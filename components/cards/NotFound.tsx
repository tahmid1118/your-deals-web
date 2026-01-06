"use client";

import errorAnimation from "@/public/animations/Error 404.json";
import dynamic from "next/dynamic";
import Link from "next/link";

// Dynamically import Lottie with SSR disabled
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

export default function NotFoundCard() {
  return (
    <div className="fixed inset-0 bg-linear-to-br from-red-50 to-white flex flex-col items-center justify-center px-4 text-center bg-background">
      <Lottie
        animationData={errorAnimation}
        loop
        autoplay
        className="w-full max-w-md mb-6"
      />

      <Link
        href="/"
        className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded font-medium transition-colors"
      >
        Return Home
      </Link>
    </div>
  );
}
