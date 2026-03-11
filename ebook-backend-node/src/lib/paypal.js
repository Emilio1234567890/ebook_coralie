import "dotenv/config";

const PAYPAL_BASE =
  process.env.PAYPAL_ENV === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

function basicAuth() {
  const raw = `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`;
  return Buffer.from(raw).toString("base64");
}

export async function getPayPalAccessToken() {
  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth()}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`PayPal OAuth error: ${txt}`);
  }

  const json = await res.json();
  return json.access_token;
}

export async function paypalRequest(path, options = {}) {
  const accessToken = await getPayPalAccessToken();

  const res = await fetch(`${PAYPAL_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...(options.headers || {}),
    },
  });

  const text = await res.text();
  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    throw new Error(
      typeof data === "string"
        ? data
        : data?.message || data?.error_description || "PayPal request failed",
    );
  }

  return data;
}
