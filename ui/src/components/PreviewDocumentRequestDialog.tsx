import { OrganizationOCRResponse } from "@/app/api/protected/usage/requests/types";
import { Dialog, DialogContent, DialogHeader } from "./ui/dialog";
import { Table, TableBody, TableCell, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import { CodeBlock } from "./code-block";
import SyntaxCodeBlock from "./SyntaxCodeBlock";
import { useState } from "react";
import { ResultResponse } from "@/app/api/protected/usage/result/types";
import { useEffect } from "react";
import { Skeleton } from "./ui/skeleton";

const PreviewDocumentRequestDialog = ({
  open,
  onClose,
  request,
}: {
  open: boolean;
  onClose: () => void;
  request: OrganizationOCRResponse["requests"][0] | null;
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [result, setResult] = useState<ResultResponse | null>(null);

  useEffect(() => {
    const fetchCache = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/protected/usage/result?organizationId=${request?.organizationId}&requestId=${request?.id}`
        );
        const data = await response.json();
        setResult(data.request);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    if (request?.fileCache) {
      fetchCache();
    }
  }, [request]);

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="min-w-[90%] max-w-[90%] max-h-[70%] overflow-y-scroll">
        <DialogHeader>{request?.filename}</DialogHeader>

        <div>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>Cache Hit</TableCell>
                <TableCell>
                  <Badge
                    className={cn(
                      "bg-green-500/20 text-green-400",
                      request?.cacheHit
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                    )}
                  >
                    {request?.cacheHit ? "Yes" : "No"}
                  </Badge>
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell>Pages</TableCell>
                <TableCell>{request?.numOfPages.toLocaleString()}</TableCell>
              </TableRow>

              <TableRow>
                <TableCell>Status</TableCell>
                <TableCell>
                  <Badge
                    className={cn(
                      "bg-green-500/20 text-green-400",
                      request?.success
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                    )}
                  >
                    {request?.success ? "Success" : "Failed"}
                  </Badge>
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell>OCR Engine</TableCell>
                <TableCell>{request?.ocrEngine}</TableCell>
              </TableRow>

              <TableRow>
                <TableCell>Token Count</TableCell>
                <TableCell>{request?.tokenCount.toLocaleString()}</TableCell>
              </TableRow>

              <TableRow>
                <TableCell>Requested At</TableCell>
                <TableCell>
                  {dayjs(request?.createdAt).format("MMMM D, YYYY h:mm A")}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <div className="mt-4 flex flex-col gap-2">
            <div className="text-lg font-medium ">Results:</div>

            {isLoading ? (
              <div className="flex items-center justify-center">
                <Skeleton className="h-[500px] w-full" />
              </div>
            ) : (
              <>
                {!result?.fileCache?.results ? (
                  <p className="text-slate-400">
                    No results found for this document
                  </p>
                ) : (
                  <CodeBlock
                    language="json"
                    codeString={
                      typeof result?.fileCache?.results === "string"
                        ? result?.fileCache?.results
                        : JSON.stringify(result?.fileCache?.results, null, 2)
                    }
                    code={
                      <SyntaxCodeBlock lang="json">
                        {typeof result?.fileCache?.results === "string"
                          ? result?.fileCache?.results
                          : JSON.stringify(result?.fileCache?.results, null, 2)}
                      </SyntaxCodeBlock>
                    }
                  />
                )}
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PreviewDocumentRequestDialog;
