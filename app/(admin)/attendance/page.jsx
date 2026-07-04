import { getAdminDashboardData } from "@/action/adminQueries";
import { AttendanceRoute } from "../_components/admin-ui";

export const dynamic = "force-dynamic";

export default async function AttendancePage() {
  const data = await getAdminDashboardData();

  return <AttendanceRoute data={data} />;
}
