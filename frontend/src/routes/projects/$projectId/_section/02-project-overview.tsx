import { Project, Analytics } from "@/types/api.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, MessageSquare, Users } from "lucide-react";

interface ProjectOverviewProps {
  project: Project | null;
  analytics: Analytics | null;
}

export default function ProjectOverview({
  project,
  analytics
}: ProjectOverviewProps) {
  if (!project) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Conversations
            </CardTitle>
            <MessageSquare className="w-5 h-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-heading font-bold">
              {analytics?.total_conversations || project.total_conversations || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Messages
            </CardTitle>
            <Users className="w-5 h-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-heading font-bold">
              {analytics?.total_messages || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Satisfaction Rate
            </CardTitle>
            <BarChart3 className="w-5 h-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-heading font-bold">
              {analytics?.avg_satisfaction ? `${(analytics.avg_satisfaction * 100).toFixed(0)}%` : "N/A"}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Project Name</h3>
              <p className="text-muted-foreground">{project.name}</p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Description</h3>
              <p className="text-muted-foreground">{project.description}</p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Status</h3>
              <p className="text-muted-foreground capitalize">{project.status}</p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Created</h3>
              <p className="text-muted-foreground">{project.created_at ? new Date(project.created_at).toLocaleDateString() : "N/A"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Recent activity and interactions will appear here.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
