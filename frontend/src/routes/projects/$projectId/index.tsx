import { createFileRoute } from '@tanstack/react-router';
import ProjectDetailPage from './project-detail';

export const Route = createFileRoute('/projects/$projectId/')({
  component: ProjectDetailPage,
});