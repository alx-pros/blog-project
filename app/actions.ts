"use server";

import z from "zod";
import { postSchema } from "./schemas/blog";
import { fetchMutation } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { redirect } from "next/navigation";
import { getToken } from "@/lib/auth-server";
import { updateTag } from "next/cache";

export async function createBlogAction(values: z.infer<typeof postSchema>) {
  try {
    const parsed = postSchema.safeParse(values);

    if (!parsed.success) {
      throw new Error("Validation failed");
    }

    const token = await getToken();
    
    let storageId = undefined;
    
    // Upload image only if provided
    if (parsed.data.image) {
      const imageUrl = await fetchMutation(
        api.posts.generateImageUploadUrl,
        {},
        { token }
      );

      const uploadResult = await fetch(imageUrl, {
        method: "POST",
        headers: {
          "Content-Type": parsed.data.image.type,
        },
        body: parsed.data.image,
      });

      if (!uploadResult.ok) {
        throw new Error("Failed to upload image");
      }

      const result = await uploadResult.json();
      storageId = result.storageId;
    }

    await fetchMutation(
      api.posts.createPost,
      {
        body: parsed.data.content,
        title: parsed.data.title,
        contentHtml: parsed.data.contentHtml,
        topic: parsed.data.topic,
        imageStorageId: storageId,
      },
      { token }
    );

    updateTag("posts");
    redirect("/posts");
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to create post"
    );
  }
}
