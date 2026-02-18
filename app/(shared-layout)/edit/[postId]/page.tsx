"use client";

import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useConvexAuth, useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { postSchema } from "@/app/schemas/blog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
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
import z from "zod";
import { toast } from "sonner";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import Footer from "@/components/web/Footer";

const RichTextEditor = dynamic(
  () => import("@/components/ui/rich-text-editor").then((mod) => ({ default: mod.RichTextEditor })),
  {
    loading: () => <Skeleton className="h-[500px] w-full" />,
    ssr: false,
  }
);

export default function EditPostRoute() {
  const router = useRouter();
  const params = useParams<{ postId: string }>();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const [isPending, setIsPending] = useState(false);
  
  if (!isLoading && !isAuthenticated) {
    router.replace("/auth/login");
    return null;
  }

  const postId = params.postId as Id<"posts"> | undefined;
  const post = useQuery(api.posts.getPostById, postId ? { postId } : "skip");

  const updatePost = useMutation(api.posts.updatePost);

  const form = useForm({
    resolver: zodResolver(postSchema),
    defaultValues: {
      content: "",
      contentHtml: "",
      title: "",
      subtitle: "",
      topic: "Web Development" as const,
      image: undefined,
    },
  });

  // Populate form when post loads
  useEffect(() => {
    if (post) {
      form.reset({
        content: post.body,
        contentHtml: post.contentHtml || "",
        title: post.title,
        subtitle: post.subtitle || "",
        topic: (post.topic || "Web Development") as
          | "Web Development"
          | "Design & UI"
          | "AI"
          | "Engineering",
        image: undefined,
      });
    }
  }, [post, form]);

  if (!postId || isLoading || post === undefined) {
    return (
      <div className="py-12">
        <Skeleton className="h-[700px] w-full" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="py-16">
        <div className="mx-auto max-w-xl text-center space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">Post not found</h1>
          <p className="text-paragraph">The post you're looking for doesn't exist.</p>
          <Link href="/my-posts" className={buttonVariants()}>
            Back to my posts
          </Link>
        </div>
      </div>
    );
  }

  async function onSubmit(values: z.infer<typeof postSchema>) {
    if (!post || !post._id) {
      toast.error("Post not found");
      return;
    }

    setIsPending(true);
    try {
      await updatePost({
        postId: post._id,
        title: values.title,
        body: values.content,
        subtitle: values.subtitle,
        contentHtml: values.contentHtml,
        topic: values.topic,
      });
      toast.success("Post updated successfully!");
      router.push("/my-posts");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update post");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="flex flex-col pt-20 max-w-3xl mx-auto px-4 gap-6">
      <div className="text-left">
        <h1 className="text-4xl font-extrabold text-primary mt-6">Edit Post</h1>
        <p className="text-xl text-paragraph pt-4">Edit your existing post.</p>
      </div>

      <Card className="w-full max-w-4xl mx-auto">
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup className="gap-y-6">
              <Controller
                name="title"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Title</FieldLabel>
                    <Input
                      aria-invalid={fieldState.invalid}
                      placeholder="What's the subject?"
                      className="bg-white dark:bg-black"
                      {...field}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                name="subtitle"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Subtitle</FieldLabel>
                    <Input
                      aria-invalid={fieldState.invalid}
                      placeholder="What's your main idea?"
                      className="bg-white dark:bg-black"
                      {...field}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                name="topic"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel className="text-black dark:text-white">Topic</FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger aria-invalid={fieldState.invalid}>
                        <SelectValue placeholder="Select a topic" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Web Development">Web Development</SelectItem>
                        <SelectItem value="Design & UI">Design & UI</SelectItem>
                        <SelectItem value="AI">AI</SelectItem>
                        <SelectItem value="Engineering">Engineering</SelectItem>
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                name="contentHtml"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel className="text-black dark:text-white">Content</FieldLabel>
                    <RichTextEditor
                      value={field.value}
                      onChange={(text, html) => {
                        form.setValue("content", text);
                        form.setValue("contentHtml", html);
                      }}
                      placeholder="Write your article here... Use the toolbar for formatting"
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Button disabled={isPending} size="lg" className="w-full">
                {isPending && <Loader2 className="size-4 animate-spin" />}
                <span>Save Changes</span>
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </div>
  );
}
