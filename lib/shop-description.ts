const SHOP_DESCRIPTION_MIN_LENGTH = 10;
const SHOP_DESCRIPTION_MAX_LENGTH = 600;

function stripHtmlTags(input: string): string {
  return input.replace(/<[^>]*>/g, "");
}

export function normalizeShopDescription(input: string): string {
  return stripHtmlTags(input).replace(/\r\n?/g, "\n").trim();
}

export function markdownToPlainText(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^\s{0,3}(#{1,6})\s+/gm, "")
    .replace(/^\s{0,3}>\s?/gm, "")
    .replace(/^\s{0,3}([-*+]|\d+\.)\s+/gm, "")
    .replace(/\[color=(verde|rojo|azul|naranja|violeta)\]([\s\S]*?)\[\/color\]/gi, "$2")
    .replace(/\+\+([\s\S]*?)\+\+/g, "$1")
    .replace(/[*_~]/g, "")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

export function transformShopDescriptionMarkdown(markdown: string): string {
  return markdown
    .replace(/\+\+([\s\S]*?)\+\+/g, "<u>$1</u>")
    .replace(
      /\[color=(verde|rojo|azul|naranja|violeta)\]([\s\S]*?)\[\/color\]/gi,
      (_full, rawColor: string, text: string) => {
        const color = String(rawColor).toLowerCase();
        const colorClass =
          color === "rojo"
            ? "text-red-600"
            : color === "azul"
              ? "text-blue-600"
              : color === "naranja"
                ? "text-orange-600"
                : color === "violeta"
                  ? "text-violet-600"
                  : "text-emerald-600";
        return `<span class="${colorClass}">${text}</span>`;
      },
    );
}

export function shopDescriptionTextLength(markdown: string): number {
  return markdownToPlainText(markdown).length;
}

export function isShopDescriptionLengthValid(markdown: string): boolean {
  const length = shopDescriptionTextLength(markdown);
  return length >= SHOP_DESCRIPTION_MIN_LENGTH && length <= SHOP_DESCRIPTION_MAX_LENGTH;
}

export const SHOP_DESCRIPTION_MIN_TEXT = SHOP_DESCRIPTION_MIN_LENGTH;
export const SHOP_DESCRIPTION_MAX_TEXT = SHOP_DESCRIPTION_MAX_LENGTH;
