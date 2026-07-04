import { getAdminDashboardData } from "@/action/adminQueries";
import { PayrollRoute } from "../_components/admin-ui";

export const dynamic = "force-dynamic";

export default async function PayrollPage() {
  const data = await getAdminDashboardData();

  return <PayrollRoute data={data} />;
}
