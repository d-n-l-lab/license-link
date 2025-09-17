export type Tier = "light" | "standard" | "ultimate";

type ProductFeature = { productId: string; featureId: string; links: number };

function mappingForTier(tier: Tier): ProductFeature {
  const envProduct =
    tier === "light"
      ? process.env.SENTINEL_PRODUCT_LIGHT
      : tier === "standard"
      ? process.env.SENTINEL_PRODUCT_STANDARD
      : process.env.SENTINEL_PRODUCT_ULTIMATE;
  const envFeature =
    tier === "light"
      ? process.env.SENTINEL_FEATURE_LIGHT
      : tier === "standard"
      ? process.env.SENTINEL_FEATURE_STANDARD
      : process.env.SENTINEL_FEATURE_ULTIMATE;
  const envLinks =
    tier === "light"
      ? Number(process.env.SENTINEL_LINKS_LIGHT || 1)
      : tier === "standard"
      ? Number(process.env.SENTINEL_LINKS_STANDARD || 10)
      : Number(process.env.SENTINEL_LINKS_ULTIMATE || 10);

  if (!envProduct || !envFeature) {
    throw new Error("Missing SENTINEL_PRODUCT_* or SENTINEL_FEATURE_* env for tier");
  }
  return { productId: envProduct, featureId: envFeature, links: envLinks };
}

export async function createSentinelCustomer(params: { name: string }): Promise<{ id: string }> {
  const useMock = (process.env.SENTINEL_MOCK || "true").toLowerCase() === "true";
  if (useMock) {
    return { id: `mock_${hashOf(params.name)}` };
  }

  const baseUrl = requiredEnv("SENTINEL_BASE_URL");
  const marketGroupId = requiredEnv("SENTINEL_MARKET_GROUP_ID");
  const marketGroupName = process.env.SENTINEL_MARKET_GROUP_NAME || "MEZTZ";

  const body = {
    customer: {
      name: params.name,
      state: "ENABLE",
      marketGroup: { id: marketGroupId, name: marketGroupName },
    },
  };

  const resp = await fetch(`${baseUrl}/customers`, {
    method: "POST",
    headers: jsonAuthHeaders(),
    body: JSON.stringify(body),
  });
  if (!resp.ok) throw new Error(`Sentinel create customer failed: ${resp.status}`);
  const data = await resp.json();
  const id = data?.customer?.id as string | undefined;
  if (!id) throw new Error("Sentinel create customer: missing id");
  return { id };
}

export async function issuePerpetualLicenseKeys(params: {
  accountId: string;
  tier: Tier;
  quantity: number;
  customerName: string;
  licenseDate?: Date;
}): Promise<string[]> {
  const useMock = (process.env.SENTINEL_MOCK || "true").toLowerCase() === "true";
  if (useMock) {
    const mockPrefix = mappingForTier(params.tier).productId.slice(0, 4).toUpperCase();
    return Array.from({ length: params.quantity }, () => generateMockKey(mockPrefix));
  }

  const baseUrl = requiredEnv("SENTINEL_BASE_URL");
  const startDate = isoDateOnly(params.licenseDate || new Date());
  const excelSerial = dateToExcelSerial(params.licenseDate || new Date());
  const { productId, featureId, links } = mappingForTier(params.tier);

  const productKeyItems = Array.from({ length: params.quantity }, () => buildProductKey({
    startDate,
    links,
    vendorText: process.env.SENTINEL_VENDOR_TEXT || "Inasoft Systems GmbH",
    customerName: params.customerName,
    licenseTypeText: capitalize(params.tier),
    licenseDateSerial: excelSerial,
    productId,
    featureId,
  }));

  const entitlementBody = {
    entitlement: {
      externalId: "",
      createdBy: process.env.SENTINEL_CREATED_BY || "S4AWeb",
      lastModifiedBy: process.env.SENTINEL_CREATED_BY || "S4AWeb",
      identifier: "",
      entitlementAsWhole: false,
      startDate,
      expiry: { neverExpires: true, endDate: "", expiryInDays: "" },
      customer: { id: params.accountId },
      userRegistration: "NONE",
      activationAllowed: true,
      allowActivationBy: "ALL_USERS",
      revocationAllowed: true,
      state: "ENABLE",
      sendNotification: false,
      isTest: false,
      totalRegisteredQuantity: params.quantity,
      productKeys: {
        totalRegisteredQuantity: params.quantity,
        productKey: productKeyItems,
      },
    },
  };

  const resp = await fetch(`${baseUrl}/entitlements`, {
    method: "POST",
    headers: jsonAuthHeaders(),
    body: JSON.stringify(entitlementBody),
  });
  if (!resp.ok) throw new Error(`Sentinel entitlement failed: ${resp.status}`);
  const data = await resp.json();
  const pkArray = data?.entitlement?.productKeys?.productKey as Array<any> | undefined;
  const keys = Array.isArray(pkArray) ? pkArray.map((pk) => pk?.pkId).filter(Boolean) : [];
  if (!keys.length) throw new Error("Sentinel entitlement: no pkId returned");
  return keys;
}

function buildProductKey(params: {
  startDate: string;
  links: number;
  vendorText: string;
  customerName: string;
  licenseTypeText: string;
  licenseDateSerial: number;
  productId: string;
  featureId: string;
}) {
  return {
    startDate: params.startDate,
    expiry: { neverExpires: true, endDate: "", expiryInDays: "" },
    totalQuantity: 1,
    availableQuantity: 1,
    splittedQuantity: 1,
    activationMethod: "FIXED",
    fixedQuantity: 1,
    extnLDK: {
      lockingType: "HL_or_SL_AdminMode",
      isNotLockedToDevice: false,
      upgradeToDriverless: true,
      vclock: true,
      prdMemoryReferences: {
        memoryFile: [
          {
            fileName: "Links",
            text: asciiToHex(String(params.links)),
            fileId: 1,
            fileType: "READ_ONLY",
            fileSize: "",
            segmentName: "",
            size: "",
            offset: "0",
            applyMemory: "OVERWRITE",
          },
          {
            fileName: "Vendor",
            text: asciiToHex(params.vendorText),
            fileId: 3,
            fileType: "READ_ONLY",
            fileSize: "",
            segmentName: "",
            size: "",
            offset: "0",
            applyMemory: "OVERWRITE",
          },
          {
            fileName: "Customer",
            text: asciiToHex(params.customerName),
            fileId: 4,
            fileType: "READ_ONLY",
            fileSize: "256",
            segmentName: "",
            size: "256",
            offset: "0",
            applyMemory: "OVERWRITE",
          },
          {
            fileName: "LicenseDate",
            text: asciiToHex(String(params.licenseDateSerial)),
            fileId: 5,
            fileType: "READ_ONLY",
            fileSize: "",
            segmentName: "",
            size: "",
            offset: "0",
            applyMemory: "OVERWRITE",
          },
          {
            fileName: "LicenseType",
            text: asciiToHex(params.licenseTypeText),
            fileId: 6,
            fileType: "READ_ONLY",
            fileSize: "",
            segmentName: "",
            size: "",
            offset: "0",
            applyMemory: "OVERWRITE",
          },
        ],
      },
    },
    state: "ENABLE",
    item: {
      itemProduct: {
        product: { id: params.productId },
        itemProductFeatures: {
          itemProductFeature: [
            {
              feature: { id: params.featureId },
              itemFeatureState: "INCLUDED",
              SAOT: false,
            },
          ],
        },
      },
    },
  };
}

function asciiToHex(input: string): string {
  return Buffer.from(input, "utf8").toString("hex").toUpperCase();
}

function requiredEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

function jsonAuthHeaders(): Record<string, string> {
  const headerValue = process.env.SENTINEL_AUTH_HEADER ||
    (process.env.SENTINEL_TOKEN ? `Bearer ${process.env.SENTINEL_TOKEN}` : "");
  if (!headerValue) throw new Error("Missing SENTINEL_AUTH_HEADER or SENTINEL_TOKEN");
  return { "content-type": "application/json", authorization: headerValue };
}

function isoDateOnly(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function dateToExcelSerial(d: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  const excelEpoch = Date.UTC(1899, 11, 30);
  const t = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  return Math.floor((t - excelEpoch) / msPerDay);
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function generateMockKey(prefix: string): string {
  return `${prefix}-${randomBlock()}-${randomBlock()}-${randomBlock()}`;
}

function randomBlock(): string {
  return Math.random().toString(36).slice(2, 6).toUpperCase();
}

function hashOf(input: string): string {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (Math.imul(31, h) + input.charCodeAt(i)) | 0;
  }
  return Math.abs(h).toString(36);
}

