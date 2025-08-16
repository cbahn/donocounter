import 'dotenv/config';

export const CONFIG = {
  mongoUrl: process.env.MONGO_URL ?? "mongodb://localhost:27017/cards_app",
  port: parseInt(process.env.PORT ?? "3000", 10),
  nodeEnv: process.env.NODE_ENV ?? "development",
  donationWebhookKey: process.env.DONATION_WEBHOOK_KEY ?? "012345"
};
