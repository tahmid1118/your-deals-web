import axios from "axios";
import https from "https";
import type { NextAuthConfig } from "next-auth";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

declare module "next-auth" {
  interface User {
    user_id: string;
    access_token: string;
  }
}

const credentialsConfig = CredentialsProvider({
  name: "Credentials",
  credentials: {
    lg: { label: "lg" },
    email: { label: "Email" },
    password: { label: "Password", type: "password" },
  },
  async authorize(credentials) {
    try {
      console.log("[NextAuth][authorize] credentials:", credentials);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/users/login`,
        {
          lg: credentials.lg,
          email: credentials.email,
          password: credentials.password,
        },
        {
          headers: { "Content-Type": "application/json" },
          httpsAgent: new https.Agent({
            rejectUnauthorized: false,
          }),
        }
      );

      const { status, data } = response;
      console.log("[NextAuth][authorize] response status:", status);
      console.log("[NextAuth][authorize] response data:", data);

      if (status === 200) {
        return {
          id: data.user.id, // user_id from personal-data
          access_token: data.user.token,
          name: data.user.fullName, // full_name from personal-data
          email: data.user.email,
          image: data.user.imageUrl, // imageUrl from login, not image_url
          user_id: data.user.id,
        };
      }
      return null;
    } catch (error: unknown) {
      console.error("[NextAuth][authorize] Login error:", error);
      if (axios.isAxiosError(error) && error.response) {
        console.error("[NextAuth][authorize] Error response data:", error.response.data);
      }
      return null;
    }
  },
});

const config = {
  providers: [credentialsConfig],
  callbacks: {
    async jwt({ token, user }) {
      // On sign in, persist the access_token to the token
      if (user) {
        token.access_token = user.access_token;
        token.user_id = user.user_id;
        token.name = user.name;
        token.email = user.email;
        token.image = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      // Attach access_token and user_id to session
      if (session.user) {
        session.user.access_token = token.access_token as string;
        session.user.user_id = token.user_id as string;
        session.user.name = token.name as string;
        session.user.email = (token.email ?? "") as string;
        session.user.image = (token.image ?? null) as string | null;
      }

      // Optionally, fetch user data from API using access_token
      if (token.access_token) {
        try {
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/users/personal-data`,
            {
              headers: { Authorization: `Bearer ${token.access_token}` },
              httpsAgent: new https.Agent({
                rejectUnauthorized: false,
              }),
            }
          );
          const { status, data } = response;
          if (status === 200 && session.user) {
            session.user.name = data.data.full_name;
            session.user.email = data.data.email;
            session.user.user_id = data.data.user_id;
            session.user.image = data.data.image_url ?? null;
          }
        } catch (error) {
          // Optionally log error, but don't break session
          console.error("[NextAuth][session] Error fetching personal-data:", error);
        }
      }
      return session;
    },
  },
  session: { strategy: "jwt" },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);
