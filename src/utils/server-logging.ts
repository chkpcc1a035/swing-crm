import { Logging } from "@google-cloud/logging";

const logging = new Logging();
const log = logging.log("sku-manager-routing");

export async function logToCloudServer(
  severity: string,
  message: string,
  metadata: any = {}
) {
  try {
    const entry = log.entry({
      severity: severity.toUpperCase(),
      message: message,
      ...metadata,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    });

    await log.write(entry);
  } catch (error) {
    console.error("Failed to write to Cloud Logging:", error);
    console.log(`[${severity.toUpperCase()}] ${message}`, metadata);
  }
}
