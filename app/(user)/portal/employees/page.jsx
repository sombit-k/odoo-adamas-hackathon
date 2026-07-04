import { getEmployees, getCurrentEmployee } from "@/action/userQueries";
import { EmployeeCard, SummaryCard } from "../../_components/user-ui";

export const dynamic = "force-dynamic";

export default async function EmployeesPage() {
  const [employees, currentEmployee] = await Promise.all([getEmployees(), getCurrentEmployee()]);

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-600">Employee Portal</p>
        <h2 className="mt-2 text-3xl font-bold text-slate-950">Employees</h2>
        <p className="mt-2 text-sm text-slate-500">Browse team members and open a simple view-only profile by clicking a card.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard title="Team Members" value={employees.length} tone="sky" />
        <SummaryCard title="Logged In" value={currentEmployee?.profile?.firstName || currentEmployee?.email || "Employee"} tone="emerald" />
        <SummaryCard title="Status" value="Available" tone="slate" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {employees.map((employee) => (
          <EmployeeCard key={employee.id} user={employee} />
        ))}
      </div>
    </div>
  );
}
