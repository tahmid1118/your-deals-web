"use client";
import { Button } from "@/components/ui/button";
import { Heart, Share2, User } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "react";
import { create } from "zustand";

type LanguageState = {
  language: "en" | "bn";
  toggleLanguage: () => void;
  setLanguage: (lang: "en" | "bn") => void;
};

const useLanguageStore = create<LanguageState>((set) => ({
  language: "en",
  toggleLanguage: () =>
    set((state) => ({
      language: state.language === "en" ? "bn" : "en",
    })),
  setLanguage: (lang) => set({ language: lang }),
}));

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const { language, setLanguage } = useLanguageStore();
  const lng = pathname.split("/")[1] as "en" | "bn";

  useEffect(() => {
    if (lng && lng !== language && ["en", "bn"].includes(lng)) {
      setLanguage(lng as "en" | "bn");
    }
  }, [lng, language, setLanguage]);

  const handleLanguageChange = (newLanguage: "en" | "bn") => {
    const currentUrl = window.location.href;
    const updatedUrl = currentUrl.replace(/\/(en|bn)\//, `/${newLanguage}/`);
    router.push(updatedUrl);
    setLanguage(newLanguage);
  };

  const handleLogin = () => {
    router.push("/en/login");
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/en/login" });
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 border-b shadow-sm backdrop-blur-md">
      <div className="container mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <Link href="/en/user-dashboard" className="focus:outline-none">
            <span className="text-lg sm:text-xl md:text-2xl font-bold text-red-500 tracking-tight cursor-pointer">YourDeals</span>
          </Link>
          {/* DealDetails header actions */}
          {pathname.includes("deal-details") ? (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" title="Share"><Share2 className="h-5 w-5" /></Button>
              <Button variant="ghost" size="icon" title="Save"><Heart className="h-5 w-5" /></Button>
            </div>
          ) : (
            <div className="flex items-center gap-1 sm:gap-2 md:gap-4">
              {/* Language Selector */}
              <div className="flex items-center bg-red-50 rounded-full px-2 py-1 shadow-sm gap-1">
                <button
                  onClick={() => handleLanguageChange("en")}
                  className={`px-2 py-1 rounded-full text-xs sm:text-sm font-semibold transition-colors ${
                    language === "en" ? "bg-red-500 text-white" : "text-gray-700 hover:bg-red-100"
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => handleLanguageChange("bn")}
                  className={`px-2 py-1 rounded-full text-xs sm:text-sm font-semibold transition-colors ${
                    language === "bn" ? "bg-red-500 text-white" : "text-gray-700 hover:bg-red-100"
                  }`}
                >
                  BN
                </button>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9">
                    <User className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {!session ? (
                    <DropdownMenuItem onClick={handleLogin}>Login</DropdownMenuItem>
                  ) : (
                    <>
                      <div className="px-2 py-2 text-sm font-semibold text-gray-700 border-b">
                        {session.user?.name}
                      </div>
                      <DropdownMenuItem
                        onClick={() => {
                          const lng = pathname.split("/")[1] || "en";
                          router.push(`/${lng}/deal-management`);
                        }}
                        className="hover:bg-red-50"
                      >
                        Deal Management
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleLogout} className="hover:bg-red-50">Logout</DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
