import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    const superAdminEmail = process.env.SUPERADMIN_EMAIL || "admin@bitlot.com";
    const superAdminPassword = process.env.SUPERADMIN_PASSWORD || "AdminPassword123!";

    console.log(`Starting seed: checking for SuperAdmin user (${superAdminEmail})...`);

    const hashedPassword = await bcrypt.hash(superAdminPassword, 12);

    const superAdmin = await prisma.user.upsert({
        where: { email: superAdminEmail },
        update: {
            password: hashedPassword,
            role: "SUPERADMIN",
            isVerified: true,
        },
        create: {
            email: superAdminEmail,
            name: "BitLOT Admin",
            password: hashedPassword,
            role: "SUPERADMIN",
            isVerified: true,
            balance: 1000,
        },
    });

    console.log("SuperAdmin user created or updated successfully.");
    console.log(`Email: ${superAdminEmail}`);
    console.log(`Role: ${superAdmin.role}`);
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error("Seed error:", e);
        await prisma.$disconnect();
        process.exit(1);
    });
