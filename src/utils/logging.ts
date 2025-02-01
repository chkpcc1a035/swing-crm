import { Logging } from "@google-cloud/logging";

const logging = new Logging();
const log = logging.log("sku-manager-routing");

export async function logToCloud(
  severity: string,
  message: string,
  metadata: any = {}
) {
  try {
    const entry = log.entry({
      severity: severity.toUpperCase(),
      message: message,
      ...metadata,
    });

    await log.write(entry);
  } catch (error) {
    console.error("Failed to write to Cloud Logging:", error);
    // Fallback to console
    console.log(`[${severity.toUpperCase()}] ${message}`, metadata);
  }
}
