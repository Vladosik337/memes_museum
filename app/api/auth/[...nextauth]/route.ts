import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";

export const authOptions = {
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
      async authorize(credentials) {
        // TODO: Реалізувати перевірку email/пароля через Drizzle ORM
        // Наприклад:
        // const user = await db.query.users.findFirst({ where: { email: credentials.email } });
        // if (user && compareHash(credentials.password, user.password_hash)) return user;
        // return null;
        return null;
      },
    }),
  ],
  callbacks: {
    async signIn(params) {
      const { account, profile } = params;
      if (account?.provider === "github" && profile) {
        const email = profile.email;
        const oidc_sub =
          profile.id?.toString() || profile.sub?.toString() || "";
        // Перевірити чи користувач існує
        const existing = await db
          .select()
          .from(users)
          .where(eq(users.email, email));
        if (existing.length === 0) {
          // Створити нового користувача: name з GitHub записати у first_name
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
    async session({ session }) {
      // Додаємо кастомні поля з БД у session.user
      if (session?.user?.email) {
        const userDb = await db
          .select()
          .from(users)
          .where(eq(users.email, session.user.email));
        if (userDb.length > 0) {
          session.user.first_name = userDb[0].first_name;
          session.user.last_name = userDb[0].last_name;
          session.user.role = userDb[0].role;
          session.user.oidc_sub = userDb[0].oidc_sub;
        }
      }
      return session;
    },
    // ...інші callbacks
  },
  // ...інші опції (session, pages)
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
