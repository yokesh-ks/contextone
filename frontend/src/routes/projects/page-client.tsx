import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import {
  Plus,
  FolderOpen,
  Search
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import type { Project } from "@/types";
import { ProjectCard } from "./_components/project-card";
import { CreateProjectModal } from "./_components/create-project-modal";

export default function ProjectsPage() {
  const { user } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const queryClient = useQueryClient();

  const { data: projects = [], isLoading: loading } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: async (): Promise<Project[]> => {
      const token = localStorage.getItem('access_token');
      console.log('Token being sent for fetch projects:', token);
      const response = await fetch('/api/projects', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }
      return response.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (newProjectData: { name: string; description: string }) => {
      const token = localStorage.getItem('access_token');
      console.log('Token being sent for create project:', token);
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newProjectData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create project');
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setDialogOpen(false);
      toast.success("Project created successfully!");
    },
    onError: (error: any) => {
      if (error.message.includes('403')) {
        toast.error(error.message || "Project limit exceeded");
      } else {
        toast.error("Failed to create project");
      }
    },
  });



  // Calculate remaining project slots
  const getRemainingSlots = () => {
    if (!user?.plan) return null;

    const planLimits = {
      free: 3,
      pro: null, // unlimited
      enterprise: null, // unlimited
    };

    const limit = planLimits[user.plan as keyof typeof planLimits];
    if (limit === null) return null; // unlimited

    const remaining = limit - projects.length;
    return remaining;
  };

  const remainingSlots = getRemainingSlots();

  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-heading font-bold text-3xl mb-2" data-testid="projects-title">Projects</h1>
            <p className="text-muted-foreground">
              Manage your AI chatbot projects and configurations.
            </p>
            {remainingSlots !== null && (
              <p className="text-sm text-muted-foreground mt-2">
                {remainingSlots > 0
                  ? `${remainingSlots} project slot${remainingSlots === 1 ? '' : 's'} remaining on your ${user?.plan} plan`
                  : 'You have reached your project limit'
                }
              </p>
            )}
          </div>
          <Button className="gap-2" onClick={() => setDialogOpen(true)} data-testid="new-project-btn">
            <Plus className="w-4 h-4" />
            New Project
          </Button>
        </div>

        {/* Project Limit Alert */}
        {remainingSlots !== null && remainingSlots <= 1 && (
          <Alert className={remainingSlots === 0 ? "border-destructive" : "border-warning"}>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {remainingSlots === 0
                ? `You've reached the project limit for your ${user?.plan} plan. Upgrade to create more projects.`
                : `You have ${remainingSlots} project slot remaining on your ${user?.plan} plan.`
              }
            </AlertDescription>
          </Alert>
        )}

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="search-projects-input"
          />
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="border-border animate-pulse">
                <CardHeader>
                  <div className="h-5 bg-muted rounded w-2/3"></div>
                  <div className="h-4 bg-muted rounded w-1/2 mt-2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-muted rounded w-full"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <Card className="border-border border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FolderOpen className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="font-heading font-semibold text-lg mb-2">
                {searchQuery ? "No matching projects" : "No projects yet"}
              </h3>
              <p className="text-muted-foreground text-sm mb-4 text-center">
                {searchQuery
                  ? "Try a different search term."
                  : "Create your first project to start building AI chatbots."}
              </p>
              {!searchQuery && (
                <Button onClick={() => setDialogOpen(true)} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Create Project
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.project_id} project={project} />
            ))}
          </div>
        )}
      </div>
      <CreateProjectModal
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={createMutation.mutate}
        isPending={createMutation.isPending}
      />
    </>
  );
}