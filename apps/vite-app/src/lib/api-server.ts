const API_BASE = "http://localhost:3001";

export const api = {
  async getContent(format: "json" | "html" = "json") {
    const res = await fetch(`${API_BASE}/content/${format}`);
    const data = await res.json();
    return data.content;
  },

  async saveContent(content: string, format: "json" | "html" = "json") {
    const res = await fetch(`${API_BASE}/content/${format}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    return res.json();
  },

  async reset(format?: "json" | "html") {
    const res = await fetch(`${API_BASE}/content/reset`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ format }),
    });
    return res.json();
  },
};
