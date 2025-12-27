"use client";
import { Button } from "@/components/ui/button";
import { Heart, Share2, Bell, User } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function Header() {
  const pathname = usePathname();
  // You can add logic here to customize header per route if needed
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
            // UserDashboard header actions
            <div className="flex items-center gap-1 sm:gap-2 md:gap-4">
              <Button variant="ghost" className="hidden md:inline-flex text-sm">
                My Favorites
              </Button>
              <Button variant="ghost" size="icon" title="Notifications" className="h-8 w-8 sm:h-9 sm:w-9">
                <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <Button variant="ghost" size="icon" title="Profile" className="h-8 w-8 sm:h-9 sm:w-9">
                <User className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
