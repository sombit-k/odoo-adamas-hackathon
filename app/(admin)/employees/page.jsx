import { getAdminDashboardData } from "@/action/adminQueries";
import { EmployeesRoute } from "../_components/admin-ui";

export const dynamic = "force-dynamic";

export default async function EmployeesPage() {
  const data = await getAdminDashboardData();

  return <EmployeesRoute data={data} />;
}
