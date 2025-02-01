import { Logging } from "@google-cloud/logging";

let logging: any = null;
let log: any = null;

// Initialize logging only if we're in a server environment
if (typeof window === "undefined") {
  try {
    logging = new Logging();
    log = logging.log("sku-manager-routing");
  } catch (error) {
    console.error("Failed to initialize Cloud Logging:", error);
  }
}

export async function logToCloudServer(
  severity: string,
  message: string,
  metadata: any = {}
) {
  const logData = {
    timestamp: new Date().toISOString(),
    severity: severity.toUpperCase(),
    message,
    ...metadata,
    environment: process.env.NODE_ENV,
  };

  // Always log to console
  console.log(`[${severity.toUpperCase()}] ${message}`, metadata);

  // Only attempt Cloud Logging in production and if initialization was successful
  if (process.env.NODE_ENV === "production" && log) {
    try {
      const entry = log.entry(logData);
      await log.write(entry);
    } catch (error) {
      console.error("Failed to write to Cloud Logging:", error);
    }
  }
}
