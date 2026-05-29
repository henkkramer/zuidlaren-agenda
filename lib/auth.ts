import { PrismaAdapter } from "@auth/prisma-adapter";
import type { Adapter } from "next-auth/adapters";
import type { NextAuthOptions, Session } from "next-auth";
import { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import EmailProvider from "next-auth/providers/email";
import { shouldPromoteAdminUser } from "@/lib/admin-email";
import { createLoginLinkFallbackRecord } from "@/lib/login-link-fallback";
import { normalizeCredentialLogin, verifyPassword } from "@/lib/password-auth";
import { prisma } from "@/lib/prisma";
import { logError, logInfo } from "@/lib/structured-log";

const emailServer = process.env.EMAIL_SERVER;
const emailFrom = process.env.EMAIL_FROM ?? "Zuidlaren Agenda <noreply@zuidlaren.local>";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as unknown as Adapter,
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Gebruikersnaam",
      credentials: {
        username: { label: "Gebruikersnaam", type: "text" },
        password: { label: "Wachtwoord", type: "password" },
      },
      async authorize(credentials) {
        const username = normalizeCredentialLogin(credentials?.username ?? "");
        const password = credentials?.password ?? "";

        if (!username || !password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { credentialLogin: username },
          select: {
            id: true,
            email: true,
            name: true,
            displayName: true,
            locale: true,
            disabledAt: true,
            passwordHash: true,
          },
        });

        if (!user || user.disabledAt || !verifyPassword(password, user.passwordHash)) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          displayName: user.displayName,
          locale: user.locale,
        };
      },
    }),
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
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.displayName = user.displayName ?? user.name ?? null;
        token.locale = user.locale;
        return token;
      }

      if (!token.id && token.sub) {
        const persistedUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { id: true, displayName: true, name: true, locale: true },
        });

        if (persistedUser) {
          token.id = persistedUser.id;
          token.displayName = persistedUser.displayName ?? persistedUser.name ?? null;
          token.locale = persistedUser.locale;
        }
      }

      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.id ?? token.sub);
        session.user.displayName = typeof token.displayName === "string" ? token.displayName : null;
        session.user.locale = typeof token.locale === "string" ? token.locale : "nl-NL";
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
    strategy: "jwt",
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
