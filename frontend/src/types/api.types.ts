// ============================================================================
// USER TYPES
// ============================================================================

export interface User {
  id: string;
  email: string;
  full_name: string;
  tenant_id: string;
  plan?: 'free' | 'pro' | 'enterprise';
  created_at: string;
  updated_at?: string;
}

// ============================================================================
// AUTH TYPES
// ============================================================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  full_name: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  tenant_id: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

// ============================================================================
// PROJECT TYPES
// ============================================================================

export interface Project {
  project_id: string;
  tenant_id: string;
  name: string;
  description?: string;
  system_prompt?: string;
  welcome_message?: string;
  fallback_message?: string;
  ui_config?: {
    primary_color?: string;
    position?: 'bottom-right' | 'bottom-left';
    theme?: 'dark' | 'light' | 'auto';
  };
  model_config_data?: Record<string, unknown>;
  status: 'active' | 'paused' | 'archived';
  doc_count: number;
  total_conversations: number;
  total_tokens_used: number;
  created_at: string;
  updated_at: string;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  system_prompt?: string;
  welcome_message?: string;
  fallback_message?: string;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  system_prompt?: string;
  welcome_message?: string;
  fallback_message?: string;
  ui_config?: Project['ui_config'];
}

// ============================================================================
// DOCUMENT TYPES
// ============================================================================

export interface Document {
  doc_id: string;
  project_id: string;
  tenant_id: string;
  filename: string;
  file_size_bytes: number;
  file_type: string;
  status: 'processing' | 'ready' | 'failed';
  chunks_created: number;
  content?: string;
  uploaded_at: string;
  indexed_at?: string;
}

export type SupportedFileType = 'pdf' | 'txt' | 'md' | 'docx' | 'html';

// ============================================================================
// CHAT TYPES
// ============================================================================

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export interface ChatRequest {
  query: string;
  conversation_history?: ChatMessage[];
}

export interface ChatSource {
  doc_id: string;
  filename: string;
  chunk_text: string;
  relevance_score: number;
}

export interface ChatResponse {
  response: string;
  sources?: ChatSource[];
}

// ============================================================================
// CONVERSATION TYPES
// ============================================================================

export interface Conversation {
  conversation_id: string;
  project_id: string;
  tenant_id: string;
  messages: ChatMessage[];
  created_at: string;
  updated_at: string;
}

// ============================================================================
// API KEY TYPES
// ============================================================================

export interface ApiKey {
  key_id: string;
  user_id: string;
  tenant_id: string;
  name: string;
  key: string;
  key_preview: string;
  is_active: boolean;
  created_at: string;
  last_used?: string;
}

export interface CreateApiKeyRequest {
  name: string;
}

// ============================================================================
// ANALYTICS TYPES
// ============================================================================

export interface Analytics {
  total_conversations: number;
  total_messages: number;
  total_queries?: number;
  total_documents?: number;
  avg_satisfaction?: number;
  queries_by_day?: Array<{
    date: string;
    count: number;
  }>;
  top_documents?: Array<{
    doc_id: string;
    filename: string;
    query_count: number;
  }>;
}

// ============================================================================
// FEEDBACK TYPES
// ============================================================================

export interface FeedbackRequest {
  conversation_id?: string;
  message_id?: string;
  project_id?: string;
  rating?: 1 | 2 | 3 | 4 | 5;
  comment?: string;
}

export interface Feedback extends FeedbackRequest {
  feedback_id: string;
  tenant_id: string;
  created_at: string;
}

// ============================================================================
// API RESPONSE WRAPPERS
// ============================================================================

export interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
}

export interface ApiError {
  detail: string;
  status?: number;
  code?: string;
}

// ============================================================================
// WIDGET CONFIGURATION
// ============================================================================

export interface WidgetConfig {
  project_id: string;
  api_key: string;
  primary_color?: string;
  position?: 'bottom-right' | 'bottom-left';
  theme?: 'dark' | 'light' | 'auto';
  welcome_message?: string;
}
