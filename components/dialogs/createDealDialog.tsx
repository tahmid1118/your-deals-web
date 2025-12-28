"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useState } from "react";
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
import { useTranslation } from "@/app/i18n/client";

// Zod schema for form validation
const dealSchema = z.object({
  dealTitle: z.string().min(1, "Deal title is required"),
  dealDetails: z.string().min(1, "Deal details are required"),
  dealThumbnail: z.any().refine((files) => files?.length > 0, "Deal thumbnail is required"),
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

interface CreateDealDialogProps {
  fetchDeals: () => void;
  accessToken: string;
}

const CreateDealDialog: React.FC<CreateDealDialogProps> = ({
  fetchDeals,
  accessToken,
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const pathname = usePathname();
  const lng = pathname.split("/")[1] as "en" | "bn";
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
      branchId: 1,
      shopId: 1,
    },
  });

  const onSubmit = async (data: DealFormInputs) => {
    setLoading(true);
    try {
      const formData = new FormData();
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
        `${process.env.NEXT_PUBLIC_API_URL}/deal/create`,
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
        toast.success(result.message || "Deal created successfully", {
          style: { background: "#2E7D32", color: "#fff" },
        });
        form.reset();
        fetchDeals();
        setOpen(false);
      } else {
        toast.error(result.message || "Creation failed", {
          style: { background: "#D32F2F", color: "#fff" },
        });
      }
    } catch (error) {
      toast.error("An error occurred while creating the deal", {
        style: { background: "#D32F2F", color: "#fff" },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-red-500 hover:bg-red-600 text-white">
          <Plus className="w-4 h-4 mr-2" />
          {t("createDeal")}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[80vh] overflow-y-auto border-none shadow-none bg-red-50">
        <DialogHeader>
          <DialogTitle>{t("createNewDeal")}</DialogTitle>
          <DialogDescription>
            {t("fillInTheDetailsToCreateANewDeal")}
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
              {loading ? t("creating") : t("createDeal")}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateDealDialog;
