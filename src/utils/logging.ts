type LogSeverity = "info" | "error" | "warn" | "debug";

// Simple function to format the log message
function formatLog(severity: LogSeverity, message: string, metadata: any = {}) {
  return {
    timestamp: new Date().toISOString(),
    severity: severity.toUpperCase(),
    message,
    ...metadata,
    environment: process.env.NODE_ENV,
  };
}

// Client-side logging
export async function logToCloud(
  severity: LogSeverity,
  message: string,
  metadata: any = {}
) {
  const logData = formatLog(severity, message, metadata);

  // Log to console
  const consoleMethod = severity === "error" ? console.error : console.log;
  consoleMethod(`[${severity.toUpperCase()}] ${message}`, metadata);

  // If in production, send to your logging API endpoint
  if (process.env.NODE_ENV === "production") {
    try {
      await fetch("/api/log", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(logData),
      });
    } catch (error) {
      console.error("Failed to send log to API:", error);
    }
  }
}
