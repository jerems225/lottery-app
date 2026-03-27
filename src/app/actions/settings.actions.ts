"use server";
import { auth } from "@/auth";
import fs from "fs";
import path from "path";

const settingsFilePath = path.join(process.cwd(), "config", "global_settings.json");

// Default Fallback Settings
const defaultSettings = {
    platformCommission: 20,
    referralReward: 5,
    minWithdrawal: 10,
    maintenanceMode: false,
    newRegistrations: true,
    emailVerification: true,
    supportEmail: "support@bitlot.io"
};

/**
 * Ensures the settings file exists.
 */
function ensureSettingsFile() {
    const dir = path.dirname(settingsFilePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(settingsFilePath)) {
        fs.writeFileSync(settingsFilePath, JSON.stringify(defaultSettings, null, 2), "utf8");
    }
}

/**
 * Get all global settings
 */
export async function getGlobalSettingsAction() {
    try {
        const session = await auth();
        // Allow Superadmin and Admin
        if (!session?.user?.role || !["ADMIN", "SUPERADMIN", "MANAGER"].includes(session.user.role)) {
            return { error: "Unauthorized access" };
        }

        ensureSettingsFile();
        const data = fs.readFileSync(settingsFilePath, "utf8");
        return { success: true, settings: JSON.parse(data) };
    } catch (error) {
        return { success: true, settings: defaultSettings };
    }
}

/**
 * Update global settings
 */
export async function updateGlobalSettingsAction(updates: any) {
    try {
        const session = await auth();
        if (session?.user?.role !== "SUPERADMIN") {
            return { error: "Superadmin privileges required to modify global settings" };
        }

        ensureSettingsFile();
        const currentData = JSON.parse(fs.readFileSync(settingsFilePath, "utf8"));
        const newData = { ...currentData, ...updates };

        fs.writeFileSync(settingsFilePath, JSON.stringify(newData, null, 2), "utf8");
        return { success: true, settings: newData };
    } catch (error) {
        return { error: "Failed to update global settings" };
    }
}
