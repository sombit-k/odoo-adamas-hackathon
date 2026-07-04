import { getMyPayroll, getMyProfile } from "@/action/userQueries";
import { ProfilePanel, ProfileEditor, SalaryPanel } from "../../_components/user-ui";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const [currentEmployee, payroll] = await Promise.all([getMyProfile(), getMyPayroll()]);

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-600">My Profile</p>
        <h2 className="mt-2 text-3xl font-bold text-slate-950">Profile & Salary</h2>
        <p className="mt-2 text-sm text-slate-500">Review your basic information and view salary details that are read-only.</p>
      </div>
      <ProfilePanel profile={currentEmployee?.profile} currentEmployee={currentEmployee} />
      <ProfileEditor currentEmployee={currentEmployee} />
      <SalaryPanel payroll={payroll} />
    </div>
  );
}
