"use client";

import { useEffect, useState } from "react";
import { useConvexAuth, useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Loader2, Edit2, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";

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
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Posts</h1>
            <p className="text-muted-foreground mt-2">
              {userPosts.length === 0 ? "You haven't created any posts yet" : `You have ${userPosts.length} post${userPosts.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <Link href="/create" className={buttonVariants()}>
            <Plus className="size-4 mr-2" />
            New Post
          </Link>
        </div>

        {userPosts.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent className="space-y-4">
              <p className="text-lg font-medium">No posts yet</p>
              <p className="text-muted-foreground">Start creating your first post to share your thoughts with the community.</p>
              <Link href="/create" className={buttonVariants()}>
                <Plus className="size-4 mr-2" />
                Create Your First Post
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {userPosts.map((post: any) => (
              <Card key={post._id} className="overflow-hidden flex flex-col sm:flex-row">
                <div className="relative h-48 sm:h-40 sm:w-48 flex-shrink-0">
                  <Image
                    src={
                      post.imageUrl ??
                      "https://images.unsplash.com/photo-1761019646782-4bc46ba43fe9?q=80&w=1631&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    }
                    alt="post image"
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex-1 flex flex-col">
                  <CardContent className="flex-1 pt-6 pb-4">
                    <div className="space-y-2">
                      <Link href={`/posts/${post._id}`}>
                        <h3 className="text-xl font-bold hover:text-primary line-clamp-2">
                          {post.title}
                        </h3>
                      </Link>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {post.body}
                      </p>
                      <div className="flex items-center gap-2 pt-2 text-xs text-muted-foreground">
                        <span>
                          {new Date(post._creationTime).toLocaleDateString("en-US")}
                        </span>
                        {post.topic && (
                          <>
                            <span>•</span>
                            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                              {post.topic}
                            </span>
                          </>
                        )}
                        <span>•</span>
                        <span className="capitalize">{post.status}</span>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="gap-2 pt-4 border-t">
                    <Link
                      href={`/posts/${post._id}`}
                      className={buttonVariants({ variant: "outline", size: "sm" })}
                    >
                      View
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditPost(post._id)}
                    >
                      <Edit2 className="size-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeletePost(post._id)}
                      disabled={isDeleting === post._id}
                    >
                      {isDeleting === post._id ? (
                        <>
                          <Loader2 className="size-3 animate-spin" />
                        </>
                      ) : (
                        <>
                          <Trash2 className="size-3 mr-1" />
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
      </div>
    </div>
  );
}
