"use client";
import { useTranslation } from "@/app/i18n/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Trash2 } from "lucide-react";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";

interface DeleteDealDialogProps {
  dealId: number;
  dealTitle: string;
  fetchDeals: () => void;
  accessToken: string;
}

const DeleteDealDialog: React.FC<DeleteDealDialogProps> = ({
  dealId,
  dealTitle,
  fetchDeals,
  accessToken,
}) => {
  const pathname = usePathname();
  const lng = pathname.split("/")[1] as "en" | "bn";
  const { t } = useTranslation(lng, "Language");

  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    if (!dealId) {
      toast.error("Deal ID is missing", {
        style: { background: "#D32F2F", color: "#fff" },
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/deal/delete`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            lg: lng,
            dealId: dealId,
          }),
        }
      );

      const result = await response.json();

      if (response.ok && result.status === "success") {
        toast.success(result.message || "Deal deleted successfully", {
          style: { background: "#2E7D32", color: "#fff" },
        });
        setOpen(false);
        fetchDeals(); // Refresh the deals list
      } else {
        toast.error(result.message || "Failed to delete deal", {
          style: { background: "#D32F2F", color: "#fff" },
        });
      }
    } catch (error) {
      console.error("Error deleting deal:", error);
      toast.error("An error occurred while deleting the deal", {
        style: { background: "#D32F2F", color: "#fff" },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="w-full justify-start text-red-600 hover:bg-red-50">
          <Trash2 className="w-4 h-4 mr-2" />
          {t("deleteDeal")}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px] bg-red-50">
        <DialogHeader>
          <DialogTitle>{t("deleteDeal")}</DialogTitle>
          <DialogDescription>
            {t("thisActionCannotBeUndone")}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-gray-700">
            {t("areYouSureYouWantToDelete")}{" "}
            <span className="font-semibold">{dealTitle}</span>?
          </p>
          <p className="text-sm text-red-600 mt-2">
            {t("allAssociatedDataWillBePermanentlyDeleted")}
          </p>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOpen(false)}
            disabled={loading}
            className="bg-white"
          >
            {t("cancel")}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="gap-2 text-white bg-red-600 hover:bg-red-700"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                {t("deleting")}
              </>
            ) : (
              <>
                <Trash2 className="size-4" />
                {t("deleteDeal")}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteDealDialog;
