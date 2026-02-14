export function buildWelcomeEmail(params: { email: string; name?: string }) {
  const greetingName = params.name || "there";
  return {
    subject: "Welcome to The Web Room",
    body: [
      `Hi ${greetingName},`,
      "",
      "Welcome to The Web Room! 🎉",
      "",
      "Your account has been created successfully. You can now:",
      "- Publish new blog posts",
      "- Join discussions in the comments",
      "- Stay up to date with the latest content from our community",
      "",
      "If you didn't create this account, you can safely ignore this email.",
      "",
      "Happy building,",
      "The Web Room team",
    ].join("\n"),
  };
}

export function buildPasswordResetEmail(params: { email: string; otp: string }) {
  return {
    subject: "Reset your password – The Web Room",
    body: [
      "Hi there,",
      "",
      "We received a request to reset the password for your The Web Room account.",
      "",
      `Your one‑time reset code is: ${params.otp}`,
      "",
      "This code is valid for 15 minutes and can only be used once.",
      "",
      "If you didn't request a password reset, you can safely ignore this email.",
      "",
      "Best,",
      "The Web Room team",
    ].join("\n"),
  };
}

export function buildNewsletterWelcomeEmail(params: { email: string }) {
  return {
    subject: "Thanks for subscribing to The Web Room",
    body: [
      "Hi there,",
      "",
      "Thanks for subscribing to The Web Room newsletter!",
      "",
      "You'll start receiving curated articles, tutorials, and updates about web development,",
      "design, AI, and engineering straight to your inbox.",
      "",
      "If you didn't mean to sign up, you can ignore this email.",
      "",
      "Talk soon,",
      "The Web Room team",
    ].join("\n"),
  };
}

