function maskEmail(value: string) {
  const [name, domain] = value.split("@");
  return domain ? `${name.slice(0, 2)}***@${domain}` : "[redacted]";
}

export function createLoginLinkFallbackRecord(identifier: string, url: string) {
  return {
    level: "warn",
    event: "auth.login_link.fallback",
    service: "zuidlaren-agenda",
    email: maskEmail(identifier),
    loginLink: url,
    warning: "EMAIL_SERVER is not configured; this login link is printed to server logs.",
  };
}
