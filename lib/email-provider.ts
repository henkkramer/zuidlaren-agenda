import "server-only";

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
    console.info(`Zuidlaren Agenda email to ${message.to}: ${message.subject}\n${message.text}`);
    return { providerId: `log-${Date.now().toString(36)}` };
  },
};

export function getEmailProvider(): EmailProvider {
  return logEmailProvider;
}
