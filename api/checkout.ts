import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-06-20",
});

type Tier = "light" | "standard" | "ultimate";

function getPriceIdForTier(tier: Tier): string {
  switch (tier) {
    case "light":
      return process.env.STRIPE_PRICE_LIGHT as string;
    case "standard":
      return process.env.STRIPE_PRICE_STANDARD as string;
    case "ultimate":
      return process.env.STRIPE_PRICE_ULTIMATE as string;
    default:
      throw new Error("Invalid tier");
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { tier, quantity } = (req.body || {}) as { tier: Tier; quantity?: number };
    if (!tier) return res.status(400).json({ error: "tier is required" });

    const qty = Math.max(1, Number(quantity || 1));
    const priceId = getPriceIdForTier(tier);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price: priceId,
          quantity: qty,
        },
      ],
      customer_creation: "always",
      allow_promotion_codes: true,
      customer_update: { address: "auto", name: "auto" },
      success_url: `${process.env.PUBLIC_URL || "http://localhost:3000"}/success?sid={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.PUBLIC_URL || "http://localhost:3000"}/cancel`,
      metadata: {
        tier,
        quantity: String(qty),
      },
    });

    return res.status(200).json({ url: session.url });
  } catch (error: any) {
    console.error("/api/checkout error", error);
    return res.status(400).json({ error: error.message || "Unknown error" });
  }
}

