import nodemailer from "nodemailer";

/**
 * Configure Nodemailer Transport with provided SMTP credentials.
 */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "centreoptiquelorial.net",
  port: Number(process.env.SMTP_PORT) || 465,
  secure: true, // Use SSL for port 465
  auth: {
    user: process.env.SMTP_USER || "reservations@centreoptiquelorial.net",
    pass: process.env.SMTP_PASS || "EARq638kkCuw",
  },
});

/**
 * Sends a 6-digit verification code to the user's email address.
 * 
 * Uses Nodemailer via SMTP.
 */
export async function sendVerificationEmail(email: string, code: string) {
  const from = process.env.SMTP_FROM || "BitLOT <reservations@centreoptiquelorial.net>";

  try {
    const info = await transporter.sendMail({
      from: from,
      to: email,
      subject: "Verify your email - BitLOT",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 20px;">
          <h1 style="color: #F6851B; text-align: center; text-transform: uppercase; letter-spacing: 2px;">BitLOT Verification Code</h1>
          <p style="text-align: center; color: #555; font-weight: bold; font-size: 16px;">Welcome to BitLOT! Use the code below to verify your account.</p>
          
          <div style="background-color: #f6f6f6; border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0;">
            <span style="font-size: 42px; font-weight: 900; letter-spacing: 15px; color: #000; font-family: monospace;">${code}</span>
          </div>

          <p style="text-align: center; font-size: 12px; color: #999;">If you didn't request this code, you can safely ignore this email.</p>
          
          <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
          <p style="text-align: center; font-size: 10px; color: #ccc; text-transform: uppercase; letter-spacing: 1px;">&copy; 2026 BitLOT Bitcoin Lottery Platform</p>
        </div>
      `,
    });

    console.log("Email sent successfully via Nodemailer: %s", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (err: any) {
    console.error("Mail Send Error:", err);
    return { error: "Failed to send email via SMTP" };
  }
}
