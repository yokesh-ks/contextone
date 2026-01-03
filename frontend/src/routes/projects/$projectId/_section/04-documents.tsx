import { useRef, useState, Dispatch, SetStateAction, RefObject, ChangeEvent } from "react";
import { useParams } from "@tanstack/react-router";
import { documentsAPI } from "@/lib/api";
import { Document } from "@/types/api.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Upload, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface DocumentsProps {
  projectId: string;
  documents: Document[];
  setDocuments: Dispatch<SetStateAction<Document[]>>;
  fileInputRef: RefObject<HTMLInputElement>;
  uploading: boolean;
  handleFileUpload: (e: ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleDeleteDocument: (docId: string) => Promise<void>;
}

export default function DocumentsSection({
  projectId,
  documents,
  setDocuments,
  fileInputRef,
  uploading,
  handleFileUpload,
  handleDeleteDocument
}: DocumentsProps) {


  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Documents</CardTitle>
            <CardDescription>
              Upload documents to train your chatbot. Supports PDF, TXT, MD, DOCX, HTML.
            </CardDescription>
          </div>
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".pdf,.txt,.md,.docx,.html"
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef?.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Upload className="w-4 h-4 mr-2" />
              )}
              Upload Document
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <div className="text-center py-12 border border-dashed rounded-lg">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium mb-2">No documents yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Upload your first document to get started.
            </p>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Document
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.doc_id}
                className="flex items-center justify-between p-4 rounded-lg border border-border"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-primary" />
                  <div>
                    <p className="font-medium">{doc.filename}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{(doc.file_size_bytes / 1024).toFixed(1)} KB</span>
                      <span>{doc.chunks_created} chunks</span>
                      <Badge variant={doc.status === "indexed" ? "default" : "secondary"}>
                        {doc.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteDocument(doc.doc_id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
