import assert from "node:assert/strict";
import { test } from "node:test";
import { hashPassword, isValidNewPassword, normalizeCredentialLogin, verifyPassword } from "@/lib/password-auth";

test("credential logins normalize whitespace and casing", () => {
  assert.equal(normalizeCredentialLogin(" Admin "), "admin");
});

test("password hashes verify only the matching password", () => {
  const hash = hashPassword("correct horse battery staple");

  assert.notEqual(hash, "correct horse battery staple");
  assert.equal(verifyPassword("correct horse battery staple", hash), true);
  assert.equal(verifyPassword("wrong", hash), false);
  assert.equal(verifyPassword("correct horse battery staple", null), false);
});

test("new password validation enforces a practical minimum", () => {
  assert.equal(isValidNewPassword("1234567"), false);
  assert.equal(isValidNewPassword("12345678"), true);
});
