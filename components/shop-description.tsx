import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { cn } from "@/lib/utils";
import { transformShopDescriptionMarkdown } from "@/lib/shop-description";

type ShopDescriptionProps = {
  markdown: string | null | undefined;
  className?: string;
};

export function ShopDescription({ markdown, className }: ShopDescriptionProps) {
  const source = transformShopDescriptionMarkdown(String(markdown ?? "").trim());
  if (!source) return null;

  return (
    <div
      className={cn(
        "prose prose-sm max-w-none prose-p:my-1 prose-headings:my-2 prose-headings:font-semibold prose-strong:font-semibold prose-u:underline",
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          ul: ({ className, ...props }) => (
            <ul className={cn("my-1 list-disc pl-6", className)} {...props} />
          ),
          ol: ({ className, ...props }) => (
            <ol className={cn("my-1 list-decimal pl-6", className)} {...props} />
          ),
          li: ({ className, ...props }) => (
            <li className={cn("my-0.5", className)} {...props} />
          ),
        }}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}
