import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { loginSchema } from "@/features/auth/schemas";
import { prisma } from "@/lib/prisma";

const prismaAdapterClient = prisma as unknown as Parameters<
  typeof PrismaAdapter
>[0];

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prismaAdapterClient),
  providers: [
    CredentialsProvider({
      name: "Email et mot de passe",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        const parsedCredentials = loginSchema.safeParse(credentials);

        if (!parsedCredentials.success) {
          return null;
        }

        const { email, password } = parsedCredentials.data;

        const user = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            name: true,
            passwordHash: true,
            reputationScore: true,
            isModerator: true,
          },
        });

        if (!user?.passwordHash) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          password,
          user.passwordHash,
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          reputationScore: user.reputationScore,
          isModerator: user.isModerator,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.reputationScore = user.reputationScore;
        token.isModerator = user.isModerator;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.reputationScore = token.reputationScore;
        session.user.isModerator = token.isModerator;
      }

      return session;
    },
  },
};
