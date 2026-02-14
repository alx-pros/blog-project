import { mutation } from "./_generated/server";
import { v } from "convex/values";
import {
  buildWelcomeEmail,
  buildPasswordResetEmail,
  buildNewsletterWelcomeEmail,
} from "./emailTemplates";

export const sendWelcomeEmail = mutation({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
    const { subject, body } = buildWelcomeEmail({
      email: args.email,
      name: args.name ?? undefined,
    });

    // In a real app, integrate your email provider here.
    console.log("[Email][Welcome]", {
      to: args.email,
      subject,
      body,
    });

    return { success: true };
  },
});

export const sendPasswordResetEmail = mutation({
  args: {
    email: v.string(),
    otp: v.string(),
  },
  handler: async (_ctx, args) => {
    const { subject, body } = buildPasswordResetEmail({
      email: args.email,
      otp: args.otp,
    });

    console.log("[Email][PasswordReset]", {
      to: args.email,
      subject,
      body,
    });

    return { success: true };
  },
});

export const sendNewsletterWelcomeEmail = mutation({
  args: {
    email: v.string(),
  },
  handler: async (_ctx, args) => {
    const { subject, body } = buildNewsletterWelcomeEmail({
      email: args.email,
    });

    console.log("[Email][Newsletter]", {
      to: args.email,
      subject,
      body,
    });

    return { success: true };
  },
});

