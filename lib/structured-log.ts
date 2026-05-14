type LogLevel = "error" | "info" | "warn";

type LogFields = Record<string, unknown>;

const sensitiveKeyPattern = /email|token|secret|password|authorization|cookie|url/i;
const emailPattern = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;

function maskEmail(value: string) {
  return value.replace(emailPattern, (email) => {
    const [name, domain] = email.split("@");
    return `${name.slice(0, 2)}***@${domain}`;
  });
}

function redactString(value: string) {
  return maskEmail(value).slice(0, 500);
}

export function redactLogValue(key: string, value: unknown): unknown {
  if (value instanceof Error) {
    return redactString(value.message);
  }

  if (value === null || value === undefined) {
    return value;
  }

  if (sensitiveKeyPattern.test(key)) {
    return typeof value === "string" && emailPattern.test(value) ? maskEmail(value) : "[redacted]";
  }

  if (typeof value === "string") {
    return redactString(value);
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => redactLogValue(key, item));
  }

  if (typeof value === "object") {
    return Object.fromEntries(Object.entries(value as LogFields).map(([childKey, childValue]) => [childKey, redactLogValue(childKey, childValue)]));
  }

  return String(value);
}

export function createLogRecord(level: LogLevel, event: string, fields: LogFields = {}): LogFields & { event: string; level: LogLevel; service: string } {
  return {
    level,
    event,
    service: "zuidlaren-agenda",
    ...Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, redactLogValue(key, value)])),
  };
}

export function logInfo(event: string, fields?: LogFields) {
  console.info(JSON.stringify(createLogRecord("info", event, fields)));
}

export function logWarn(event: string, fields?: LogFields) {
  console.warn(JSON.stringify(createLogRecord("warn", event, fields)));
}

export function logError(event: string, fields?: LogFields) {
  console.error(JSON.stringify(createLogRecord("error", event, fields)));
}
