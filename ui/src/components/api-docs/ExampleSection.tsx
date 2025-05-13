import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CodeBlock } from "@/components/code-block";
import SyntaxCodeBlock from "../SyntaxCodeBlock";

export type Example = {
  title: string;
  language: string;
  code: string;
};

interface ExampleSectionProps {
  examples: Example[];
}

export function ExampleSection({ examples }: ExampleSectionProps) {
  return (
    <div className="my-8">
      <h3 className="text-xl font-semibold mb-4">Examples</h3>

      <Tabs defaultValue={examples[0]?.title}>
        <TabsList className="mb-4">
          {examples.map((example) => (
            <TabsTrigger key={example.title} value={example.title}>
              {example.title}
            </TabsTrigger>
          ))}
        </TabsList>

        {examples.map((example) => (
          <TabsContent key={example.title} value={example.title}>
            <CodeBlock
              language={example.language}
              code={
                <SyntaxCodeBlock lang={example.language}>
                  {example.code}
                </SyntaxCodeBlock>
              }
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
