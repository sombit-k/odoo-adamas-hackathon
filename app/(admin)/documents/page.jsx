import { getAdminDashboardData } from "@/action/adminQueries";
import { DocumentsRoute } from "../_components/admin-ui";

export const dynamic = "force-dynamic";

export default async function DocumentsPage() {
  const data = await getAdminDashboardData();

  return <DocumentsRoute data={data} />;
}
