import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectsAPI, documentsAPI, chatAPI, analyticsAPI, apiKeysAPI } from "@/lib/api";
import { Project, Document, ApiKey, ChatMessage, Analytics } from "@/types/api.types";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Settings, FileText, MessageSquare, BarChart3, Code2, Loader2 } from "lucide-react";
import { toast } from "sonner";

// Import the new modular components
import ProjectSettings from "./_section/01-project-settings";
import ProjectOverview from "./_section/02-project-overview";
import ChatSection from "./_section/03-chat";
import DocumentsSection from "./_section/04-documents";
import AnalyticsSection from "./_section/05-analytics";
import ApiKeysSection from "./_section/06-api-keys";
import WidgetSection from "./_section/07-widget";

export default function ProjectDetailPage() {
  const { projectId } = useParams({ from: '/projects/$projectId/' });
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  console.log('ProjectDetailPage loaded with projectId:', projectId);
  const [activeTab, setActiveTab] = useState("overview");
  const [editableProject, setEditableProject] = useState<Project | null>(null);

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Widget code state
  const [selectedApiKey, setSelectedApiKey] = useState("");

  // File upload ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch project data using React Query
  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const response = await projectsAPI.getOne(projectId);
      return response.data;
    },
    retry: 1,
  });

  const { data: documents = [] } = useQuery({
    queryKey: ['documents', projectId],
    queryFn: async () => {
      const response = await documentsAPI.getAll(projectId);
      return response.data;
    },
    enabled: !!project,
  });

  const { data: analytics } = useQuery({
    queryKey: ['analytics', projectId],
    queryFn: async () => {
      const response = await analyticsAPI.get(projectId);
      return response.data;
    },
    retry: false,
    enabled: !!project,
  });

  const { data: apiKeys = [] } = useQuery({
    queryKey: ['apiKeys'],
    queryFn: async () => {
      const response = await apiKeysAPI.getAll();
      return response.data;
    },
    enabled: !!project,
  });

  // Sync editable project with fetched project
  useEffect(() => {
    if (project) {
      setEditableProject(project);
    }
  }, [project]);

  // Set selected API key when apiKeys are loaded
  useEffect(() => {
    if (apiKeys.length > 0 && !selectedApiKey && apiKeys[0]) {
      setSelectedApiKey(apiKeys[0].key_preview);
    }
  }, [apiKeys, selectedApiKey]);

  // Set welcome message when project is loaded
  useEffect(() => {
    if (project?.welcome_message && chatMessages.length === 0) {
      setChatMessages([{
        role: "assistant" as const,
        content: project.welcome_message
      }]);
    }
  }, [project?.welcome_message]);

  // Effect for auto-scrolling to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Mutation for saving project
  const saveMutation = useMutation({
    mutationFn: async (updatedProject: typeof project) => {
      if (!updatedProject) throw new Error("No project data");
      const response = await projectsAPI.update(projectId, {
        name: updatedProject.name,
        description: updatedProject.description,
        system_prompt: updatedProject.system_prompt,
        welcome_message: updatedProject.welcome_message,
        fallback_message: updatedProject.fallback_message,
        ui_config: updatedProject.ui_config,
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['project', projectId], data);
      toast.success("Project saved successfully!");
    },
    onError: () => {
      toast.error("Failed to save project");
    },
  });

  // Mutation for deleting project
  const deleteMutation = useMutation({
    mutationFn: async () => {
      await projectsAPI.delete(projectId);
    },
    onSuccess: () => {
      toast.success("Project deleted");
      navigate({ to: "/projects" });
    },
    onError: () => {
      toast.error("Failed to delete project");
    },
  });

  // Mutation for uploading document
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const response = await documentsAPI.upload(projectId, file);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Document uploaded! Processing...");
      // Refresh documents after a delay to get updated status
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['documents', projectId] });
      }, 3000);
      queryClient.invalidateQueries({ queryKey: ['documents', projectId] });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to upload document");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
  });

  // Mutation for deleting document
  const deleteDocMutation = useMutation({
    mutationFn: async (docId: string) => {
      await documentsAPI.delete(projectId, docId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', projectId] });
      toast.success("Document deleted");
    },
    onError: () => {
      toast.error("Failed to delete document");
    },
  });

  // Mutation for sending chat message
  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await chatAPI.send(projectId, message);
      return response.data;
    },
    onSuccess: (data) => {
      setChatMessages(prev => [...prev, {
        role: "assistant" as const,
        content: data.response,
        sources: data.sources
      }]);
    },
    onError: () => {
      toast.error("Failed to get response");
      setChatMessages(prev => [...prev, {
        role: "assistant" as const,
        content: "Sorry, I encountered an error. Please try again."
      }]);
    },
  });

  // Handler functions
  const handleSave = () => {
    if (editableProject) {
      saveMutation.mutate(editableProject);
    }
  };

  const handleDeleteProject = () => {
    deleteMutation.mutate();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadMutation.mutate(file);
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    deleteDocMutation.mutate(docId);
  };

  const handleSendMessage = () => {
    if (!chatInput.trim() || chatMutation.isPending) return;

    const userMessage = { role: "user" as const, content: chatInput };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput("");
    chatMutation.mutate(chatInput);
  };

  // Handle project not found
  useEffect(() => {
    if (!projectLoading && !project) {
      toast.error("Project not found");
      navigate({ to: "/projects" });
    }
  }, [projectLoading, project, navigate]);

  if (projectLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to="/projects">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="font-heading font-bold text-2xl" data-testid="project-name">
                {project.name}
              </h1>
              <Badge variant={project.status === 'active' ? 'default' : 'secondary'} className="">
                {project.status}
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm">{project.description}</p>
          </div>
          <Button onClick={handleSave} disabled={saveMutation.isPending} data-testid="save-project-btn">
            {saveMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Save Changes
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-7 lg:w-auto lg:inline-grid">
            <TabsTrigger value="overview" className="gap-2" data-testid="tab-overview">
              <BarChart3 className="w-4 h-4 hidden sm:block" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2" data-testid="tab-settings">
              <Settings className="w-4 h-4 hidden sm:block" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="documents" className="gap-2" data-testid="tab-documents">
              <FileText className="w-4 h-4 hidden sm:block" />
              Documents
            </TabsTrigger>
            <TabsTrigger value="chat" className="gap-2" data-testid="tab-chat">
              <MessageSquare className="w-4 h-4 hidden sm:block" />
              Test Chat
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2" data-testid="tab-analytics">
              <BarChart3 className="w-4 h-4 hidden sm:block" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="api-keys" className="gap-2" data-testid="tab-api-keys">
              <Code2 className="w-4 h-4 hidden sm:block" />
              API Keys
            </TabsTrigger>
            <TabsTrigger value="widget" className="gap-2" data-testid="tab-widget">
              <Code2 className="w-4 h-4 hidden sm:block" />
              Widget
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <ProjectOverview project={project} analytics={analytics || null} />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <ProjectSettings
              project={editableProject}
              setProject={setEditableProject}
              handleSave={handleSave}
              saving={saveMutation.isPending}
              handleDeleteProject={handleDeleteProject}
            />
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            <DocumentsSection
              projectId={projectId}
              documents={documents}
              setDocuments={() => {}}
              fileInputRef={fileInputRef}
              uploading={uploadMutation.isPending}
              handleFileUpload={handleFileUpload}
              handleDeleteDocument={handleDeleteDocument}
            />
          </TabsContent>

          {/* Chat Tab */}
          <TabsContent value="chat" className="space-y-6">
            <ChatSection
              projectId={projectId}
              welcomeMessage={project.welcome_message}
              chatMessages={chatMessages}
              setChatMessages={setChatMessages}
              chatInput={chatInput}
              setChatInput={setChatInput}
              chatLoading={chatMutation.isPending}
              handleSendMessage={handleSendMessage}
              chatEndRef={chatEndRef}
            />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsSection project={project} analytics={analytics || null} />
          </TabsContent>

          {/* API Keys Tab */}
          <TabsContent value="api-keys" className="space-y-6">
            <ApiKeysSection apiKeys={apiKeys} />
          </TabsContent>

          {/* Widget Tab */}
          <TabsContent value="widget" className="space-y-6">
            <WidgetSection
              projectId={projectId}
              project={project}
              apiKeys={apiKeys}
              selectedApiKey={selectedApiKey}
              setSelectedApiKey={setSelectedApiKey}
            />
          </TabsContent>
        </Tabs>
      </div>
  );
}