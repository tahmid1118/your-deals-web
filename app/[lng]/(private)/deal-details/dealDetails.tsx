"use client";
import { useTranslation } from "@/app/i18n/client";
import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useRouter } from "next/navigation";
import * as CryptoJS from "crypto-js";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, MapPin, Share2, Star, Facebook, Globe, Instagram } from "lucide-react";

interface DealDetails {
  deal_id: number;
  deal_title: string;
  deal_details: string;
  deal_thumbnail: string;
  source_facebook: string;
  source_website: string;
  source_instagram: string;
  deal_channel: string;
  deal_type: string;
  deal_start_datetime: string;
  deal_end_datetime: string;
  rating: number;
  created_at: string;
  updated_at: string;
  branch_id: number;
  shop_id: number;
  shop_name: string;
  shop_details: string;
  branch_name: string;
  branch_location: string;
  branch_address: string;
  branch_area: string;
  categories: string[];
}

export default function DealDetailsComponent() {
  const [isPortrait, setIsPortrait] = useState<boolean | null>(null);
  const searchParams = useSearchParams();
  const [deal, setDeal] = useState<DealDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [topDeals, setTopDeals] = useState<any[]>([]);
  const [topDealsLoading, setTopDealsLoading] = useState(false);
  const [topDealsError, setTopDealsError] = useState("");
  const pathname = usePathname();
  const router = useRouter();
  const lng = pathname.split("/")[1] as "en" | "jp"; // detect language from URL
  const { t } = useTranslation(lng, "Language");
  useEffect(() => {
    const encodedId = searchParams.get("id");
    if (!encodedId) {
      setError("No deal ID provided.");
      setLoading(false);
      return;
    }
    let dealId: number | null = null;
    try {
      const secretKey = process.env.SECRET_KEY || "default_secret_key";
      const bytes = CryptoJS.AES.decrypt(encodedId, secretKey);
      dealId = parseInt(bytes.toString(CryptoJS.enc.Utf8), 10);
    } catch (e) {
      setError("Invalid deal ID.");
      setLoading(false);
      return;
    }
    if (!dealId) {
      setError("Invalid deal ID.");
      setLoading(false);
      return;
    }
    fetchDealDetails(dealId);
  }, [searchParams]);

  // Fetch random top deals after deal is loaded
  useEffect(() => {
    if (deal && Array.isArray(deal.categories) && deal.categories.length > 0) {
      const categoryIds = deal.categories
        .map((cat: any) => cat.category_id)
        .filter((id: any) => typeof id === "number");
      if (categoryIds.length > 0) {
        setTopDealsLoading(true);
        setTopDealsError("");
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/deal/random-top-deals`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ categoryIds, lg: lng, dealId: deal.deal_id }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.status === "success") {
              setTopDeals(data.data);
            } else {
              setTopDealsError("No top deals found.");
            }
          })
          .catch(() => setTopDealsError("Failed to fetch top deals."))
          .finally(() => setTopDealsLoading(false));
      }
    }
  }, [deal, lng]);

  const fetchDealDetails = async (dealId: number) => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/deal/details`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dealId, lg: "en" }),
      });
      const data = await response.json();
      if (data.status === "success") {
        setDeal(data.data);
      } else {
        setError("Deal not found.");
      }
    } catch (e) {
      setError("Failed to fetch deal details.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-100 to-white">
        <div className="text-xl animate-pulse">Loading deal details...</div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-100 to-white">
        <div className="text-xl text-red-500">{error}</div>
      </div>
    );
  }
  if (!deal) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white">
      {/* Main Content */}
      <main className="container mx-auto px-2 sm:px-4 md:px-8 py-4 sm:py-6 md:py-10">
        <div className="flex flex-col gap-8 lg:gap-12">
          {/* Gallery & Details Section */}
          <div className="w-full flex flex-col gap-4">
            <div className="w-full rounded-2xl overflow-hidden bg-gray-100 shadow-md flex items-center justify-center p-2">
              <Image
                src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/deal-thumbnails/${deal.deal_thumbnail}`}
                alt={deal.deal_title}
                width={600}
                height={600}
                className={
                  `object-contain w-full h-auto block bg-white rounded-xl max-h-[500px] ` +
                  (isPortrait ? 'max-w-[350px] md:max-w-[400px]' : 'max-w-full')
                }
                style={{ aspectRatio: 'auto' }}
                sizes="(max-width: 1024px) 100vw, 60vw"
                priority
                onLoad={e => {
                  const img = e.currentTarget;
                  setIsPortrait(img.naturalHeight > img.naturalWidth);
                }}
              />
            </div>
            <div className="flex flex-wrap gap-2 items-center mt-2">
              <Badge className="bg-red-500 text-white capitalize text-xs px-2 py-1">{deal.deal_type}</Badge>
              <span className="flex items-center gap-1 text-xs text-gray-600"><Star className="h-4 w-4 text-yellow-400" /> {deal.rating ?? 0} ratings</span>
              <span className="flex items-center gap-1 text-xs text-gray-600"><MapPin className="h-4 w-4" /> {deal.branch_location}</span>
              <span className="flex items-center gap-1 text-xs text-gray-600">{deal.deal_channel === 'both' ? '🌐 Both' : deal.deal_channel === 'online' ? '💻 Online' : '🏬 Physical'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold mt-2 mb-1 text-gray-900">{deal.deal_title}</h2>
            <div className="text-gray-700 text-base sm:text-lg mb-2 whitespace-pre-line">{deal.deal_details}</div>
            <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-2">
              <span>Start: {formatDate(deal.deal_start_datetime)}</span>
              <span>End: {formatDate(deal.deal_end_datetime)}</span>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-2">
              <span>Shop: <span className="font-semibold text-gray-700">{deal.shop_name}</span></span>
              <span>Branch: <span className="font-semibold text-gray-700">{deal.branch_name}</span></span>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-2">
              <span>Address: {deal.branch_address}</span>
              <span>Area: {deal.branch_area}</span>
            </div>
            <div className="flex flex-wrap gap-3 items-center text-gray-500 mb-2">
              {deal.source_facebook && (
                <a href={`https://${deal.source_facebook}`} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors" title="Facebook">
                  <Facebook className="h-5 w-5" />
                </a>
              )}
              {deal.source_website && (
                <a href={`https://${deal.source_website}`} target="_blank" rel="noopener noreferrer" className="hover:text-green-600 transition-colors" title="Website">
                  <Globe className="h-5 w-5" />
                </a>
              )}
              {deal.source_instagram && (
                <a href={`https://${deal.source_instagram}`} target="_blank" rel="noopener noreferrer" className="hover:text-pink-500 transition-colors" title="Instagram">
                  <Instagram className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>
        </div>
        {/* Top Deals Section (below main content) */}
        <div className="mt-10 w-full flex flex-col gap-4">
          <h3 className="text-lg font-semibold mb-2">Top Deals You May Like</h3>
          {topDealsLoading ? (
            <div className="text-gray-500">Loading top deals...</div>
          ) : topDealsError ? (
            <div className="text-red-500">{topDealsError}</div>
          ) : topDeals.length === 0 ? (
            <div className="text-gray-400">No top deals found.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {topDeals.map((d) => (
                <div
                  key={d.deal_id + '-' + d.branch_id}
                  className="group cursor-pointer border rounded-xl bg-white shadow hover:shadow-lg transition-shadow overflow-hidden"
                  onClick={() => {
                    const secretKey = process.env.SECRET_KEY || "default_secret_key";
                    const encodedId = CryptoJS.AES.encrypt(d.deal_id.toString(), secretKey).toString();
                    router.push(`/${lng}/deal-details?id=${encodeURIComponent(encodedId)}`);
                  }}
                >
                  <div className="relative aspect-[4/3] w-full bg-gray-100">
                    <Image
                      src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/deal-thumbnails/${d.deal_thumbnail}`}
                      alt={d.deal_title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 100vw, 50vw"
                    />
                  </div>
                  <div className="p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-sm line-clamp-1">{d.shop_name}</h4>
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Heart className="h-3 w-3 text-red-500" />
                        {d.rating ? Math.floor(Number(d.rating)) : 0}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 line-clamp-2">{d.deal_title}</div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <MapPin className="h-3 w-3" />
                      <span>{d.branch_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span>{d.deal_channel === 'both' ? '🌐 Both' : d.deal_channel === 'online' ? '💻 Online' : '🏬 Physical'}</span>
                      <span>{d.deal_type}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
