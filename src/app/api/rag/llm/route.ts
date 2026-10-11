import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { provider, apiKey, question, passages } = body as {
      provider: string;
      apiKey: string;
      question: string;
      passages: { pText: string; docTitle: string }[];
    };

    const effectiveApiKey = (apiKey || '').trim() || (process.env.GEMINI_API_KEY || '').trim() || (process.env.GROQ_API_KEY || '').trim() || (process.env.OPENAI_API_KEY || '').trim();
    const effectiveProvider = provider || (process.env.GEMINI_API_KEY ? 'gemini' : process.env.GROQ_API_KEY ? 'groq' : 'gemini');

    if (!effectiveApiKey || !question) {
      return NextResponse.json({ error: 'API Key dan pertanyaan wajib diisi.' }, { status: 400 });
    }

    const contextStr = (passages || [])
      .map((p: { pText: string; docTitle: string }, idx: number) => `[Sumber Dokumen ${idx + 1}: ${p.docTitle}]\n${p.pText}`)
      .join('\n\n');

    const systemPrompt = `Anda adalah Ainya, Asisten Riset AI tingkat lanjut yang sangat pintar, analitis, dan berpengetahuan mendalam dalam mengkaji skripsi, tugas akhir, tesis, jurnal, dan dokumen riset ilmiah.
Tugas Anda: Berikan jawaban yang MENDALAM, KOMPREHENSIF, LENGKAP, dan BERBOBOT ILMIAH dalam Bahasa Indonesia berdasarkan konteks dokumen yang diberikan.

PANDUAN JAWABAN (SANGAT PENTING):
1. DILARANG KERAS memberikan jawaban yang terlalu singkat atau hanya 1-2 baris. Pengguna membutuhkan penjelasan yang komprehensif, kaya informasi, dan berbobot!
2. Jika pengguna menanyakan tentang isi dokumen (misalnya "apa isi filenya ini", "jelaskan isi dokumen ini", "rangkum riset ini"):
   - Berikan **Ringkasan Eksekutif**: Gambaran umum dokumen dan fokus utama kajian.
   - Uraikan **Latar Belakang & Permasalahan**: Konteks masalah yang melandasi riset tersebut.
   - Jelaskan **Tujuan Penelitian & Metodologi**: Metode yang dipakai, alur pengumpulan data, dan pendekatan analisis.
   - Paparkan **Temuan Kunci, Analisis Teknis, & Pembahasan**: Jabarkan secara detail poin-poin temuan, evaluasi data, atau celah yang ditemukan.
   - Sajikan **Kesimpulan & Rekomendasi Praktis**: Hasil akhir riset dan langkah implementasi nyata.
3. Format Markdown yang Elegan:
   - Gunakan judul bab dengan heading (### Judul Bagian).
   - Gunakan bullet points atau penomoran dengan teks tebal (**Kata Kunci**:) disertai elaborasi 2-4 kalimat di setiap poin.
   - Tambahkan tabel jika ada data komparatif.
4. Selipkan sitasi nomor dokumen seperti [1] pada setiap poin temuan atau klaim penting.
5. Nada bicara: Cerdas, akademis, profesional, dan kaya wawasan riset.`;

    const userPrompt = `KONTEKS DOKUMEN:\n${contextStr}\n\nPERTANYAAN PENGGUNA:\n${question}`;

    let resultText: string | null = null;
    let errorDetail = '';

    if (effectiveProvider === 'gemini') {
      const trimmedKey = effectiveApiKey;
      if (!trimmedKey.startsWith('AIzaSy') && !trimmedKey.startsWith('AQ.') && trimmedKey.length < 20) {
        return NextResponse.json(
          {
            success: false,
            error: `API Key Gemini tidak valid. Dapatkan key resmi di: https://aistudio.google.com/app/apikey`,
          },
          { status: 400 }
        );
      }

      // Try active Gemini models (Gemini 3.8 Flash, 3.6 Flash, 2.5 Flash, flash-latest)
      const models = ['gemini-3.8-flash', 'gemini-3.6-flash', 'gemini-2.5-flash', 'gemini-flash-latest'];
      const allErrors: string[] = [];

      for (const model of models) {
        try {
          const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${trimmedKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [
                  {
                    parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
                  },
                ],
                generationConfig: {
                  temperature: 0.3,
                  maxOutputTokens: 4096,
                },
              }),
            }
          );

          if (res.ok) {
            const data = await res.json();
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text && text.trim().length > 0) {
              resultText = text;
              break;
            }
          } else {
            const errBody = await res.text();
            allErrors.push(`${model}: HTTP ${res.status}`);
            console.warn(`Gemini ${model} failed (${res.status}):`, errBody.slice(0, 300));
          }
        } catch (e) {
          allErrors.push(`${model}: ${e instanceof Error ? e.message : String(e)}`);
          console.warn(`Gemini ${model} exception:`, e);
        }
      }

      if (!resultText) {
        errorDetail = `Semua model Gemini gagal: ${allErrors.join(' | ')}. Pastikan API Key valid (dimulai AIzaSy...) dan kuota belum habis.`;
      }
    } else if (effectiveProvider === 'groq') {
      try {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${effectiveApiKey}`,
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt },
            ],
            temperature: 0.3,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          resultText = data?.choices?.[0]?.message?.content || null;
        } else {
          errorDetail = `Groq HTTP ${res.status}: ${await res.text()}`;
        }
      } catch (e) {
        errorDetail = `Groq error: ${e instanceof Error ? e.message : String(e)}`;
      }
    } else if (effectiveProvider === 'openai') {
      try {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${effectiveApiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt },
            ],
            temperature: 0.3,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          resultText = data?.choices?.[0]?.message?.content || null;
        } else {
          errorDetail = `OpenAI HTTP ${res.status}: ${await res.text()}`;
        }
      } catch (e) {
        errorDetail = `OpenAI error: ${e instanceof Error ? e.message : String(e)}`;
      }
    }

    if (resultText) {
      return NextResponse.json({ success: true, answer: resultText });
    }

    return NextResponse.json(
      { success: false, error: errorDetail || 'Tidak ada respons dari AI provider.' },
      { status: 502 }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown LLM proxy error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
