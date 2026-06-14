import type { PipelineStage } from "@/lib/types/admin";

export interface PipelineStagesListParams {
  sort?: "position" | "name";
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

class PipelineStagesAPIService {
  private baseUrl = "/api/pipeline-stages";

  async list(params?: PipelineStagesListParams): Promise<{ items: PipelineStage[] }> {
    const searchParams = new URLSearchParams();
    if (params?.sort) searchParams.set("sort", params.sort);

    const url = searchParams.toString() ? `${this.baseUrl}?${searchParams.toString()}` : this.baseUrl;
    const response = await fetch(url);
    if (!response.ok) return parseError(response, "Failed to fetch pipeline stages");
    return response.json();
  }

  async getById(id: string): Promise<PipelineStage | null> {
    const response = await fetch(`${this.baseUrl}/${id}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      return parseError(response, "Failed to fetch pipeline stage");
    }
    return response.json();
  }

  async create(payload: Record<string, unknown>): Promise<PipelineStage> {
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) return parseError(response, "Failed to create pipeline stage");
    return response.json();
  }

  async update(id: string, payload: Record<string, unknown>): Promise<PipelineStage> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) return parseError(response, "Failed to update pipeline stage");
    return response.json();
  }

  async delete(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, { method: "DELETE" });
    if (!response.ok) return parseError(response, "Failed to delete pipeline stage");
  }
}

export const pipelineStagesService = new PipelineStagesAPIService();
