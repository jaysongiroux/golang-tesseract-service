import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface TypeProperty {
  name: string;
  type: string;
  description: string;
}

interface TypeDefinition {
  description: string;
  properties?: TypeProperty[];
  values?: { name: string; description: string }[];
}

interface TypeDefinitionsProps {
  types: Record<string, TypeDefinition>;
}

export function TypeDefinitions({ types }: TypeDefinitionsProps) {
  return (
    <div className="my-8">
      <h3 className="text-xl font-semibold mb-4">Type Definitions</h3>

      <Accordion type="multiple" className="w-full">
        {Object.entries(types).map(([typeName, typeInfo]) => (
          <AccordionItem key={typeName} value={typeName}>
            <AccordionTrigger className="text-lg font-medium">
              {typeName}
            </AccordionTrigger>
            <AccordionContent>
              <p className="mb-3">{typeInfo.description}</p>

              {typeInfo.properties && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-1/4">Property</TableHead>
                      <TableHead className="w-1/4">Type</TableHead>
                      <TableHead>Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {typeInfo.properties.map((prop) => (
                      <TableRow key={prop.name}>
                        <TableCell className="font-mono">{prop.name}</TableCell>
                        <TableCell>{prop.type}</TableCell>
                        <TableCell>{prop.description}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {typeInfo.values && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-1/3">Value</TableHead>
                      <TableHead>Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {typeInfo.values.map((value) => (
                      <TableRow key={value.name}>
                        <TableCell className="font-mono">
                          {value.name}
                        </TableCell>
                        <TableCell>{value.description}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
