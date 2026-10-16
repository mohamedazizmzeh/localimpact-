import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("password123", 10);

  await prisma.user.upsert({
    where: { email: "user@demo.com" },
    update: {},
    create: {
      name: "Demo User",
      email: "user@demo.com",
      password,
      role: "USER",
    },
  });

  await prisma.user.upsert({
    where: { email: "responsible@demo.com" },
    update: {},
    create: {
      name: "Demo Responsible",
      email: "responsible@demo.com",
      password,
      role: "RESPONSIBLE",
    },
  });

  await prisma.user.upsert({
    where: { email: "admin@demo.com" },
    update: {},
    create: {
      name: "Demo Admin",
      email: "admin@demo.com",
      password,
      role: "ADMIN",
    },
  });

  console.log("✅ Seed created:");
  console.log("   user@demo.com / password123");
  console.log("   responsible@demo.com / password123");
  console.log("   admin@demo.com / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });