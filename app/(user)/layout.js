import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentEmployee, getMyCurrentAttendance } from "@/action/userQueries";
import { clearCurrentEmployee } from "@/action/userActions";

const navItems = [
  { href: "/portal/employees", label: "Employees" },
  { href: "/portal/attendance", label: "Attendance" },
  { href: "/portal/time-off", label: "Time Off" },
];

export const metadata = {
  title: "Employee Portal | HRMS",
  description: "Basic employee side of the HRMS",
};

export default async function UserLayout({ children }) {
  const [employee, currentAttendance] = await Promise.all([getCurrentEmployee(), getMyCurrentAttendance()]);

  if (!employee) {
    redirect("/");
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-600">
              Human Resource Management System
            </p>
            <h1 className="text-xl font-bold">Employee Portal</h1>
          </div>
          <nav className="flex flex-wrap items-center gap-2 text-sm font-semibold">
            {navItems.map((item) => (
              <Link
                key={item.href}
                className="inline-flex h-9 items-center justify-center rounded-md border border-slate-200 px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                href={item.href}
              >
                {item.label}
              </Link>
            ))}
            <div className="relative group">
              <button className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-100 text-sm font-bold text-rose-700">
                  {employee.profile?.firstName?.slice(0, 1)?.toUpperCase() || "U"}
                </span>
                <span>{employee.profile?.firstName || employee.email}</span>
                <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${currentAttendance?.checkIn && !currentAttendance?.checkOut ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                  {currentAttendance?.checkIn && !currentAttendance?.checkOut ? "In" : "Out"}
                </span>
              </button>
              <div className="absolute right-0 mt-2 hidden min-w-40 rounded-md border border-slate-200 bg-white p-2 shadow-sm group-hover:block">
                <Link href="/portal/profile" className="block rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">My Profile</Link>
                <form action={clearCurrentEmployee}>
                  <button className="block w-full rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50" type="submit">Log Out</button>
                </form>
              </div>
            </div>
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">{children}</div>
    </main>
  );
}
