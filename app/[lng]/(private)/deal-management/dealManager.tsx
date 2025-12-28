"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { DataTable } from "@/components/ui/myTable";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import UpdateDealDialog from "@/components/dialogs/updateDealDialog";
import DeleteDealDialog from "@/components/dialogs/deleteDealDialog";
import CreateDealDialog from "@/components/dialogs/createDealDialog";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/app/i18n/client";



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

export default function DealManager({ accessToken }: { accessToken: string }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const lng = pathname.split("/")[1] as "en" | "bn";
  const { t } = useTranslation(lng, "Language");
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [pagination, setPagination] = useState<{
    currentPage: number;
    itemsPerPage: number;
    totalData: number;
    totalPages: number;
  } | null>(null);

  const fetchDeals = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/deal/table-data`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lg: "en",
          paginationData: {
            itemsPerPage: 12,
            currentPageNumber: currentPage,
            sortOrder: "asc",
            filterBy: "",
          },
        }),
      });
      const data = await res.json();
      setDeals(data.data.deals || []);
      setPagination(data.data.pagination || null);
    } catch (e) {
      setDeals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, [currentPage]);

  const columns = [
    {
      accessorKey: "deal_id",
      header: t("id"),
      cell: (info: any) => info.getValue(),
    },
    {
      accessorKey: "deal_title",
      header: t("dealTitle"),
      cell: (info: any) => info.getValue(),
    },
    {
      accessorKey: "deal_details",
      header: t("dealDetails"),
      cell: (info: any) => info.getValue(),
    },
    {
      accessorKey: "deal_channel",
      header: t("dealChannel"),
      cell: (info: any) => info.getValue(),
    },
    {
      accessorKey: "deal_type",
      header: t("dealType"),
      cell: (info: any) => info.getValue(),
    },
    {
      accessorKey: "deal_start_datetime",
      header: t("startDate"),
      cell: (info: any) => new Date(info.getValue()).toLocaleDateString(),
    },
    {
      accessorKey: "deal_end_datetime",
      header: t("endDate"),
      cell: (info: any) => new Date(info.getValue()).toLocaleDateString(),
    },
    {
      accessorKey: "shop_name",
      header: "Shop",
      cell: (info: any) => info.getValue(),
    },
    {
      accessorKey: "branch_name",
      header: "Branch",
      cell: (info: any) => info.getValue(),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }: any) => {
        const tableData = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-fit">
              <DropdownMenuLabel>{t("actions")}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <UpdateDealDialog dealDetails={tableData} fetchDeals={fetchDeals} accessToken={accessToken} />
              <DeleteDealDialog dealId={tableData.deal_id} dealTitle={tableData.deal_title} fetchDeals={fetchDeals} accessToken={accessToken} />
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="h-screen overflow-y-auto bg-gradient-to-br from-red-50 to-white">
      <div className="container mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        <h1 className="text-2xl font-bold mb-4">{t("dealManagement")}</h1>
        <DataTable 
          data={deals} 
          columns={columns} 
          searchableKey="deal_title"
          toolbarContent={<CreateDealDialog fetchDeals={fetchDeals} accessToken={accessToken} />}
        />
        {loading && <div className="mt-2">{t("loading")}</div>}
      
        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-1 sm:gap-2 mt-6 flex-wrap px-2 flex-shrink-0">
            <Button
              variant="outline"
              disabled={currentPage === 0}
              onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
              className="min-w-[70px] sm:min-w-[100px] text-xs sm:text-sm h-8 sm:h-9 bg-red-100 hover:bg-red-200"
            >
              {t("previous")}
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
                      currentPage === pageIndex ? "bg-red-500 hover:bg-red-600" : "bg-red-100 hover:bg-red-200"
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
              className="min-w-[70px] sm:min-w-[100px] text-xs sm:text-sm h-8 sm:h-9 bg-red-100 hover:bg-red-200"
            >
              {t("next")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
