"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { Separator } from "../ui/separator";
import {
  Sun,
  Moon,
  Pencil,
  Search,
  X,
  Loader2,
  BookText,
  GripHorizontal,
  GripVertical,
} from "lucide-react";
import { AnimatedThemeToggler } from "../ui/animated-theme-toggle";
import { NavbarDataBlog, NavbarDataUser, NavbarDataUnauth } from "@/lib/data";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { Skeleton } from "../ui/skeleton";
import { AnimatePresence, motion, PanInfo, useMotionValue, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Kbd } from "../ui/kbd";

// Types
type DockPosition = "bottom" | "top" | "left" | "right";

export function DockNavigation() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // --- Dock State ---
  const [position, setPosition] = useState<DockPosition>("bottom");
  const [isSearching, setIsSearching] = useState(false);

  // Lock tooltips during animations (drag, resize, search toggle)
  const [isLayoutAnimating, setIsLayoutAnimating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Derived State
  const isVertical = (position === "left" || position === "right") && !isSearching;

  // --- Search Logic State ---
  const [term, setTerm] = useState("");
  const [isSearchingDebounce, setIsSearchingDebounce] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // --- TOOLTIP STATE & REFS ---
  const dockRef = useRef<HTMLDivElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [prevHoveredIndex, setPrevHoveredIndex] = useState<number>(0);

  // Motion Values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { stiffness: 350, damping: 30 };
  const xSpring = useSpring(mouseX, springConfig);
  const ySpring = useSpring(mouseY, springConfig);

  // --- Dynamic Label Generation ---
  const dockLabels = useMemo(() => {
    const labels = [
      ...NavbarDataBlog.map((item) => item.label),
      <div>
        Search &nbsp;<Kbd>⌘</Kbd> <Kbd>K</Kbd>
      </div>,
      "Create",
    ];

    if (!isLoading) {
      const authItems = isAuthenticated ? NavbarDataUser : NavbarDataUnauth;
      labels.push(...authItems.map((i) => i.label));
    } else {
      labels.push("", "");
    }

    labels.push("Theme");
    return labels;
  }, [isAuthenticated, isLoading]);

  // --- Tooltip Event Handlers ---
  const handleItemHover = (e: React.MouseEvent<HTMLElement>, index: number) => {
    if (isDragging || isSearching || isLayoutAnimating) return;

    if (!dockRef.current) return;

    const buttonRect = e.currentTarget.getBoundingClientRect();
    const dockRect = dockRef.current.getBoundingClientRect();

    if (isVertical) {
      const safeCenterY = buttonRect.top - dockRect.top + buttonRect.height / 2;
      mouseY.set(safeCenterY);
    } else {
      const buttonCenterX = buttonRect.left - dockRect.left + buttonRect.width / 2;
      mouseX.set(buttonCenterX);
    }

    if (hoveredIndex !== null && hoveredIndex !== index) {
      setPrevHoveredIndex(hoveredIndex);
    }
    setHoveredIndex(index);
  };

  const handleItemLeave = () => {
    if (hoveredIndex !== null) {
      setPrevHoveredIndex(hoveredIndex);
    }
    setHoveredIndex(null);
  };

  // --- Fix: Lock Tooltips on Orientation Change ---
  useEffect(() => {
    setIsLayoutAnimating(true);
    setHoveredIndex(null);
    const t = setTimeout(() => setIsLayoutAnimating(false), 200);
    return () => clearTimeout(t);
  }, [position]);

  // --- Fix: Lock Tooltips on Search Toggle ---
  useEffect(() => {
    setIsLayoutAnimating(true);
    setHoveredIndex(null);

    const t = setTimeout(() => {
      setIsLayoutAnimating(false);
      if (isSearching) inputRef.current?.focus();
    }, 350);

    return () => clearTimeout(t);
  }, [isSearching]);

  // --- Drag Logic ---
  const handleDragStart = () => {
    setIsDragging(true);
    setHoveredIndex(null);
  };

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false);
    setHoveredIndex(null); // Ensure tooltip is cleared on drop

    const w = window.innerWidth;
    const h = window.innerHeight;
    const x = info.point.x;
    const y = info.point.y;
    const slope = h / w;

    let newPos: DockPosition = "bottom";
    if (y < x * slope && y < h - x * slope) newPos = "top";
    else if (y > x * slope && y > h - x * slope) newPos = "bottom";
    else if (y > x * slope && y < h - x * slope) newPos = "left";
    else newPos = "right";

    if (newPos !== position) setPosition(newPos);
  };

  // --- Keyboard Shortcuts ---
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearching((prev) => !prev);
      }
      if (e.key === "Escape" && isSearching) setIsSearching(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isSearching]);

  useEffect(() => {
    if (!isSearching) setTerm("");
  }, [isSearching]);

  const getContainerStyles = () => {
    const base =
      "fixed inset-0 z-50 flex p-6 pointer-events-none transition-all duration-500 ease-in-out min-w-[320px]";
    if (isSearching) return cn(base, "items-center justify-center");
    const positions = {
      bottom: "items-end justify-center",
      top: "items-start justify-center",
      left: "items-center justify-start",
      right: "items-center justify-end",
    };
    return cn(base, positions[position]);
  };

  let renderIndex = 0;
  const getIndex = () => renderIndex++;
  const showTooltips = isMounted && !isSearching && !isDragging && !isLayoutAnimating;

  if (!isMounted) return null;

  return (
    <>
      <AnimatePresence>
        {isSearching && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSearching(false)}
            className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      <div className={getContainerStyles()}>
        <motion.div
          ref={dockRef}
          layout
          drag={!isSearching}
          dragMomentum={false}
          dragElastic={1.0}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={handleDragEnd}
          dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }}
          dragSnapToOrigin
          dragTransition={{ bounceStiffness: 600, bounceDamping: 100 }}
          onMouseLeave={handleItemLeave}
          className={cn(
            "relative flex gap-2 rounded-2xl border border-gray bg-white dark:bg-black shadow-2xl backdrop-blur-2xl transition-colors pointer-events-auto",
            isSearching
              ? "w-[550px] h-[450px] max-w-[90vw] max-h-[80vh] flex-col p-0 overflow-hidden cursor-default"
              : isVertical
                ? "w-16 h-auto flex-col p-2 cursor-grab active:cursor-grabbing"
                : "w-auto h-16 flex-row p-2 cursor-grab active:cursor-grabbing"
          )}
        >
          {/* === INTEGRATED TOOLTIPS === */}
          {showTooltips && (
            <>
              {isVertical ? (
                <VerticalTooltip
                  items={dockLabels}
                  hoveredIndex={hoveredIndex}
                  prevHoveredIndex={prevHoveredIndex}
                  ySpring={ySpring}
                  position={position}
                />
              ) : (
                <HorizontalTooltip
                  items={dockLabels}
                  hoveredIndex={hoveredIndex}
                  prevHoveredIndex={prevHoveredIndex}
                  xSpring={xSpring}
                  position={position}
                />
              )}
            </>
          )}

          <AnimatePresence mode="wait">
            {isSearching ? (
              <motion.div
                key="search"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0 } }}
                className="flex flex-col w-full h-full"
              >
                <DockSearchContent
                  term={term}
                  setTerm={setTerm}
                  inputRef={inputRef}
                  onClose={() => setIsSearching(false)}
                  activeIndex={activeIndex}
                  setActiveIndex={setActiveIndex}
                  router={router}
                  isDebouncing={isSearchingDebounce}
                  setDebouncing={setIsSearchingDebounce}
                />
              </motion.div>
            ) : (
              <motion.div
                key="dock"
                initial={{ opacity: 0, y: isVertical ? 0 : 20, x: isVertical ? 20 : 0 }}
                animate={{ opacity: 1, y: 0, x: 0, transition: { delay: 0.5 } }}
                exit={{
                  opacity: 0,
                  y: isVertical ? 0 : 20,
                  x: isVertical ? 20 : 0,
                  transitionEnd: { display: "none" },
                }}
                transition={{ duration: 0.1, ease: "easeOut" }}
                className={cn(
                  "flex items-center justify-center w-full h-full",
                  isVertical ? "flex-col" : "flex-row",
                  isDragging && "pointer-events-none"
                )}
              >
                {/* --- RENDERING DOCK ITEMS --- */}
                {NavbarDataBlog.map((item) => (
                  <DockItem key={item.label} index={getIndex()} onHover={handleItemHover}>
                    <Link href={item.href}>
                      <DockIconWrapper>
                        <item.icon className="size-5" />
                      </DockIconWrapper>
                    </Link>
                  </DockItem>
                ))}

                <DockItem index={getIndex()} onHover={handleItemHover}>
                  <button onClick={() => setIsSearching(true)}>
                    <DockIconWrapper>
                      <Search className="size-5" />
                    </DockIconWrapper>
                  </button>
                </DockItem>

                <DockItem index={getIndex()} onHover={handleItemHover}>
                  <Link href="/create">
                    <DockIconWrapper>
                      <Pencil className="size-5" />
                    </DockIconWrapper>
                  </Link>
                </DockItem>

                {!isLoading &&
                  (isAuthenticated ? NavbarDataUser : NavbarDataUnauth).map((item) => (
                    <DockItem key={item.label} index={getIndex()} onHover={handleItemHover}>
                      <Link href={item.href}>
                        <DockIconWrapper>
                          <item.icon className="size-5" />
                        </DockIconWrapper>
                      </Link>
                    </DockItem>
                  ))}

                {isLoading && (
                  <div className={cn("flex gap-2", isVertical ? "flex-col" : "flex-row")}>
                    <div className="hidden">{getIndex()}</div>
                    <div className="hidden">{getIndex()}</div>
                    <Skeleton className="size-10 rounded-xl" />
                    <Skeleton className="size-10 rounded-xl" />
                  </div>
                )}

                <DockItem index={getIndex()} onHover={handleItemHover}>
                  <AnimatedThemeToggler className="w-full h-full block">
                    <DockIconWrapper>
                      <div className="relative w-full h-full flex items-center justify-center">
                        <Sun className="size-5 absolute scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                        <Moon className="size-5 absolute scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
                      </div>
                    </DockIconWrapper>
                  </AnimatedThemeToggler>
                </DockItem>

                <Separator
                  orientation={isVertical ? "horizontal" : "vertical"}
                  className={cn(
                    "bg-border/60 relative",
                    isVertical ? "w-8 h-[1px] top-1" : "h-8 w-[1px] left-1"
                  )}
                />

                <div
                  className={cn(
                    "relative flex w-full h-full items-center justify-center",
                    isVertical ? "py-3 top-1" : "px-3 left-1"
                  )}
                >
                  {isVertical ? (
                    <GripHorizontal className="text-paragraph" />
                  ) : (
                    <GripVertical className="text-paragraph" />
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </>
  );
}

// --- TOOLTIP COMPONENTS ---

function VerticalTooltip({ items, hoveredIndex, prevHoveredIndex, ySpring, position }: any) {
  const itemHeight = 32;

  return (
    <motion.div
      // Added initial={{ opacity: 0 }} to prevent flash on mount
      initial={{ opacity: 0 }}
      className={cn(
        "pointer-events-none absolute overflow-hidden rounded-xl bg-[#FFBBA2] dark:bg-[#742C0A] text-primary shadow-lg z-50",
        position === "left" ? "left-full ml-3" : "right-full mr-3"
      )}
      style={{ top: ySpring, y: "-50%" }}
      animate={{
        opacity: hoveredIndex !== null ? 1 : 0,
        height: itemHeight,
      }}
      transition={{ opacity: { duration: 0.15 } }}
    >
      <motion.div
        className="flex flex-col items-center"
        initial={false}
        animate={{ y: -(hoveredIndex !== null ? hoveredIndex : prevHoveredIndex) * itemHeight }}
        transition={{ type: "spring", stiffness: 350, damping: 30 }}
      >
        {items.map((label: string, i: number) => (
          <div
            key={i}
            className="inline-flex w-full h-8 items-center justify-center px-4 text-xs font-medium whitespace-nowrap"
            style={{ height: itemHeight }}
          >
            {label}
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}

function HorizontalTooltip({ items, hoveredIndex, prevHoveredIndex, xSpring, position }: any) {
  const [textWidths, setTextWidths] = useState<number[]>([]);
  const textRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    // Ensure refs are cleaned before measuring
    textRefs.current = textRefs.current.slice(0, items.length);
    const widths = textRefs.current.map((ref) => ref?.offsetWidth || 0);
    setTextWidths(widths);
  }, [items]);

  const activeIndex = hoveredIndex !== null ? hoveredIndex : prevHoveredIndex;

  const getCurrentWidth = () => textWidths[activeIndex] || 0;

  const getTextXOffset = () => {
    if (textWidths.length === 0) return 0;
    let offset = 0;
    for (let i = 0; i < activeIndex; i++) {
      offset += textWidths[i];
    }
    return -offset;
  };

  return (
    <>
      {/* Measurement Div - always rendered but hidden */}
      <div
        className="absolute opacity-0 pointer-events-none top-0 left-0 flex h-8 items-center whitespace-nowrap"
        aria-hidden="true"
      >
        {items.map((label: string, index: number) => (
          <div
            key={`measure-${index}`}
            ref={(el) => {
              textRefs.current[index] = el;
            }}
            className="px-4 text-xs font-medium"
          >
            {label}
          </div>
        ))}
      </div>

      {textWidths.length > 0 && (
        <motion.div
          initial={{ opacity: 0, width: 0 }} // Start invisible/collapsed
          className={cn(
            "pointer-events-none absolute left-0 overflow-hidden rounded-xl dark:bg-[#742C0A] bg-[#FFBBA2] text-primary shadow-lg z-50",
            position === "bottom" ? "bottom-full mb-3" : "top-full mt-3"
          )}
          style={{
            x: xSpring,
            translateX: "-50%",
          }}
          animate={{
            opacity: hoveredIndex !== null ? 1 : 0,
            width: getCurrentWidth(),
          }}
          transition={{
            opacity: { duration: 0.15 },
            width: { duration: 0.25, ease: "easeOut" },
          }}
        >
          <motion.div
            className="flex h-8 items-center whitespace-nowrap"
            animate={{
              x: getTextXOffset(),
            }}
            transition={{
              duration: 0.25,
              ease: "easeOut",
            }}
          >
            {items.map((label: string, index: number) => (
              <div
                key={`vis-${index}`}
                style={{ width: textWidths[index] }}
                className="flex h-8 items-center justify-center px-4 text-xs font-medium"
              >
                {label}
              </div>
            ))}
          </motion.div>
        </motion.div>
      )}
    </>
  );
}

// --- Helpers ---

function DockIconWrapper({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "size-10 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer",
        "text-paragraph hover:text-primary! hover:bg-[#F4F4F5] dark:hover:bg-[#1E1E1E]",
        className
      )}
    >
      {children}
    </div>
  );
}

function DockItem({
  children,
  index,
  onHover,
}: {
  children: React.ReactNode;
  index: number;
  onHover: any;
}) {
  return (
    <div className="relative block" onMouseEnter={(e) => onHover(e, index)}>
      {children}
    </div>
  );
}

// --- Search Component ---
interface DockSearchContentProps {
  term: string;
  setTerm: (t: string) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onClose: () => void;
  activeIndex: number;
  setActiveIndex: React.Dispatch<React.SetStateAction<number>>;
  router: any;
  isDebouncing: boolean;
  setDebouncing: (b: boolean) => void;
}

function DockSearchContent({
  term,
  setTerm,
  inputRef,
  onClose,
  activeIndex,
  setActiveIndex,
  router,
  isDebouncing,
  setDebouncing,
}: DockSearchContentProps) {
  const posts = useQuery(api.posts.getPublishedPosts);
  const [inputMode, setInputMode] = useState<"mouse" | "keyboard">("mouse");

  const results = useMemo(() => {
    if (term.length < 2 || !posts) return null;
    const lower = term.toLowerCase();
    return posts.filter(
      (post: any) =>
        post.title.toLowerCase().includes(lower) || post.body.toLowerCase().includes(lower)
    );
  }, [term, posts]);

  useEffect(() => {
    if (term.length >= 2) {
      setDebouncing(true);
      const t = setTimeout(() => setDebouncing(false), 250);
      return () => clearTimeout(t);
    }
    setDebouncing(false);
  }, [term, setDebouncing]);

  useEffect(() => {
    if (!results || results.length === 0) return;
    function handleNav(e: KeyboardEvent) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        setInputMode("keyboard");

        setActiveIndex((prev) => {
          if (!results) return prev;
          if (e.key === "ArrowDown") {
            return prev < results.length - 1 ? prev + 1 : 0;
          }
          return prev > 0 ? prev - 1 : results.length - 1;
        });
      }

      if (e.key === "Enter" && activeIndex >= 0) {
        e.preventDefault();
        const selected = results?.[activeIndex];
        if (selected) {
          router.push(`/posts/${selected._id}`);
          onClose();
        }
      }
    }
    document.addEventListener("keydown", handleNav);
    return () => document.removeEventListener("keydown", handleNav);
  }, [results, activeIndex, router, onClose, setActiveIndex]);

  return (
    <div className="flex flex-col h-full w-full bg-transparent">
      <div className="flex items-center gap-3 px-5 py-5 border-b border-border/40 shrink-0">
        <Search className="size-5 text-paragraph" />
        <input
          ref={inputRef}
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="What are you searching for?"
          className="flex-1 bg-transparent text-lg outline-none placeholder:text-paragraph text-foreground"
          autoFocus
        />
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-bold text-paragraph border border-border/50 px-1.5 py-0.5 rounded">
            Esc
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative">
        {isDebouncing ? (
          <div className="flex items-center justify-center h-full text-paragraph gap-2">
            <Loader2 className="animate-spin size-4" />
          </div>
        ) : !results && term.length < 2 ? (
          <div className="flex flex-col items-center justify-center h-full text-paragraph gap-2 select-none">
            <BookText className="size-12 opacity-20" />
            <span className="text-sm font-medium">Type to search blog posts</span>
          </div>
        ) : results && results.length === 0 ? (
          <div className="flex items-center justify-center h-full text-paragraph text-sm">
            No results found for "{term}"
          </div>
        ) : (
          <ScrollArea className="h-full p-2">
            <div className="flex flex-col gap-1">
              {results?.map((post: any, index: number) => (
                <Link
                  key={post._id}
                  href={`/posts/${post._id}`}
                  onClick={onClose}
                  onMouseEnter={() => {
                    setInputMode("mouse");
                    setActiveIndex(index);
                  }}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-xl transition-all text-left",
                    activeIndex === index && inputMode === "keyboard"
                      ? "bg-muted"
                      : inputMode === "mouse"
                        ? "hover:bg-[#F4F4F5] dark:hover:bg-[#1E1E1E]"
                        : ""
                  )}
                >
                  <BookText className="size-5 mt-0.5 shrink-0 transition-colors" />
                  <div>
                    <h4 className="text-sm font-medium transition-colors">{post.title}</h4>
                    <p className="text-xs text-paragraph line-clamp-1 mt-0.5">{post.body}</p>
                  </div>
                </Link>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}
