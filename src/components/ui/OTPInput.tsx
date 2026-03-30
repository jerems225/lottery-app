"use client";
import React, { useState, useRef, useEffect } from "react";

interface OTPInputProps {
  length?: number;
  onComplete: (code: string) => void;
  disabled?: boolean;
}

export const OTPInput = ({ length = 6, onComplete, disabled = false }: OTPInputProps) => {
  const [code, setCode] = useState<string[]>(new Array(length).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    if (isNaN(Number(value))) return;

    const newCode = [...code];
    newCode[index] = value.substring(value.length - 1);
    setCode(newCode);

    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, length);
    if (!/^\d+$/.test(pastedData)) return;

    const newCode = [...code];
    pastedData.split("").forEach((char, i) => {
      newCode[i] = char;
    });
    setCode(newCode);

    const nextIndex = pastedData.length < length ? pastedData.length : length - 1;
    inputRefs.current[nextIndex]?.focus();
  };

  useEffect(() => {
    const fullCode = code.join("");
    if (fullCode.length === length) {
      onComplete(fullCode);
    }
  }, [code, length, onComplete]);

  return (
    <div className="flex justify-between gap-2 md:gap-3" onPaste={handlePaste}>
      {code.map((digit, i) => (
        <input
          key={i}
          ref={(el) => { inputRefs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          value={digit}
          disabled={disabled}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          className="w-full aspect-[4/5] bg-bg-light border border-black/5 rounded-xl md:rounded-2xl text-center font-black text-xl md:text-2xl outline-none focus:border-primary-gold focus:bg-white focus:shadow-lg transition-all shadow-inner text-text-main"
          required
        />
      ))}
    </div>
  );
};
