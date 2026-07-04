import { redirect } from "next/navigation";
import { getCurrentEmployee, getLoginUsers } from "@/action/userQueries";
import { setCurrentEmployee } from "@/action/userActions";

export default async function Home() {
  const [currentEmployee, users] = await Promise.all([getCurrentEmployee(), getLoginUsers()]);

  if (currentEmployee) {
    redirect(currentEmployee.role === "ADMIN" ? "/dashboard" : "/portal/employees");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <div className="w-full max-w-xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">HRMS</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">Choose your workspace</h1>
        <p className="mt-2 text-sm text-slate-500">Select an employee or admin profile to continue into the lightweight HR portal.</p>

        <form action={setCurrentEmployee} className="mt-6 space-y-3">
          <label className="grid gap-1 text-sm font-semibold text-slate-700">
            Select account
            <select name="employeeId" required className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900">
              <option value="" disabled>Select a user</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.profile?.firstName || user.email} {user.profile?.lastName || ""} ({user.role})
                </option>
              ))}
            </select>
          </label>
          <button className="inline-flex h-10 items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-semibold text-white" type="submit">
            Continue
          </button>
        </form>
      </div>
    </main>
  );
}
