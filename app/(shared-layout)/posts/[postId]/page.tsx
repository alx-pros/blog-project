import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CommentSection } from "@/components/web/CommentSection";
import { OnThisPage } from "@/components/web/OnThisPage";
import Footer from "@/components/web/Footer";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { getToken } from "@/lib/auth-server";
import { fetchQuery, preloadQuery } from "convex/nextjs";
import { ArrowLeft } from "lucide-react";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

interface PostIdRouteProps {
  params: Promise<{
    postId: Id<"posts">;
  }>;
}

export async function generateMetadata({ params }: PostIdRouteProps): Promise<Metadata> {
  const { postId } = await params;

  const post = await fetchQuery(api.posts.getPostById, { postId: postId });

  if (!post) {
    return {
      title: "Post not found",
    };
  }

  return {
    title: post.title,
    description: post.body,
    authors: [{ name: "Jan marshal" }],
  };
}

export default async function PostIdRoute({ params }: PostIdRouteProps) {
  const { postId } = await params;

  const token = await getToken();

  const [post, preloadedComments, userId] = await Promise.all([
    await fetchQuery(api.posts.getPostById, { postId: postId }),
    await preloadQuery(api.comment.getCommentsByPostId, {
      postId: postId,
    }),
    await fetchQuery(api.presence.getUserId, {}, { token }),
  ]);

  if (!post) {
    return (
      <div>
        <h1 className="text-6xl font-extrabold text-red-500 p-20">No post found</h1>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8 animate-in fade-in druation-500 lg:flex-row lg:items-start lg:gap-10">
        <div className="w-full lg:w-[minmax(0,1.7fr)]">
          <Link className={buttonVariants({ variant: "outline", className: "mb-4" })} href="/posts">
            <ArrowLeft className="size-4" />
            Back to blog
          </Link>

          <div className="relative mb-8 h-[260px] w-full overflow-hidden rounded-xl shadow-sm sm:h-[340px] lg:h-[380px]">
            <Image
              src={
                post.imageUrl ??
                "https://images.unsplash.com/photo-1761019646782-4bc46ba43fe9?q=80&w=1631&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              }
              alt="image"
              fill
              className="object-cover transition-transform duration-500"
            />
          </div>

          <header className="flex flex-col space-y-4">
            <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <p>Posted on {new Date(post._creationTime ?? 0).toLocaleDateString("en-US")}</p>
              {post.topic && (
                <>
                  <span className="h-1 w-1 rounded-full bg-muted-foreground/60" />
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                    {post.topic}
                  </span>
                </>
              )}
            </div>
          </header>

          <Separator className="my-8" />

          <article
            className="prose prose-neutral max-w-none text-lg leading-relaxed text-foreground/90 prose-headings:scroll-mt-28 dark:prose-invert"
            dangerouslySetInnerHTML={{
              __html: post.contentHtml || `<p>${post.body}</p>`,
            }}
          />

          <Separator className="my-8" />

          <CommentSection preloadedComments={preloadedComments} />
        </div>

        <OnThisPage />
      </div>

      <Footer />
    </div>
  );
}
