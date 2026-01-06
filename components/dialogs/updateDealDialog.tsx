"use client";
import { useTranslation } from "@/app/i18n/client";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

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

// Zod schema for form validation
const createUpdateDealSchema = (t: any) =>
  z.object({
    dealTitle: z.string().min(1, t("dealTitleIsRequired")),
    dealDetails: z.string().min(1, t("dealDetailsAreRequired")),
    dealThumbnail: z.any().optional(),
    sourceFacebook: z.string().optional(),
    sourceWebsite: z.string().optional(),
    sourceInstagram: z.string().optional(),
    dealChannel: z.string().min(1, t("selectADealChannel")),
    dealType: z.string().min(1, t("selectADealType")),
    dealStartDatetime: z.string().min(1, t("startDateIsRequired")),
    dealEndDatetime: z.string().min(1, t("endDateIsRequired")),
    branchId: z.number().min(1, t("branchIDIsRequired")),
    shopId: z.number().min(1, t("shopIDIsRequired")),
  });

const UpdateDealDialog: React.FC<UpdateDealDialogProps> = ({
  dealDetails,
  fetchDeals,
  accessToken,
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const pathname = usePathname();
  const lng = pathname.split("/")[1] as "en" | "bn";
  const { t } = useTranslation(lng, "Language");

  const dealSchema = createUpdateDealSchema(t);
  type DealFormInputs = z.infer<typeof dealSchema>;

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
        toast.success(result.message || t("dealUpdatedSuccessfully"), {
          style: { background: "#2E7D32", color: "#fff" },
        });
        fetchDeals();
        setOpen(false);
      } else {
        toast.error(result.message || t("updateFailed"), {
          style: { background: "#D32F2F", color: "#fff" },
        });
      }
    } catch (error) {
      toast.error(t("anErrorOccurred"), {
        style: { background: "#D32F2F", color: "#fff" },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-start hover:bg-red-50"
        >
          <Pencil className="w-4 h-4 mr-2" />
          {t("updateDeal")}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[80vh] overflow-y-auto border-none shadow-none bg-red-50">
        <DialogHeader>
          <DialogTitle>{t("updateDeal")}</DialogTitle>
          <DialogDescription>{t("modifyDealDetailsBelow")}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Deal Title */}
            <FormField
              control={form.control}
              name="dealTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">{t("dealTitle")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("enterDealTitle")}
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
                  <FormLabel className="font-bold">
                    {t("dealDetails")}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t("enterDealDetails")}
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
                  <FormLabel className="font-bold">
                    {t("dealThumbnail")}
                  </FormLabel>
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
                  <FormLabel className="font-bold">
                    {t("facebookURL")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("enterFacebookURL")}
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
                  <FormLabel className="font-bold">{t("websiteURL")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("enterWebsiteURL")}
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
                  <FormLabel className="font-bold">
                    {t("instagramURL")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("enterInstagramURL")}
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
                  <FormLabel className="font-bold">
                    {t("dealChannel")}
                  </FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder={t("selectChannel")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="online">{t("online")}</SelectItem>
                        <SelectItem value="physical">
                          {t("physical")}
                        </SelectItem>
                        <SelectItem value="both">{t("both")}</SelectItem>
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
                  <FormLabel className="font-bold">{t("dealType")}</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder={t("selectType")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="seasonal">
                          {t("seasonal")}
                        </SelectItem>
                        <SelectItem value="promotional">
                          {t("promotional")}
                        </SelectItem>
                        <SelectItem value="flash">{t("flash")}</SelectItem>
                        <SelectItem value="weekend">{t("weekend")}</SelectItem>
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
                  <FormLabel className="font-bold">{t("startDate")}</FormLabel>
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
                  <FormLabel className="font-bold">{t("endDate")}</FormLabel>
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
              {loading ? t("updating") : t("updateDeal")}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateDealDialog;
