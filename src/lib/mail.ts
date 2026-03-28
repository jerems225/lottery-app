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
  const from = process.env.SMTP_FROM || 'BitLOT <reservations@centreoptiquelorial.net>';

  try {
    const info = await transporter.sendMail({
      from: from,
      to: email,
      subject: "Verify your email - BitLOT",
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 40px; border: 1px solid #f0f0f0; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.05);">
          <div style="background-color: #000000; padding: 40px 20px; text-align: center;">
            <h1 style="color: #F6851B; margin: 0; text-transform: uppercase; letter-spacing: 5px; font-weight: 900; font-size: 28px;">BitLOT</h1>
            <p style="color: #ffffff; opacity: 0.6; margin-top: 5px; font-size: 10px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase;">Premium Bitcoin Lottery</p>
          </div>
          
          <div style="padding: 50px 40px; text-align: center;">
            <h2 style="color: #111111; font-weight: 900; font-size: 24px; margin-bottom: 10px; text-transform: uppercase;">Verification Code</h2>
            <p style="color: #666666; font-size: 15px; line-height: 1.6; margin-bottom: 40px;">Please use the 6-digit code below to complete your account verification. This code is valid for 10 minutes.</p>
            
            <div style="background-color: #f8f8f8; border-radius: 20px; padding: 30px; display: inline-block; border: 1px solid #eeeeee; position: relative;">
              <span style="font-size: 48px; font-weight: 950; letter-spacing: 12px; color: #000000; font-family: 'Courier New', Courier, monospace; margin-left: 12px;">${code}</span>
              <div style="margin-top: 15px; color: #999999; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">
                <img src="https://img.icons8.com/material-rounded/24/999999/copy.png" style="vertical-align: middle; width: 14px; height: 14px; margin-right: 5px;" />
                Copy and paste this code
              </div>
            </div>

            <p style="color: #999999; font-size: 12px; margin-top: 40px;">If you did not request this verification, please ignore this email or contact our support.</p>
          </div>
          
          <div style="background-color: #fafafa; padding: 30px; text-align: center; border-top: 1px solid #f0f0f0;">
             <p style="margin: 0; color: #bbbbbb; font-size: 9px; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;">&copy; 2026 BitLOT &bull; Secure & Decentralized</p>
          </div>
        </div>
      `,
    });

    console.log("Verification Email sent: %s", info.messageId);
    return { success: true };
  } catch (err: any) {
    console.error("Mail Send Error:", err);
    return { error: "Failed to send email" };
  }
}

/**
 * Sends a password reset code to the user.
 */
export async function sendPasswordResetEmail(email: string, code: string) {
  const from = process.env.SMTP_FROM || 'BitLOT <reservations@centreoptiquelorial.net>';

  try {
    const info = await transporter.sendMail({
      from: from,
      to: email,
      subject: "Reset your password - BitLOT",
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 40px; border: 1px solid #f0f0f0; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.05);">
          <div style="background-color: #000000; padding: 40px 20px; text-align: center;">
            <h1 style="color: #F6851B; margin: 0; text-transform: uppercase; letter-spacing: 5px; font-weight: 900; font-size: 28px;">BitLOT</h1>
            <p style="color: #ffffff; opacity: 0.6; margin-top: 5px; font-size: 10px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase;">Premium Bitcoin Lottery</p>
          </div>
          
          <div style="padding: 50px 40px; text-align: center;">
            <h2 style="color: #111111; font-weight: 900; font-size: 24px; margin-bottom: 10px; text-transform: uppercase;">Reset Password</h2>
            <p style="color: #666666; font-size: 15px; line-height: 1.6; margin-bottom: 40px;">We received a request to reset your password. Use the secret code below to proceed.</p>
            
            <div style="background-color: #f8f8f8; border-radius: 20px; padding: 30px; display: inline-block; border: 1px solid #eeeeee; position: relative;">
              <span style="font-size: 48px; font-weight: 950; letter-spacing: 12px; color: #F6851B; font-family: 'Courier New', Courier, monospace; margin-left: 12px;">${code}</span>
              <div style="margin-top: 15px; color: #999999; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">
                <img src="https://img.icons8.com/material-rounded/24/999999/copy.png" style="vertical-align: middle; width: 14px; height: 14px; margin-right: 5px;" />
                Copy and paste this code
              </div>
            </div>

            <p style="color: #999999; font-size: 12px; margin-top: 40px;">If you did not request a password reset, you can safely ignore this email.</p>
          </div>
          
          <div style="background-color: #fafafa; padding: 30px; text-align: center; border-top: 1px solid #f0f0f0;">
             <p style="margin: 0; color: #bbbbbb; font-size: 9px; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;">&copy; 2026 BitLOT &bull; Secure & Decentralized</p>
          </div>
        </div>
      `,
    });

    console.log("Reset Email sent: %s", info.messageId);
    return { success: true };
  } catch (err: any) {
    console.error("Mail Send Error:", err);
    return { error: "Failed to send reset email" };
  }
}

/**
 * Sends a notification email to a blocked or suspended user.
 */
export async function sendBlockNotificationEmail(email: string, reason: string, blockedUntil: Date | null, isTotalBlock: boolean = false) {
  const from = process.env.SMTP_FROM || 'BitLOT Security <reservations@centreoptiquelorial.net>';
  const dateStr = blockedUntil ? blockedUntil.toLocaleDateString() : "Indefinite";
  const typeLabel = isTotalBlock ? "Access Blocked" : "Account Suspended";
  const typeColor = isTotalBlock ? "#ff4d4d" : "#f6851b";

  try {
    const info = await transporter.sendMail({
      from: from,
      to: email,
      subject: `Account Notice: ${typeLabel} - BitLOT`,
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 40px; border: 1px solid #f0f0f0; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.05);">
          <div style="background-color: #000000; padding: 40px 20px; text-align: center;">
            <h1 style="color: ${typeColor}; margin: 0; text-transform: uppercase; letter-spacing: 5px; font-weight: 900; font-size: 28px;">BitLOT</h1>
            <p style="color: #ffffff; opacity: 0.6; margin-top: 5px; font-size: 10px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase;">Security Department</p>
          </div>
          
          <div style="padding: 50px 40px; text-align: center;">
            <h2 style="color: ${typeColor}; font-weight: 900; font-size: 24px; margin-bottom: 20px; text-transform: uppercase;">${typeLabel}</h2>
            <p style="color: #666666; font-size: 15px; line-height: 1.6; margin-bottom: 30px;">
                ${isTotalBlock
          ? "Your account access has been fully restricted. You can no longer log in to the platform."
          : "Your account has been suspended. You can still access your profile, but betting and recharge functions are disabled."}
            </p>
            
            <div style="background-color: #fffafa; border-radius: 20px; padding: 25px; border: 1px solid #ffebeb; margin-bottom: 30px;">
              <p style="font-size: 16px; font-weight: 800; color: #cc0000; margin: 0; font-style: italic;">"${reason}"</p>
            </div>

            <div style="border-top: 1px solid #f0f0f0; padding-top: 20px; margin-top: 20px;">
                <p style="color: #999999; font-size: 12px; text-transform: uppercase; font-weight: bold; letter-spacing: 1px;">Restriction Period</p>
                <p style="font-size: 18px; font-weight: 900; color: #333333; margin-top: 5px;">Until ${dateStr}</p>
            </div>

            <p style="color: #999999; font-size: 12px; margin-top: 40px;">If you believe this is a mistake, please contact our support team to file an appeal.</p>
          </div>
          
          <div style="background-color: #fafafa; padding: 30px; text-align: center; border-top: 1px solid #f0f0f0;">
             <p style="margin: 0; color: #bbbbbb; font-size: 9px; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;">&copy; 2026 BitLOT &bull; Secure & Transparent</p>
          </div>
        </div>
      `,
    });

    console.log("Block Notification Email sent: %s", info.messageId);
    return { success: true };
  } catch (err: any) {
    console.error("Mail Send Error:", err);
    return { error: "Failed to send block notification email" };
  }
}
/**
 * Sends a notification email when a lottery room closes.
 */
export async function sendRoomClosedEmail(
  email: string,
  roomTitle: string,
  userRole: string = "USER",
  isManual: boolean = false
) {
  const from = process.env.SMTP_FROM || 'BitLOT Notifications <reservations@centreoptiquelorial.net>';
  const subject = userRole === "ADMIN" || userRole === "SUPERADMIN" || userRole === "MANAGER"
    ? `Action Required: Room ${roomTitle} Closed - BitLOT`
    : `Room ${roomTitle} has Closed! - BitLOT`;

  const titleText = userRole === "ADMIN" || userRole === "SUPERADMIN" || userRole === "MANAGER"
    ? "Room Requires Drawing"
    : "Room Drawing is Starting";

  const bodyText = userRole === "ADMIN" || userRole === "SUPERADMIN" || userRole === "MANAGER"
    ? `The lottery room <b>${roomTitle}</b> has expired. Since it was set to Manual Resolution, please log in to the admin panel to pick a winner and distribute regular prizes.`
    : `The lottery room <b>${roomTitle}</b> has just closed. The drawing will take place shortly. If the creator chose manual resolution, the selection might take a few moments. Stay tuned!`;

  try {
    const info = await transporter.sendMail({
      from: from,
      to: email,
      subject: subject,
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 40px; border: 1px solid #f0f0f0; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.05);">
          <div style="background-color: #000000; padding: 40px 20px; text-align: center;">
            <h1 style="color: #F6851B; margin: 0; text-transform: uppercase; letter-spacing: 5px; font-weight: 900; font-size: 28px;">BitLOT</h1>
            <p style="color: #ffffff; opacity: 0.6; margin-top: 5px; font-size: 10px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase;">Room Closure Alert</p>
          </div>
          
          <div style="padding: 50px 40px; text-align: center;">
            <div style="width: 60px; height: 60px; background-color: #f8f8f8; border-radius: 20px; display: flex; align-items: center; justify-content: center; margin: 0 auto 30px;">
                <img src="https://img.icons8.com/color/48/000000/timer.png" style="width: 32px; height: 32px;" />
            </div>
            <h2 style="color: #111111; font-weight: 900; font-size: 24px; margin-bottom: 20px; text-transform: uppercase;">${titleText}</h2>
            <p style="color: #666666; font-size: 15px; line-height: 1.6; margin-bottom: 40px;">
                ${bodyText}
            </p>
            
            <a href="${process.env.NEXTAUTH_URL}/rooms" style="background-color: #000000; color: #ffffff; padding: 20px 40px; border-radius: 20px; text-decoration: none; font-weight: 900; text-transform: uppercase; font-size: 12px; letter-spacing: 2px;">View All Rooms</a>

            <p style="color: #999999; font-size: 12px; margin-top: 40px;">Good luck to all participants! May the Bitcoin be with you.</p>
          </div>
          
          <div style="background-color: #fafafa; padding: 30px; text-align: center; border-top: 1px solid #f0f0f0;">
             <p style="margin: 0; color: #bbbbbb; font-size: 9px; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;">&copy; 2026 BitLOT &bull; Premium Experience</p>
          </div>
        </div>
      `,
    });

    console.log("Room Closure Email sent: %s", info.messageId);
    return { success: true };
  } catch (err: any) {
    console.error("Mail Send Error:", err);
    return { error: "Failed to send room closure email" };
  }
}

/**
 * Sends a generic newsletter/bulk email to a subscriber.
 */
export async function sendNewsletterEmail(email: string, subject: string, content: string) {
  const from = process.env.SMTP_FROM || 'BitLOT Announcements <reservations@centreoptiquelorial.net>';

  try {
    const info = await transporter.sendMail({
      from: from,
      to: email,
      subject: subject,
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 40px; border: 1px solid #f0f0f0; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.05);">
          <div style="background-color: #000000; padding: 40px 20px; text-align: center;">
            <h1 style="color: #F6851B; margin: 0; text-transform: uppercase; letter-spacing: 5px; font-weight: 900; font-size: 28px;">BitLOT</h1>
            <p style="color: #ffffff; opacity: 0.6; margin-top: 5px; font-size: 10px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase;">Official Update</p>
          </div>
          
          <div style="padding: 50px 40px;">
            <div style="color: #111111; font-size: 16px; line-height: 1.8;">
              ${content}
            </div>
            
            <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #f0f0f0; text-align: center;">
              <a href="${process.env.NEXTAUTH_URL}" style="background-color: #000000; color: #ffffff; padding: 18px 30px; border-radius: 18px; text-decoration: none; font-weight: 900; text-transform: uppercase; font-size: 11px; letter-spacing: 2px;">Visit Platform</a>
            </div>

            <p style="color: #999999; font-size: 11px; text-align: center; margin-top: 40px; line-height: 1.5;">
              You received this email because you're subscribed to BitLOT updates. <br/>
              <a href="#" style="color: #F6851B; text-decoration: none;">Unsubscribe instantly</a> if you no longer wish to receive these.
            </p>
          </div>
          
          <div style="background-color: #fafafa; padding: 30px; text-align: center; border-top: 1px solid #f0f0f0;">
             <p style="margin: 0; color: #bbbbbb; font-size: 9px; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;">&copy; 2026 BitLOT &bull; Advanced Lottery Tech</p>
          </div>
        </div>
      `,
    });

    return { success: true };
  } catch (err: any) {
    console.error("Bulk Mail Error:", err);
    return { error: "Failed to send newsletter email" };
  }
}

