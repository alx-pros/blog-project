import { createHighlighter } from "shiki"

import vercelDark from "@/lib/theme/vercel-dark.json"
import vercelLight from "@/lib/theme/vercel-light.json"

export const highlighterPromise = createHighlighter({
  themes: [vercelDark as any, vercelLight as any],
  langs: ["ts", "tsx", "js", "jsx"],
})