import {
  addDocument,
  createEmployee,
  createLeaveRequestForEmployee,
  generatePayroll,
  recordAttendance,
  reviewLeaveRequest,
  sendNotification,
  updateUserStatus,
} from "@/action/adminActions";
import {
  formatCurrency,
  formatDate,
  formatHours,
  formatTime,
  getDisplayName,
} from "@/action/adminQueries";

export const fieldClass =
  "h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100";
export const labelClass =
  "grid gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500";
export const buttonClass =
  "inline-flex h-10 items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800";
export const ghostButtonClass =
  "inline-flex h-9 items-center justify-center rounded-md border border-slate-200 px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50";

export function PageTitle({ eyebrow, title, description }) {
  return (
    <div className="mb-6">
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="mt-1 text-3xl font-bold text-slate-950">{title}</h2>
      {description ? <p className="mt-2 max-w-3xl text-sm text-slate-500">{description}</p> : null}
    </div>
  );
}

export function StatCard({ label, value, tone = "slate" }) {
  const tones = {
    slate: "border-slate-200 bg-white",
    sky: "border-sky-100 bg-sky-50",
    emerald: "border-emerald-100 bg-emerald-50",
    rose: "border-rose-100 bg-rose-50",
  };

  return (
    <div className={`rounded-lg border p-4 ${tones[tone]}`}>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-950">{value}</p>
    </div>
  );
}

export function EmptyState({ children }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
      {children}
    </div>
  );
}

export function EmployeeSelect({ users, name = "employeeId", required = true }) {
  return (
    <select name={name} required={required} className={fieldClass} defaultValue="">
      <option value="" disabled>
        Select employee
      </option>
      {users.map((user) => (
        <option key={user.id} value={user.id}>
          {getDisplayName(user)} ({user.employeeId})
        </option>
      ))}
    </select>
  );
}

export function DashboardOverview({ data }) {
  return (
    <>
      <PageTitle
        eyebrow="Overview"
        title="Admin Dashboard"
        description="A quick view of employees, attendance, time off, and payroll health."
      />
      <section className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <p className="text-sm font-semibold text-sky-600">My Profile</p>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-rose-100 text-2xl font-bold text-rose-700">
              {getDisplayName(data.admin).slice(0, 1).toUpperCase() || "A"}
            </div>
            <div>
              <h2 className="text-3xl font-bold">{getDisplayName(data.admin)}</h2>
              <p className="text-slate-500">
                {data.admin?.email || "Create an admin employee to complete this profile"}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {data.admin?.profile?.department || "Administration"} /{" "}
                {data.admin?.profile?.designation || "HR Officer"}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <StatCard label="Employees" value={data.stats.totalEmployees} tone="sky" />
          <StatCard label="Verified Users" value={data.stats.verifiedUsers} tone="emerald" />
          <StatCard label="Pending Leaves" value={data.stats.pendingLeaves} tone="rose" />
          <StatCard label="Monthly Salary" value={data.stats.totalMonthlySalaryLabel} />
        </div>
      </section>
    </>
  );
}

function EmployeeCard({ user }) {
  const profile = user.profile;
  const monthly = Number(profile?.basicSalary || 0);
  const yearly = monthly * 12;
  const hra = monthly * 0.5;
  const allowance = monthly * 0.25;
  const pf = monthly * 0.12;

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-rose-100 text-xl font-bold text-rose-700">
          {getDisplayName(user).slice(0, 1).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-slate-950">{getDisplayName(user)}</h3>
              <p className="text-sm text-slate-500">
                {user.employeeId} / {user.email}
              </p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {user.role}
            </span>
          </div>

          <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
            <p>
              <strong className="text-slate-900">Department:</strong>{" "}
              {profile?.department || "Not set"}
            </p>
            <p>
              <strong className="text-slate-900">Designation:</strong>{" "}
              {profile?.designation || "Not set"}
            </p>
            <p>
              <strong className="text-slate-900">Mobile:</strong> {profile?.phone || "Not set"}
            </p>
            <p>
              <strong className="text-slate-900">Joined:</strong>{" "}
              {formatDate(profile?.joiningDate)}
            </p>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="rounded-md border border-slate-200 p-3">
              <h4 className="font-semibold text-slate-950">Private Info</h4>
              <dl className="mt-2 grid gap-2 text-sm text-slate-600">
                <div className="flex justify-between gap-3">
                  <dt>Address</dt>
                  <dd className="text-right">{profile?.address || "Not set"}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt>Bank</dt>
                  <dd>{profile?.bankName || "Not set"}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt>Emergency</dt>
                  <dd>{profile?.emergencyPhone || "Not set"}</dd>
                </div>
              </dl>
            </div>

            <div className="rounded-md border border-sky-200 bg-sky-50 p-3">
              <h4 className="font-semibold text-slate-950">Salary Info</h4>
              <dl className="mt-2 grid gap-2 text-sm text-slate-700">
                <div className="flex justify-between gap-3">
                  <dt>Monthly Wage</dt>
                  <dd>{formatCurrency(monthly)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt>Yearly Wage</dt>
                  <dd>{formatCurrency(yearly)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt>HRA</dt>
                  <dd>{formatCurrency(hra)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt>Allowance</dt>
                  <dd>{formatCurrency(allowance)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt>PF Deduction</dt>
                  <dd>{formatCurrency(pf)}</dd>
                </div>
              </dl>
            </div>
          </div>

          <form action={updateUserStatus} className="mt-4 flex flex-wrap items-center gap-3">
            <input type="hidden" name="userId" value={user.id} />
            <select name="role" defaultValue={user.role} className={fieldClass}>
              <option value="EMPLOYEE">Employee</option>
              <option value="ADMIN">Admin</option>
            </select>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <input name="isVerified" type="checkbox" defaultChecked={user.isVerified} />
              Verified
            </label>
            <button className={ghostButtonClass} type="submit">
              Save Status
            </button>
          </form>
        </div>
      </div>
    </article>
  );
}

export function EmployeesRoute({ data }) {
  return (
    <>
      <PageTitle
        eyebrow="Admin"
        title="Employees"
        description="Create employees, verify accounts, and review private and salary information."
      />
      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <form action={createEmployee} className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-lg font-bold">Create Employee</h3>
          <div className="mt-4 grid gap-3">
            <label className={labelClass}>
              Employee ID
              <input name="employeeId" required className={fieldClass} placeholder="EMP001" />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className={labelClass}>
                First Name
                <input name="firstName" required className={fieldClass} />
              </label>
              <label className={labelClass}>
                Last Name
                <input name="lastName" required className={fieldClass} />
              </label>
            </div>
            <label className={labelClass}>
              Email
              <input name="email" type="email" required className={fieldClass} />
            </label>
            <label className={labelClass}>
              Temporary Password
              <input
                name="password"
                type="text"
                className={fieldClass}
                placeholder="ChangeMe@123"
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className={labelClass}>
                Role
                <select name="role" className={fieldClass} defaultValue="EMPLOYEE">
                  <option value="EMPLOYEE">Employee</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </label>
              <label className={labelClass}>
                Gender
                <select name="gender" className={fieldClass} defaultValue="">
                  <option value="">Not set</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </label>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <input name="department" className={fieldClass} placeholder="Department" />
              <input name="designation" className={fieldClass} placeholder="Designation" />
              <input name="phone" className={fieldClass} placeholder="Phone" />
              <input name="joiningDate" type="date" required className={fieldClass} />
            </div>
            <input
              name="basicSalary"
              type="number"
              min="0"
              required
              className={fieldClass}
              placeholder="Basic salary"
            />
            <textarea
              name="address"
              className="min-h-20 rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              placeholder="Address"
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <input name="bankName" className={fieldClass} placeholder="Bank name" />
              <input name="accountNumber" className={fieldClass} placeholder="Account number" />
              <input name="emergencyName" className={fieldClass} placeholder="Emergency contact" />
              <input name="emergencyPhone" className={fieldClass} placeholder="Emergency phone" />
            </div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <input name="isVerified" type="checkbox" defaultChecked />
              Mark verified
            </label>
            <button className={buttonClass} type="submit">
              Add Employee
            </button>
          </div>
        </form>

        <div className="grid gap-4">
          {data.users.length ? (
            data.users.map((user) => <EmployeeCard key={user.id} user={user} />)
          ) : (
            <EmptyState>No employees found. Create the first admin or employee.</EmptyState>
          )}
        </div>
      </div>
    </>
  );
}

export function AttendanceRoute({ data }) {
  const usersForForms = data.users.length ? data.users : data.employees;

  return (
    <>
      <PageTitle
        eyebrow="Admin / HR"
        title="Attendance"
        description="Record day-wise attendance. These records can drive payable day and payroll calculations."
      />
      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <form action={recordAttendance} className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-lg font-bold">Record Attendance</h3>
          <div className="mt-4 grid gap-3">
            <EmployeeSelect users={usersForForms} />
            <input name="date" type="date" required defaultValue={data.today} className={fieldClass} />
            <div className="grid gap-3 sm:grid-cols-2">
              <input name="checkIn" type="time" className={fieldClass} />
              <input name="checkOut" type="time" className={fieldClass} />
            </div>
            <select name="status" className={fieldClass} defaultValue="PRESENT">
              <option value="PRESENT">Present</option>
              <option value="ABSENT">Absent</option>
              <option value="HALF_DAY">Half Day</option>
              <option value="LEAVE">Leave</option>
            </select>
            <input name="remarks" className={fieldClass} placeholder="Remarks" />
            <button className={buttonClass} type="submit">
              Save Attendance
            </button>
          </div>
        </form>

        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="border-b border-slate-200 p-4">
            <h3 className="text-lg font-bold">Attendance List View</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3">Check In</th>
                  <th className="px-4 py-3">Check Out</th>
                  <th className="px-4 py-3">Work Hours</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.attendances.map((attendance) => (
                  <tr key={attendance.id}>
                    <td className="px-4 py-3">{formatDate(attendance.date)}</td>
                    <td className="px-4 py-3">{getDisplayName(attendance.employee)}</td>
                    <td className="px-4 py-3">{formatTime(attendance.checkIn)}</td>
                    <td className="px-4 py-3">{formatTime(attendance.checkOut)}</td>
                    <td className="px-4 py-3">{formatHours(attendance)}</td>
                    <td className="px-4 py-3">{attendance.status.replace("_", " ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!data.attendances.length ? <EmptyState>No attendance records yet.</EmptyState> : null}
        </div>
      </div>
    </>
  );
}

export function TimeOffRoute({ data }) {
  const usersForForms = data.users.length ? data.users : data.employees;
  const adminId = data.admin?.id || "";

  return (
    <>
      <PageTitle
        eyebrow="Approval"
        title="Time Off"
        description="Admins and HR can view, approve, and reject leave requests for all employees."
      />
      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <form
          action={createLeaveRequestForEmployee}
          className="rounded-lg border border-slate-200 bg-white p-4"
        >
          <h3 className="text-lg font-bold">Create Leave Request</h3>
          <div className="mt-4 grid gap-3">
            <EmployeeSelect users={usersForForms} />
            <select name="leaveType" defaultValue="PAID" className={fieldClass}>
              <option value="PAID">Paid Time Off</option>
              <option value="SICK">Sick Time Off</option>
              <option value="UNPAID">Unpaid Leave</option>
            </select>
            <div className="grid gap-3 sm:grid-cols-2">
              <input name="startDate" type="date" required className={fieldClass} />
              <input name="endDate" type="date" required className={fieldClass} />
            </div>
            <textarea
              name="reason"
              required
              placeholder="Reason"
              className="min-h-24 rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            />
            <button className={buttonClass} type="submit">
              Add Request
            </button>
          </div>
        </form>

        <div className="grid gap-3">
          {data.leaveRequests.length ? (
            data.leaveRequests.map((leave) => (
              <article key={leave.id} className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-slate-950">{getDisplayName(leave.employee)}</h3>
                    <p className="text-sm text-slate-500">
                      {leave.leaveType} / {formatDate(leave.startDate)} to{" "}
                      {formatDate(leave.endDate)}
                    </p>
                    <p className="mt-2 text-sm text-slate-700">{leave.reason}</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                    {leave.status}
                  </span>
                </div>
                <form action={reviewLeaveRequest} className="mt-4 flex flex-wrap items-center gap-2">
                  <input type="hidden" name="leaveId" value={leave.id} />
                  <input type="hidden" name="adminId" value={adminId} />
                  <input
                    name="adminComment"
                    className={fieldClass}
                    placeholder="Admin comment"
                    defaultValue={leave.adminComment || ""}
                  />
                  <button
                    className="h-9 rounded-md bg-emerald-600 px-3 text-sm font-bold text-white hover:bg-emerald-700"
                    name="status"
                    value="APPROVED"
                    type="submit"
                  >
                    Approve
                  </button>
                  <button
                    className="h-9 rounded-md bg-rose-600 px-3 text-sm font-bold text-white hover:bg-rose-700"
                    name="status"
                    value="REJECTED"
                    type="submit"
                  >
                    Reject
                  </button>
                </form>
              </article>
            ))
          ) : (
            <EmptyState>No time off records yet.</EmptyState>
          )}
        </div>
      </div>
    </>
  );
}

export function PayrollRoute({ data }) {
  const usersForForms = data.users.length ? data.users : data.employees;

  return (
    <>
      <PageTitle
        eyebrow="Admin only"
        title="Payroll & Salary"
        description="Generate payslips from profile salary data and review payroll history."
      />
      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <form action={generatePayroll} className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-lg font-bold">Generate Payslip</h3>
          <div className="mt-4 grid gap-3">
            <EmployeeSelect users={usersForForms} />
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                name="month"
                type="number"
                min="1"
                max="12"
                defaultValue={data.month}
                className={fieldClass}
              />
              <input name="year" type="number" min="2020" defaultValue={data.year} className={fieldClass} />
            </div>
            <input name="basic" type="number" min="0" className={fieldClass} placeholder="Override basic salary" />
            <input name="bonus" type="number" min="0" className={fieldClass} placeholder="Bonus" />
            <button className={buttonClass} type="submit">
              Generate Payroll
            </button>
          </div>
        </form>

        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="border-b border-slate-200 p-4">
            <h3 className="text-lg font-bold">Payroll Records</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3">Period</th>
                  <th className="px-4 py-3">Basic</th>
                  <th className="px-4 py-3">Allowance</th>
                  <th className="px-4 py-3">Deduction</th>
                  <th className="px-4 py-3">Net Salary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.payrolls.map((payroll) => (
                  <tr key={payroll.id}>
                    <td className="px-4 py-3">{getDisplayName(payroll.employee)}</td>
                    <td className="px-4 py-3">
                      {payroll.month}/{payroll.year}
                    </td>
                    <td className="px-4 py-3">{formatCurrency(payroll.basic)}</td>
                    <td className="px-4 py-3">{formatCurrency(payroll.allowance)}</td>
                    <td className="px-4 py-3">{formatCurrency(payroll.deduction)}</td>
                    <td className="px-4 py-3 font-bold">{formatCurrency(payroll.netSalary)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!data.payrolls.length ? <EmptyState>No payroll records generated.</EmptyState> : null}
        </div>
      </div>
    </>
  );
}

export function DocumentsRoute({ data }) {
  const usersForForms = data.users.length ? data.users : data.employees;

  return (
    <>
      <PageTitle
        eyebrow="Admin"
        title="Documents & Notifications"
        description="Attach document links to employees and send notifications."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <form action={addDocument} className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-lg font-bold">Add Document</h3>
          <div className="mt-4 grid gap-3">
            <EmployeeSelect users={usersForForms} />
            <input name="title" required className={fieldClass} placeholder="Document title" />
            <input name="fileUrl" required className={fieldClass} placeholder="File URL" />
            <button className={buttonClass} type="submit">
              Save Document
            </button>
          </div>
        </form>

        <form action={sendNotification} className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-lg font-bold">Send Notification</h3>
          <div className="mt-4 grid gap-3">
            <EmployeeSelect users={usersForForms} name="userId" />
            <input name="title" required className={fieldClass} placeholder="Title" />
            <textarea
              name="message"
              required
              className="min-h-24 rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              placeholder="Message"
            />
            <button className={buttonClass} type="submit">
              Send
            </button>
          </div>
        </form>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-lg font-bold">Recent Documents</h3>
          <div className="mt-3 grid gap-3">
            {data.documents.length ? (
              data.documents.map((doc) => (
                <a
                  key={doc.id}
                  href={doc.fileUrl}
                  className="rounded-md border border-slate-100 p-3 text-sm hover:bg-slate-50"
                  target="_blank"
                  rel="noreferrer"
                >
                  <strong className="block text-slate-950">{doc.title}</strong>
                  <span className="text-slate-500">{getDisplayName(doc.employee)}</span>
                </a>
              ))
            ) : (
              <EmptyState>No documents uploaded.</EmptyState>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-lg font-bold">Recent Notifications</h3>
          <div className="mt-3 grid gap-3">
            {data.notifications.length ? (
              data.notifications.map((notification) => (
                <article key={notification.id} className="rounded-md border border-slate-100 p-3 text-sm">
                  <strong className="block text-slate-950">{notification.title}</strong>
                  <p className="text-slate-600">{notification.message}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    To {getDisplayName(notification.user)}
                  </p>
                </article>
              ))
            ) : (
              <EmptyState>No notifications sent.</EmptyState>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
