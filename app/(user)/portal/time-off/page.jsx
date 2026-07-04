import { getMyLeaveRequests } from "@/action/userQueries";
import { LeaveRequestForm, LeaveRequestPanel } from "../../_components/user-ui";

export const dynamic = "force-dynamic";

export default async function TimeOffPage() {
  const leaves = await getMyLeaveRequests();

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-600">Time Off</p>
        <h2 className="mt-2 text-3xl font-bold text-slate-950">My Time Off</h2>
        <p className="mt-2 text-sm text-slate-500">Create a simple leave request and track its status.</p>
      </div>
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <LeaveRequestForm />
        <LeaveRequestPanel leaves={leaves} />
      </div>
    </div>
  );
}
