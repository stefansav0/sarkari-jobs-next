import nodemailer from "nodemailer";
import User from "@/lib/models/User";

// ✅ Gmail Transporter (uses App Password)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ✅ Reusable HTML email wrapper
const wrapHtml = (title, content) => `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px; background-color: #ffffff;">
    <h2 style="color: #2563eb; text-align: center;">${title}</h2>
    <div style="margin-top: 20px; font-size: 15px; color: #333;">
      ${content}
    </div>
    <hr style="margin: 30px 0;" />
    <p style="font-size: 13px; color: #6b7280; text-align: center;">
      You received this email because you're registered on <strong>Finderight</strong>.
    </p>
  </div>
`;

// ✅ OTP Email Content Generator
const otpHtmlTemplate = (name = "User", otp) => `
  <p>Hi ${name},</p>
  <p>Your One-Time Password (OTP) to verify your email is:</p>
  <p style="font-size: 24px; font-weight: bold; color: #10b981; margin: 20px 0;">${otp}</p>
  <p>This OTP is valid for 10 minutes. Please do not share it with anyone.</p>
  <p>If you did not request this, please ignore this email.</p>
`;

// ✅ Generic email sender
export const sendEmail = async (to, subject, text = "", html = "", attachments = []) => {
  const mailOptions = {
    from: `"Finderight" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html: html ? wrapHtml(subject, html) : undefined,
    attachments,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent to ${to}`);
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}:`, error?.response?.data || error.message);
  }
};

// ✅ OTP sender
export const sendOtpEmail = async (to, name, otp) => {
  const subject = "Verify Your Email";
  const html = otpHtmlTemplate(name, otp);
  await sendEmail(to, subject, "", html);
};

// ✅ Broadcast email to all verified users
export const sendToAllUsers = async ({ subject, text = "", html = "" }) => {
  try {
    const users = await User.find({ isVerified: true }, "name email");

    if (!users.length) {
      console.warn("⚠️ No verified users found.");
      return;
    }

    console.log(`📢 Sending to ${users.length} verified users...`);

    const sendPromises = users.map(({ name, email }) => {
      const personalizedHtml = html.replace("{{name}}", name || "User");
      return sendEmail(email, subject, text, personalizedHtml);
    });

    await Promise.allSettled(sendPromises);
    console.log("✅ Broadcast complete.");
  } catch (error) {
    console.error("❌ Bulk email failed:", error.message);
  }
};
