"use client";

import { OrganizationOCRResponse } from "@/app/api/protected/usage/requests/types";
import { DashboardLayout } from "@/components/DashboardLayout";
import PreviewDocumentRequestDialog from "@/components/PreviewDocumentRequestDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useUser } from "@/providers";
import dayjs from "dayjs";
import { ChevronLeft, ChevronRight, FileText } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const LIMIT = 10;

export default function DocumentsPage() {
  const { selectedOrg } = useUser();
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [documents, setDocuments] = useState<
    OrganizationOCRResponse["requests"]
  >([]);
  const [selectedDocument, setSelectedDocument] = useState<
    OrganizationOCRResponse["requests"][0] | null
  >(null);

  const fetchRequests = useCallback(async () => {
    if (!selectedOrg) return;
    if (!hasMore) return;

    const resp = await fetch(
      `/api/protected/usage/requests?organizationId=${
        selectedOrg?.id
      }&limit=${LIMIT}&offset=${page * LIMIT}`
    );

    const data = await resp.json();

    // if the response is equal to the limit then there are more documents
    if (data.requests.length === LIMIT) {
      setHasMore(true);
    } else {
      setHasMore(false);
    }

    setDocuments(data.requests);
  }, [hasMore, page, selectedOrg]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests, selectedOrg?.id, page]);

  return (
    <DashboardLayout>
      <PreviewDocumentRequestDialog
        open={!!selectedDocument}
        onClose={() => setSelectedDocument(null)}
        request={selectedDocument}
      />
      {/* Documents */}
      <div className="flex flex-col gap-2">
        <div className="mb-2 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">Team Members</h1>
            <p className="text-slate-400">
              Manage your team members and their permissions
            </p>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Documents</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document</TableHead>
                  <TableHead className="max-w-[100px]">Date</TableHead>
                  <TableHead className="max-w-[100px]">Pages</TableHead>
                  <TableHead className="max-w-[100px]">Status</TableHead>
                  <TableHead className="max-w-[100px]">Cache Hit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents?.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-slate-400"
                    >
                      No documents found
                    </TableCell>
                  </TableRow>
                ) : (
                  documents.map((document) => (
                    <TableRow key={document.id}>
                      <TableCell className="">
                        <div
                          className="w-[200px] md:w-[100%] cursor-pointer flex flex-row gap-2 items-center line-clamp-1 underline text-blue-300"
                          onClick={() => {
                            setSelectedDocument(document);
                          }}
                        >
                          <FileText className="h-6 w-6" />
                          <span className="truncate">{document.filename}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {dayjs(document.createdAt).format("MMMM D, YYYY")}
                      </TableCell>
                      <TableCell>{document.numOfPages}</TableCell>
                      <TableCell>
                        <Badge
                          className={cn(
                            "bg-green-500/20 text-green-400",
                            document.success
                              ? "bg-green-500/20 text-green-400"
                              : "bg-red-500/20 text-red-400"
                          )}
                        >
                          {document.success ? "Success" : "Failed"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={cn(
                            "bg-green-500/20 text-green-400",
                            document.cacheHit
                              ? "bg-green-500/20 text-green-400"
                              : "bg-red-500/20 text-red-400"
                          )}
                        >
                          {document.cacheHit ? "Yes" : "No"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {/* pagination */}
            <div className="flex justify-end gap-2">
              {/* disabled if there are not previous pages */}
              <Button
                variant="outline"
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                disabled={!hasMore}
                onClick={() => setPage(page + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
