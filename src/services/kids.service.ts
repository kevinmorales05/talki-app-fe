const API_BASE = import.meta.env["VITE_API_BASE"] || "http://localhost:3000";

export interface CreateKidPayload {
  name: string;
  lastname: string;
  birthday: string;
  user_id: string;
  specialNeed: string;
}

export const KidsService = {
  async getKidsByUserId(userId: string) {
    const response = await fetch(`${API_BASE}/kids/user/${userId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch kids: ${response.statusText}`);
    }
    return response.json();
  },

  async createKid(payload: CreateKidPayload) {
    const response = await fetch(`${API_BASE}/kids`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error(`Failed to create kid: ${response.statusText}`);
    }
    return response.json();
  },
};
