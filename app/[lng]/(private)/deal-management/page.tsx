import DealManager from "./dealManager";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function Page({ params }: { params: Promise<{ lng: string }> }) {
  const session = await auth();
  const { lng } = await params;
  
  // Redirect to login if not authenticated
  if (!session) {
    redirect(`/${lng}/login`);
  }
  
  const accessToken = session?.user?.access_token || "";

  return <DealManager accessToken={accessToken} />;
}
