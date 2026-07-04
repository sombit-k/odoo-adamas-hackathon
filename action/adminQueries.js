import { prisma } from "@/app/lib/prisma";

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function toNumber(value) {
  if (value == null) return 0;
  return Number(value.toString());
}

function dateKey(date) {
  return date.toISOString().slice(0, 10);
}

function hoursBetween(start, end) {
  if (!start || !end) return 0;
  return Math.max(0, (end.getTime() - start.getTime()) / 3600000);
}

export async function getAdminDashboardData() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

  const [
    users,
    attendances,
    todaysAttendances,
    leaveRequests,
    payrolls,
    documents,
    notifications,
  ] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        profile: true,
        attendances: {
          where: { date: { gte: startOfMonth, lt: endOfMonth } },
          orderBy: { date: "desc" },
        },
        leaveRequests: {
          orderBy: { createdAt: "desc" },
          take: 3,
        },
        payrolls: {
          orderBy: [{ year: "desc" }, { month: "desc" }],
          take: 2,
        },
      },
    }),
    prisma.attendance.findMany({
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      take: 80,
      include: { employee: { include: { profile: true } } },
    }),
    prisma.attendance.findMany({
      where: { date: { gte: today, lt: tomorrow } },
      orderBy: { createdAt: "desc" },
      include: { employee: { include: { profile: true } } },
    }),
    prisma.leaveRequest.findMany({
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      take: 80,
      include: {
        employee: { include: { profile: true } },
        approvedBy: { include: { profile: true } },
      },
    }),
    prisma.payroll.findMany({
      orderBy: [{ year: "desc" }, { month: "desc" }],
      take: 60,
      include: { employee: { include: { profile: true } } },
    }),
    prisma.document.findMany({
      orderBy: { uploadedAt: "desc" },
      take: 30,
      include: { employee: { include: { profile: true } } },
    }),
    prisma.notification.findMany({
      orderBy: { createdAt: "desc" },
      take: 40,
      include: { user: { include: { profile: true } } },
    }),
  ]);

  const admin = users.find((user) => user.role === "ADMIN") || users[0] || null;
  const employees = users.filter((user) => user.role === "EMPLOYEE");
  const pendingLeaves = leaveRequests.filter((leave) => leave.status === "PENDING");
  const presentToday = todaysAttendances.filter((row) => row.status === "PRESENT").length;
  const totalMonthlySalary = users.reduce(
    (sum, user) => sum + toNumber(user.profile?.basicSalary),
    0
  );

  return {
    admin,
    users,
    employees,
    attendances,
    leaveRequests,
    payrolls,
    documents,
    notifications,
    stats: {
      totalUsers: users.length,
      totalEmployees: employees.length,
      verifiedUsers: users.filter((user) => user.isVerified).length,
      pendingLeaves: pendingLeaves.length,
      presentToday,
      totalMonthlySalary,
      totalMonthlySalaryLabel: currency.format(totalMonthlySalary),
    },
    today: dateKey(today),
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  };
}

export function getDisplayName(user) {
  if (!user) return "Unassigned";
  const first = user.profile?.firstName || "";
  const last = user.profile?.lastName || "";
  const fullName = `${first} ${last}`.trim();
  return fullName || user.email || user.employeeId;
}

export function formatCurrency(value) {
  return currency.format(toNumber(value));
}

export function formatDate(value) {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(value);
}

export function formatTime(value) {
  if (!value) return "--";
  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

export function formatHours(attendance) {
  const hours = hoursBetween(attendance.checkIn, attendance.checkOut);
  return hours ? `${hours.toFixed(1)}h` : "--";
}
