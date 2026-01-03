import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { apiKeysAPI } from "@/lib/api";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Key, 
  Plus, 
  Trash2, 
  Copy, 
  Check,
  Loader2,
  AlertTriangle
} from "lucide-react";
import { toast } from "sonner";

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newKeyDialogOpen, setNewKeyDialogOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKey, setNewKey] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    loadApiKeys();
  }, []);

  const loadApiKeys = async () => {
    try {
      const response = await apiKeysAPI.getAll();
      setApiKeys(response.data);
    } catch (error) {
      toast.error("Failed to load API keys");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newKeyName.trim()) {
      toast.error("Key name is required");
      return;
    }

    setCreating(true);
    try {
      const response = await apiKeysAPI.create(newKeyName);
      setNewKey(response.data);
      setDialogOpen(false);
      setNewKeyDialogOpen(true);
      setNewKeyName("");
      loadApiKeys();
    } catch (error) {
      toast.error("Failed to create API key");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (keyId) => {
    try {
      await apiKeysAPI.delete(keyId);
      setApiKeys(apiKeys.filter(k => k.key_id !== keyId));
      toast.success("API key deleted");
    } catch (error) {
      toast.error("Failed to delete API key");
    }
  };

  const copyKey = (key, keyId) => {
    navigator.clipboard.writeText(key);
    setCopiedId(keyId);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading font-bold text-3xl mb-2" data-testid="apikeys-title">API Keys</h1>
            <p className="text-muted-foreground">
              Manage API keys for widget integration and programmatic access.
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" data-testid="create-apikey-btn">
                <Plus className="w-4 h-4" />
                Create API Key
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New API Key</DialogTitle>
                <DialogDescription>
                  Give your API key a descriptive name so you can identify it later.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="keyName">Key Name</Label>
                  <Input
                    id="keyName"
                    placeholder="e.g., Production Widget"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    data-testid="apikey-name-input"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={creating} data-testid="create-apikey-submit">
                  {creating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Key"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* New Key Dialog */}
        <Dialog open={newKeyDialogOpen} onOpenChange={setNewKeyDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                API Key Created
              </DialogTitle>
              <DialogDescription>
                Copy your API key now. You won't be able to see the full key again!
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <code className="flex-1 font-mono text-sm break-all">
                  {newKey?.key_preview}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyKey(newKey?.key_preview, 'new')}
                >
                  {copiedId === 'new' ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <div className="flex items-start gap-2 mt-4 p-3 bg-yellow-500/10 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-500">
                  Make sure to copy this key now. For security reasons, we don't store the full key and you won't be able to see it again.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setNewKeyDialogOpen(false)}>
                Done
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* API Keys List */}
        <Card>
          <CardHeader>
            <CardTitle>Your API Keys</CardTitle>
            <CardDescription>
              Use these keys to authenticate widget requests. Keep them secure!
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : apiKeys.length === 0 ? (
              <div className="text-center py-12 border border-dashed rounded-lg">
                <Key className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium mb-2">No API keys yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Create your first API key to start using the widget.
                </p>
                <Button onClick={() => setDialogOpen(true)} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Create API Key
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {apiKeys.map((key) => (
                  <div
                    key={key.key_id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border"
                    data-testid={`apikey-${key.key_id}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Key className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{key.name}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <code className="font-mono">{key.key_preview}</code>
                          <span>Created {new Date(key.created_at).toLocaleDateString()}</span>
                          {key.last_used && (
                            <span>Last used {new Date(key.last_used).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyKey(key.key_preview, key.key_id)}
                      >
                        {copiedId === key.key_id ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete API Key?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete the API key "{key.name}". 
                              Any widgets using this key will stop working immediately.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(key.key_id)}
                              className="bg-destructive text-destructive-foreground"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Usage Guide */}
        <Card>
          <CardHeader>
            <CardTitle>Usage Guide</CardTitle>
            <CardDescription>
              How to use your API keys with the ContextOne widget.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Widget Integration</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Use your API key in the widget initialization:
                </p>
                <pre className="p-4 bg-muted rounded-lg overflow-x-auto text-sm font-mono">
{`new ContextOneWidget({
  projectId: "proj_xxx",
  apiKey: "YOUR_API_KEY",
  apiUrl: "${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'}"
});`}
                </pre>
              </div>
              <div>
                <h4 className="font-medium mb-2">REST API</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Include the API key in the X-API-Key header:
                </p>
                <pre className="p-4 bg-muted rounded-lg overflow-x-auto text-sm font-mono">
{`curl -X POST "${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'}/api/widget/proj_xxx/chat" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"query": "How do I get started?"}'`}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
