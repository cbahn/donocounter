// This is called before running config.ts to ensure that
// enviornmental variables are loaded from the .env
// file, but only while in dev mode


if (process.env.NODE_ENV !== "production") {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require("dotenv").config();
}
