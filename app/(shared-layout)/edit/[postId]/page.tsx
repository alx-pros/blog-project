"use client";

import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useConvexAuth, useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { postSchema } from "@/app/schemas/blog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
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
import { Loader2, ArrowLeft } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import z from "zod";
import { toast } from "sonner";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

const RichTextEditor = dynamic(
  () => import("@/components/ui/rich-text-editor").then(mod => ({ default: mod.RichTextEditor })),
  { 
    loading: () => <Skeleton className="h-80 w-full" />,
    ssr: false 
  }
);

export default function EditPostRoute({ params }: { params: Promise<{ postId: string }> }) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const [resolvedParams, setResolvedParams] = useState<{ postId: string } | null>(null);
  const [isPending, startTransition] = useState(false);

  useEffect(() => {
    params.then(p => setResolvedParams(p));
  }, [params]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, isLoading, router]);

  const post = resolvedParams 
    ? useQuery(api.posts.getPostById, { postId: resolvedParams.postId as Id<"posts"> })
    : null;

  const updatePost = useMutation(api.posts.updatePost);

  const form = useForm({
    resolver: zodResolver(postSchema),
    defaultValues: {
      content: "",
      contentHtml: "",
      title: "",
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
        topic: (post.topic || "Web Development") as "Web Development" | "Design & UI" | "AI" | "Engineering",
        image: undefined,
      });
    }
  }, [post, form]);

  if (!resolvedParams || isLoading) {
    return (
      <div className="py-12">
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="py-16">
        <div className="mx-auto max-w-xl text-center space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">Post not found</h1>
          <p className="text-muted-foreground">
            The post you're looking for doesn't exist.
          </p>
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

    startTransition(true);
    try {
      await updatePost({
        postId: post._id,
        title: values.title,
        body: values.content,
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
      startTransition(false);
    }
  }

  return (
    <div className="py-12">
      <div className="text-center mb-12">
        <Link href="/my-posts" className={buttonVariants({ variant: "outline", className: "mb-4" })}>
          <ArrowLeft className="size-4 mr-2" />
          Back to my posts
        </Link>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl mt-6">
          Edit Post
        </h1>
        <p className="text-xl text-muted-foreground pt-4">
          Update your article
        </p>
      </div>

      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Edit Blog Article</CardTitle>
          <CardDescription>
            Modify your article with rich formatting
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup className="gap-y-6">
              <Controller
                name="title"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Article Title</FieldLabel>
                    <Input
                      aria-invalid={fieldState.invalid}
                      placeholder="Enter your article title"
                      {...field}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="topic"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Topic</FieldLabel>
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
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="contentHtml"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Article Content</FieldLabel>
                    <RichTextEditor
                      value={field.value}
                      onChange={(text, html) => {
                        form.setValue("content", text);
                        form.setValue("contentHtml", html);
                      }}
                      placeholder="Write your article here... Use the toolbar for formatting"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Button disabled={isPending} size="lg" className="w-full">
                {isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Changes</span>
                )}
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
