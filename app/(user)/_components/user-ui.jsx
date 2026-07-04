import Link from "next/link";
import { checkIn, checkOut, createLeaveRequest, updateMyProfile } from "@/action/userActions";
import { formatCurrency, formatDate, formatTime, getDisplayName } from "@/action/adminQueries";
import { fieldClass, labelClass, buttonClass, ghostButtonClass } from "@/app/(admin)/_components/admin-ui";

function Avatar({ name, image, size = "h-12 w-12" }) {
  if (image) {
    return <img src={image} alt={name} className={`${size} rounded-full object-cover`} />;
  }

  return (
    <div className={`${size} flex items-center justify-center rounded-full bg-rose-100 text-lg font-bold text-rose-700`}>
      {name.slice(0, 1).toUpperCase()}
    </div>
  );
}

function statusBadge(status) {
  const palette = {
    emerald: "bg-emerald-100 text-emerald-700",
    amber: "bg-amber-100 text-amber-700",
    slate: "bg-slate-100 text-slate-700",
  };

  const mapping = {
    Present: { tone: "emerald", label: "Present" },
    "On Leave": { tone: "amber", label: "On Leave" },
    Absent: { tone: "amber", label: "Absent" },
  };

  const current = mapping[status] || { tone: "slate", label: status };
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${palette[current.tone]}`}>
      {current.label}
    </span>
  );
}

export function EmployeeCard({ user }) {
  return (
    <Link href={`/portal/employees/${user.id}`} className="block rounded-lg border border-slate-200 bg-white p-4 transition hover:border-sky-300 hover:shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar name={getDisplayName(user)} image={user.profile?.profileImage} />
          <div>
            <h3 className="font-semibold text-slate-950">{getDisplayName(user)}</h3>
            <p className="text-sm text-slate-500">{user.profile?.designation || "Employee"}</p>
          </div>
        </div>
        {statusBadge(user.status?.label || "Absent")}
      </div>
      <p className="mt-4 text-sm text-slate-600">{user.profile?.department || "General"}</p>
    </Link>
  );
}

export function EmployeeDetailView({ employee, currentEmployee }) {
  const profile = employee?.profile;
  const isMine = currentEmployee?.id === employee?.id;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-center gap-4">
          <Avatar name={getDisplayName(employee)} image={profile?.profileImage} size="h-16 w-16" />
          <div>
            <h2 className="text-2xl font-bold text-slate-950">{getDisplayName(employee)}</h2>
            <p className="text-sm text-slate-500">{profile?.designation || "Employee"}</p>
            <p className="mt-1 text-sm text-slate-500">{profile?.department || "General"}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
          <p><strong className="text-slate-900">Employee ID:</strong> {employee?.employeeId}</p>
          <p><strong className="text-slate-900">Email:</strong> {employee?.email}</p>
          <p><strong className="text-slate-900">Phone:</strong> {profile?.phone || "Not set"}</p>
          <p><strong className="text-slate-900">Location:</strong> {profile?.address || "Not set"}</p>
        </div>

        {!isMine ? (
          <div className="mt-6 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
            This is a view-only profile card. Private details and editing are only available for your own account.
          </div>
        ) : null}
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <h3 className="text-lg font-bold text-slate-950">Basic Information</h3>
        <dl className="mt-4 grid gap-3 text-sm text-slate-600">
          <div className="flex justify-between gap-3"><dt>Gender</dt><dd>{profile?.gender || "Not set"}</dd></div>
          <div className="flex justify-between gap-3"><dt>Joining Date</dt><dd>{formatDate(profile?.joiningDate)}</dd></div>
          <div className="flex justify-between gap-3"><dt>Manager</dt><dd>Not available</dd></div>
          <div className="flex justify-between gap-3"><dt>Company</dt><dd>Adamas</dd></div>
        </dl>
      </div>
    </div>
  );
}

export function AttendancePanel({ attendance, currentAttendance }) {
  const checkedIn = Boolean(currentAttendance?.checkIn && !currentAttendance?.checkOut);

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">Attendance</p>
          <h2 className="mt-1 text-2xl font-bold text-slate-950">{checkedIn ? "Checked In" : "Ready to Check In"}</h2>
        </div>
        <div className="flex gap-2">
          <form action={checkedIn ? checkOut : checkIn}>
            <button className={buttonClass} type="submit">
              {checkedIn ? "Check Out" : "Check In"}
            </button>
          </form>
        </div>
      </div>
      <div className="mt-6 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
        <div className="rounded-md border border-slate-200 p-3">
          <p className="font-semibold text-slate-900">Today</p>
          <p className="mt-2">{currentAttendance?.checkIn ? `Checked in at ${formatTime(currentAttendance.checkIn)}` : "Not checked in yet"}</p>
          <p className="mt-1">{currentAttendance?.checkOut ? `Checked out at ${formatTime(currentAttendance.checkOut)}` : ""}</p>
        </div>
        <div className="rounded-md border border-slate-200 p-3">
          <p className="font-semibold text-slate-900">Latest Record</p>
          <p className="mt-2">{attendance?.[0] ? `${attendance[0].status}` : "No records"}</p>
        </div>
      </div>
    </div>
  );
}

export function AttendanceHistory({ attendance }) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="border-b border-slate-200 p-4">
        <h3 className="text-lg font-bold text-slate-950">Recent Attendance</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-160 text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Check In</th>
              <th className="px-4 py-3">Check Out</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {attendance.map((row) => (
              <tr key={row.id}>
                <td className="px-4 py-3">{formatDate(row.date)}</td>
                <td className="px-4 py-3">{formatTime(row.checkIn)}</td>
                <td className="px-4 py-3">{formatTime(row.checkOut)}</td>
                <td className="px-4 py-3">{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!attendance.length ? <div className="p-4 text-sm text-slate-500">No attendance found.</div> : null}
    </div>
  );
}

export function ProfilePanel({ profile, currentEmployee }) {
  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-center gap-4">
          <Avatar name={getDisplayName(currentEmployee)} image={profile?.profileImage} size="h-16 w-16" />
          <div>
            <h2 className="text-2xl font-bold text-slate-950">{getDisplayName(currentEmployee)}</h2>
            <p className="text-sm text-slate-500">{profile?.designation || "Employee"}</p>
            <p className="text-sm text-slate-500">{profile?.department || "General"}</p>
          </div>
        </div>
        <div className="mt-6 rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          <p className="font-semibold text-slate-900">Resume</p>
          <p className="mt-2">{profile?.designation || "Employee"} in {profile?.department || "General"} operations.</p>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <h3 className="text-lg font-bold text-slate-950">Private Info</h3>
        <dl className="mt-4 grid gap-3 text-sm text-slate-600">
          <div className="flex justify-between gap-3"><dt>Date of Birth</dt><dd>{profile?.dob ? formatDate(profile.dob) : "Not set"}</dd></div>
          <div className="flex justify-between gap-3"><dt>Address</dt><dd>{profile?.address || "Not set"}</dd></div>
          <div className="flex justify-between gap-3"><dt>Phone</dt><dd>{profile?.phone || "Not set"}</dd></div>
          <div className="flex justify-between gap-3"><dt>Gender</dt><dd>{profile?.gender || "Not set"}</dd></div>
          <div className="flex justify-between gap-3"><dt>Joining Date</dt><dd>{formatDate(profile?.joiningDate)}</dd></div>
        </dl>
      </div>
    </div>
  );
}

export function ProfileEditor({ currentEmployee }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-slate-950">Edit Profile</h3>
          <p className="text-sm text-slate-500">You can update your address, phone, and profile image.</p>
        </div>
      </div>
      <form action={updateMyProfile} className="mt-4 grid gap-3">
        <label className={labelClass}>
          Address
          <input name="address" defaultValue={currentEmployee?.profile?.address || ""} className={fieldClass} />
        </label>
        <label className={labelClass}>
          Phone
          <input name="phone" defaultValue={currentEmployee?.profile?.phone || ""} className={fieldClass} />
        </label>
        <label className={labelClass}>
          Profile Image URL
          <input name="profileImage" defaultValue={currentEmployee?.profile?.profileImage || ""} className={fieldClass} />
        </label>
        <button className={buttonClass} type="submit">Save Changes</button>
      </form>
    </div>
  );
}

export function SalaryPanel({ payroll }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <h3 className="text-lg font-bold text-slate-950">Salary Info</h3>
      <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
        <div className="rounded-md border border-slate-200 p-3">
          <p className="font-semibold text-slate-900">Basic Salary</p>
          <p className="mt-2">{payroll ? formatCurrency(payroll.basic) : "Not set"}</p>
        </div>
        <div className="rounded-md border border-slate-200 p-3">
          <p className="font-semibold text-slate-900">HRA</p>
          <p className="mt-2">{payroll ? formatCurrency(payroll.hra) : "Not set"}</p>
        </div>
        <div className="rounded-md border border-slate-200 p-3">
          <p className="font-semibold text-slate-900">Allowance</p>
          <p className="mt-2">{payroll ? formatCurrency(payroll.allowance) : "Not set"}</p>
        </div>
        <div className="rounded-md border border-slate-200 p-3">
          <p className="font-semibold text-slate-900">Net Salary</p>
          <p className="mt-2">{payroll ? formatCurrency(payroll.netSalary) : "Not set"}</p>
        </div>
      </div>
    </div>
  );
}

export function LeaveRequestPanel({ leaves }) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="border-b border-slate-200 p-4">
        <h3 className="text-lg font-bold text-slate-950">My Leave Requests</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-160 text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Leave Type</th>
              <th className="px-4 py-3">Start</th>
              <th className="px-4 py-3">End</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {leaves.map((leave) => (
              <tr key={leave.id}>
                <td className="px-4 py-3">{leave.leaveType}</td>
                <td className="px-4 py-3">{formatDate(leave.startDate)}</td>
                <td className="px-4 py-3">{formatDate(leave.endDate)}</td>
                <td className="px-4 py-3">{leave.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!leaves.length ? <div className="p-4 text-sm text-slate-500">No leave requests found.</div> : null}
    </div>
  );
}

export function LeaveRequestForm() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-slate-950">New Leave Request</h3>
          <p className="text-sm text-slate-500">Submit a simple leave request for review.</p>
        </div>
      </div>
      <form action={createLeaveRequest} className="mt-4 grid gap-3">
        <label className={labelClass}>
          Leave Type
          <select name="leaveType" className={fieldClass} defaultValue="PAID">
            <option value="PAID">Paid Time Off</option>
            <option value="SICK">Sick Time Off</option>
            <option value="UNPAID">Unpaid Leave</option>
          </select>
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className={labelClass}>
            Start Date
            <input name="startDate" type="date" required className={fieldClass} />
          </label>
          <label className={labelClass}>
            End Date
            <input name="endDate" type="date" required className={fieldClass} />
          </label>
        </div>
        <label className={labelClass}>
          Reason
          <textarea name="reason" className="min-h-24 rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100" />
        </label>
        <button className={buttonClass} type="submit">Submit Leave Request</button>
      </form>
    </div>
  );
}

export function SummaryCard({ title, value, tone = "slate" }) {
  const tones = {
    slate: "border-slate-200 bg-white",
    sky: "border-sky-100 bg-sky-50",
    emerald: "border-emerald-100 bg-emerald-50",
    amber: "border-amber-100 bg-amber-50",
  };

  return (
    <div className={`rounded-lg border p-4 ${tones[tone]}`}>
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className="mt-2 text-2xl font-bold text-slate-950">{value}</p>
    </div>
  );
}
