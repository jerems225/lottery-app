"use client";
import React, { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Image as ImageIcon, Loader2, CheckCircle2 } from "lucide-react";
import { updateUserAction, getSignatureAction } from "@/app/actions";
import { toast } from "react-hot-toast";

interface UploadAvatarModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function UploadAvatarModal({ isOpen, onClose, onSuccess }: UploadAvatarModalProps) {
    const { update } = useSession();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error("File is too large (max 5MB)");
                return;
            }
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;
        setUploading(true);

        const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

        if (!uploadPreset) {
            toast.error("Cloudinary Upload Preset is not configured in .env");
            setUploading(false);
            return;
        }

        try {
            // 1. Get Signed Signature from server
            const signRes = await getSignatureAction({ 
                upload_preset: uploadPreset,
                folder: "avatars"
            });

            if (signRes.error || !signRes.signature) {
                toast.error(signRes.error || "Cloudinary credentials not configured on server");
                setUploading(false);
                return;
            }

            // 2. Upload to Cloudinary
            const formData = new FormData();
            formData.append("file", selectedFile);
            formData.append("api_key", signRes.apiKey!);
            formData.append("timestamp", signRes.timestamp!.toString());
            formData.append("signature", signRes.signature);
            formData.append("upload_preset", uploadPreset);
            formData.append("folder", "avatars");

            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${signRes.cloudName}/image/upload`,
                {
                    method: "POST",
                    body: formData,
                }
            );

            const data = await response.json();
            if (data.secure_url) {
                const updateFormData = new FormData();
                updateFormData.append("image", data.secure_url);
                const res = await updateUserAction(updateFormData);
                
                if (res.error) {
                    toast.error(res.error);
                } else {
                    await update({ image: data.secure_url });
                    toast.success("Profile picture updated!");
                    onSuccess();
                    onClose();
                }
            } else {
                console.error("Cloudinary Error:", data.error);
                toast.error(data.error?.message || "Upload failed");
            }
        } catch (error) {
            toast.error("Error uploading image");
        } finally {
            setUploading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="bg-white rounded-[40px] w-full max-w-md p-10 relative shadow-2xl overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-2 bg-primary-gold/20">
                        {uploading && (
                            <motion.div 
                                className="h-full bg-primary-gold" 
                                initial={{ width: 0 }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 2, repeat: Infinity }}
                            />
                        )}
                    </div>

                    <button
                        onClick={onClose}
                        className="absolute top-8 right-8 p-2 rounded-full hover:bg-zinc-100 transition-all"
                    >
                        <X className="w-5 h-5 text-zinc-400" />
                    </button>

                    <div className="flex flex-col items-center text-center gap-4 mb-10">
                        <div className="w-16 h-16 rounded-3xl bg-primary-gold/10 flex items-center justify-center text-primary-gold">
                            <ImageIcon className="w-8 h-8" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <h2 className="text-2xl font-[950] text-text-main uppercase tracking-tight">Upload Photo</h2>
                            <p className="font-bold text-sm text-text-muted px-4">Choose a high-quality JPG or PNG for your profile.</p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-8">
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className={`border-2 border-dashed rounded-[32px] p-8 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all hover:bg-zinc-50 border-zinc-200 hover:border-primary-gold ${previewUrl ? 'bg-zinc-50' : ''}`}
                        >
                            {previewUrl ? (
                                <div className="relative group">
                                    <img src={previewUrl} alt="Preview" className="w-32 h-32 rounded-3xl object-cover shadow-xl border-4 border-white" />
                                    <div className="absolute inset-0 bg-black/40 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Upload className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center">
                                        <Upload className="w-5 h-5 text-zinc-400" />
                                    </div>
                                    <span className="text-xs font-black uppercase tracking-widest text-zinc-500">Tap to select</span>
                                </div>
                            )}
                            <input 
                                ref={fileInputRef}
                                type="file" 
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </div>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleUpload}
                                disabled={!selectedFile || uploading}
                                className="w-full bg-zinc-900 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-primary-gold transition-all shadow-xl shadow-black/10 flex items-center justify-center disabled:opacity-30"
                            >
                                {uploading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    "Save Profile Photo"
                                )}
                            </button>
                            <button
                                onClick={onClose}
                                className="w-full text-zinc-400 py-2 font-black uppercase text-[10px] tracking-widest hover:text-zinc-600 transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
