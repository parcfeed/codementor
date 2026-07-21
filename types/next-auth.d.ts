import type { DefaultSession, DefaultUser } from "next-auth";
import type { JWT as DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      reputationScore: number;
      isModerator: boolean;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    reputationScore: number;
    isModerator: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    reputationScore: number;
    isModerator: boolean;
  }
}
