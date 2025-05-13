"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { File, FileText, Loader2, Trash } from "lucide-react";
import Dropzone from "shadcn-dropzone";
import { Card, CardContent, CardTitle } from "./ui/card";
import { OCREngine, OrganizationMemberAPIKeyScope } from "@prisma/client";
import { OneTimeTokenResponse } from "@/app/api/protected/organization/tokens/one-time/types";
import { useUser } from "@/providers";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { cn } from "@/lib/utils";
import { OCRResponseList } from "@/lib/types";
import SyntaxCodeBlock from "./SyntaxCodeBlock";
import { CodeBlock } from "./code-block";
import { toast } from "sonner";

export function ProcessDocumentDrawer({}) {
  const { selectedOrg } = useUser();
  const [file, setFile] = useState<File | null>(null);
  const [outputType, setOutputType] = useState("raw");
  const [cachePolicy, setCachePolicy] = useState("cache_first");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState("");
  const [engine, setEngine] = useState<OCREngine>(OCREngine.TESSERACT);
  const [processDocumentDrawerOpen, setProcessDocumentDrawerOpen] =
    useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!file) {
      setError("Please select a document to process");
      return;
    }

    setIsLoading(true);

    try {
      const tokenResponse = await fetch(
        "/api/protected/organization/tokens/one-time",
        {
          method: "POST",
          body: JSON.stringify({
            organizationId: selectedOrg?.id,
            scopes: [OrganizationMemberAPIKeyScope.SERVICE_OCR],
          }),
        }
      );

      const tokenResp = (await tokenResponse.json()) as OneTimeTokenResponse;

      if ("error" in tokenResp) {
        setError(tokenResp.error);
        setIsLoading(false);
        return;
      }

      const token = tokenResp.token;

      const formData = new FormData();
      formData.append("file", file);
      if (outputType === "raw") {
        formData.append("raw", "true");
      } else {
        formData.append("raw", "false");
      }
      formData.append("cache_policy", cachePolicy);
      formData.append("engine", engine);
      const startTime = Date.now();
      const resp = await fetch(
        `${process.env.NEXT_PUBLIC_SERVICE_BACKEND_URL}/api/service/ocr`,
        {
          method: "POST",
          body: formData,
          headers: {
            "x-api-key": token,
          },
        }
      );
      const endTime = Date.now();
      const data = (await resp.json()) as OCRResponseList | { error: string };

      if ("error" in data) {
        setError(data.error);
        setIsLoading(false);
        return;
      }

      if ("ocr_responses" in data) {
        toast.success(`Processed document in ${endTime - startTime}ms`);
        setResults(JSON.stringify(data, null, 2));
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to process document. Please try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setOutputType("raw");
    setCachePolicy("cache_first");
    setResults("");
  };

  const fileSizeInMBKb = (file: File) => {
    if (file.size > 1024 * 1024) {
      return (file.size / 1024 / 1024).toFixed(2) + " MB";
    } else {
      return (file.size / 1024).toFixed(2) + " KB";
    }
  };

  return (
    <Dialog
      open={processDocumentDrawerOpen}
      onOpenChange={setProcessDocumentDrawerOpen}
    >
      <div className="flex items-center gap-2">
        <Button
          onClick={() => {
            setProcessDocumentDrawerOpen(true);
          }}
          className="text-slate-50 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
        >
          <FileText className="mr-2 h-4 w-4 text-slate-50" />
          Process Document
        </Button>
      </div>

      <DialogContent className="bg-slate-900 min-w-[90%] w-full h-[90%] max-h-[90%] flex flex-col">
        <DialogHeader className="p-0 m-0 mb-0 py-0 pb-0">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-2">
              <DialogTitle>Process Document</DialogTitle>
              <DialogDescription>
                Upload a document to extract text and data using OCR.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <div className="flex flex-col gap-4 md:flex-row w-full h-full justify-start">
            {/* form */}
            <div
              className={cn(
                `space-y-6  transition-all duration-500 ease-in-out ${
                  results ? "md:w-1/2 w-full" : "w-full"
                }`
              )}
            >
              {error && <div className="text-sm text-red-500">{error}</div>}

              <div className="space-y-2">
                <Label htmlFor="document">Upload Document</Label>
                {file ? (
                  <Card className="border-slate-800 bg-slate-800 text-slate-50 ">
                    <CardContent className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <File className="w-8 h-8" />
                        <div className="flex flex-col">
                          {/* max length filename */}
                          <CardTitle className="text-xs md:text-sm text-wrap line-clamp-1">
                            {file.name.slice(0, 50)}
                            {file.name.length > 50 && "..."}
                          </CardTitle>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span>{fileSizeInMBKb(file)}</span>
                            <span>•</span>
                            <span>{file.type}</span>
                          </div>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setFile(null);
                          setResults("");
                        }}
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <Dropzone
                    multiple={false}
                    accept={{
                      "image/*": [".png", ".jpg", ".jpeg"],
                      "application/pdf": [".pdf"],
                    }}
                    dropZoneClassName="py-10"
                    showFilesList={false}
                    onDropAccepted={(acceptedFiles: File[]) => {
                      setFile(acceptedFiles[0]);
                    }}
                    maxSize={10 * 1024 * 1024} // 10mb
                    maxFiles={1}
                    //   only allow 1 file
                    onDropRejected={(fileRejections) => {
                      setError(fileRejections[0].errors[0].message);
                    }}
                  />
                )}
              </div>

              <div className="flex-col flex gap-2">
                <Label className="pb-2">Output Type</Label>
                <RadioGroup
                  defaultValue="raw"
                  value={outputType}
                  onValueChange={setOutputType}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="raw" id="raw" />
                    <div className="flex flex-col gap-0">
                      <Label htmlFor="raw" className="font-normal">
                        Raw OCR Output
                        <span className="text-xs text-slate-500">
                          (Default)
                        </span>
                      </Label>
                      <label className="text-sm text-slate-500">
                        Returns raw text extracted from the document
                      </label>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="formatted" id="formatted" />
                    <div className="flex flex-col gap-0">
                      <Label htmlFor="formatted" className="font-normal">
                        Formatted OCR Output
                      </Label>
                      <label className="text-sm text-slate-500">
                        returns structured JSON data from the document
                      </label>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              {/* select engine */}
              <div className="space-y-2 flex-1/2">
                <div className="flex flex-col gap-1">
                  <Label htmlFor="engine">Engine</Label>
                  <p className="text-xs text-slate-500">
                    Select the engine to use for OCR.
                  </p>
                </div>
                <Select
                  defaultValue={OCREngine.TESSERACT}
                  value={engine}
                  onValueChange={(value: unknown) =>
                    setEngine(value as OCREngine)
                  }
                >
                  <SelectTrigger className="border-slate-800 bg-slate-900 text-slate-50 focus:border-blue-500">
                    <SelectValue placeholder="Select engine" />
                  </SelectTrigger>
                  <SelectContent className="border-slate-800 bg-slate-950 text-slate-50">
                    {Object.keys(OCREngine).map((engine) => (
                      <SelectItem key={engine} value={engine}>
                        {engine}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cachePolicy">Cache Policy</Label>
                <Select
                  defaultValue="cache-first"
                  value={cachePolicy}
                  onValueChange={setCachePolicy}
                >
                  <SelectTrigger className="border-slate-800 bg-slate-900 text-slate-50 focus:border-blue-500">
                    <SelectValue placeholder="Select cache policy" />
                  </SelectTrigger>
                  <SelectContent className="border-slate-800 bg-slate-950 text-slate-50">
                    <SelectItem value="cache_first">
                      Cache First (Default)
                    </SelectItem>
                    <SelectItem value="cache_only">Cache Only</SelectItem>
                    <SelectItem value="no_cache">No Cache</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500 mt-1">
                  Cache First: Check cache first, then process if not found.
                  Cache Only: Only return cached results. No Cache: Always
                  process document.
                </p>
              </div>
            </div>

            {/* results */}
            <div
              className={cn(
                "overflow-y-scroll flex flex-col gap-2 w-0 opacity-0 transition-width duration-500 ease-in-out",
                results && "md:w-2/3 w-full opacity-100"
              )}
            >
              <CodeBlock
                language="JSON"
                codeString={results}
                code={<SyntaxCodeBlock lang="json">{results}</SyntaxCodeBlock>}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="items-end">
          <div className="flex gap-2 w-full justify-end items-end h-fit">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={handleSubmit}
              disabled={isLoading || !file}
              className="text-slate-50 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Process Document"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
