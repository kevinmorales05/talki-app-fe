const API_BASE = import.meta.env["VITE_API_BASE"] || "http://localhost:3000";

export interface CreateUserPayload {
  name: string;
  lastname: string;
  email: string;
  firebase_id: string;
}

export const UsersService = {
  async findByEmail(email: string) {
    const response = await fetch(`${API_BASE}/users/email/${email}`);
    if (!response.ok) {
      if (response.status === 404) return null; // Expected when user doesn't exist
      throw new Error(`Failed to fetch user: ${response.statusText}`);
    }
    return response.json();
  },

  async createUser(payload: CreateUserPayload) {
    const response = await fetch(`${API_BASE}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error(`Failed to create user: ${response.statusText}`);
    }
    return response.json();
  },

  async findById(id: string) {
    const response = await fetch(`${API_BASE}/users/${id}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`Failed to fetch user: ${response.statusText}`);
    }
    return response.json();
  },
};
