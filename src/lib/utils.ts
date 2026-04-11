import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatCurrency(amount: any, locale: string = "en-US") {
    try {
        const val = typeof amount === "number" ? amount : parseFloat(amount) || 0;
        return new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-US", {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 0,
        }).format(val);
    } catch (e) {
        return "$0";
    }
}

export function formatNumber(amount: any, locale: string = "en-US") {
    try {
        const val = typeof amount === "number" ? amount : parseFloat(amount) || 0;
        return new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-US", {
            maximumFractionDigits: 0,
        }).format(val);
    } catch (e) {
        return "0";
    }
}

export function truncateAddress(address: string) {
    if (!address) return "";
    return `${address.slice(0, 10)}...${address.slice(-4)}`;
}
