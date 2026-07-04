import { getAdminDashboardData } from "@/action/adminQueries";
import { TimeOffRoute } from "../_components/admin-ui";

export const dynamic = "force-dynamic";

export default async function TimeOffPage() {
  const data = await getAdminDashboardData();

  return <TimeOffRoute data={data} />;
}
