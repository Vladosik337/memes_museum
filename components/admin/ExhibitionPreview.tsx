"use client";
import DOMPurify from "dompurify";
import { marked, Renderer } from "marked";

export function parseMarkdownWithAnchors(markdown: string) {
  const headings: { level: number; text: string; id: string }[] = [];
  const renderer = new Renderer();

  renderer.heading = function ({ depth, tokens, raw }) {
    // текст із токенів (Marked v5+)
    const text = tokens
      ? tokens
          .map((t: { raw?: string; text?: string }) => t.raw || t.text || "")
          .join("")
      : raw || "";
    const id = text
      .toLowerCase()
      .replace(/[^a-zа-я0-9]+/gi, "-")
      .replace(/^-+|-+$/g, "");
    headings.push({ level: depth, text, id });
    return `<h${depth} id="${id}">${text}</h${depth}>`;
  };

  const rawHtml = marked.parse(markdown, { renderer }) as string;
  let html = rawHtml;
  try {
    type Sanitizer = { sanitize: (s: string) => string };
    type DPExport = Sanitizer | ((root?: unknown) => Sanitizer);
    const dpExport: unknown = DOMPurify as unknown as DPExport;
    let sanitizer: Sanitizer | null = null;
    if (
      dpExport &&
      typeof dpExport === "object" &&
      "sanitize" in dpExport &&
      typeof (dpExport as { sanitize: unknown }).sanitize === "function"
    ) {
      sanitizer = dpExport as Sanitizer;
    } else if (typeof dpExport === "function") {
      const inst = dpExport(typeof window !== "undefined" ? window : undefined);
      if (inst && typeof inst.sanitize === "function") sanitizer = inst;
    }
    if (sanitizer) html = sanitizer.sanitize(rawHtml);
  } catch {
    // ігнорувати
  }
  return { html, headings };
}

export default function ExhibitionPreview({ markdown }: { markdown: string }) {
  const { html, headings } = parseMarkdownWithAnchors(markdown);

  return (
    <div className="space-y-6">
      {/* Меню навігації */}
      <nav className="mb-4 nav-menu-preview">
        <h2 className="text-sm font-semibold text-gray-700">
          Сформований зміст
        </h2>
        {headings.length > 0 ? (
          <ul>
            {headings.map((h) => (
              <li key={h.id} style={{ marginLeft: (h.level - 1) * 16 }}>
                <a
                  href={`#${h.id}`}
                  className="block py-1 px-2 rounded hover:bg-orange-100 hover:text-orange-700 text-gray-700 text-sm"
                >
                  {h.text}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <span className="text-gray-400 text-sm">
            Додайте заголовки (#) для меню
          </span>
        )}
      </nav>
      {/* Контент */}
      <div
        className="preview-area border border-gray-200 rounded-lg p-4 h-[560px] max-h-[100vh] overflow-y-auto [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mt-6 [&_h1]:mb-2 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-4 [&_h2]:mb-2 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-3 [&_h3]:mb-1 [&_p]:mb-2"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
