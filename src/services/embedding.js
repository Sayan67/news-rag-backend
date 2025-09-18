// embedding.js
export async function getEmbedding(query) {
  const JINA_API_KEY = process.env.JINA_API_KEY;
  if (!JINA_API_KEY) {
    throw new Error("Missing Jina API key in environment variables");
  }
  const resp = await fetch("https://api.jina.ai/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${JINA_API_KEY}`,
    },
    body: JSON.stringify({
      model: "jina-embeddings-v3",
      input: [query],
    }),
  });
  const data = await resp.json();
  //   console.log(data.data[0].embedding);

  return data.data[0].embedding; // 2048-dim vector
}
