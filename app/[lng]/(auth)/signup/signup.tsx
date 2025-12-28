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
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import Select from "react-select";
import { toast } from "sonner";
import { z } from "zod";
import { create } from "zustand";
import bg3 from "../../../../public/bg3.png";

// Zod Schema for YourDeals
const signupSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  contact: z.string().min(6, "Contact number is required"),
});

type SignupFormValues = z.infer<typeof signupSchema>;

// Zustand Store
type SignupState = SignupFormValues & {
  setField: (field: keyof SignupFormValues, value: string) => void;
};

const useSignupStore = create<SignupState>((set) => ({
  fullName: "",
  email: "",
  password: "",
  contact: "",
  setField: (field, value) => set((state) => ({ ...state, [field]: value })),
}));

// Component

export default function Signup() {
  const pathname = usePathname();
  const lng = pathname.split("/")[1] as "en" | "jp";
  const { fullName, email, password, contact } = useSignupStore();
  const [isLoading, setIsLoading] = React.useState(false);
  const [showMessage, setShowMessage] = React.useState(false);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: fullName || "",
      email: email || "",
      password: "",
      contact: "",
    },
  });

  const onSubmit = async (values: SignupFormValues) => {
    try {
      setShowMessage(false);
      setIsLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            lg: lng,
            fullName: values.fullName,
            email: values.email,
            password: values.password,
            contact: values.contact,
          }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        setIsLoading(false);
        form.reset();
        setShowMessage(true);
      } else {
        toast.error(data.status || "Error", {
          description: data.message || "Something went wrong.",
          style: { background: "#D32F2F", color: "#fff" },
        });
      }
    } catch (errorData) {
      console.error("Fetch Error:", errorData);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-red-50 to-white overflow-hidden">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl flex flex-col md:flex-row overflow-hidden min-h-[500px] md:min-h-[600px] items-stretch">
        {/* Left Panel - Form */}
        <div className="w-full md:w-1/2 flex flex-col justify-center bg-white/80 p-10 order-1 md:order-1 h-full">
          <h2 className="text-3xl font-bold mb-2">Create Account</h2>
          <p className="text-gray-500 mb-8">Sign up to get started</p>

          {showMessage && (
            <div className="shadow-md p-4 mb-4">
              <div className="flex justify-between my-2">
                <p className="font-semibold text-green-600">
                  Registration Success !
                </p>
                <X
                  className="cursor-pointer w-4 h-4 text-red-700 font-semibold"
                  onClick={() => {
                    setShowMessage((prev) => !prev);
                  }}
                />
              </div>

              <p className="text-sm">
                You will get a confirmation email after approval by the admin.
              </p>
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Full Name */}
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm text-gray-700 font-bold">
                      Full Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Your full name"
                        className={`bg-red-50 text-base text-gray-800 px-4 py-2 rounded-full pr-4 border mt-2 focus:bg-red-50 ${
                          form.formState.errors.fullName
                            ? "border-red-500 focus:ring-red-500"
                            : "border-none focus:ring-0"
                        }`}
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 text-sm" />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm text-gray-700 font-bold">
                      Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="Enter your email"
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

              {/* Password */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm text-gray-700 font-bold">
                      Password
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder="Enter your password"
                        className={`bg-red-50 text-base text-gray-800 px-4 py-2 rounded-full pr-4 border mt-2 focus:bg-red-50 ${
                          form.formState.errors.password
                            ? "border-red-500 focus:ring-red-500"
                            : "border-none focus:ring-0"
                        }`}
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 text-sm" />
                  </FormItem>
                )}
              />

              {/* Contact */}
              <FormField
                control={form.control}
                name="contact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm text-gray-700 font-bold">
                      Contact Number
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Contact number"
                        className={`bg-red-50 text-base text-gray-800 px-4 py-2 rounded-full pr-4 border mt-2 focus:bg-red-50 ${
                          form.formState.errors.contact
                            ? "border-red-500 focus:ring-red-500"
                            : "border-none focus:ring-0"
                        }`}
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 text-sm" />
                  </FormItem>
                )}
              />

              {/* Redirect to login */}
              <p className="text-center text-sm text-gray-700 mt-2">
                Already have an account?{" "}
                <Link
                  href={`/${lng}/login`}
                  className="text-red-500 hover:underline font-semibold"
                >
                  Login here
                </Link>
              </p>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors font-semibold mt-4 mb-2 py-3"
              >
                {isLoading ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    Signing up
                  </>
                ) : (
                  <> Sign up </>
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
