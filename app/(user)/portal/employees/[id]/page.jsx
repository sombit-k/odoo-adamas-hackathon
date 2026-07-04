import { notFound } from "next/navigation";
import { getCurrentEmployee, getEmployeeById } from "@/action/userQueries";
import { EmployeeDetailView } from "../../../_components/user-ui";

export const dynamic = "force-dynamic";

export default async function EmployeeDetailPage({ params }) {
  const resolvedParams = await params;
  const [currentEmployee, employee] = await Promise.all([
    getCurrentEmployee(),
    getEmployeeById(resolvedParams.id),
  ]);

  if (!employee || !employee.profile) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-600">Employee Profile</p>
        <h2 className="mt-2 text-3xl font-bold text-slate-950">{employee.profile.firstName} {employee.profile.lastName}</h2>
        <p className="mt-2 text-sm text-slate-500">View-only profile page for basic employee information.</p>
      </div>
      <EmployeeDetailView employee={employee} currentEmployee={currentEmployee} />
    </div>
  );
}
