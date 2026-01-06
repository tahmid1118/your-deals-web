"use client";
import { useTranslation } from "@/app/i18n/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Heart, Share2, User } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
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
  const { t } = useTranslation(lng, "Language");

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
    router.push(`/${lng}/login`);
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: `/${lng}/login` });
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 border-b shadow-sm backdrop-blur-md">
      <div className="container mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <Link href={`/${lng}/user-dashboard`} className="focus:outline-none">
            <span className="text-lg sm:text-xl md:text-2xl font-bold text-red-500 tracking-tight cursor-pointer">
              YourDeals
            </span>
          </Link>
          {/* DealDetails header actions */}
          {pathname.includes("deal-details") ? (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" title={t("share")}>
                <Share2 className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" title={t("save")}>
                <Heart className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-1 sm:gap-2 md:gap-4">
              {/* Language Selector Slider */}
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs sm:text-sm font-semibold transition-colors ${language === "en" ? "text-red-500" : "text-gray-500"}`}
                >
                  EN
                </span>
                <button
                  onClick={() =>
                    handleLanguageChange(language === "en" ? "bn" : "en")
                  }
                  className="relative inline-flex h-6 w-11 items-center rounded-full bg-red-100 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  role="switch"
                  aria-checked={language === "bn"}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-red-500 transition-transform ${
                      language === "bn" ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
                <span
                  className={`text-xs sm:text-sm font-semibold transition-colors ${language === "bn" ? "text-red-500" : "text-gray-500"}`}
                >
                  BN
                </span>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 sm:h-9 sm:w-9"
                  >
                    <User className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {!session ? (
                    <DropdownMenuItem onClick={handleLogin}>
                      {t("login")}
                    </DropdownMenuItem>
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
                        {t("dealManagement")}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="hover:bg-red-50"
                      >
                        {t("logout")}
                      </DropdownMenuItem>
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
