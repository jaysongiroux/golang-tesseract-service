import { Badge } from "@/components/ui/badge";
import { CodeBlock } from "@/components/code-block";
import SyntaxCodeBlock from "../SyntaxCodeBlock";

export type ResponseProps = {
  code: number;
  type: string;
  description: string;
  schema: Record<string, unknown>;
};

export function ResponseSection({
  success,
  errors,
}: {
  success: ResponseProps;
  errors: ResponseProps[];
}) {
  // Convert schema to JSON string for display
  const successSchemaStr = JSON.stringify(success.schema, null, 2);

  return (
    <div className="my-8">
      <h3 className="text-xl font-semibold mb-4">Responses</h3>

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="success" className="bg-green-500">
            {success.code}
          </Badge>
          <span className="font-medium">{success.type}</span>
        </div>
        <p className="mb-3">{success.description}</p>
        <CodeBlock
          language="json"
          code={
            <SyntaxCodeBlock lang="json">{successSchemaStr}</SyntaxCodeBlock>
          }
        />
      </div>

      <h4 className="text-lg font-semibold mt-6 mb-3">Error Responses</h4>
      <div className="space-y-6">
        {errors.map((error) => (
          <div key={error.code} className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="destructive">{error.code}</Badge>
              <span className="font-medium">{error.type}</span>
            </div>
            <p className="mb-2">{error.description}</p>
            <CodeBlock
              language="json"
              code={
                <SyntaxCodeBlock lang="json">
                  {JSON.stringify(error.schema, null, 2)}
                </SyntaxCodeBlock>
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
}
