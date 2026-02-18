"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { postSchema } from "@/app/schemas/blog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { useState } from "react";
import z from "zod";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

const RichTextEditor = dynamic(
  () =>
    import("@/components/ui/rich-text-editor").then((mod) => ({
      default: mod.RichTextEditor,
    })),
  {
    loading: () => <Skeleton className="h-[500px] w-full" />,
    ssr: false,
  }
);

interface Props {
  initialPost: any; // You can strongly type this from Convex
}

export default function EditPostClient({ initialPost }: Props) {
  const router = useRouter();
  const updatePost = useMutation(api.posts.updatePost);
  const [isPending, setIsPending] = useState(false);

  const form = useForm({
    resolver: zodResolver(postSchema),
    defaultValues: {
      content: initialPost.body,
      contentHtml: initialPost.contentHtml || "",
      title: initialPost.title,
      subtitle: initialPost.subtitle || "",
      topic: initialPost.topic || "Web Development",
      image: undefined,
    },
  });

  async function onSubmit(values: z.infer<typeof postSchema>) {
    setIsPending(true);

    try {
      await updatePost({
        postId: initialPost._id,
        title: values.title,
        body: values.content,
        subtitle: values.subtitle,
        contentHtml: values.contentHtml,
        topic: values.topic,
      });

      toast.success("Post updated successfully!");
      router.push("/my-posts");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update post"
      );
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="flex flex-col pt-20 max-w-3xl mx-auto px-4 gap-6">
      <div>
        <h1 className="text-4xl font-extrabold text-primary mt-6">
          Edit Post
        </h1>
        <p className="text-xl text-paragraph pt-4">
          Edit your existing post.
        </p>
      </div>

      <Card>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup className="gap-y-6">
              <Controller
                name="title"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Title</FieldLabel>
                    <Input {...field} />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="subtitle"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Subtitle</FieldLabel>
                    <Input {...field} />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="topic"
                control={form.control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel>Topic</FieldLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Web Development">
                          Web Development
                        </SelectItem>
                        <SelectItem value="Design & UI">
                          Design & UI
                        </SelectItem>
                        <SelectItem value="AI">AI</SelectItem>
                        <SelectItem value="Engineering">
                          Engineering
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              />

              <Controller
                name="contentHtml"
                control={form.control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel>Content</FieldLabel>
                    <RichTextEditor
                      value={field.value}
                      onChange={(text, html) => {
                        form.setValue("content", text);
                        form.setValue("contentHtml", html);
                      }}
                    />
                  </Field>
                )}
              />

              <Button disabled={isPending} size="lg" className="w-full">
                {isPending && (
                  <Loader2 className="size-4 animate-spin" />
                )}
                Save Changes
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}