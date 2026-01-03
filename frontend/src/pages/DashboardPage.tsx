import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { projectsAPI } from "@/lib/api";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  FolderOpen, 
  MessageSquare, 
  FileText, 
  TrendingUp,
  Plus,
  ArrowRight
} from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalDocs: 0,
    totalConversations: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await projectsAPI.getAll();
      const projectList = response.data;
      setProjects(projectList);
      
      // Calculate stats
      const totalDocs = projectList.reduce((sum, p) => sum + (p.doc_count || 0), 0);
      const totalConversations = projectList.reduce((sum, p) => sum + (p.total_conversations || 0), 0);
      
      setStats({
        totalProjects: projectList.length,
        totalDocs,
        totalConversations
      });
    } catch (error) {
      console.error("Failed to load projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Projects",
      value: stats.totalProjects,
      icon: FolderOpen,
      color: "text-primary"
    },
    {
      title: "Documents Indexed",
      value: stats.totalDocs,
      icon: FileText,
      color: "text-green-500"
    },
    {
      title: "Conversations",
      value: stats.totalConversations,
      icon: MessageSquare,
      color: "text-blue-500"
    },
    {
      title: "Avg. Response",
      value: "1.2s",
      icon: TrendingUp,
      color: "text-orange-500"
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading font-bold text-3xl mb-2" data-testid="dashboard-title">
              Welcome back, {user?.full_name?.split(' ')[0] || 'there'}
            </h1>
            <p className="text-muted-foreground">
              Here's what's happening with your chatbots today.
            </p>
          </div>
          <Link to="/projects">
            <Button className="gap-2" data-testid="create-project-btn">
              <Plus className="w-4 h-4" />
              New Project
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat) => (
            <Card key={stat.title} className="border-border" data-testid={`stat-${stat.title.toLowerCase().replace(' ', '-')}`}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-heading font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Projects */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-semibold text-xl">Recent Projects</h2>
            <Link to="/projects" className="text-primary text-sm hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
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
          ) : projects.length === 0 ? (
            <Card className="border-border border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FolderOpen className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="font-heading font-semibold text-lg mb-2">No projects yet</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Create your first project to start building AI chatbots.
                </p>
                <Link to="/projects">
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Create Project
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.slice(0, 6).map((project) => (
                <Link key={project.project_id} to={`/projects/${project.project_id}`}>
                  <Card className="border-border hover:border-primary/50 transition-colors cursor-pointer h-full" data-testid={`project-card-${project.project_id}`}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{project.name}</CardTitle>
                        <div className={`w-2 h-2 rounded-full ${project.status === 'active' ? 'bg-green-500' : 'bg-muted'}`} />
                      </div>
                      <CardDescription className="line-clamp-2">
                        {project.description || "No description"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          {project.doc_count} docs
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="w-4 h-4" />
                          {project.total_conversations} chats
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="font-heading font-semibold text-xl mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/projects">
              <Card className="border-border hover:border-primary/50 transition-colors cursor-pointer">
                <CardContent className="flex items-center gap-4 py-6">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Plus className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Create Project</p>
                    <p className="text-sm text-muted-foreground">Start a new chatbot</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link to="/api-keys">
              <Card className="border-border hover:border-primary/50 transition-colors cursor-pointer">
                <CardContent className="flex items-center gap-4 py-6">
                  <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="font-medium">API Keys</p>
                    <p className="text-sm text-muted-foreground">Manage widget access</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link to="/settings">
              <Card className="border-border hover:border-primary/50 transition-colors cursor-pointer">
                <CardContent className="flex items-center gap-4 py-6">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium">Settings</p>
                    <p className="text-sm text-muted-foreground">Account preferences</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
