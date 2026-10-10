export interface EmbeddingOptions {
  provider?: 'openai' | 'gemini' | 'local';
  dimension?: number;
}

export async function generateEmbedding(
  text: string,
  options: EmbeddingOptions = {}
): Promise<number[]> {
  const provider = options.provider || process.env.LLM_PROVIDER || 'local';
  const dim = options.dimension || 1536;

  if (provider === 'openai' && process.env.OPENAI_API_KEY) {
    try {
      const res = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          input: text,
          model: process.env.EMBEDDING_MODEL || 'text-embedding-3-small',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        return data.data[0].embedding;
      }
    } catch (e) {
      console.warn('OpenAI embedding failed, falling back to local vector generator:', e);
    }
  }

  // Fallback: Deterministic 1536-dim normalized vector generator based on text hashing
  return generateLocalEmbedding(text, dim);
}

export function generateLocalEmbedding(text: string, dim: number = 1536): number[] {
  const vector: number[] = new Array(dim).fill(0);
  const normalized = text.toLowerCase();

  for (let i = 0; i < normalized.length; i++) {
    const charCode = normalized.charCodeAt(i);
    const index = (charCode * 31 + i * 17) % dim;
    vector[index] += Math.sin(charCode) * 0.1;
  }

  // Calculate norm for cosine normalization
  let norm = 0;
  for (let i = 0; i < dim; i++) {
    norm += vector[i] * vector[i];
  }
  norm = Math.sqrt(norm) || 1;

  for (let i = 0; i < dim; i++) {
    vector[i] = vector[i] / norm;
  }

  return vector;
}

export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  const len = Math.min(vecA.length, vecB.length);
  for (let i = 0; i < len; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;
  return dotProduct / denominator;
}
