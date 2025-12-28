import { auth } from "@/auth";
import { Metadata } from "next";
import Login from "./login";

export const metadata: Metadata = {
  title: "Login | UXPMT",
  description: "Login page",
};


import { redirect } from "next/navigation";

const LoginPage = async () => {
  const session = await auth();
  if (session?.user?.user_id) {
    redirect("/en/user-dashboard");
  }
  return (
    <div className="bg-blue-100 px-4 ">
      <Login />
    </div>
  );
};

export default LoginPage;
