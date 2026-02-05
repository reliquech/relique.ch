import type { PaginatedListResponse, Task } from "@/lib/types";

export interface TasksListParams {
  status?: "open" | "done";
  due?: "overdue" | "today" | "upcoming";
  page?: number;
  pageSize?: number;
}

export interface TaskCreateInput {
  title: string;
  description?: string | null;
  status?: "open" | "done";
  priority?: "low" | "medium" | "high";
  due_at?: string | null;
  entity_type?: "lead" | "deal" | "message" | "customer" | null;
  entity_id?: string | null;
}

export interface TaskUpdateInput {
  title?: string;
  description?: string | null;
  status?: "open" | "done";
  priority?: "low" | "medium" | "high";
  due_at?: string | null;
  entity_type?: "lead" | "deal" | "message" | "customer" | null;
  entity_id?: string | null;
}

async function parseError(response: Response, prefix: string): Promise<never> {
  let message = response.statusText;
  try {
    const data = await response.json();
    if (data.error) message = data.error;
  } catch {
    // ignore
  }
  throw new Error(`${prefix}: ${message}`);
}

class TasksAPIService {
  private baseUrl = "/api/tasks";

  async list(params?: TasksListParams): Promise<PaginatedListResponse<Task>> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set("status", params.status);
    if (params?.due) searchParams.set("due", params.due);
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.pageSize) searchParams.set("pageSize", String(params.pageSize));

    const response = await fetch(`${this.baseUrl}?${searchParams.toString()}`);
    if (!response.ok) return parseError(response, "Failed to fetch tasks");
    return response.json();
  }

  async create(payload: TaskCreateInput): Promise<Task> {
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) return parseError(response, "Failed to create task");
    return response.json();
  }

  async update(id: string, payload: TaskUpdateInput): Promise<Task> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) return parseError(response, "Failed to update task");
    return response.json();
  }

  async remove(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, { method: "DELETE" });
    if (!response.ok) return parseError(response, "Failed to delete task");
  }
}

export const tasksService = new TasksAPIService();
