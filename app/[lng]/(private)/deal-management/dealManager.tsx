"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { DataTable } from "@/components/ui/myTable";


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

const columns = [
  {
    accessorKey: "deal_id",
    header: "ID",
    cell: (info: any) => info.getValue(),
  },
  {
    accessorKey: "deal_title",
    header: "Title",
    cell: (info: any) => info.getValue(),
  },
  {
    accessorKey: "deal_details",
    header: "Details",
    cell: (info: any) => info.getValue(),
  },
  {
    accessorKey: "deal_channel",
    header: "Channel",
    cell: (info: any) => info.getValue(),
  },
  {
    accessorKey: "deal_type",
    header: "Type",
    cell: (info: any) => info.getValue(),
  },
  {
    accessorKey: "deal_start_datetime",
    header: "Start",
    cell: (info: any) => new Date(info.getValue()).toLocaleDateString(),
  },
  {
    accessorKey: "deal_end_datetime",
    header: "End",
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
];

export default function DealManager() {
  const { data: session } = useSession();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeals = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/deal/table-data`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lg: "en",
            paginationData: {
              itemsPerPage: 5,
              currentPageNumber: 0,
              sortOrder: "asc",
              filterBy: "",
            },
          }),
        });
        const data = await res.json();
        setDeals(data.data.deals || []);
      } catch (e) {
        setDeals([]);
      } finally {
        setLoading(false);
      }
    };
    fetchDeals();
  }, []);

  return (
    <div className="p-6 ">
      <h1 className="text-2xl font-bold mb-4">Deal Management</h1>
      <DataTable data={deals} columns={columns} searchableKey="deal_title" />
      {loading && <div className="mt-4">Loading...</div>}
    </div>
  );
}
