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
        theme: "dracula",
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
      className="formatted-code-container"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export default SyntaxCodeBlock;
