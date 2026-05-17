import assert from "node:assert/strict";
import { test } from "node:test";
import { createLoginLinkFallbackRecord } from "@/lib/login-link-fallback";
import { createLogRecord, redactLogValue } from "@/lib/structured-log";

test("structured log masks emails in non-sensitive text", () => {
  const record = createLogRecord("info", "test.event", {
    message: "Login requested for owner@example.nl",
  });

  assert.equal(record.message, "Login requested for ow***@example.nl");
});

test("structured log redacts sensitive keys", () => {
  const record = createLogRecord("warn", "test.sensitive", {
    email: "owner@example.nl",
    loginUrl: "https://example.nl/api/auth/callback/email?token=secret",
    token: "secret-token",
    nested: {
      password: "hidden",
      note: "Contact user@example.nl",
    },
  });

  assert.equal(record.email, "ow***@example.nl");
  assert.equal(record.loginUrl, "[redacted]");
  assert.equal(record.token, "[redacted]");
  assert.deepEqual(record.nested, {
    password: "[redacted]",
    note: "Contact us***@example.nl",
  });
});

test("error values only expose redacted messages", () => {
  const value = redactLogValue("error", new Error("Database failed for admin@example.nl"));

  assert.equal(value, "Database failed for ad***@example.nl");
});

test("login link fallback record exposes link while masking email", () => {
  const record = createLoginLinkFallbackRecord("owner@example.nl", "https://example.nl/api/auth/callback/email?token=secret");

  assert.equal(record.event, "auth.login_link.fallback");
  assert.equal(record.email, "ow***@example.nl");
  assert.equal(record.loginLink, "https://example.nl/api/auth/callback/email?token=secret");
});
