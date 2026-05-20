import { PrismaAdapter } from "@auth/prisma-adapter";
import type { Adapter } from "next-auth/adapters";
import type { NextAuthOptions, Session } from "next-auth";
import { getServerSession } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { shouldPromoteAdminUser } from "@/lib/admin-email";
import { createLoginLinkFallbackRecord } from "@/lib/login-link-fallback";
import { prisma } from "@/lib/prisma";
import { logError, logInfo } from "@/lib/structured-log";

const emailServer = process.env.EMAIL_SERVER;
const emailFrom = process.env.EMAIL_FROM ?? "Zuidlaren Agenda <noreply@zuidlaren.local>";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as unknown as Adapter,
  providers: [
    EmailProvider({
      server: emailServer,
      from: emailFrom,
      ...(emailServer
        ? {}
        : {
            async sendVerificationRequest({ identifier, url }) {
              logInfo("auth.login_link.created", {
                email: identifier,
                loginUrl: url,
                provider: "email",
              });
              console.warn(JSON.stringify(createLoginLinkFallbackRecord(identifier, url)));
            },
          }),
    }),
  ],
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.displayName = user.displayName ?? user.name ?? null;
        session.user.locale = user.locale;
      }

      return session;
    },
  },
  events: {
    async signIn({ user }) {
      if (!user.id || !shouldPromoteAdminUser(user.email)) return;

      try {
        await prisma.user.update({
          where: { id: user.id },
          data: { disabledAt: null, isAdmin: true },
        });
        logInfo("auth.admin.promoted", { email: user.email, userId: user.id });
      } catch (error) {
        logError("auth.admin.promote.failed", { email: user.email, error });
      }
    },
  },
  pages: {
    signIn: "/account",
    verifyRequest: "/account/check-email",
  },
  session: {
    strategy: "database",
  },
};

export async function getCurrentSession(): Promise<Session | null> {
  return getServerSession(authOptions);
}

export async function requireCurrentUser() {
  const session = await getCurrentSession();

  if (!session?.user?.id) {
    return null;
  }

  return prisma.user.findUnique({
    where: { id: session.user.id },
    include: { notificationPreferences: true },
  });
}
