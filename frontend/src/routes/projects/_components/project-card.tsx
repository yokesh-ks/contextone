import { Link } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, MessageSquare } from "lucide-react";
import type { Project } from "@/types";

type ProjectCardProps = {
  project: Project;
};

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link
      to={`/projects/${project.project_id}`}
      className="block"
    >
      <Card
        className="border-border hover:border-primary/50 transition-colors cursor-pointer h-full"
        data-testid={`project-card-${project.project_id}`}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg truncate">{project.name}</CardTitle>
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
              project.status === 'active' ? 'bg-green-500' : 'bg-muted'
            }`} />
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
          <p className="text-xs text-muted-foreground mt-3">
            Created {new Date(project.created_at).toLocaleDateString()}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
