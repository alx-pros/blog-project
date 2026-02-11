import z from "zod";

export const postSchema = z.object({
  title: z.string().min(6, "Title must be at least 6 characters").max(200),
  content: z.string().min(300, "Content must be at least 300 characters"),
  contentHtml: z.optional(z.string()),
  topic: z
    .enum(["Web Development", "Design & UI", "AI", "Engineering"])
    .refine((val) => val !== "", { message: "Please select a topic" }),
});
