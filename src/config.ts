// src/config.ts
function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

export const CONFIG = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? "3000"),

  // secrets / deployment-specific
  mongoUrl: required("MONGO_URL"),
  donationWebhookKey: required("DONATION_WEBHOOK_KEY"),
} as const;
