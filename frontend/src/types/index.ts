// API Response Types

export interface User {
  id: string;
  email: string;
  is_active: boolean;
  is_superuser: boolean;
  tenant_id: string;
  created_at: string;
}

export interface Tenant {
  id: string;
  name: string;
  is_active: boolean;
  tokens_used: number;
  tokens_limit: number;
  posts_count: number;
  posts_limit: number;
  created_at: string;
}

export interface Agent {
  id: string;
  tenant_id: string;
  name: string;
  description?: string;
  tone_style: string;
  keywords: string[];
  target_audience?: string;
  seo_focus: string;
  is_active: boolean;
  schedule_cron?: string;
  last_generation?: string;
  created_at: string;
  updated_at: string;
  settings?: {
    language?: string;
    [key: string]: any;
  };
}

export interface Post {
  id: string;
  agent_id: string;
  tenant_id: string;
  title: string;
  meta_title: string;
  meta_description: string;
  content: string;
  status: 'draft' | 'published' | 'scheduled' | 'failed';
  published_url?: string;
  scheduled_at?: string;
  word_count: number;
  readability_score: number;
  seo_score: number;
  tokens_used: number;
  cost_usd: number;
  created_at: string;
  updated_at: string;
  agent?: Agent;
}

export interface Source {
  id: string;
  agent_id: string;
  tenant_id: string;
  name: string;
  source_type: 'rss' | 'api' | 'webhook';
  config: Record<string, any>;
  is_active: boolean;
  last_fetch?: string;
  created_at: string;
  updated_at: string;
}

export interface Publisher {
  id: string;
  agent_id: string;
  tenant_id: string;
  name: string;
  publisher_type: 'wordpress' | 'webhook' | 'api';
  config: Record<string, any>;
  is_active: boolean;
  last_publish?: string;
  created_at: string;
  updated_at: string;
}

export interface TaskStatus {
  task_id: string;
  status: 'PENDING' | 'STARTED' | 'SUCCESS' | 'FAILURE' | 'RETRY' | 'REVOKED';
  result?: any;
  error?: string;
}

export interface HealthCheck {
  celery_status: string;
  workers_online: boolean;
  health_check_result?: {
    success: boolean;
    timestamp: string;
    worker: string;
    database: string;
  };
}

// API Request Types

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface CreateAgentRequest {
  name: string;
  description?: string;
  tone_style: string;
  keywords: string[];
  target_audience?: string;
  seo_focus: string;
  schedule_cron?: string;
  settings?: {
    language?: string;
    [key: string]: any;
  };
}

export interface CreatePostRequest {
  agent_id: string;
  topic: string;
  keyword: string;
}

export interface CreateSourceRequest {
  agent_id: string;
  name: string;
  source_type: 'rss' | 'api' | 'webhook';
  config: Record<string, any>;
}

export interface CreatePublisherRequest {
  agent_id: string;
  name: string;
  publisher_type: 'wordpress' | 'webhook' | 'api';
  config: Record<string, any>;
}

export interface TriggerTaskRequest {
  agent_id: string;
  topic?: string;
  keyword?: string;
}

// Dashboard Statistics
export interface DashboardStats {
  total_posts: number;
  total_agents: number;
  tokens_used: number;
  tokens_limit: number;
  posts_this_month: number;
  recent_posts: Post[];
  active_tasks: number;
}
