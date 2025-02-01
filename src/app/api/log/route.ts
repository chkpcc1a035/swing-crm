import { Logging } from "@google-cloud/logging";
import { NextResponse } from "next/server";

// Initialize Google Cloud Logging
const logging = new Logging();
const log = logging.log("sku-manager-routing");

export async function POST(request: Request) {
  try {
    const logData = await request.json();

    // Only in production
    if (process.env.NODE_ENV === "production") {
      const entry = log.entry({
        severity: logData.severity,
        message: logData.message,
        ...logData,
      });
      await log.write(entry);
    }

    // Always log to console as backup
    console.log(`[${logData.severity}] ${logData.message}`, logData);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error writing to Cloud Logging:", error);
    return NextResponse.json({ error: "Failed to write log" }, { status: 500 });
  }
}
