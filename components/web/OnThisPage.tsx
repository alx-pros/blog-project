"use client";

import { useEffect, useMemo, useState } from "react";

type Heading = {
  id: string;
  text: string;
  level: 2 | 3;
};

type OnThisPageProps = {
  /**
   * CSS selector that contains the article content.
   * Defaults to "article".
   */
  containerSelector?: string;
};

export function OnThisPage({ containerSelector = "article" }: OnThisPageProps) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const elements = Array.from(
      container.querySelectorAll<HTMLHeadingElement>("h2, h3"),
    );

    if (elements.length === 0) {
      setHeadings([]);
      return;
    }

    const slugify = (value: string) =>
      value
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-");

    const mapped: Heading[] = elements.map((el) => {
      const rawText = el.textContent ?? "";
      let id = el.id || slugify(rawText);
      if (!el.id) {
        el.id = id;
      }

      return {
        id,
        text: rawText,
        level: el.tagName === "H2" ? 2 : 3,
      };
    });

    setHeadings(mapped);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => (a.target as HTMLElement).offsetTop - (b.target as HTMLElement).offsetTop);

        if (visible[0]?.target) {
          const target = visible[0].target as HTMLElement;
          setActiveId(target.id);
        }
      },
      {
        rootMargin: "-64px 0px -60% 0px",
        threshold: [0.1, 0.25, 0.5],
      },
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [containerSelector]);

  const grouped = useMemo(() => {
    if (!headings.length) return [];

    const out: { parent: Heading; children: Heading[] }[] = [];
    let currentParent: { parent: Heading; children: Heading[] } | null = null;

    for (const h of headings) {
      if (h.level === 2) {
        currentParent = { parent: h, children: [] };
        out.push(currentParent);
      } else if (h.level === 3) {
        if (!currentParent) {
          currentParent = { parent: h, children: [] };
          out.push(currentParent);
        } else {
          currentParent.children.push(h);
        }
      }
    }

    return out;
  }, [headings]);

  if (!grouped.length) {
    return null;
  }

  return (
    <aside
      aria-label="On this page"
      className="sticky top-24 hidden max-h-[calc(100vh-7rem)] min-w-[220px] flex-col overflow-auto rounded-xl border bg-card/60 px-4 py-4 text-sm shadow-sm backdrop-blur lg:flex"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
        On this page
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        Quick navigation for this article.
      </p>

      <nav className="mt-4 space-y-1 text-xs" aria-label="Table of contents">
        {grouped.map(({ parent, children }) => {
          const isActiveParent = activeId === parent.id;

          return (
            <div key={parent.id} className="space-y-1 relative">
              <a
                href={`#${parent.id}`}
                className={`flex items-start gap-2 rounded-md px-2 py-1.5 transition-all ${
                  isActiveParent
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                }`}
              >
                <span className={`mt-1 h-[3px] w-[3px] flex-shrink-0 rounded-full transition-all ${
                  isActiveParent ? "bg-primary scale-125" : "bg-primary/70"
                }`} />
                <span className="line-clamp-2">{parent.text}</span>
              </a>

              {children.length > 0 && (
                <div className="ml-4 border-l border-border/60 pl-2.5 space-y-0.5">
                  {children.map((child) => {
                    const isActiveChild = activeId === child.id;
                    return (
                      <a
                        key={child.id}
                        href={`#${child.id}`}
                        className={`flex items-start gap-2 rounded-md px-2 py-1 transition-all ${
                          isActiveChild
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                        }`}
                      >
                        <span className={`mt-1 h-[3px] w-[3px] flex-shrink-0 rounded-full transition-all ${
                          isActiveChild ? "bg-primary scale-125" : "bg-muted-foreground/60"
                        }`} />
                        <span className="line-clamp-2">{child.text}</span>
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}

