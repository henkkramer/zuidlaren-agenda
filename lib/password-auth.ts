import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const keyLength = 64;
const scryptOptions = { N: 16384, r: 8, p: 1 };

export function normalizeCredentialLogin(login: string) {
  return login.trim().toLowerCase();
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, keyLength, scryptOptions).toString("hex");
  return `scrypt$${scryptOptions.N}$${scryptOptions.r}$${scryptOptions.p}$${salt}$${hash}`;
}

export function verifyPassword(password: string, storedHash: string | null | undefined) {
  if (!storedHash) return false;

  const [algorithm, rawN, rawR, rawP, salt, hash] = storedHash.split("$");

  if (algorithm !== "scrypt" || !rawN || !rawR || !rawP || !salt || !hash) {
    return false;
  }

  const expected = Buffer.from(hash, "hex");
  const actual = scryptSync(password, salt, expected.length, {
    N: Number(rawN),
    r: Number(rawR),
    p: Number(rawP),
  });

  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export function isValidNewPassword(password: string) {
  return password.length >= 8 && password.length <= 128;
}
