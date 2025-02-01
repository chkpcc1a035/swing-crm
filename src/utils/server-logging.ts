import { Logging } from "@google-cloud/logging";

let logging: any = null;
let log: any = null;
let isLoggingInitialized = false;
let initializationAttempted = false;

// Initialize logging only if we're in a server environment
async function initializeLogging() {
  if (initializationAttempted || typeof window !== "undefined") return;

  initializationAttempted = true;

  try {
    // Check if we have the required credentials
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      console.warn(
        "GOOGLE_APPLICATION_CREDENTIALS not set, falling back to console logging"
      );
      return;
    }

    logging = new Logging();
    log = logging.log("sku-manager-routing");

    // Test the logging permissions
    await log.write(
      log.entry({
        severity: "INFO",
        message: "Logging initialization test",
      })
    );

    isLoggingInitialized = true;
    console.log("Google Cloud Logging initialized successfully");
  } catch (error) {
    console.warn(
      "Failed to initialize Cloud Logging, falling back to console logging:",
      error
    );
    logging = null;
    log = null;
  }
}

export async function logToCloudServer(
  severity: string,
  message: string,
  metadata: any = {}
) {
  // Always log to console first
  console.log(`[${severity.toUpperCase()}] ${message}`, metadata);

  // If we haven't tried to initialize logging yet, do it now
  if (!initializationAttempted) {
    await initializeLogging();
  }

  // Only attempt Cloud Logging if initialization was successful
  if (isLoggingInitialized && log) {
    try {
      const entry = log.entry({
        severity: severity.toUpperCase(),
        message,
        ...metadata,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
      });
      await log.write(entry);
    } catch (error) {
      // If we get a permission error, disable cloud logging
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === 7
      ) {
        // PERMISSION_DENIED
        isLoggingInitialized = false;
        console.warn(
          "Cloud Logging permissions denied, falling back to console logging"
        );
      }
      console.error("Failed to write to Cloud Logging:", error);
    }
  }
}
