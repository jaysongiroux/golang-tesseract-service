import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Parameter, ParameterTable } from "./ParameterTable";
import { ResponseProps, ResponseSection } from "./ResponseSection";
import { Example, ExampleSection } from "./ExampleSection";

interface EndpointCardProps {
  endpoint: {
    method: string;
    path: string;
    description: string;
    requestParams: {
      headers: Parameter[];
      body: Parameter[];
    };
    responses: {
      success: ResponseProps;
      errors: ResponseProps[];
    };
    examples: Example[];
  };
}

export function EndpointCard({ endpoint }: EndpointCardProps) {
  return (
    <Card className="mb-10">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <Badge className="bg-purple-600 hover:bg-purple-700">
            {endpoint.method}
          </Badge>
          <code className="text-lg font-mono bg-muted px-2 py-1 rounded">
            {endpoint.path}
          </code>
        </div>
        <CardTitle className="text-2xl">
          {endpoint.path.split("/").pop()}
        </CardTitle>
        <CardDescription className="text-base mt-2">
          {endpoint.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {endpoint.requestParams.headers.length > 0 && (
          <ParameterTable
            parameters={endpoint.requestParams.headers}
            title="Headers"
          />
        )}

        {endpoint.requestParams.body.length > 0 && (
          <ParameterTable
            parameters={endpoint.requestParams.body}
            title="Request Body Parameters"
          />
        )}

        <ResponseSection
          success={endpoint.responses.success}
          errors={endpoint.responses.errors}
        />

        <ExampleSection examples={endpoint.examples} />
      </CardContent>
    </Card>
  );
}
