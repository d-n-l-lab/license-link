import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";
import { createSentinelCustomer, issuePerpetualLicenseKeys, Tier } from "../../lib/sentinel";

export const config = {
  api: {
    bodyParser: false,
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-06-20",
});

async function buffer(readable: any): Promise<Buffer> {
  const chunks: Uint8Array[] = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const sig = req.headers["stripe-signature"] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;
  if (!webhookSecret) {
    console.error("Missing STRIPE_WEBHOOK_SECRET");
    return res.status(500).send("Server misconfigured");
  }

  let event: Stripe.Event;
  try {
    const rawBody = await buffer(req);
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed.", err?.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const tier = (session.metadata?.tier as Tier) || undefined;
      const quantity = Number(session.metadata?.quantity || 1);
      const stripeCustomerId = (session.customer as string) || undefined;
      const email = session.customer_details?.email || session.customer_email || undefined;
      const paymentIntentId = session.payment_intent as string | undefined;

      if (!tier || !paymentIntentId) {
        console.warn("Missing tier or paymentIntentId; skipping fulfillment");
        return res.status(200).send("Skipped");
      }

      // Idempotency guard without a DB: if PI already has license_keys metadata, skip
      const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
      const existing = (pi.metadata as any)?.license_keys;
      if (existing) {
        console.log("Licenses already issued for", paymentIntentId);
        return res.status(200).send("Already fulfilled");
      }

      // Reuse sentinel_customer_id from Stripe Customer metadata if present
      let sentinelAccountId: string | undefined;
      let customer: Stripe.Customer | null = null;
      if (stripeCustomerId) {
        customer = await stripe.customers.retrieve(stripeCustomerId);
        if (!customer?.deleted) {
          const meta = (customer.metadata || {}) as Record<string, string>;
          sentinelAccountId = meta["sentinel_customer_id"];
        }
      }
      // If not present, create a Sentinel customer using email or name
      if (!sentinelAccountId) {
        const name = (customer && !customer.deleted ? customer.name : undefined) || email || `Stripe:${stripeCustomerId}` || "Customer";
        const created = await createSentinelCustomer({ name });
        sentinelAccountId = created.id;
        if (customer && !customer.deleted) {
          await stripe.customers.update(customer.id, {
            metadata: { ...(customer.metadata || {}), sentinel_customer_id: sentinelAccountId },
          });
        }
      }

      // Issue keys
      const issuedKeys = await issuePerpetualLicenseKeys({
        accountId: sentinelAccountId!,
        tier,
        quantity,
        customerName: (customer && !customer.deleted ? customer.name : undefined) || email || "Customer",
      });

      // Attach keys to the PaymentIntent metadata for easy testing visibility
      await stripe.paymentIntents.update(paymentIntentId, {
        metadata: {
          license_keys: issuedKeys.join(","),
          sentinel_account_id: sentinelAccountId || "",
        },
      });

      console.log("Issued licenses:", issuedKeys);
    }

    return res.status(200).json({ received: true });
  } catch (error: any) {
    console.error("Webhook handler error", error);
    return res.status(500).send("Internal error");
  }
}

