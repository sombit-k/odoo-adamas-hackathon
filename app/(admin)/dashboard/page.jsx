import { getAdminDashboardData } from "@/action/adminQueries";
import { DashboardOverview } from "../_components/admin-ui";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const data = await getAdminDashboardData();

  return <DashboardOverview data={data} />;
}
