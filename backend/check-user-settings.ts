import { prisma } from "./src/prisma.js";

async function main() {
  await prisma.$connect();
  const user = await prisma.user.findFirst({
    where: {
      email: {
        contains: "neerajkushwaha0401",
        mode: "insensitive"
      }
    },
    include: {
      settings: true
    }
  });

  if (!user) {
    console.log("User not found!");
  } else {
    console.log("User Data:", {
      id: user.id,
      email: user.email,
      clerkId: user.clerkId,
      supabaseId: user.supabaseId,
      settings: user.settings
    });
  }

  await prisma.$disconnect();
}

main();
