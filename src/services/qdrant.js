export async function searchQdrant(vector, topK = 5) {
    const QDRANT_API_KEY = process.env.QDRANT_API_KEY
    const QDRANT_URL = process.env.QDRANT_URL
    if (!QDRANT_URL || !QDRANT_API_KEY) {
      throw new Error("Missing Qdrant configuration in environment variables");
    }
    const resp = await fetch(`${QDRANT_URL}/collections/news_docs/points/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": QDRANT_API_KEY,
      },
      body: JSON.stringify({
        vector,
        limit: topK,
        with_payload: true,
      }),
    });
    const data = await resp.json();
    return data.result.map(r => r.payload);
  }