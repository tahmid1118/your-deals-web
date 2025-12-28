"use client";
import { useTranslation } from "@/app/i18n/client";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import * as CryptoJS from "crypto-js";
import Image from "next/image";
import { Heart, MapPin, Star, Search, Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Deal {
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
  rating: number | null;
  created_at: string;
  updated_at: string | null;
  branch_id: number;
  shop_id: number;
  shop_name: string;
  branch_name: string;
}

interface PaginationData {
  currentPage: number;
  itemsPerPage: number;
  totalData: number;
  totalPages: number;
}

interface DealsResponse {
  status: string;
  message: string;
  data: {
    deals: Deal[];
    pagination: PaginationData;
  };
}


import CookiesProviderWrapper from "@/components/CookiesProviderWrapper";

function UserDashboardComponent() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const router = useRouter();
  const pathname = usePathname();
  const lng = pathname.split("/")[1] as "en" | "jp"; // detect language from URL
  const { t } = useTranslation(lng, "Language");
  const fetchDeals = async (page: number = 0) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/deal/table-data`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            lg: "en",
            paginationData: {
              itemsPerPage: 10,
              currentPageNumber: page,
              sortOrder: "desc",
              filterBy: "",
            },
            filter: {
              shopId: null,
              branchId: null,
              categoryTitle: null,
              targetCustomer: null,
            },
          }),
        }
      );

      const data: DealsResponse = await response.json();
      if (data.status === "success") {
        setDeals(data.data.deals);
        setPagination(data.data.pagination);
      }
    } catch (error) {
      console.error("Error fetching deals:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals(currentPage);
  }, [currentPage]);

  const handleRating = async (dealId: number) => {
    // Find the current deal and its rating from the latest state
    const deal = deals.find((d) => d.deal_id === dealId);
    // Always treat rating as integer for calculation
    const currentRating = deal?.rating ? Math.floor(Number(deal.rating)) : 0;
    const newRating = currentRating + 1;

    // Update UI immediately
    setDeals((prevDeals) => {
      const updatedDeals = prevDeals.map((d) =>
        d.deal_id === dealId ? { ...d, rating: newRating } : d
      );
      // Sort by rating (highest first), null ratings go to the end
      return updatedDeals.sort((a, b) => {
        const ratingA = a.rating ?? -1;
        const ratingB = b.rating ?? -1;
        return ratingB - ratingA;
      });
    });

    // Send API call in background
    try {
      const formData = new FormData();
      formData.append("dealId", dealId.toString());
      formData.append("rating", newRating.toString());
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/deal/update`,
        {
          method: "POST",
          body: formData,
        }
      );
    } catch (error) {
      console.error("Error updating rating:", error);
    }
  };

  const handleImageError = (dealId: number) => {
    setImageErrors((prev) => {
      const newErrors = new Set(prev);
      newErrors.add(dealId);
      return newErrors;
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getDealTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      seasonal: "bg-blue-500",
      promotional: "bg-green-500",
      flash: "bg-red-500",
      weekend: "bg-purple-500",
    };
    return colors[type] || "bg-gray-500";
  };

  const getChannelBadge = (channel: string) => {
    const badges: { [key: string]: string } = {
      both: "🌐 Both",
      online: "💻 Online",
      physical: "🏬 Physical",
    };
    return badges[channel] || channel;
  };

  if (loading && deals.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading deals...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white">
      {/* Search Bar */}
      <div className="bg-white py-3 sm:py-4 md:py-6 border-b">
        <div className="container mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center max-w-4xl mx-auto">
            <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 border rounded-2xl sm:rounded-full px-3 sm:px-4 md:px-6 py-2 sm:py-3 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex-1 min-w-0">
                <label className="text-xs font-semibold block mb-0.5">Where</label>
                <input
                  type="text"
                  placeholder="Search destinations"
                  className="w-full border-none outline-none text-xs sm:text-sm bg-transparent"
                />
              </div>
              <div className="hidden sm:block border-l h-12"></div>
              <div className="flex-1 min-w-0 sm:pl-4">
                <label className="text-xs font-semibold block mb-0.5">When</label>
                <input
                  type="text"
                  placeholder="Add dates"
                  className="w-full border-none outline-none text-xs sm:text-sm bg-transparent"
                />
              </div>
              <div className="hidden sm:block border-l h-12"></div>
              <div className="flex-1 min-w-0 sm:pl-4">
                <label className="text-xs font-semibold block mb-0.5">Category</label>
                <input
                  type="text"
                  placeholder="All deals"
                  className="w-full border-none outline-none text-xs sm:text-sm bg-transparent"
                />
              </div>
              <Button
                size="icon"
                className="bg-red-500 hover:bg-red-600 rounded-full h-10 w-10 sm:h-12 sm:w-12 shrink-0 self-center sm:self-auto"
              >
                <Search className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold">
            Popular Deals in Your Area →
          </h2>
        </div>

        {/* Deals Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
          {deals.map((deal) => (
            <Card
              key={deal.deal_id}
              className="group cursor-pointer border-none shadow-none hover:shadow-lg transition-shadow"
              onClick={() => {
                const secretKey = process.env.SECRET_KEY || "default_secret_key";
                const encodedId = CryptoJS.AES.encrypt(deal.deal_id.toString(), secretKey).toString();
                router.push(`/${lng}/deal-details?id=${encodeURIComponent(encodedId)}`);
              }}
            >
              <CardContent className="p-0">
                {/* Image Container */}
                <div className="relative aspect-square rounded-lg sm:rounded-xl overflow-hidden mb-2 sm:mb-3 bg-gray-100">
                  {imageErrors.has(deal.deal_id) ? (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <div className="text-center">
                        <div className="text-2xl sm:text-4xl mb-2">📦</div>
                        <div className="text-xs sm:text-sm">Deal Image</div>
                      </div>
                    </div>
                  ) : (
                    <Image
                      src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/deal-thumbnails/${deal.deal_thumbnail}`}
                      alt={deal.deal_title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                      onError={() => handleImageError(deal.deal_id)}
                    />
                  )}
                  {/* Rating Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleRating(deal.deal_id);
                      // Animation: add a class for a short pulse
                      const btn = e.currentTarget;
                      btn.classList.remove('animate-ping-heart');
                      void btn.offsetWidth; // trigger reflow
                      btn.classList.add('animate-ping-heart');
                    }}
                    className={
                      `absolute top-2 right-2 p-1.5 sm:p-2 rounded-full bg-white/90 transition-colors hover:bg-white cursor-pointer`
                    }
                    type="button"
                  >
                    <Heart
                      className="h-3 w-3 sm:h-4 sm:w-4 text-gray-700 transition-transform"
                    />
                    <style jsx>{`
                      .animate-ping-heart {
                        animation: ping-heart 0.4s cubic-bezier(0.4, 0, 0.6, 1);
                      }
                      @keyframes ping-heart {
                        0% { transform: scale(1); }
                        50% { transform: scale(1.4); }
                        100% { transform: scale(1); }
                      }
                    `}</style>
                  </button>
                  {/* Guest Favorite Badge */}
                  {/* <div className="absolute top-3 left-3">
                    <Badge className="bg-white text-gray-900 text-xs px-2 py-1">
                      Guest favorite
                    </Badge>
                  </div> */}
                  {/* Deal Type Badge */}
                  {/* <div className="absolute bottom-3 left-3">
                    <Badge
                      className={`${getDealTypeColor(
                        deal.deal_type
                      )} text-white text-xs px-2 py-1 capitalize`}
                    >
                      {deal.deal_type}
                    </Badge>
                  </div> */}
                </div>

                {/* Deal Info */}
                <div className="space-y-1 sm:space-y-2 px-1.5 sm:px-2 pb-1.5 sm:pb-2">
                  <div className="flex items-start justify-between gap-1 sm:gap-2">
                    <h3 className="font-semibold text-xs sm:text-sm line-clamp-1">
                      {deal.shop_name}
                    </h3>
                    <div className="flex items-center gap-0.5 sm:gap-1 text-xs shrink-0">
                      <Heart className="h-2.5 w-2.5 sm:h-3 sm:w-3 fill-red-500 text-red-500" />
                      <span className="font-semibold text-xs">
                        {deal.rating ? Math.floor(Number(deal.rating)) : 0}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-0.5 sm:gap-1 text-xs text-gray-600">
                    <MapPin className="h-2.5 w-2.5 sm:h-3 sm:w-3 shrink-0" />
                    <span className="line-clamp-1 text-xs">{deal.branch_name}</span>
                  </div>

                  <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
                    {deal.deal_title}
                  </p>

                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="text-xs">{getChannelBadge(deal.deal_channel)}</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="text-xs">
                      {formatDate(deal.deal_start_datetime)} -{" "}
                      {formatDate(deal.deal_end_datetime)}
                    </span>
                  </div>

                  {/* <div className="pt-1">
                    <p className="text-sm">
                      <span className="font-semibold">Limited Time</span>
                    </p>
                  </div> */}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-1 sm:gap-2 mt-6 sm:mt-8 md:mt-12 flex-wrap px-2">
            <Button
              variant="outline"
              disabled={currentPage === 0}
              onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
              className="min-w-[70px] sm:min-w-[100px] text-xs sm:text-sm h-8 sm:h-9"
            >
              Previous
            </Button>
            <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-center">
              {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                const pageIndex = currentPage < 3 ? i : currentPage - 2 + i;
                if (pageIndex >= pagination.totalPages) return null;
                return (
                  <Button
                    key={pageIndex}
                    variant={currentPage === pageIndex ? "default" : "outline"}
                    onClick={() => setCurrentPage(pageIndex)}
                    className={`h-8 w-8 sm:h-9 sm:w-9 p-0 text-xs sm:text-sm ${
                      currentPage === pageIndex ? "bg-red-500 hover:bg-red-600" : ""
                    }`}
                  >
                    {pageIndex + 1}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              disabled={currentPage === pagination.totalPages - 1}
              onClick={() => setCurrentPage((prev) => Math.min(pagination.totalPages - 1, prev + 1))}
              className="min-w-[70px] sm:min-w-[100px] text-xs sm:text-sm h-8 sm:h-9"
            >
              Next
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}

export default function UserDashboard(props) {
  return (
    <CookiesProviderWrapper>
      <UserDashboardComponent {...props} />
    </CookiesProviderWrapper>
  );
}
