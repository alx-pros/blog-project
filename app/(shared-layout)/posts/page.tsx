import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import Footer from "@/components/web/Footer";
import { fetchQuery } from "convex/nextjs";
import { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight } from "lucide-react";
import Newsletter from "@/components/web/Newsletter";
import BlogFilters from "@/components/web/BlogFilters";

export const metadata: Metadata = {
  title: "The Web Room",
  description: "Read our latest articles and insights.",
  category: "Blog",
  authors: [{ name: "The Community at The Web Room" }],
};

export default function BlogPage() {
  return (
    <div className="flex flex-col pt-20 max-w-3xl mx-auto px-4">
      <section className="flex-1 flex flex-col items-start gap-5 py-5 border-b">
        <h1 className="text-4xl font-extrabold text-primary">Topics</h1>
        <BlogFilters />
      </section>

      <Suspense fallback={<SkeletonLoadingUi />}>
        <LoadBlogList />
      </Suspense>

      <Newsletter />
      <Footer />
    </div>

  );
}

export async function LoadBlogList() {
  "use cache";
  cacheLife("hours");
  cacheTag("blog");
  const data = await fetchQuery(api.posts.getPublishedPosts);

  return (
    <div className="grid gap-6 grid-rows-3">
      {data.map((post) => (
        <Link key={post._id} href={`/posts/${post._id}`} className="group block">
          <div className="relative flex flex-row items-center border-b border-dashed py-4 gap-10">
            {/* Arrow */}
            <div
              className="hidden absolute left-2 top-8 md:flex items-center justify-center opacity-0 
              -translate-x-10 transition-all duration-200 ease-out
              group-hover:opacity-100 group-hover:translate-x-0"
            >
              <ArrowRight className="h-5 w-5 text-black dark:text-white" />
            </div>

            {/* Content */}
            <div
              className="flex w-full flex-row items-start justify-between
              transition-transform duration-300 ease-out
              md:group-hover:translate-x-10"
            >
              <div className="flex flex-col">
                <h1 className="text-xl font-bold">{post.title}</h1>
                <p className="text-paragraph line-clamp-2">{post.body}</p>
              </div>
            </div>
            <p className="text-sm text-paragraph whitespace-nowrap">{post._creationTime}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

function SkeletonLoadingUi() {
  return (
    <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-3">
      {[...Array(3)].map((_, i) => (
        <div className="flex flex-col space-y-3" key={i}>
          <Skeleton className="h-48 w-full rounded-xl" />
          <div className="space-y-2 flex flex-col">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/" />
          </div>
        </div>
      ))}
    </div>
  );
}
