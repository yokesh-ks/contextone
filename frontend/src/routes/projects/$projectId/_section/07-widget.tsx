import { useState, Dispatch, SetStateAction } from "react";
import { Link } from "@tanstack/react-router";
import { ApiKey, Project } from "@/types/api.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Copy, Check, Code2 } from "lucide-react";
import { toast } from "sonner";

interface WidgetProps {
  projectId: string;
  project: Project | null;
  apiKeys: ApiKey[];
  selectedApiKey: string;
  setSelectedApiKey: Dispatch<SetStateAction<string>>;
}

export default function WidgetSection({
  projectId,
  project,
  apiKeys,
  selectedApiKey,
  setSelectedApiKey
}: WidgetProps) {
  const [copied, setCopied] = useState(false);

  const copyWidgetCode = () => {
    const code = getWidgetCode();
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Widget code copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const getWidgetCode = () => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";
    return `<!-- ContextOne Chat Widget -->
<script src="${backendUrl}/api/widget.js"></script>
<script>
  new ContextOneWidget({
    projectId: "${projectId}",
    apiKey: "${selectedApiKey || "YOUR_API_KEY"}",
    apiUrl: "${backendUrl}",
    position: "${project?.ui_config?.position || "bottom-right"}",
    primaryColor: "${project?.ui_config?.primary_color || "#6366F1"}"
  });
</script>`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Embed Widget</CardTitle>
        <CardDescription>
          Copy this code and paste it into your website's HTML, just before the closing &lt;/body&gt; tag.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {apiKeys.length === 0 ? (
          <div className="text-center py-8 border border-dashed rounded-lg">
            <Code2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium mb-2">No API Keys</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create an API key to use the widget.
            </p>
            <Link to="/api-keys">
              <Button>Create API Key</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <Label>Select API Key</Label>
              <Select value={selectedApiKey} onValueChange={setSelectedApiKey}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an API key" />
                </SelectTrigger>
                <SelectContent>
                  {apiKeys.map((key) => (
                    <SelectItem key={key.key_id} value={key.key_preview}>
                      {key.name} ({key.key_preview})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="relative">
              <pre className="p-4 bg-muted rounded-lg overflow-x-auto text-sm font-mono">
                {getWidgetCode()}
              </pre>
              <Button
                variant="outline"
                size="sm"
                className="absolute top-2 right-2"
                onClick={copyWidgetCode}
              >
                {copied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
