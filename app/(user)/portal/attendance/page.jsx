import { getMyAttendance, getMyCurrentAttendance } from "@/action/userQueries";
import { AttendancePanel, AttendanceHistory } from "../../_components/user-ui";

export const dynamic = "force-dynamic";

export default async function AttendancePage() {
  const [attendance, currentAttendance] = await Promise.all([getMyAttendance(), getMyCurrentAttendance()]);

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-600">Attendance</p>
        <h2 className="mt-2 text-3xl font-bold text-slate-950">My Attendance</h2>
        <p className="mt-2 text-sm text-slate-500">Check in and out for today, then review your recent activity.</p>
      </div>
      <AttendancePanel attendance={attendance} currentAttendance={currentAttendance} />
      <AttendanceHistory attendance={attendance} />
    </div>
  );
}
