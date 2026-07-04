import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
const prismaClientPkg = await import("../app/generated/prisma/client.ts");

const { Prisma, PrismaClient } = prismaClientPkg;

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("Set DIRECT_URL or DATABASE_URL before running the seed.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function addHours(date, hours) {
  const next = new Date(date);
  next.setHours(next.getHours() + hours);
  return next;
}

function currentMonthValue(offset = 0) {
  const base = new Date();
  const shifted = new Date(base.getFullYear(), base.getMonth() + offset, 1);
  return {
    month: shifted.getMonth() + 1,
    year: shifted.getFullYear(),
  };
}

function decimal(value) {
  return new Prisma.Decimal(value);
}

const team = [
  {
    employeeId: "EMP-0001",
    email: "admin@adamas.local",
    password: "Admin@123",
    role: "ADMIN",
    isVerified: true,
    firstName: "Asha",
    lastName: "Nair",
    gender: "FEMALE",
    designation: "HR Manager",
    department: "Administration",
    salary: 95000,
    joiningDateOffset: -740,
  },
  {
    employeeId: "EMP-0101",
    email: "mina.khan@adamas.local",
    password: "ChangeMe@123",
    role: "EMPLOYEE",
    isVerified: true,
    firstName: "Mina",
    lastName: "Khan",
    gender: "FEMALE",
    designation: "Operations Lead",
    department: "Operations",
    salary: 62000,
    joiningDateOffset: -420,
  },
  {
    employeeId: "EMP-0102",
    email: "rahul.rao@adamas.local",
    password: "ChangeMe@123",
    role: "EMPLOYEE",
    isVerified: true,
    firstName: "Rahul",
    lastName: "Rao",
    gender: "MALE",
    designation: "Finance Analyst",
    department: "Finance",
    salary: 58000,
    joiningDateOffset: -510,
  },
  {
    employeeId: "EMP-0103",
    email: "sana.ali@adamas.local",
    password: "ChangeMe@123",
    role: "EMPLOYEE",
    isVerified: true,
    firstName: "Sana",
    lastName: "Ali",
    gender: "FEMALE",
    designation: "People Partner",
    department: "HR",
    salary: 54000,
    joiningDateOffset: -380,
  },
  {
    employeeId: "EMP-0104",
    email: "arjun.verma@adamas.local",
    password: "ChangeMe@123",
    role: "EMPLOYEE",
    isVerified: false,
    firstName: "Arjun",
    lastName: "Verma",
    gender: "MALE",
    designation: "Sales Executive",
    department: "Sales",
    salary: 47000,
    joiningDateOffset: -260,
  },
  {
    employeeId: "EMP-0105",
    email: "noor.sheikh@adamas.local",
    password: "ChangeMe@123",
    role: "EMPLOYEE",
    isVerified: true,
    firstName: "Noor",
    lastName: "Sheikh",
    gender: "OTHER",
    designation: "Support Specialist",
    department: "Customer Success",
    salary: 44000,
    joiningDateOffset: -230,
  },
  {
    employeeId: "EMP-0106",
    email: "fatima.shaikh@adamas.local",
    password: "ChangeMe@123",
    role: "EMPLOYEE",
    isVerified: true,
    firstName: "Fatima",
    lastName: "Shaikh",
    gender: "FEMALE",
    designation: "QA Engineer",
    department: "Technology",
    salary: 68000,
    joiningDateOffset: -300,
  },
  {
    employeeId: "EMP-0107",
    email: "kabir.jain@adamas.local",
    password: "ChangeMe@123",
    role: "EMPLOYEE",
    isVerified: false,
    firstName: "Kabir",
    lastName: "Jain",
    gender: "MALE",
    designation: "Marketing Associate",
    department: "Marketing",
    salary: 42000,
    joiningDateOffset: -190,
  },
  {
    employeeId: "EMP-0108",
    email: "ananya.patel@adamas.local",
    password: "ChangeMe@123",
    role: "EMPLOYEE",
    isVerified: true,
    firstName: "Ananya",
    lastName: "Patel",
    gender: "FEMALE",
    designation: "Business Analyst",
    department: "Product",
    salary: 73000,
    joiningDateOffset: -340,
  },
];

async function clearExistingData() {
  await prisma.notification.deleteMany();
  await prisma.document.deleteMany();
  await prisma.payroll.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.leaveRequest.deleteMany();
  await prisma.employeeProfile.deleteMany();
  await prisma.user.deleteMany();
}

async function seedUsers() {
  const createdUsers = [];

  for (const employee of team) {
    const user = await prisma.user.create({
      data: {
        employeeId: employee.employeeId,
        email: employee.email,
        password: employee.password,
        role: employee.role,
        isVerified: employee.isVerified,
        profile: {
          create: {
            firstName: employee.firstName,
            lastName: employee.lastName,
            phone: `+91-9000-${employee.employeeId.slice(-4)}`,
            address: `${employee.firstName} Residency, Bengaluru`,
            gender: employee.gender,
            dob: addDays(startOfDay(new Date()), employee.joiningDateOffset - 1200),
            joiningDate: addDays(startOfDay(new Date()), employee.joiningDateOffset),
            designation: employee.designation,
            department: employee.department,
            profileImage: null,
            basicSalary: decimal(employee.salary),
            bankName: `${employee.department} Bank`,
            accountNumber: `ACCT-${employee.employeeId.slice(-4)}-${employee.employeeId.slice(-4)}`,
            emergencyName: `${employee.firstName} Contact`,
            emergencyPhone: `+91-9888-${employee.employeeId.slice(-4)}`,
          },
        },
      },
      include: { profile: true },
    });

    createdUsers.push(user);
  }

  return createdUsers;
}

function buildAttendanceRows(users) {
  const today = startOfDay(new Date());
  const rows = [];

  users.forEach((user, index) => {
    const todayCheckIn = addHours(today, 9 + (index % 2));
    const todayCheckOut = addHours(today, 18 + (index % 2));

    rows.push({
      employeeId: user.id,
      date: today,
      checkIn: todayCheckIn,
      checkOut: todayCheckOut,
      status: "PRESENT",
      remarks: "Seeded present day record",
    });

    const yesterday = addDays(today, -1);

    rows.push({
      employeeId: user.id,
      date: yesterday,
      checkIn: index % 3 === 0 ? null : addHours(yesterday, 9 + (index % 3)),
      checkOut: index % 3 === 0 ? null : addHours(yesterday, 14 + (index % 3)),
      status: index % 3 === 0 ? "ABSENT" : "HALF_DAY",
      remarks: index % 3 === 0 ? "Auto-seeded absence" : "Auto-seeded half day",
    });

    const olderDate = addDays(today, -3 - index);

    rows.push({
      employeeId: user.id,
      date: olderDate,
      checkIn: addHours(olderDate, 9),
      checkOut: addHours(olderDate, 18),
      status: index % 4 === 0 ? "LEAVE" : "PRESENT",
      remarks: index % 4 === 0 ? "Planned leave" : "Seeded workday",
    });
  });

  return rows;
}

function buildLeaveRows(users, adminId) {
  return users.slice(1).map((user, index) => {
    const startDate = addDays(startOfDay(new Date()), -10 - index * 2);
    const endDate = addDays(startDate, index % 2 === 0 ? 1 : 2);
    const isPending = index % 3 === 0;
    const approved = index % 2 === 0;

    return {
      employeeId: user.id,
      leaveType: index % 3 === 0 ? "PAID" : index % 3 === 1 ? "SICK" : "UNPAID",
      startDate,
      endDate,
      reason: `Seeded ${isPending ? "pending" : approved ? "approved" : "rejected"} leave for ${user.employeeId}`,
      status: isPending ? "PENDING" : approved ? "APPROVED" : "REJECTED",
      adminComment: isPending ? null : approved ? "Approved in seed data" : "Rejected in seed data",
      approvedById: isPending ? null : adminId,
    };
  });
}

function buildPayrollRows(users) {
  const current = currentMonthValue();
  const previous = currentMonthValue(-1);
  const rows = [];

  users.slice(1).forEach((user, index) => {
    const basic = 40000 + index * 4500;
    const hra = Math.round(basic * 0.5);
    const allowance = Math.round(basic * 0.25);
    const deduction = Math.round(basic * 0.12);
    const bonus = index % 2 === 0 ? 2500 : 0;

    rows.push({
      employeeId: user.id,
      month: current.month,
      year: current.year,
      basic: decimal(basic),
      hra: decimal(hra),
      allowance: decimal(allowance),
      deduction: decimal(deduction),
      bonus: decimal(bonus),
      netSalary: decimal(basic + hra + allowance - deduction + bonus),
    });

    const previousBasic = basic - 1500;
    const previousHra = Math.round(previousBasic * 0.5);
    const previousAllowance = Math.round(previousBasic * 0.25);
    const previousDeduction = Math.round(previousBasic * 0.12);

    rows.push({
      employeeId: user.id,
      month: previous.month,
      year: previous.year,
      basic: decimal(previousBasic),
      hra: decimal(previousHra),
      allowance: decimal(previousAllowance),
      deduction: decimal(previousDeduction),
      bonus: decimal(0),
      netSalary: decimal(previousBasic + previousHra + previousAllowance - previousDeduction),
    });
  });

  return rows;
}

function buildDocumentRows(users) {
  return users.slice(1).map((user, index) => ({
    employeeId: user.id,
    title: `${user.profile.firstName} ${index % 2 === 0 ? "Offer" : "ID"} Document`,
    fileUrl: `https://example.com/files/${user.employeeId.toLowerCase()}-${index + 1}.pdf`,
  }));
}

function buildNotificationRows(users) {
  const rows = [];

  users.forEach((user, index) => {
    rows.push({
      userId: user.id,
      title: index % 2 === 0 ? "Welcome to Adamas" : "Payroll Ready",
      message:
        index % 2 === 0
          ? "Your profile has been created and is ready for admin review."
          : "Your latest payslip is available in the payroll section.",
      isRead: index % 3 === 0,
    });
  });

  return rows;
}

async function main() {
  await clearExistingData();

  const users = await seedUsers();
  const admin = users.find((user) => user.role === "ADMIN");

  await Promise.all(
    buildAttendanceRows(users).map((data) => prisma.attendance.create({ data })),
  );
  await Promise.all(
    buildLeaveRows(users, admin.id).map((data) => prisma.leaveRequest.create({ data })),
  );
  await Promise.all(
    buildPayrollRows(users).map((data) => prisma.payroll.create({ data })),
  );
  await Promise.all(
    buildDocumentRows(users).map((data) => prisma.document.create({ data })),
  );
  await Promise.all(
    buildNotificationRows(users).map((data) => prisma.notification.create({ data })),
  );

  console.log(`Seeded ${users.length} users with related admin data.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });