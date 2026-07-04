"use server";

import { cookies } from "next/headers";
import { prisma } from "@/app/lib/prisma";

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function endOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
}

function computeStatus(attendance, leaveRequests) {
  const hasActiveLeave = leaveRequests?.some((leave) => leave.status === "APPROVED");

  if (hasActiveLeave) {
    return { label: "On Leave", tone: "amber" };
  }

  if (attendance?.status === "PRESENT") {
    return { label: "Present", tone: "emerald" };
  }

  return { label: "Absent", tone: "amber" };
}

async function getSessionEmployeeId() {
  const cookieStore = await cookies();
  return cookieStore.get("hrms-user-id")?.value || null;
}

export async function getCurrentEmployee() {
  const employeeId = await getSessionEmployeeId();
  if (!employeeId) return null;

  return prisma.user.findUnique({
    where: { id: employeeId },
    include: {
      profile: true,
      attendances: {
        orderBy: [{ date: "desc" }, { createdAt: "desc" }],
        take: 10,
      },
      leaveRequests: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      payrolls: {
        orderBy: [{ year: "desc" }, { month: "desc" }],
        take: 3,
      },
    },
  });
}

export async function getLoginUsers() {
  return prisma.user.findMany({
    where: { role: { in: ["ADMIN", "EMPLOYEE"] } },
    orderBy: { createdAt: "asc" },
    include: { profile: true },
  });
}

export async function getEmployees() {
  const today = startOfDay(new Date());
  const tomorrow = endOfDay(new Date());

  const users = await prisma.user.findMany({
    where: { role: "EMPLOYEE" },
    orderBy: { createdAt: "asc" },
    include: {
      profile: true,
      attendances: {
        where: { date: { gte: today, lt: tomorrow } },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      leaveRequests: {
        where: {
          status: "APPROVED",
          startDate: { lte: tomorrow },
          endDate: { gte: today },
        },
        orderBy: { startDate: "desc" },
        take: 1,
      },
    },
  });

  return users.map((user) => ({
    ...user,
    status: computeStatus(user.attendances[0], user.leaveRequests),
  }));
}

export async function getEmployeeById(id) {
  return prisma.user.findUnique({
    where: { id },
    include: {
      profile: true,
      attendances: {
        orderBy: [{ date: "desc" }, { createdAt: "desc" }],
        take: 5,
      },
    },
  });
}

export async function getMyProfile() {
  return getCurrentEmployee();
}

export async function getMyAttendance() {
  const employeeId = await getSessionEmployeeId();
  if (!employeeId) return [];

  return prisma.attendance.findMany({
    where: { employeeId },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    take: 20,
  });
}

export async function getMyCurrentAttendance() {
  const employeeId = await getSessionEmployeeId();
  if (!employeeId) return null;

  const today = startOfDay(new Date());
  const tomorrow = endOfDay(new Date());

  return prisma.attendance.findFirst({
    where: {
      employeeId,
      date: { gte: today, lt: tomorrow },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getMyLeaveRequests() {
  const employeeId = await getSessionEmployeeId();
  if (!employeeId) return [];

  return prisma.leaveRequest.findMany({
    where: { employeeId },
    orderBy: [{ startDate: "desc" }, { createdAt: "desc" }],
    take: 20,
  });
}

export async function getMyPayroll() {
  const employeeId = await getSessionEmployeeId();
  if (!employeeId) return null;

  return prisma.payroll.findFirst({
    where: { employeeId },
    orderBy: [{ year: "desc" }, { month: "desc" }],
  });
}
