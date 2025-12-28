"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useTranslation } from "@/app/i18n/client";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePathname } from "next/navigation";

// Zod schema for form validation
const dealSchema = z.object({
  dealTitle: z.string().min(1, "Deal title is required"),
  dealDetails: z.string().min(1, "Deal details are required"),
  dealThumbnail: z.any().optional(),
  sourceFacebook: z.string().optional(),
  sourceWebsite: z.string().optional(),
  sourceInstagram: z.string().optional(),
  dealChannel: z.string().min(1, "Select a deal channel"),
  dealType: z.string().min(1, "Select a deal type"),
  dealStartDatetime: z.string().min(1, "Start date is required"),
  dealEndDatetime: z.string().min(1, "End date is required"),
  branchId: z.number().min(1, "Branch ID is required"),
  shopId: z.number().min(1, "Shop ID is required"),
});

type DealFormInputs = z.infer<typeof dealSchema>;

interface UpdateDealDialogProps {
  dealDetails: {
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
    branch_id: number;
    shop_id: number;
  };
  fetchDeals: () => void;
  accessToken: string;
}

const UpdateDealDialog: React.FC<UpdateDealDialogProps> = ({
  dealDetails,
  fetchDeals,
  accessToken,
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const pathname = usePathname();
  const lng = pathname.split("/")[1] as "en" | "jp";
  const { t } = useTranslation(lng, "Language");

  const form = useForm<DealFormInputs>({
    resolver: zodResolver(dealSchema),
    defaultValues: {
      dealTitle: "",
      dealDetails: "",
      sourceFacebook: "",
      sourceWebsite: "",
      sourceInstagram: "",
      dealChannel: "",
      dealType: "",
      dealStartDatetime: "",
      dealEndDatetime: "",
      branchId: 0,
      shopId: 0,
    },
  });

  // Populate form with existing deal details
  useEffect(() => {
    if (dealDetails) {
      form.reset({
        dealTitle: dealDetails.deal_title,
        dealDetails: dealDetails.deal_details,
        sourceFacebook: dealDetails.source_facebook || "",
        sourceWebsite: dealDetails.source_website || "",
        sourceInstagram: dealDetails.source_instagram || "",
        dealChannel: dealDetails.deal_channel,
        dealType: dealDetails.deal_type,
        dealStartDatetime: dealDetails.deal_start_datetime.split("T")[0],
        dealEndDatetime: dealDetails.deal_end_datetime.split("T")[0],
        branchId: dealDetails.branch_id,
        shopId: dealDetails.shop_id,
      });
    }
  }, [dealDetails, form]);

  const onSubmit = async (data: DealFormInputs) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("dealId", dealDetails.deal_id.toString());
      formData.append("dealTitle", data.dealTitle);
      formData.append("dealDetails", data.dealDetails);
      formData.append("sourceFacebook", data.sourceFacebook || "");
      formData.append("sourceWebsite", data.sourceWebsite || "");
      formData.append("sourceInstagram", data.sourceInstagram || "");
      formData.append("dealChannel", data.dealChannel);
      formData.append("dealType", data.dealType);
      formData.append("dealStartDatetime", data.dealStartDatetime);
      formData.append("dealEndDatetime", data.dealEndDatetime);
      formData.append("branchId", data.branchId.toString());
      formData.append("shopId", data.shopId.toString());

      if (data.dealThumbnail && data.dealThumbnail[0]) {
        formData.append("dealThumbnail", data.dealThumbnail[0]);
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/deal/update`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: formData,
        }
      );

      const result = await response.json();

      if (response.ok && result.status === "success") {
        toast.success(result.message || "Deal updated successfully", {
          style: { background: "#2E7D32", color: "#fff" },
        });
        fetchDeals();
        setOpen(false);
      } else {
        toast.error(result.message || "Update failed", {
          style: { background: "#D32F2F", color: "#fff" },
        });
      }
    } catch (error) {
      toast.error("An error occurred", {
        style: { background: "#D32F2F", color: "#fff" },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="w-full justify-start hover:bg-red-50">
          <Pencil className="w-4 h-4 mr-2" />
          Update Deal
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[80vh] overflow-y-auto border-none shadow-none bg-red-50">
        <DialogHeader>
          <DialogTitle>Update Deal</DialogTitle>
          <DialogDescription>
            Modify deal details below
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Deal Title */}
            <FormField
              control={form.control}
              name="dealTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Deal Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter deal title"
                      {...field}
                      className="bg-white p-3 rounded-lg"
                    />
                  </FormControl>
                  <FormMessage className="text-red-600" />
                </FormItem>
              )}
            />

            {/* Deal Details */}
            <FormField
              control={form.control}
              name="dealDetails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Deal Details</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter deal details"
                      {...field}
                      className="bg-white p-3 rounded-lg"
                    />
                  </FormControl>
                  <FormMessage className="text-red-600" />
                </FormItem>
              )}
            />

            {/* Deal Thumbnail */}
            <FormField
              control={form.control}
              name="dealThumbnail"
              render={({ field: { onChange, value, ...field } }) => (
                <FormItem>
                  <FormLabel className="font-bold">Deal Thumbnail</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => onChange(e.target.files)}
                      {...field}
                      className="bg-white p-3 rounded-lg"
                    />
                  </FormControl>
                  <FormMessage className="text-red-600" />
                </FormItem>
              )}
            />

            {/* Source Facebook */}
            <FormField
              control={form.control}
              name="sourceFacebook"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Facebook URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter Facebook URL"
                      {...field}
                      className="bg-white p-3 rounded-lg"
                    />
                  </FormControl>
                  <FormMessage className="text-red-600" />
                </FormItem>
              )}
            />

            {/* Source Website */}
            <FormField
              control={form.control}
              name="sourceWebsite"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Website URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter website URL"
                      {...field}
                      className="bg-white p-3 rounded-lg"
                    />
                  </FormControl>
                  <FormMessage className="text-red-600" />
                </FormItem>
              )}
            />

            {/* Source Instagram */}
            <FormField
              control={form.control}
              name="sourceInstagram"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Instagram URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter Instagram URL"
                      {...field}
                      className="bg-white p-3 rounded-lg"
                    />
                  </FormControl>
                  <FormMessage className="text-red-600" />
                </FormItem>
              )}
            />

            {/* Deal Channel */}
            <FormField
              control={form.control}
              name="dealChannel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Deal Channel</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Select channel" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="online">Online</SelectItem>
                        <SelectItem value="physical">Physical</SelectItem>
                        <SelectItem value="both">Both</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage className="text-red-600" />
                </FormItem>
              )}
            />

            {/* Deal Type */}
            <FormField
              control={form.control}
              name="dealType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Deal Type</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="seasonal">Seasonal</SelectItem>
                        <SelectItem value="promotional">Promotional</SelectItem>
                        <SelectItem value="flash">Flash</SelectItem>
                        <SelectItem value="weekend">Weekend</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage className="text-red-600" />
                </FormItem>
              )}
            />

            {/* Start Date */}
            <FormField
              control={form.control}
              name="dealStartDatetime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Start Date</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      className="bg-white p-3 rounded-lg"
                    />
                  </FormControl>
                  <FormMessage className="text-red-600" />
                </FormItem>
              )}
            />

            {/* End Date */}
            <FormField
              control={form.control}
              name="dealEndDatetime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">End Date</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      className="bg-white p-3 rounded-lg"
                    />
                  </FormControl>
                  <FormMessage className="text-red-600" />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-red-500 text-white hover:bg-red-600"
            >
              {loading ? "Updating..." : "Update Deal"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateDealDialog;
