const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const lotteries = await prisma.lottery.findMany({ take: 1 });
  console.log(JSON.stringify(lotteries[0], null, 2));
  process.exit(0);
}

check();
