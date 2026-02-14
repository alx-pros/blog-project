import { Button, buttonVariants } from "@/components/ui/button";
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
    description: post.subtitle ?? post.body,
    authors: [{ name: "Jan marshal" }],
  };
}

export default async function PostIdRoute({ params }: PostIdRouteProps) {
  const { postId } = await params;

  const token = await getToken().catch(() => null);

  const [post, preloadedComments] = await Promise.all([
    await fetchQuery(api.posts.getPostById, { postId: postId }),
    await preloadQuery(api.comment.getCommentsByPostId, {
      postId: postId,
    }),
  ]);

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="text-center space-y-6 max-w-2xl">
          <div className="space-y-2">
            <h1 className="text-7xl font-extrabold tracking-tight sm:text-8xl">404</h1>
            <p className="text-4xl font-extrabold tracking-tight md:text-5xl">Page not found</p>
          </div>

          <p className="md:text-xl text-paragraph leading-relaxed text-balance mx-auto">
            Sorry, we couldn't find the page you're looking for. <br className="hidden sm:block" />
            It might have been moved or deleted.
          </p>

          <div className="flex items-center justify-center gap-4">
            <Link href="/" className={buttonVariants({ size: "lg" })}>
              Back to home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full max-w-3xl min-h-screen pt-20 px-4 mx-auto">
      <div className="flex flex-col w-full items-start justify-center gap-8">
      <Button
        variant="outline"
        size="sm"
        className="relative flex items-center justify-start z-20"
      >
        <Link href="/posts" className="flex items-center justify-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          All posts
        </Link>
      </Button>

        <header className="flex flex-col w-full gap-4">
          <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {post.title}
          </h1>

          <p className="text-lg text-paragraph leading-relaxed">{post.subtitle}</p>

          <Separator className="my-4" />

          <div className="flex flex-wrap items-center gap-14 text-sm text-muted-foreground">
            <div className="flex flex-col gap-2">
              <p className="text-paragraph">Published</p>
              <p className="text-black dark:text-white">
                {new Date(post._creationTime ?? 0).toLocaleDateString("en-US")}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-paragraph">Topic</p>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                {post.topic}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-paragraph">Author</p>
              <p className="text-black dark:text-white">{post.authorName}</p>
            </div>
          </div>
        </header>

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

        <article
          className="prose prose-neutral max-w-none text-lg leading-relaxed text-foreground/90 prose-headings:scroll-mt-28 dark:prose-invert"
          dangerouslySetInnerHTML={{
            __html: post.contentHtml || `<p>${post.body}</p>`,
          }}
        />

        <Separator className="my-8" />

        <CommentSection preloadedComments={preloadedComments} />
        {/*         <OnThisPage />
         */}
        <div className="w-full">
          <Footer />
        </div>
      </div>
    </div>
  );
}
