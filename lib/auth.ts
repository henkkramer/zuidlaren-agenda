import { PrismaAdapter } from "@auth/prisma-adapter";
import type { Adapter } from "next-auth/adapters";
import type { NextAuthOptions, Session } from "next-auth";
import { getServerSession } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as unknown as Adapter,
  providers: [
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM ?? "Zuidlaren Agenda <noreply@zuidlaren.local>",
      async sendVerificationRequest({ identifier, url }) {
        console.info(`Zuidlaren Agenda login link for ${identifier}: ${url}`);
      },
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
