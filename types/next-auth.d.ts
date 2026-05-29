import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user?: DefaultSession["user"] & {
      id: string;
      displayName?: string | null;
      locale?: string;
    };
  }

  interface User {
    displayName?: string | null;
    locale: string;
  }
}


declare module "next-auth/jwt" {
  interface JWT {
    displayName?: string | null;
    id?: string;
    locale?: string;
  }
}
