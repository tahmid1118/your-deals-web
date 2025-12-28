"use client";
import { Button } from "@/components/ui/button";
import { Heart, Share2, User } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";





export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

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
              {session?.user?.name && (
                <span className="text-base font-medium text-gray-700 mr-2">Hello, {session.user.name}!</span>
              )}
              {/* Deal Management button for logged in users */}
              {session && (
                <Button
                  variant="outline"
                  className="mr-2 hidden sm:inline-flex"
                  onClick={() => {
                    // Try to detect language from path, fallback to 'en'
                    const lng = pathname.split("/")[1] || "en";
                    router.push(`/${lng}/deal-management`);
                  }}
                >
                  Add an item Deal Management
                </Button>
              )}
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
                    <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
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
