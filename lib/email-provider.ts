import "server-only";

import { logInfo } from "@/lib/structured-log";

export type EmailMessage = {
  to: string;
  subject: string;
  text: string;
};

export type EmailProvider = {
  name: string;
  send(message: EmailMessage): Promise<{ providerId?: string }>;
};

export const logEmailProvider: EmailProvider = {
  name: "log",
  async send(message) {
    logInfo("email.send.logged", {
      email: message.to,
      provider: "log",
      subject: message.subject,
      textLength: message.text.length,
    });
    return { providerId: `log-${Date.now().toString(36)}` };
  },
};

export function getEmailProvider(): EmailProvider {
  return logEmailProvider;
}
