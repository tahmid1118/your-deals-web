import DealManager from "./dealManager";
import { auth } from "@/auth";

export default async function Page() {
  const session = await auth();
  const accessToken = session?.user?.access_token || "";

  return <DealManager accessToken={accessToken} />;
}
