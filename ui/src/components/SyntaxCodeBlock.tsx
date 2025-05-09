import { useEffect, useState } from "react";
import { codeToHtml } from "shiki";

function SyntaxCodeBlock({
  lang,
  children,
}: {
  lang: string;
  children: string;
}) {
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    const fetchHtml = async () => {
      const out = await codeToHtml(children, {
        lang,
        theme: "catppuccin-mocha",
        mergeWhitespaces: true,
        mergeSameStyleTokens: true,
      });
      setHtml(out);
    };
    fetchHtml();
  }, [lang, children]);

  if (!html) return null;

  return (
    <div
      className="formatted-code-container rounded-lg border border-slate-800 bg-slate-950"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export default SyntaxCodeBlock;
