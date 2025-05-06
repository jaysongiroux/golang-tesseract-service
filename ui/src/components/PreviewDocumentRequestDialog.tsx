import { OrganizationOCRResponse } from "@/app/api/protected/usage/requests/types";
import { Dialog, DialogContent, DialogHeader } from "./ui/dialog";
import { Table, TableBody, TableCell, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import { CodeBlock } from "./code-block";

const PreviewDocumentRequestDialog = ({
  open,
  onClose,
  request,
}: {
  open: boolean;
  onClose: () => void;
  request: OrganizationOCRResponse["requests"][0] | null;
}) => {
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

            {!request?.fileCache?.results ? (
              <p className="text-slate-400">
                No results found for this document
              </p>
            ) : (
              <CodeBlock
                language="text"
                className="max-w-[100%] overflow-x-scroll"
                code={request?.fileCache?.results}
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PreviewDocumentRequestDialog;
