import { mutation, query } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { buildPasswordResetEmail } from "./emailTemplates";

// Generate a random 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export const requestPasswordReset = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const email = args.email.toLowerCase();

    // For demo purposes, just create an OTP record
    // In a real app, you'd verify the user exists through better-auth
    
    // Generate OTP
    const otp = generateOTP();
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes

    // Delete any existing OTP for this email
    const existingOtps = await ctx.db
      .query("passwordResetOtps")
      .withIndex("by_email", (q) => q.eq("email", email))
      .collect();

    for (const otpRecord of existingOtps) {
      await ctx.db.delete(otpRecord._id);
    }

    // Store new OTP
    await ctx.db.insert("passwordResetOtps", {
      email,
      otp,
      expiresAt,
      attempts: 0,
    });

    // Build and "send" the password reset email using our template.
    const { subject, body } = buildPasswordResetEmail({ email, otp });
    console.log("[Email][PasswordReset][OTP]", {
      to: email,
      subject,
      body,
    });

    return { success: true };
  },
});

export const verifyOTP = query({
  args: { email: v.string(), otp: v.string() },
  handler: async (ctx, args) => {
    const email = args.email.toLowerCase();

    const otpRecords = await ctx.db
      .query("passwordResetOtps")
      .withIndex("by_email", (q) => q.eq("email", email))
      .collect();

    if (otpRecords.length === 0) {
      return { valid: false, error: "OTP not found" };
    }

    const otpRecord = otpRecords[0];

    // Check if OTP expired
    if (Date.now() > otpRecord.expiresAt) {
      // Don't delete here since this is a query
      return { valid: false, error: "OTP expired" };
    }

    // Check if too many attempts
    if (otpRecord.attempts >= 5) {
      return { valid: false, error: "Too many attempts" };
    }

    // Check if OTP matches
    if (otpRecord.otp !== args.otp) {
      return { valid: false, error: "Invalid OTP" };
    }

    return { valid: true };
  },
});

export const resetPassword = mutation({
  args: { email: v.string(), otp: v.string(), newPassword: v.string() },
  handler: async (ctx, args) => {
    const email = args.email.toLowerCase();

    // Verify OTP first
    const otpRecords = await ctx.db
      .query("passwordResetOtps")
      .withIndex("by_email", (q) => q.eq("email", email))
      .collect();

    if (otpRecords.length === 0) {
      throw new ConvexError("Invalid OTP");
    }

    const otpRecord = otpRecords[0];

    if (Date.now() > otpRecord.expiresAt) {
      await ctx.db.delete(otpRecord._id);
      throw new ConvexError("OTP expired");
    }

    if (otpRecord.otp !== args.otp) {
      // Increment attempts
      await ctx.db.patch(otpRecord._id, { attempts: otpRecord.attempts + 1 });
      throw new ConvexError("Invalid OTP");
    }

    // Find user and reset password
    // Note: This would require integration with better-auth password reset functionality
    // For now, we're just deleting the OTP
    await ctx.db.delete(otpRecord._id);

    return { success: true };
  },
});
