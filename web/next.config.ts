import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import { withAxiom } from "next-axiom";

const nextConfig: NextConfig = {
  /* config options here */
};

export default withSentryConfig(withAxiom(nextConfig), {
  org: "nexxt-wh",
  project: "coffeeandai",
  silent: !process.env.CI,
  widenClientFileUpload: true,
  tunnelRoute: "/monitoring",
  disableLogger: true,
});
