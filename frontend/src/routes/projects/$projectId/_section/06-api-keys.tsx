import { Link } from "@tanstack/react-router";
import { ApiKey } from "@/types/api.types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Code2 } from "lucide-react";

interface ApiKeysProps {
  apiKeys: ApiKey[];
}

export default function ApiKeysSection({
  apiKeys
}: ApiKeysProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>API Keys</CardTitle>
        <CardDescription>
          Manage your API keys for accessing the project programmatically.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {apiKeys.length === 0 ? (
          <div className="text-center py-8 border border-dashed rounded-lg">
            <Code2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium mb-2">No API Keys</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create an API key to access your project programmatically.
            </p>
            <Link to="/api-keys">
              <Button>Create API Key</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              You have {apiKeys.length} API key(s) available for this project.
            </p>
            <div className="space-y-3">
              {apiKeys.map((key) => (
                <div
                  key={key.key_id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border"
                >
                  <div>
                    <p className="font-medium">{key.name}</p>
                    <p className="text-sm text-muted-foreground">{key.key_preview}</p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(key.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
