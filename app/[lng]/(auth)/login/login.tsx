"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import bg3 from "@/public/bg3.png";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { toast } from "sonner";
import { z } from "zod";
import { create } from "zustand";

// Dummy translation function (replace with your i18n solution)
  // Replace translation function with direct English text
  const t = (key: string) => {
    switch (key) {
      case "welcome_back":
        return "Welcome back!";
      case "login_subtitle":
        return "Sign in to your account to continue.";
      case "email":
        return "Email";
      case "placeholders.enter_email":
        return "Enter your email address";
      case "password":
        return "Password";
      case "placeholders.password_hint":
        return "Enter your password";
      case "forgot_password":
        return "Forgot your password?";
      case "no_account":
        return "Don't have an account?";
      case "signup_here":
        return "Sign up here";
      case "logging_in":
        return "Logging in...";
      case "login":
        return "Login";
      default:
        return key;
    }
  };

// Dummy lng (replace with your routing/i18n solution)
const lng = "en";

// Zod schema for form validation
const schema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  // Extract language from pathname, fallback to 'en'
  const detectedLng = pathname?.split("/")[1] || lng;

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
        lg: detectedLng,
      });
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Logged in!");
        router.push(`/${detectedLng}/user-dashboard`);
      }
    } catch (error) {
      toast.error("Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-red-50 to-white overflow-hidden">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl flex flex-col md:flex-row overflow-hidden min-h-[500px] md:min-h-[600px] items-stretch">
        {/* Left Panel - Form */}
        <div className="w-full md:w-1/2 flex flex-col justify-center bg-white/80 p-10 order-1 md:order-1 h-full">
          <h2 className="text-3xl font-bold mb-2">{t("welcome_back")}</h2>
          <p className="text-gray-500 mb-8">{t("login_subtitle")}</p>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm text-gray-700 font-bold">
                      {t("email")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder={t("placeholders.enter_email")}
                        className={`bg-red-50 text-base text-gray-800 px-4 py-2 rounded-full pr-4 border mt-2 focus:bg-red-50 ${
                          form.formState.errors.email
                            ? "border-red-500 focus:ring-red-500"
                            : "border-none focus:ring-0"
                        }`}
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 text-sm" />
                  </FormItem>
                )}
              />

              {/* Password with toggle */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm text-gray-700 font-bold">
                      {t("password")}
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showPassword ? "text" : "password"}
                          placeholder={t("placeholders.password_hint")}
                          className={`bg-red-50 text-base text-gray-800 px-4 py-2 rounded-full pr-10 border mt-2 focus:bg-red-50 ${
                            form.formState.errors.password
                              ? "border-red-500 focus:ring-red-500"
                              : "border-none focus:ring-0"
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((prev) => !prev)}
                          className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                        >
                          {showPassword ? (
                            <AiOutlineEyeInvisible />
                          ) : (
                            <AiOutlineEye />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-500 text-sm" />
                  </FormItem>
                )}
              />

              {/*
              <div className="flex items-end justify-end text-sm">
                <Link
                  href="forgot-password"
                  className="text-red-500 hover:underline font-semibold"
                >
                  {t("forgot_password")}
                </Link>
              </div>
              */}

              {/*
              <p className="text-center text-sm text-gray-700 mt-2">
                {t("no_account")} {" "}
                <Link
                  href={`/${lng}/signup`}
                  className="text-red-500 hover:underline font-semibold"
                >
                  {t("signup_here")}
                </Link>
              </p>
              */}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors font-semibold mt-4 mb-2 py-3"
              >
                {isLoading ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    {t("logging_in")}
                  </>
                ) : (
                  <> {t("login")} </>
                )}
              </Button>
            </form>
          </Form>
        </div>

        {/* Right Panel (Image) */}
        <div className="w-full md:w-1/2 min-h-[300px] md:min-h-[600px] bg-gradient-to-br from-red-100 to-red-300 relative flex items-center justify-center order-2 md:order-2">
          <Image
            src={bg3}
            alt="Background Graphic"
            fill
            style={{ objectFit: "cover", opacity: 0.6 }}
            priority
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
            <h1 className="text-red-50 text-5xl font-bold tracking-wide mb-4">
              YourDeals
            </h1>
          </div>
        </div>
      </div>
    </div>
  );
}
