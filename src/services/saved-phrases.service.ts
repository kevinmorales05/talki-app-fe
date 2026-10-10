const API_BASE = import.meta.env["VITE_API_BASE"] || "http://localhost:3000";

export interface CreateSavedPhrasePayload {
  user_id: string;
  kid_id: string;
  phrase: any[];
  topic?: string;
  examples?: any[];
}

export const SavedPhrasesService = {
  async getSavedPhrases(userId: string, kidId: string) {
    const response = await fetch(`${API_BASE}/saved-phrases/${userId}/${kidId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch saved phrases: ${response.statusText}`);
    }
    return response.json();
  },

  async savePhrase(payload: CreateSavedPhrasePayload) {
    const response = await fetch(`${API_BASE}/saved-phrases`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error(`Failed to save phrase: ${response.statusText}`);
    }
    return response.json();
  },
};
