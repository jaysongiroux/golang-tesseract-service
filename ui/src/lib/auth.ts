import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { NextAuthOptions, User } from "next-auth";
import { prisma } from "@/lib/prisma";
import { Adapter } from "next-auth/adapters";
import { v4 as uuidv4 } from "uuid";
import { ExtendedUser } from "./types";
import { nameSchema } from "@/utils/zodSchema";

export const authOptions: NextAuthOptions = {
  // This is a temporary fix for prisma client.
  // @see https://github.com/prisma/prisma/issues/16117
  adapter: PrismaAdapter(prisma) as Adapter,
  pages: {
    signIn: "/auth/login",
    signOut: "/auth/login",
    newUser: "/auth/signup",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
  providers: [
    Credentials({
      name: "Sign in",
      id: "credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "example@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user || !(await compare(credentials.password, user.password!))) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          randomKey: uuidv4(),
        } as unknown as User;
      },
    }),
  ],
  callbacks: {
    session: async ({ session, token, trigger }) => {
      if (trigger === "update" && session.user) {
        const result = nameSchema.safeParse(token.name);
        if (!result.success) {
          return {
            ...session,
            error: result.error.message,
          };
        }

        session.user.name = token.name;
      }

      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          randomKey: token.randomKey,
          name: token.name,
        },
      };
    },
    jwt: async ({ token, user, trigger, session }) => {
      if (trigger === "update") {
        if (token.name !== session.name) {
          const result = nameSchema.safeParse(session.name);
          if (!result.success) {
            return {
              ...token,
              error: result.error.message,
            };
          }

          token.name = session.name;
        }
      }
      if (user) {
        const u = user as ExtendedUser;
        return {
          ...token,
          id: u.id,
          randomKey: u.randomKey,
        };
      }
      return token;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
