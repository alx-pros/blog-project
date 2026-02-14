"use client";

import { Loader2, MessageSquare, Edit2, Trash2, MessageCircle, MessagesSquare } from "lucide-react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { commentSchema } from "@/app/schemas/comment";
import { Field, FieldError, FieldLabel } from "../ui/field";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { useParams } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import z from "zod";
import { toast } from "sonner";
import { useTransition, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Separator } from "../ui/separator";
import { Preloaded, usePreloadedQuery } from "convex/react";
import { useConvexAuth } from "convex/react";
import Link from "next/link";
import { buttonVariants } from "../ui/button";

export function CommentSection(props: {
  preloadedComments: Preloaded<typeof api.comment.getCommentsByPostId>;
}) {
  const params = useParams<{ postId: Id<"posts"> }>();
  const data = usePreloadedQuery(props.preloadedComments);
  const { isAuthenticated, isLoading } = useConvexAuth();
  const [isPending, startTransition] = useTransition();
  const [isSubmitting, startSubmit] = useTransition();
  const [editingId, setEditingId] = useState<Id<"comments"> | null>(null);
  const [editText, setEditText] = useState("");

  const currentUser = useQuery(api.auth.getCurrentUser);
  const createComment = useMutation(api.comment.createComment);
  const updateComment = useMutation(api.comment.updateComment);
  const deleteComment = useMutation(api.comment.deleteComment);

  const form = useForm({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      body: "",
      postId: params.postId,
    },
  });

  async function onSubmit(data: z.infer<typeof commentSchema>) {
    startSubmit(async () => {
      try {
        await createComment(data);
        form.reset();
        toast.success("Comment posted");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to create comment"
        );
      }
    });
  }

  async function handleEditComment(commentId: Id<"comments">) {
    if (!editText.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    startTransition(async () => {
      try {
        await updateComment({ commentId, body: editText });
        setEditingId(null);
        setEditText("");
        toast.success("Comment updated");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to update comment"
        );
      }
    });
  }

  async function handleDeleteComment(commentId: Id<"comments">) {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    startTransition(async () => {
      try {
        await deleteComment({ commentId });
        toast.success("Comment deleted");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to delete comment"
        );
      }
    });
  }

  if (data === undefined) {
    return <p>loading...</p>;
  }

  const isAdmin = currentUser?._id === process.env.NEXT_PUBLIC_ADMIN_ID;

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center text-black dark:text-white gap-2">
        <MessagesSquare className="size-5" />
        <h2 className="text-xl font-bold">{data.length} Comments</h2>
      </CardHeader>
      <CardContent className="space-y-8">
        {!isLoading && !isAuthenticated ? (
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-6 text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              You need to be signed in to leave a comment.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link
                href="/auth/sign-up"
                className={buttonVariants({ size: "sm" })}
              >
                Sign up
              </Link>
              <Link
                href="/auth/login"
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                Log in
              </Link>
            </div>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <Controller
              name="body"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Start a conversation with the community</FieldLabel>
                  <Textarea
                    aria-invalid={fieldState.invalid}
                    rows={3}
                    wrap="soft"
                    className="resize-none"
                    placeholder="Share your thoughts"
                    {...field}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Button disabled={isSubmitting} className="cursor-pointer">
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Loading...</span>
                </>
              ) : (
                <span>Comment</span>
              )}
            </Button>
          </form>
        )}

        {data?.length > 0 && <Separator />}

        <section className="space-y-6">
          {data?.map((comment) => {
            const isOwner = currentUser?._id === comment.authorId;
            const canEdit = isOwner || isAdmin;

            return (
              <div key={comment._id}>
                {editingId === comment._id ? (
                  <div className="space-y-2 mb-6">
                    <Textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      placeholder="Edit your comment"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleEditComment(comment._id)}
                        disabled={isPending}
                      >
                        {isPending ? (
                          <>
                            <Loader2 className="size-4 animate-spin" />
                          </>
                        ) : (
                          "Save"
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-4">
                    <Avatar className="size-10 shrink-0">
                      <AvatarImage
                        src={`https://avatar.vercel.sh/${comment.authorName}`}
                        alt={comment.authorName}
                      />
                      <AvatarFallback>
                        {comment.authorName.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm">
                            {comment.authorName}
                          </p>
                          {isOwner && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                              Author
                            </span>
                          )}
                        </div>
                        <p className="text-muted-foreground text-xs">
                          {new Date(comment._creationTime).toLocaleDateString(
                            "en-US"
                          )}
                        </p>
                      </div>

                      <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed mb-3">
                        {comment.body}
                      </p>

                      {canEdit && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingId(comment._id);
                              setEditText(comment.body);
                            }}
                            className="text-xs"
                          >
                            <Edit2 className="size-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteComment(comment._id)}
                            className="text-xs text-destructive hover:text-destructive"
                          >
                            <Trash2 className="size-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </section>
      </CardContent>
    </Card>
  );
}
