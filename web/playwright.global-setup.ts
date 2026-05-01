import { clerkSetup } from "@clerk/testing/playwright";
import dotenv from "dotenv";
import path from "node:path";

async function globalSetup() {
  dotenv.config({ path: path.resolve(__dirname, ".env.development.local") });
  dotenv.config({ path: path.resolve(__dirname, ".env.local") });
  dotenv.config({ path: path.resolve(__dirname, ".env") });

  await clerkSetup();
}

export default globalSetup;
