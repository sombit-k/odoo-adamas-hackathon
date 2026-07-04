"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/app/lib/prisma";

const adminPaths = [
  "/dashboard",
  "/employees",
  "/attendance",
  "/time-off",
  "/payroll",
  "/documents",
];

function revalidateAdminRoutes() {
  adminPaths.forEach((path) => revalidatePath(path));
}

function requireAdminAccess() {
  // Hook real auth/session role checks here when authentication is added.
  return true;
}

function text(formData, name, fallback = "") {
  const value = formData.get(name);
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function optionalText(formData, name) {
  const value = text(formData, name);
  return value || null;
}

function numberValue(formData, name, fallback = 0) {
  const value = Number(formData.get(name));
  return Number.isFinite(value) ? value : fallback;
}

function dateValue(formData, name, fallback = new Date()) {
  const value = text(formData, name);
  return value ? new Date(value) : fallback;
}

function dateTimeValue(formData, dateName, timeName) {
  const date = text(formData, dateName);
  const time = text(formData, timeName);
  if (!date || !time) return null;
  return new Date(`${date}T${time}`);
}

function salaryComponents(basic) {
  const hra = Math.round(basic * 0.5);
  const allowance = Math.round(basic * 0.25);
  const deduction = Math.round(basic * 0.12);
  const netSalary = basic + hra + allowance - deduction;
  return { hra, allowance, deduction, netSalary };
}

export async function createEmployee(formData) {
  requireAdminAccess();

  const firstName = text(formData, "firstName");
  const lastName = text(formData, "lastName");
  const email = text(formData, "email");
  const employeeId = text(formData, "employeeId");
  const password = text(formData, "password", "ChangeMe@123");
  const role = text(formData, "role", "EMPLOYEE");
  const basicSalary = numberValue(formData, "basicSalary", 0);

  if (!firstName || !lastName || !email || !employeeId) {
    throw new Error("First name, last name, email, and employee ID are required.");
  }

  await prisma.user.create({
    data: {
      employeeId,
      email,
      password,
      role,
      isVerified: formData.get("isVerified") === "on",
      profile: {
        create: {
          firstName,
          lastName,
          phone: optionalText(formData, "phone"),
          address: optionalText(formData, "address"),
          gender: optionalText(formData, "gender"),
          dob: optionalText(formData, "dob") ? dateValue(formData, "dob") : null,
          joiningDate: dateValue(formData, "joiningDate"),
          designation: text(formData, "designation", "Employee"),
          department: text(formData, "department", "General"),
          basicSalary,
          bankName: optionalText(formData, "bankName"),
          accountNumber: optionalText(formData, "accountNumber"),
          emergencyName: optionalText(formData, "emergencyName"),
          emergencyPhone: optionalText(formData, "emergencyPhone"),
        },
      },
    },
  });

  revalidateAdminRoutes();
}

export async function updateUserStatus(formData) {
  requireAdminAccess();

  await prisma.user.update({
    where: { id: text(formData, "userId") },
    data: {
      role: text(formData, "role", "EMPLOYEE"),
      isVerified: formData.get("isVerified") === "on",
    },
  });

  revalidateAdminRoutes();
}

export async function recordAttendance(formData) {
  requireAdminAccess();

  const employeeId = text(formData, "employeeId");
  const date = dateValue(formData, "date");
  const status = text(formData, "status", "PRESENT");

  await prisma.attendance.upsert({
    where: {
      employeeId_date: {
        employeeId,
        date,
      },
    },
    update: {
      checkIn: dateTimeValue(formData, "date", "checkIn"),
      checkOut: dateTimeValue(formData, "date", "checkOut"),
      status,
      remarks: optionalText(formData, "remarks"),
    },
    create: {
      employeeId,
      date,
      checkIn: dateTimeValue(formData, "date", "checkIn"),
      checkOut: dateTimeValue(formData, "date", "checkOut"),
      status,
      remarks: optionalText(formData, "remarks"),
    },
  });

  revalidateAdminRoutes();
}

export async function createLeaveRequestForEmployee(formData) {
  requireAdminAccess();

  await prisma.leaveRequest.create({
    data: {
      employeeId: text(formData, "employeeId"),
      leaveType: text(formData, "leaveType", "PAID"),
      startDate: dateValue(formData, "startDate"),
      endDate: dateValue(formData, "endDate"),
      reason: text(formData, "reason", "Admin created leave request"),
    },
  });

  revalidateAdminRoutes();
}

export async function reviewLeaveRequest(formData) {
  requireAdminAccess();

  const status = text(formData, "status", "PENDING");
  const adminId = optionalText(formData, "adminId");

  await prisma.leaveRequest.update({
    where: { id: text(formData, "leaveId") },
    data: {
      status,
      adminComment: optionalText(formData, "adminComment"),
      approvedById: status === "PENDING" ? null : adminId,
    },
  });

  revalidateAdminRoutes();
}

export async function generatePayroll(formData) {
  requireAdminAccess();

  const employeeId = text(formData, "employeeId");
  const user = await prisma.user.findUnique({
    where: { id: employeeId },
    include: { profile: true },
  });
  const basic = numberValue(formData, "basic", Number(user?.profile?.basicSalary || 0));
  const bonus = numberValue(formData, "bonus", 0);
  const { hra, allowance, deduction, netSalary } = salaryComponents(basic);
  const month = numberValue(formData, "month", new Date().getMonth() + 1);
  const year = numberValue(formData, "year", new Date().getFullYear());

  await prisma.payroll.upsert({
    where: {
      employeeId_month_year: {
        employeeId,
        month,
        year,
      },
    },
    update: {
      basic,
      hra,
      allowance,
      deduction,
      bonus,
      netSalary: netSalary + bonus,
    },
    create: {
      employeeId,
      month,
      year,
      basic,
      hra,
      allowance,
      deduction,
      bonus,
      netSalary: netSalary + bonus,
    },
  });

  revalidateAdminRoutes();
}

export async function addDocument(formData) {
  requireAdminAccess();

  await prisma.document.create({
    data: {
      employeeId: text(formData, "employeeId"),
      title: text(formData, "title"),
      fileUrl: text(formData, "fileUrl"),
    },
  });

  revalidateAdminRoutes();
}

export async function sendNotification(formData) {
  requireAdminAccess();

  await prisma.notification.create({
    data: {
      userId: text(formData, "userId"),
      title: text(formData, "title"),
      message: text(formData, "message"),
    },
  });

  revalidateAdminRoutes();
}
