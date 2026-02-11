"use client";

import dynamic from "next/dynamic";
import { createBlogAction } from "@/app/actions";
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
import { Loader2 } from "lucide-react";
import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { useConvexAuth } from "convex/react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import z from "zod";
import { toast } from "sonner";

const RichTextEditor = dynamic(
  () => import("@/components/ui/rich-text-editor").then(mod => ({ default: mod.RichTextEditor })),
  { 
    loading: () => <Skeleton className="h-80 w-full" />,
    ssr: false 
  }
);

export default function CreateRoute() {
  const [isPending, startTransition] = useTransition();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const form = useForm({
    resolver: zodResolver(postSchema),
    defaultValues: {
      content: "",
      contentHtml: "",
      title: "",
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
        toast.error(
          error instanceof Error ? error.message : "Failed to create post"
        );
      }
    });
  }

  if (!isLoading && !isAuthenticated) {
    return (
      <div className="py-16">
        <div className="mx-auto max-w-xl text-center space-y-4">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            You need an account to write
          </h1>
          <p className="text-base text-muted-foreground">
            Reading is open to everyone, but creating posts is reserved for
            signed-in users. Create an account or log in to start writing.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link
              href="/auth/sign-up"
              className={buttonVariants({ size: "lg" })}
            >
              Create account
            </Link>
            <Link
              href="/auth/login"
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              Log in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          Create Post
        </h1>
        <p className="text-xl text-muted-foreground pt-4">
          Share your thoughts with the world
        </p>
      </div>

      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Create Blog Article</CardTitle>
          <CardDescription>
            Write a new article with rich formatting
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
                name="image"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Featured Image</FieldLabel>
                    <Input
                      aria-invalid={fieldState.invalid}
                      type="file"
                      accept="image/*"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        field.onChange(file);
                      }}
                    />
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

