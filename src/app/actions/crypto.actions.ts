"use server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { createPublicClient, http, formatEther } from "viem";
import { mainnet, bsc, polygon } from "viem/chains";
import { revalidatePath } from "next/cache";

const TREASURY_ADDRESSES: Record<string, string> = {
    "ethereum": process.env.TREASURY_ETH || "0x9876543210abcdef9876543210abcdef98765432", 
    "bsc": process.env.TREASURY_BSC || "0x9876543210abcdef9876543210abcdef98765432",
    "polygon": process.env.TREASURY_POLYGON || "0x9876543210abcdef9876543210abcdef98765432"
};

const RPC_URLS: Record<string, string> = {
    "ethereum": process.env.RPC_ETH || "https://eth-mainnet.public.blastapi.io",
    "bsc": process.env.RPC_BSC || "https://bsc-dataseed.binance.org",
    "polygon": process.env.RPC_POLYGON || "https://polygon-rpc.com"
};

const CHAIN_OBJECTS: Record<string, any> = {
    "ethereum": mainnet,
    "bsc": bsc,
    "polygon": polygon
};

/**
 * 1. Initiate a Crypto Recharge (PENDING)
 * Saves the PENDING transaction to the database for traceability.
 */
export async function initiateCryptoRechargeAction(data: { 
    amount: number; 
    blockchain: string; 
    currency: string; 
    txHash: string;
}) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Not authenticated" };

    try {
        const request = await prisma.paymentRequest.create({
            data: {
                userId: session.user.id,
                type: "CRYPTO_DEPOSIT",
                amount: data.amount,
                blockchain: data.blockchain,
                currency: data.currency,
                txHash: data.txHash,
                status: "PENDING",
                paymentMethod: "METAMASK"
            }
        });

        revalidatePath("/profile");
        return { success: true, requestId: request.id };
    } catch (error: any) {
        if (error.code === 'P2002') return { error: "This transaction hash has already been used." };
        return { error: "Failed to register transaction. Please contact support." };
    }
}

/**
 * 2. Verify Crypto Transaction on Blockchain
 * Verifies on-chain receipt, destination address, and success status.
 */
export async function verifyCryptoTransactionAction(requestId: string) {
    try {
        const request = await prisma.paymentRequest.findUnique({
            where: { id: requestId },
        });

        if (!request || request.status !== "PENDING") return { error: "Request not found or already processed." };
        if (!request.txHash || !request.blockchain) return { error: "Missing transaction identifier." };

        const blockchain = request.blockchain.toLowerCase();
        const chainConfig = CHAIN_OBJECTS[blockchain];
        const rpcUrl = RPC_URLS[blockchain];

        if (!chainConfig || !rpcUrl) return { error: "Unsupported blockchain network." };

        const client = createPublicClient({
            chain: chainConfig,
            transport: http(rpcUrl)
        });

        // Get Receipt (Success/Failure status)
        const receipt = await client.getTransactionReceipt({ 
            hash: request.txHash as `0x${string}` 
        });

        if (!receipt) return { error: "Transaction not found. Try again in 30 seconds." };
        if (receipt.status !== "success") return { error: "Transaction failed on the blockchain." };

        // Get Transaction Details (Amount & Recipient)
        const tx = await client.getTransaction({ 
            hash: request.txHash as `0x${string}` 
        });

        if (!tx) return { error: "Could not fetch on-chain transaction details." };

        // Verify destination
        const treasury = TREASURY_ADDRESSES[blockchain].toLowerCase();
        if (tx.to?.toLowerCase() !== treasury) {
            return { error: "Fraud Alert: Destination address mismatched." };
        }

        // Final Database Update (Transaction + Notification + Balance)
        await prisma.$transaction(async (txPrisma) => {
            await txPrisma.paymentRequest.update({
                where: { id: requestId },
                data: { status: "APPROVED" }
            });

            await txPrisma.user.update({
                where: { id: request.userId },
                data: { balance: { increment: request.amount } }
            });

            await txPrisma.transaction.create({
                data: {
                    userId: request.userId,
                    type: "DEPOSIT",
                    amount: request.amount,
                    status: "CONFIRMED",
                    description: `Recharge Crypto (${request.currency}) Tx: ${request.txHash?.substring(0, 10)}...`
                }
            });

            await txPrisma.notification.create({
                data: {
                    userId: request.userId,
                    type: "RECHARGE",
                    title: "Crypto Recharge Success",
                    message: `Success! $${request.amount} credited to your profile via ${request.blockchain}.`
                }
            });
        });

        revalidatePath("/profile");
        return { success: true };

    } catch (error: any) {
        console.error("verifyCryptoTransactionAction ERROR:", error);
        return { error: "Automatic verification failed. Please check back in a few minutes." };
    }
}
