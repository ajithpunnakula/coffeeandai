import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://bc6932a75185ffe72b7ef6c1c06c0f64@o4510912751665152.ingest.us.sentry.io/4511241504555008",
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  integrations: [
    Sentry.replayIntegration(),
  ],
});
