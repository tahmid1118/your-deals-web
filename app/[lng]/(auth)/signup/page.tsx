import { Metadata } from "next";
import Signup from "./signup";

export const metadata: Metadata = {
  title: "Signup | YourDeals",
  description: "Signup page",
};

const SignupPage = async () => {
  return (

      <Signup />

  );
};

export default SignupPage;
