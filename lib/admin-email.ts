export function normalizeAdminEmail(value: string | null | undefined) {
  const email = value?.trim().toLowerCase();
  return email || null;
}

export function shouldPromoteAdminUser(userEmail: string | null | undefined, configuredAdminEmail = process.env.ADMIN_EMAIL) {
  const normalizedUserEmail = normalizeAdminEmail(userEmail);
  const normalizedAdminEmail = normalizeAdminEmail(configuredAdminEmail);

  return Boolean(normalizedUserEmail && normalizedAdminEmail && normalizedUserEmail === normalizedAdminEmail);
}
