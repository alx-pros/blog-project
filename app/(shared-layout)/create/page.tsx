"use client";

import dynamic from "next/dynamic";
import { createBlogAction } from "@/app/actions";
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
import { ArrowDown, ChevronDown, Loader2 } from "lucide-react";
import { useEffect, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { useConvexAuth } from "convex/react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import z from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const RichTextEditor = dynamic(
  () => import("@/components/ui/rich-text-editor").then((mod) => ({ default: mod.RichTextEditor })),
  {
    loading: () => <Skeleton className="h-80 w-full" />,
    ssr: false,
  }
);

export default function CreateRoute() {
  const [isPending, startTransition] = useTransition();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(postSchema),
    defaultValues: {
      content: "",
      contentHtml: "",
      title: "",
      subtitle: "",
      topic: "Web Development",
      image: undefined,
    },
  });

  function onSubmit(values: z.infer<typeof postSchema>) {
    startTransition(async () => {
      try {
        await createBlogAction(values);
        form.reset();
        toast.success("Post created successfully!");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to create post");
      }
      router.push("/my-posts");
    });
  }

  useEffect(() => {
    console.log("[CreatePage] Auth state:", { isAuthenticated, isLoading });
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return <div>Loading auth...</div>;
  }

  if (!isLoading && !isAuthenticated) {
    return (
      <div className="py-16">
        <div className="mx-auto max-w-xl text-center space-y-4">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            You need an account to write
          </h1>
          <p className="text-base text-muted-foreground">
            Reading is open to everyone, but creating posts is reserved for signed-in users. Create
            an account or log in to start writing.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link href="/auth/sign-up" className={buttonVariants({ size: "lg" })}>
              Create account
            </Link>
            <Link href="/auth/login" className={buttonVariants({ variant: "outline", size: "lg" })}>
              Log in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="text-left mb-6">
        <h1 className="text-4xl font-extrabold text-primary">Create Post</h1>
        <p className="text-paragraph mt-2">
          Help us grow our community by sharing your knowledge and insights.
        </p>
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
                    <FieldLabel className="text-black dark:text-white">Title</FieldLabel>
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
                    <FieldLabel className="text-black dark:text-white">Subtitle</FieldLabel>
                    <Input
                      aria-invalid={fieldState.invalid}
                      placeholder="What's the main idea?"
                      className="bg-white dark:bg-black"
                      {...field}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <div className="flex flex-col sm:flex-row w-full gap-5">
                <Controller
                  name="topic"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel className="text-black dark:text-white">Topic</FieldLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger
                          aria-invalid={fieldState.invalid}
                          className="bg-white dark:bg-black hover:bg-white dark:hover:bg-black cursor-pointer"
                        >
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
                  name="image"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel className="text-black dark:text-white">Featured Image</FieldLabel>

                      <div className="space-y-2">
                        {/* Hidden input */}
                        <input
                          type="file"
                          accept="image/*"
                          id="image-upload"
                          className="hidden"
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            field.onChange(file);
                          }}
                        />

                        {/* Custom button */}
                        <label
                          htmlFor="image-upload"
                          className="flex items-center justify-between w-full h-9 px-4 rounded-md border border-input bg-white dark:bg-black text-sm cursor-pointer hover:bg-muted transition"
                        >
                          {field.value ? field.value.name : "Upload image"}
                          <ChevronDown className="size-4" />
                        </label>
                      </div>

                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
              </div>

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
                      placeholder="Write your content here..."
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Button disabled={isPending} size="lg" className="w-full cursor-pointer">
                {isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <span>Publish Article</span>
                )}
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
