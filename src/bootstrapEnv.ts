// This is called before running config.ts to ensure that
// enviornmental variables are loaded from the .env
// file, but only while in dev mode

import dotenv from "dotenv";

export function bootstrapEnv() {
  if (process.env.NODE_ENV !== "production") {
    dotenv.config();
  }
}
