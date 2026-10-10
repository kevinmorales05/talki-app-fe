const API_BASE = import.meta.env["VITE_API_BASE"] || "http://localhost:3000";

export interface Topic {
  id: string;
  name: string;
  emoji: string;
}

export const GamesService = {
  async getTopics(): Promise<Topic[]> {
    const response = await fetch(`${API_BASE}/games/topics`);
    if (!response.ok) {
      throw new Error(`Failed to fetch topics: ${response.statusText}`);
    }
    return response.json();
  },

  async generatePracticeGames(topic?: string) {
    const response = await fetch(`${API_BASE}/games/generatePracticeGames`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ topic }),
    });
    if (!response.ok) {
      throw new Error(`Failed to generate practice games: ${response.statusText}`);
    }
    return response.json();
  }
};
