"use client";

import { useRef } from "react";
import { Bold, Italic, Underline, List, ListOrdered } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type MarkdownEditorProps = {
  value: string;
  onChange: (nextValue: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
};

type SurroundConfig = {
  prefix: string;
  suffix: string;
  fallback: string;
};

function insertWithSelection(
  value: string,
  start: number,
  end: number,
  config: SurroundConfig,
): { value: string; selectionStart: number; selectionEnd: number } {
  const selected = value.slice(start, end);
  const target = selected || config.fallback;
  const nextValue = `${value.slice(0, start)}${config.prefix}${target}${config.suffix}${value.slice(end)}`;
  const selectionStart = start + config.prefix.length;
  const selectionEnd = selectionStart + target.length;
  return { value: nextValue, selectionStart, selectionEnd };
}

function transformLineStart(
  value: string,
  start: number,
  end: number,
  marker: string,
): { value: string; selectionStart: number; selectionEnd: number } {
  const blockStart = value.lastIndexOf("\n", start - 1) + 1;
  const blockEndIdx = value.indexOf("\n", end);
  const blockEnd = blockEndIdx === -1 ? value.length : blockEndIdx;
  const block = value.slice(blockStart, blockEnd);
  const lines = block.split("\n");
  const transformed = lines.map((line) => `${marker}${line}`).join("\n");
  const nextValue = `${value.slice(0, blockStart)}${transformed}${value.slice(blockEnd)}`;
  return {
    value: nextValue,
    selectionStart: blockStart,
    selectionEnd: blockStart + transformed.length,
  };
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder,
  rows = 5,
  className,
}: MarkdownEditorProps) {
  const ref = useRef<HTMLTextAreaElement | null>(null);

  const applySurround = (config: SurroundConfig) => {
    const input = ref.current;
    if (!input) return;
    const start = input.selectionStart ?? 0;
    const end = input.selectionEnd ?? start;
    const next = insertWithSelection(value, start, end, config);
    onChange(next.value);
    requestAnimationFrame(() => {
      input.focus();
      input.setSelectionRange(next.selectionStart, next.selectionEnd);
    });
  };

  const applyLineMarker = (marker: string) => {
    const input = ref.current;
    if (!input) return;
    const start = input.selectionStart ?? 0;
    const end = input.selectionEnd ?? start;
    const next = transformLineStart(value, start, end, marker);
    onChange(next.value);
    requestAnimationFrame(() => {
      input.focus();
      input.setSelectionRange(next.selectionStart, next.selectionEnd);
    });
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap gap-1.5 rounded-md border border-zinc-200 bg-zinc-50 p-1.5">
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-8 border-zinc-300 bg-white px-2 text-xs"
          onClick={() =>
            applySurround({ prefix: "**", suffix: "**", fallback: "texto en negrita" })
          }
          title="Negrita"
        >
          <Bold className="size-3.5" />
          <span className="ml-1">Negrita</span>
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-8 border-zinc-300 bg-white px-2 text-xs"
          onClick={() =>
            applySurround({ prefix: "_", suffix: "_", fallback: "texto en cursiva" })
          }
          title="Cursiva"
        >
          <Italic className="size-3.5" />
          <span className="ml-1">Cursiva</span>
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-8 border-zinc-300 bg-white px-2 text-xs"
          onClick={() =>
            applySurround({ prefix: "++", suffix: "++", fallback: "texto subrayado" })
          }
          title="Subrayado"
        >
          <Underline className="size-3.5" />
          <span className="ml-1">Subrayado</span>
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-8 border-zinc-300 bg-white px-2 text-xs"
          onClick={() => applyLineMarker("1. ")}
          title="Numeración"
        >
          <ListOrdered className="size-3.5" />
          <span className="ml-1">Numeración</span>
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-8 border-zinc-300 bg-white px-2 text-xs"
          onClick={() => applyLineMarker("- ")}
          title="Viñetas"
        >
          <List className="size-3.5" />
          <span className="ml-1">Viñetas</span>
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-8 border-zinc-300 bg-white px-2 text-xs"
          onClick={() =>
            applySurround({
              prefix: "[color=verde]",
              suffix: "[/color]",
              fallback: "texto con color",
            })
          }
          title="Color verde"
        >
          <span className="size-3 rounded-full bg-emerald-500" aria-hidden />
          <span className="ml-1">Verde</span>
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-8 border-zinc-300 bg-white px-2 text-xs"
          onClick={() =>
            applySurround({
              prefix: "[color=azul]",
              suffix: "[/color]",
              fallback: "texto con color",
            })
          }
          title="Color azul"
        >
          <span className="size-3 rounded-full bg-blue-500" aria-hidden />
          <span className="ml-1">Azul</span>
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-8 border-zinc-300 bg-white px-2 text-xs"
          onClick={() =>
            applySurround({
              prefix: "[color=rojo]",
              suffix: "[/color]",
              fallback: "texto con color",
            })
          }
          title="Color rojo"
        >
          <span className="size-3 rounded-full bg-red-500" aria-hidden />
          <span className="ml-1">Rojo</span>
        </Button>
      </div>
      <Textarea
        ref={ref}
        rows={rows}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
      <p className="text-xs text-zinc-500">
        Formato compatible: negrita, cursiva, subrayado, títulos, listas, color y enlaces
        Markdown.
      </p>
    </div>
  );
}
