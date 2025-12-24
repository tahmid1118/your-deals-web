import axios from "axios";
import https from "https";
import type { NextAuthConfig } from "next-auth";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

declare module "next-auth" {
  interface User {
    role: string;
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
      //   console.log("object data 1", data)

      if (status === 200) {
        return {
          id: data.user.token,
          access_token: data.user.token,
          name: data.user.fullName,
          email: data.user.email,
          image: data.user.image_url,
          role: data.user.role,
          user_id: data.user.id,
        };
      }
      return null;
    } catch (error) {
      // console.error("Login error:", error)
      return null;
    }
  },
});

const config = {
  providers: [credentialsConfig],
  callbacks: {
    async session({ session, token }) {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/users/personal-data`,

        {
          headers: { Authorization: `Bearer ${token.sub}` },
          httpsAgent: new https.Agent({
            rejectUnauthorized: false,
          }),
        }
      );

      const { status, data } = response;

      if (status === 200) {
        if (token.name) {
          session.user.name = data.data.full_name;
          session.user.email = data.data.email;
          session.user.role = data.data.role;
          session.user.user_id = data.data.id;
          session.user.image = data.data.image_url;
          session.user.access_token = token.sub!;
        }
      }

      return session;
    },
    async jwt({ token }) {
      return token;
    },
  },
  session: { strategy: "jwt" },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);
