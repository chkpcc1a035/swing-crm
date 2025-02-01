import { Logging } from "@google-cloud/logging";
import { NextResponse } from "next/server";

let logging: any = null;
let log: any = null;
let isLoggingInitialized = false;
let initializationAttempted = false;

async function initializeLogging() {
  if (initializationAttempted) return;

  initializationAttempted = true;

  try {
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      console.warn("GOOGLE_APPLICATION_CREDENTIALS not set");
      return;
    }

    logging = new Logging();
    log = logging.log("sku-manager-routing");

    // Test the logging permissions
    await log.write(
      log.entry({
        severity: "INFO",
        message: "API Logging initialization test",
      })
    );

    isLoggingInitialized = true;
    console.log("Google Cloud Logging initialized successfully in API route");
  } catch (error) {
    console.warn("Failed to initialize Cloud Logging in API route:", error);
  }
}

export async function POST(request: Request) {
  try {
    const logData = await request.json();

    // Always log to console
    console.log(`[${logData.severity}] ${logData.message}`, logData);

    // Only attempt cloud logging in production
    if (process.env.NODE_ENV === "production") {
      if (!initializationAttempted) {
        await initializeLogging();
      }

      if (isLoggingInitialized && log) {
        try {
          const entry = log.entry({
            severity: logData.severity,
            message: logData.message,
            ...logData,
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
            isLoggingInitialized = false;
          }
          // Don't throw the error, just log it to console
          console.error("Error writing to Cloud Logging:", error);
        }
      }
    }

    // Always return success, since we at least logged to console
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in log API route:", error);
    // Still return success if we managed to log to console
    return NextResponse.json({ success: true });
  }
}
