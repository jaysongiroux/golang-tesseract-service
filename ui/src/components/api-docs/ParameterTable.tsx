import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface ParameterOption {
  value: string;
  description: string;
}

export interface Parameter {
  name: string;
  type: string;
  required: boolean;
  description: string;
  options?: ParameterOption[];
  default?: string;
}

interface ParameterTableProps {
  parameters: Parameter[];
  title: string;
}

export function ParameterTable({ parameters, title }: ParameterTableProps) {
  return (
    <div className="my-6">
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/6">Parameter</TableHead>
            <TableHead className="w-1/6">Type</TableHead>
            <TableHead className="w-1/12">Required</TableHead>
            <TableHead>Description</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {parameters.map((param) => (
            <TableRow key={param.name}>
              <TableCell className="font-mono">{param.name}</TableCell>
              <TableCell>{param.type}</TableCell>
              <TableCell>
                {param.required ? (
                  <Badge variant="destructive">Required</Badge>
                ) : (
                  <Badge variant="outline">Optional</Badge>
                )}
              </TableCell>
              <TableCell>
                <div>
                  <p>{param.description}</p>
                  {param.default && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Default:{" "}
                      <code className="bg-muted px-1 py-0.5 rounded">
                        {param.default}
                      </code>
                    </p>
                  )}
                  {param.options && param.options.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium">Options:</p>
                      <ul className="list-disc list-inside text-sm pl-2 mt-1 space-y-1">
                        {param.options.map((option) => (
                          <li key={option.value}>
                            <code className="bg-muted px-1 py-0.5 rounded">
                              {option.value}
                            </code>
                            {option.description && ` - ${option.description}`}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
