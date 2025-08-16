import { listCards } from "./db/repositories/cards.js";

listCards({ limit: 1 })
  .then(() => {
    console.log("ok");
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
