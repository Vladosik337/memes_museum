import { db } from "@/db";
import { users } from "@/db/schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import type { AuthOptions, User } from "next-auth";
import type { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";

export const authOptions: AuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(
        credentials: Record<"email" | "password", string> | undefined
      ) {
        console.log("authorize called, credentials:", credentials);
        if (!credentials?.email || !credentials?.password) return null;
        const userDb = await db
          .select()
          .from(users)
          .where(eq(users.email, credentials.email));
        if (userDb.length === 0 || !userDb[0].password_hash) return null;
        const isValid = await bcrypt.compare(
          credentials.password,
          userDb[0].password_hash
        );
        if (!isValid) return null;
        return {
          id: String(userDb[0].id),
          email: userDb[0].email,
          name: userDb[0].first_name ?? undefined,
          image: undefined,
          first_name: userDb[0].first_name ?? undefined,
          last_name: userDb[0].last_name ?? undefined,
          role: userDb[0].role ?? undefined,
          oidc_sub: userDb[0].oidc_sub ?? undefined,
        } as User & {
          first_name?: string;
          last_name?: string;
          role?: string;
          oidc_sub?: string;
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.first_name = user.first_name;
        token.last_name = user.last_name;
        token.role = user.role;
        token.oidc_sub = user.oidc_sub;
        token.email = user.email;
        console.log("JWT callback: user:", user, "token:", token);
      }
      return token;
    },
    async signIn({
      account,
      profile,
    }: {
      account: { provider?: string } | null;
      profile?: {
        id?: string | number;
        sub?: string | number;
        email?: string;
        name?: string;
      };
    }) {
      if (account?.provider === "github" && profile) {
        const email = profile.email || "";
        const oidc_sub =
          (profile.id != null ? String(profile.id) : undefined) ||
          (profile.sub != null ? String(profile.sub) : undefined) ||
          "";
        const existing = await db
          .select()
          .from(users)
          .where(eq(users.email, email));
        if (existing.length === 0) {
          await db.insert(users).values({
            email,
            first_name: profile.name || "",
            last_name: "",
            role: "user",
            oidc_sub,
            created_at: new Date(),
            updated_at: new Date(),
          });
        }
      }
      return true;
    },
    async session({
      session,
      token,
    }: {
      session: {
        user: User & {
          first_name?: string;
          last_name?: string;
          role?: string;
          oidc_sub?: string;
        };
        expires: string;
      };
      token: JWT;
    }) {
      console.log(
        "session callback called, session:",
        session,
        "token:",
        token
      );
      type UserDbType = {
        id: number;
        first_name: string | null;
        last_name: string | null;
        role: string;
        oidc_sub: string | null;
        email: string;
      };
      let userDb: UserDbType[] = [];
      if (session?.user?.email) {
        userDb = await db
          .select()
          .from(users)
          .where(eq(users.email, session.user.email));
      } else if (session?.user?.oidc_sub) {
        userDb = await db
          .select()
          .from(users)
          .where(eq(users.oidc_sub, session.user.oidc_sub));
      }
      if (userDb.length > 0) {
        session.user.id = String(userDb[0].id);
        session.user.first_name = userDb[0].first_name ?? undefined;
        session.user.last_name = userDb[0].last_name ?? undefined;
        session.user.role = userDb[0].role ?? undefined;
        session.user.oidc_sub = userDb[0].oidc_sub ?? undefined;
        session.user.email = userDb[0].email;
        console.log("session.user after DB lookup:", session.user);
      } else {
        console.log("userDb is empty, session.user:", session.user);
      }
      return session;
    },
  },
};
