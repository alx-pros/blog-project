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
            sizes="100%"
            loading="eager"
            className="object-cover transition-transform duration-500"
          />
        </div>

        <article
          className="
            prose prose-neutral dark:prose-invert
            text-lg leading-relaxed text-foreground/90 
            prose-headings:scroll-mt-28 max-w-3xl mx-auto
            
            [&_ul]:pl-4
            [&_ul]:list-disc
            [&_ul]:flex
            [&_ul]:flex-col
            [&_ul]:gap-2
            [&_ol]:pl-4
            [&_ol]:list-decimal
            [&_ol]:flex
            [&_ol]:flex-col
            [&_ol]:gap-2

            [&_h1]:text-3xl
            [&_h1]:font-black
            [&_h1]:text-black
            dark:[&_h1]:text-white
            [&_h1]:leading-tight
            [&_h1]:my-4

            [&_h2]:text-2xl
            [&_h2]:font-bold
            [&_h2]:text-black
            dark:[&_h2]:text-white
            [&_h2]:my-3

            [&_h3]:text-xl
            [&_h3]:font-semibold
            [&_h3]:text-black
            dark:[&_h3]:text-white
            [&_h3]:my-3

            [&_code]:bg-muted
            [&_code]:px-1
            [&_code]:py-0.5
            [&_code]:rounded
            [&_code]:text-sm
            [&_pre_code]:bg-transparent
            [&_pre_code]:p-0
            [&_blockquote]:border-l-4
            [&_blockquote]:pl-4
            [&_blockquote]:italic
            [&_blockquote]:my-6
            [&_blockquote]:border-black/10
            dark:[&_blockquote]:border-white/20

            [&_hr]:my-8
            [&_hr]:border-t-2
            [&_hr]:border-[#EAEAEA]
            dark:[&_hr]:border-[#1E1E1E]
            [&_a]:text-primary
            [&_a:hover]:underline

            [&_code.language-tsx]:block
            [&_code.language-tsx]:my-8
            [&_code.language-tsx]:p-4
            [&_code.language-tsx]:rounded-lg
            [&_code.language-tsx]:border
            [&_code.language-tsx]:border-[#EAEAEA]
            dark:[&_code.language-tsx]:border-[#1E1E1E]
            [&_code.language-tsx]:bg-[#FAFAFA]
            dark:[&_code.language-tsx]:bg-[#0A0A0A]
            [&_code.language-tsx]:overflow-x-auto
            [&_code.language-tsx]:font-mono
            [&_code.language-tsx]:text-[13px]
            [&_code.language-tsx]:leading-[20px]
            [&_code.language-tsx]:whitespace-pre

            [&_code.language-ts]:block
            [&_code.language-ts]:my-8
            [&_code.language-ts]:p-4
            [&_code.language-ts]:rounded-lg
            [&_code.language-ts]:border
            [&_code.language-ts]:border-[#EAEAEA]
            dark:[&_code.language-ts]:border-[#1E1E1E]
            [&_code.language-ts]:bg-[#FAFAFA]
            dark:[&_code.language-ts]:bg-[#0A0A0A]
            [&_code.language-ts]:overflow-x-auto
            [&_code.language-ts]:font-mono
            [&_code.language-ts]:text-[13px]
            [&_code.language-ts]:leading-[20px]
            [&_code.language-ts]:whitespace-pre

            [&_code.language-js]:block
            [&_code.language-js]:my-8
            [&_code.language-js]:p-4
            [&_code.language-js]:rounded-lg
            [&_code.language-js]:border
            [&_code.language-js]:border-[#EAEAEA]
            dark:[&_code.language-js]:border-[#1E1E1E]
            [&_code.language-js]:bg-[#FAFAFA]
            dark:[&_code.language-js]:bg-[#0A0A0A]
            [&_code.language-js]:overflow-x-auto
            [&_code.language-js]:font-mono
            [&_code.language-js]:text-[13px]
            [&_code.language-js]:leading-[20px]
            [&_code.language-js]:whitespace-pre

            [&_code.language-jsx]:block
            [&_code.language-jsx]:my-8
            [&_code.language-jsx]:p-4
            [&_code.language-jsx]:rounded-lg
            [&_code.language-jsx]:border
            [&_code.language-jsx]:border-[#EAEAEA]
            dark:[&_code.language-jsx]:border-[#1E1E1E]
            [&_code.language-jsx]:bg-[#FAFAFA]
            dark:[&_code.language-jsx]:bg-[#0A0A0A]
            [&_code.language-jsx]:overflow-x-auto
            [&_code.language-jsx]:font-mono
            [&_code.language-jsx]:text-[13px]
            [&_code.language-jsx]:leading-[20px]
            [&_code.language-jsx]:whitespace-pre

            [&_div[data-type=terminal-block]]:block
            [&_div[data-type=terminal-block]]:my-8
            [&_div[data-type=terminal-block]]:p-4
            [&_div[data-type=terminal-block]]:rounded-lg
            [&_div[data-type=terminal-block]]:border
            [&_div[data-type=terminal-block]]:border-[#EAEAEA]
            dark:[&_div[data-type=terminal-block]]:border-[#1E1E1E]
            [&_div[data-type=terminal-block]]:bg-black
            dark:[&_div[data-type=terminal-block]]:bg-[#0A0A0A]
            [&_div[data-type=terminal-block]]:overflow-x-auto
            [&_div[data-type=terminal-block]]:font-mono
            [&_div[data-type=terminal-block]]:text-[13px]
            [&_div[data-type=terminal-block]]:leading-[20px]
            [&_div[data-type=terminal-block]]:whitespace-pre
            [&_div[data-type=terminal-block]]:text-[#58C760]

            [&_.badge]:inline-flex
            [&_.badge]:items-center
            [&_.badge]:px-2
            [&_.badge]:py-0.5
            [&_.badge]:rounded
            [&_.badge]:text-xs
            [&_.badge]:font-medium
            [&_.badge]:bg-primary/10
            [&_.badge]:text-primary

            [&_.caption]:block
            [&_.caption]:my-4
            [&_.caption]:text-sm
            [&_.caption]:italic
            [&_.caption]:text-muted-foreground
            [&_.caption]:text-center

            [&_table]:table-auto
            [&_table]:my-4
            [&_table]:rounded-xl
            [&_table]:border-separate
            [&_table]:border-spacing-0
            [&_table]:overflow-x-auto
            [&_table]:mask-[linear-gradient(to_right,black_90%,transparent_100%)]
            
            [&_td]:min-w-[150px]
            [&_td]:max-w-[150px]
            [&_th]:min-w-[150px]
            [&_th]:max-w-[150px]

            [&_th]:border-t
            [&_th]:border-l
            [&_th]:border-[#EAEAEA]
            dark:[&_th]:border-[#1E1E1E]

            [&_td]:border-t
            [&_td]:border-l
            [&_td]:border-[#EAEAEA]
            dark:[&_td]:border-[#1E1E1E]

            [&_tr_th:last-child]:border-r
            [&_tr_td:last-child]:border-r
            
            [&_tr:last-child_td]:border-b
            [&_tr:last-child_th]:border-b

            [&_tr:first-child_th:first-child]:rounded-tl-xl
            [&_tr:first-child_td:first-child]:rounded-tl-xl

            [&_tr:first-child_th:last-child]:rounded-tr-xl
            [&_tr:first-child_td:last-child]:rounded-tr-xl

            [&_tr:last-child_th:first-child]:rounded-bl-xl
            [&_tr:last-child_td:first-child]:rounded-bl-xl

            [&_tr:last-child_th:last-child]:rounded-br-xl
            [&_tr:last-child_td:last-child]:rounded-br-xl

            [&_th]:bg-[#FAFAFA]
            dark:[&_th]:bg-black
            [&_th]:font-bold
            [&_th]:p-2
            [&_th]:align-middle
            [&_th]:text-center

            [&_td]:bg-white
            dark:[&_td]:bg-[#0A0A0A]
            [&_td]:p-2
            [&_td]:align-middle
            [&_td]:text-center
          "
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