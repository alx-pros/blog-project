"use client";

import { useEffect, useState } from "react";
import { useConvexAuth, useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Loader2, Edit2, Trash2, Plus, BookText, NotebookPen, Pencil } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Footer from "@/components/web/Footer";

export default function MyPostsPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const user = useQuery(api.auth.getCurrentUser);
  const posts = useQuery(api.posts.getPosts);
  const deletePost = useMutation(api.posts.deletePost);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, isLoading, router]);

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this post?")) {
      return;
    }

    setIsDeleting(postId);
    try {
      await deletePost({ postId: postId as any });
      toast.success("Post deleted successfully");
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete post");
    } finally {
      setIsDeleting(null);
    }
  };

  const handleEditPost = (postId: string) => {
    router.push(`/edit/${postId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="size-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Filter posts by current user
  const userPosts = posts?.filter((post: any) => post.authorId === user?._id) || [];

  return (
    <div className="flex flex-col w-full pt-20 max-w-3xl mx-auto px-4">
      <div className="w-full space-y-6">
        <div className="flex flex-col items-start justify-center">
          <h1 className="text-4xl font-extrabold text-primary">My Posts</h1>
          <p className="text-paragraph mt-2">
            {userPosts.length === 0
              ? "You haven't created any posts yet"
              : `You have created ${userPosts.length} post${userPosts.length !== 1 ? "s" : ""}`}
          </p>
        </div>

        {userPosts.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent className="space-y-4">
              <p className="text-lg font-medium">No posts yet</p>
              <p className="text-muted-foreground">
                Start creating your first post to share your thoughts with the community.
              </p>
              <Link href="/create" className={buttonVariants()}>
                <Plus className="size-4 mr-2" />
                Create Your First Post
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {userPosts.map((post: any) => (
              <Card key={post._id} className="overflow-hidden flex flex-col sm:flex-row px-3 sm:px-4">
                {/* IMAGE */}
                <div className="relative w-full h-48 sm:h-auto sm:w-1/3 flex-shrink-0">
                  <Image
                    src={
                      post.imageUrl ??
                      "https://images.unsplash.com/photo-1761019646782-4bc46ba43fe9?q=80&w=1631&auto=format&fit=crop"
                    }
                    alt="post image"
                    fill
                    sizes="100%"
                    className="object-cover rounded-md"
                  />
                </div>

                {/* CONTENT */}
                <div className="flex flex-col flex-1">
                  <CardContent className="flex-1 pt-6 pb-4 px-4 sm:px-6">
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-black dark:text-white line-clamp-2">
                        {post.title}
                      </h3>

                      <p className="text-sm text-paragraph line-clamp-2">{post.subtitle}</p>

                      <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-paragraph">
                        <div className="flex gap-2 items-center">
                          <p className="font-medium">Published</p>
                          <p className="text-black dark:text-white">
                            {new Date(post._creationTime ?? 0).toLocaleDateString("en-US")}
                          </p>
                        </div>

                        <span>|</span>

                        <div className="flex gap-2 items-center">
                          <p className="font-medium">Topic</p>
                          <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                            {post.topic}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>

                  {/* BUTTONS */}
                  <CardFooter className="flex flex-wrap gap-2 pt-4 px-3 sm:px-6 border-t border-[#D9D9D9] dark:border-[#3A3A3A]">
                    <Link
                      href={`/posts/${post._id}`}
                      className={buttonVariants({
                        variant: "outline",
                        size: "sm",
                        className: "text-black dark:text-white bg-white dark:bg-black cursor-pointer",
                      })}
                    >
                      <BookText className="size-3" />
                      View
                    </Link>

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleEditPost(post._id)}
                      className="text-black dark:text-white bg-white dark:bg-black cursor-pointer"
                    >
                      <Pencil className="size-3" />
                      Edit
                    </Button>

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeletePost(post._id)}
                      disabled={isDeleting === post._id}
                      className="h-7"
                    >
                      {isDeleting === post._id ? (
                        <Loader2 className="size-3 animate-spin" />
                      ) : (
                        <>
                          <Trash2 className="size-3" />
                          Delete
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </div>
              </Card>
            ))}
          </div>
        )}

        <Footer />
      </div>
    </div>
  );
}
