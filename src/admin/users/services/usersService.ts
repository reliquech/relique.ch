export interface UserRow {
  id: string;
  email: string | null;
  display_name: string | null;
  role: "admin" | "editor" | "viewer";
  created_at: string;
}

export interface InviteUserInput {
  email: string;
  display_name?: string;
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

class UsersAPIService {
  private baseUrl = "/api/users";

  async list(): Promise<UserRow[]> {
    const response = await fetch(this.baseUrl);
    if (!response.ok) return parseError(response, "Failed to fetch users");
    return response.json();
  }

  async invite(payload: InviteUserInput): Promise<{ id: string; email: string | null }> {
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) return parseError(response, "Failed to invite user");
    return response.json();
  }

  async updateRole(id: string, role: "admin" | "editor" | "viewer"): Promise<UserRow> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    if (!response.ok) return parseError(response, "Failed to update role");
    return response.json();
  }
}

export const usersService = new UsersAPIService();
