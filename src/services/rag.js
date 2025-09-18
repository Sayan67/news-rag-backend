// rag.js
import { getAIInstance as geminiModel } from "./gemini.js";
import { getEmbedding } from "./embedding.js";
import { searchQdrant } from "./qdrant.js";


export async function answerQuery(query, onToken = null) {
  // 1. Embed query
  const embedding = await getEmbedding(query);
  // console.log("Query embedding obtained", embedding, embedding.length);
  // 2. Retrieve top passages
  const results = await searchQdrant(embedding, 5);
  // console.log("Retrieved passages:", results);
  const context = results.map((r, i) => `(${i + 1}) ${r.text}`).join("\n\n");
  
  // 3. Build prompt
  const prompt = `Answer the question using the following passages:\n\n${context}\n\nQuestion: ${query}\nAnswer: The answer should not contain any references like "the provided passage" and the answer should be well elaborated. if you don't know the answer, just say "Sorry! Currently I don't have the information about that.".`;
  
  // 4A. Streaming mode
  if (onToken) {
    const stream = await geminiModel().models.generateContentStream({contents:prompt, model: "gemini-2.0-flash"});
    
    let fullText = "";
    for await (const chunk of stream) {
      const text = chunk.text;
      if (text) {
        fullText += text;
        onToken(text);
      }
    }
    return fullText;
  }
  
  // 4B. Non-streaming mode
  const result = await geminiModel().generateContent(prompt);
  return result.response.text();
}

