"use client";

import { NodeViewWrapper, NodeViewContent } from "@tiptap/react";
import { Terminal, Copy, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const managers = ["npm", "pnpm", "yarn"];

interface managerMap {
  run: string;
  exec: string;
}

const managerMap: Record<string, managerMap> = {
  npm: { run: "npm", exec: "npx" },
  pnpm: { run: "pnpm", exec: "pnpm dlx" },
  yarn: { run: "yarn", exec: "yarn dlx" },
};

export default function TerminalCodeBlockComponent({
  node,
  updateAttributes,
  editor,
  getPos,
}: any) {
  const [copied, setCopied] = useState(false);

  const text = node.textContent || "";

  const PREFIX_REGEX = /^(npm|pnpm|yarn|npx|cd|git|rm|mv|touch|mkdir|ls|echo|cat)/;

  // Replace prefix when switching
  const switchManager = (manager: string) => {
    const pos = getPos();
    if (typeof pos !== "number") return;

    const currentText = node.textContent || "";
    const currentManager = node.attrs.packageManager;

    const currentMap = managerMap[currentManager];
    const newMap = managerMap[manager];

    let updated = currentText;

    if (currentMap && newMap) {
      updated = updated
        // Replace exec command first (longer)
        .replace(new RegExp(`^${currentMap.exec.replace(" ", "\\s+")}`, "gm"), newMap.exec)
        // Then replace run command
        .replace(new RegExp(`^${currentMap.run}`, "gm"), newMap.run);
    }

    updateAttributes({ packageManager: manager });

    editor
      .chain()
      .focus()
      .command(({ tr }: any) => {
        const pos = getPos();
        if (typeof pos !== "number") return false;

        tr.insertText(updated, pos + 1, pos + node.nodeSize - 1);
        return true;
      })
      .run();
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  // Styled visual rendering
  const renderStyled = () => {
    return text.split("\n").map((line: string, i: number) => {
      const match = line.match(PREFIX_REGEX);

      if (!match) {
        return (
          <div key={i} className="text-green-500">
            {line}
          </div>
        );
      }

      const prefix = match[0];
      const rest = line.slice(prefix.length);

      return (
        <div key={i}>
          <span className="text-[#7200C4] dark:text-[#B675F1]">{prefix}</span>
          <span className="text-[#397C3B] dark:text-[#58C760]">{rest}</span>
        </div>
      );
    });
  };

  return (
    <NodeViewWrapper className="my-8 rounded-lg overflow-hidden border border-[#EAEAEA] dark:border-[#1E1E1E]">
      {/* HEADER */}
      <div
        contentEditable={false}
        className="flex items-center justify-between px-4 py-2 border-b border-[#EAEAEA] dark:border-[#1E1E1E] bg-[#FAFAFA] dark:bg-black"
      >
        <div className="flex items-center gap-3">
          <Terminal className="size-4" />

          {/* Manager Buttons */}
          <div className="flex gap-2 text-xs font-mono">
            {managers.map((manager) => (
              <button
                key={manager}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  switchManager(manager);
                }}
                className={`px-2 py-0.5 rounded transition cursor-pointer ${
                  node.attrs.packageManager === manager
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "dark:bg-[#181818] bg-[#E8E8E8]"
                }`}
              >
                {manager}
              </button>
            ))}
          </div>
        </div>
        <button
          type="button"
          contentEditable={false}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleCopy();
          }}
          className="p-2 rounded-md transition cursor-pointer hover:bg-[#EAEAEA] dark:hover:bg-[#1E1E1E]"
        >
          {copied ? (
            <motion.div
              key="check"
              initial={{ scale: 0.1, opacity: 1 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.1, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <Check className="size-4 text-[#666666] dark:text-[#A0A0A0]" />
            </motion.div>
          ) : (
            <motion.div
              key="copy"
              initial={{ scale: 0.1, opacity: 1 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.1, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <Copy className="size-4 text-[#666666] dark:text-[#A0A0A0]" />
            </motion.div>
          )}
        </button>
      </div>

      {/* BODY */}
      <div className="relative bg-white dark:bg-black px-4 py-5 font-mono text-[13px] leading-[20px]">
        {/* Visual layer */}
        <div className="pointer-events-none whitespace-pre h-4">{renderStyled()}</div>

        {/* Editable layer */}
        <NodeViewContent
          as="pre"
          className="absolute inset-0 px-4 py-5 whitespace-pre text-transparent caret-black dark:caret-white outline-none"
        />
      </div>
    </NodeViewWrapper>
  );
}
