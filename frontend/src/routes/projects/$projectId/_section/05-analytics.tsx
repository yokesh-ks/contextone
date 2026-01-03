import { Project, Analytics } from "@/types/api.types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

interface AnalyticsProps {
  project: Project | null;
  analytics: Analytics | null;
}

export default function AnalyticsSection({
  project,
  analytics
}: AnalyticsProps) {
  if (!project) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Conversations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-heading font-bold">
              {analytics?.total_conversations || project.total_conversations || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Messages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-heading font-bold">
              {analytics?.total_messages || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Satisfaction Rate
            </CardTitle>
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
          <CardTitle>Analytics Overview</CardTitle>
          <CardDescription>
            Track your chatbot's performance and user engagement.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Detailed analytics will appear here as users interact with your chatbot.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
