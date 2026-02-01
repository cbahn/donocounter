// src/config.ts

import dotenv from "dotenv";

function required(name: string): string {

  // load the .env file each time there's a variable missing
  // This is a bad solution
  if (process.env.NODE_ENV !== "production") {
    dotenv.config();
  };
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
