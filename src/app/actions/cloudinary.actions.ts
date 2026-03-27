"use server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function getSignatureAction(params: Record<string, any>) {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const secret = process.env.CLOUDINARY_API_SECRET;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

    if (!secret || !apiKey || !cloudName) {
        return { error: "Cloudinary credentials missing" };
    }

    const signature = cloudinary.utils.api_sign_request(
        {
            ...params,
            timestamp,
        },
        secret
    );

    return {
        signature,
        timestamp,
        apiKey,
        cloudName
    };
}
