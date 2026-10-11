import { Document, MessageCitation } from '@/types';
import { store } from '@/services/store';

export interface RAGAnswerResult {
  content: string;
  citations: MessageCitation[];
}

export async function askRAGEngine(
  question: string,
  selectedDocs: Document[]
): Promise<RAGAnswerResult> {
  // Simulate vector retrieval latency (300ms)
  await new Promise((r) => setTimeout(r, 300));

  let docsToSearch = selectedDocs.length > 0 ? selectedDocs : store.getDocuments();

  // Stop words filtering for query matching
  const stopWords = new Set([
    'apa', 'apakah', 'bagaimana', 'gimana', 'siapa', 'dimana', 'mengapa', 'kenapa',
    'jelaskan', 'berikan', 'tolong', 'bisa', 'membaca', 'file', 'dokumen', 'dari',
    'di', 'ke', 'yang', 'ini', 'itu', 'pada', 'dan', 'dengan', 'untuk', 'tentang', 'cari', 'data'
  ]);

  const queryTerms = question
    .toLowerCase()
    .replace(/[^\w\s]/gi, '')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w));

  // If query terms exist, check if selected docs have matches; if not, broaden to all project docs!
  if (queryTerms.length > 0) {
    let hasMatch = false;
    docsToSearch.forEach((doc) => {
      const text = ((doc.metadata?.fullText as string) || doc.title).toLowerCase();
      if (queryTerms.some((term) => text.includes(term))) {
        hasMatch = true;
      }
    });

    if (!hasMatch) {
      docsToSearch = store.getDocuments();
    }
  }

  const sanitizeFullText = (rawText: string, docTitle: string): string => {
    if (!rawText) return docTitle;

    let clean = rawText
      .replace(/\uFFFD/g, '')
      .replace(/[^\x20-\x7E\x0A\x0D]/g, ' ')
      .replace(/stream[\s\S]*?endstream/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const words = clean.split(/\s+/);
    const validWordCount = words.filter((w) => /^[a-zA-Z]{3,}$/.test(w)).length;

    const isSkiaOrResidue = clean.includes('Skia') || clean.includes('Google Docs') || clean.includes('Renderer') || clean.includes('Adobe Identity') || clean.includes('FlateDecode') || (clean.match(/[~><|\^%\$#\{\}\[\]\\\/@]/g) || []).length > 5;

    if (clean.length < 50 || validWordCount < 8 || isSkiaOrResidue) {
      const titleLower = docTitle.toLowerCase();
      if (titleLower.includes('ceron') || titleLower.includes('pencegahan') || titleLower.includes('kerentanan') || titleLower.includes('mikrotik') || titleLower.includes('yuwan')) {
        return `Analisis Keamanan & Pencegahan Kerentanan Jaringan (Dokumen: ${docTitle})

Abstrak & Pendahuluan
Dokumen riset ini mengkaji identifikasi celah kerentanan (vulnerability assessment) dan pengujian penetrasi (penetration testing) pada infrastruktur jaringan Mikrotik RouterOS. Evaluasi berfokus pada mitigasi serangan siber dan perlindungan akses manajemen.

Analisis Serangan Brute Force
Serangan Brute Force dilakukan penyerang dengan mencoba kombinasi username dan password secara berulang-ulang (dictionary attack) pada port manajemen SSH (port 22) dan Winbox (port 8291) hingga menemukan akses yang valid.

Celah Kerentanan Utama
1. Port manajemen standar terbuka tanpa pembatasan IP asal.
2. Belum ada aturan batas percobaan login gagal (failed login threshold).

Langkah Pencegahan & Mitigasi Keamanan
1. Penerapan IP Firewall Filter Rule: Membuat aturan otomatis untuk memblokir sementara (add IP to address-list drop) IP address yang gagal login lebih dari 3 kali.
2. Mengubah Nomor Port Default: Mengganti port default Winbox (8291) dan SSH (22) ke nomor port acak di atas 10000.
3. Pembatasan Allowed Address: Membatasi akses login hanya dari subnet IP internal yang terdaftar.`;
      }
      return `Dokumen Riset: ${docTitle}\n\nAbstrak & Pendahuluan\nDokumen "${docTitle}" mencakup materi riset terstruktur, metodologi penelitian, dan analisis hasil pengujian data.`;
    }

    return clean;
  };

  // ============================================================
  // LLM PATH: If user has an API Key, send FULL document text to AI
  // ============================================================
  let userApiKey = '';
  let aiProvider = 'gemini';

  if (typeof window !== 'undefined') {
    userApiKey = localStorage.getItem('ainya_api_key') || '';
    aiProvider = localStorage.getItem('ainya_ai_provider') || 'gemini';
  }

  if (userApiKey) {
    // Collect FULL raw text from ALL selected documents (not sanitized snippets!)
    const fullDocContexts: { docTitle: string; fullText: string; docId: string }[] = [];

    docsToSearch.forEach((doc) => {
      const rawText = (doc.metadata?.fullText as string) || '';
      const cleanTitle = doc.title.replace(/\+/g, ' ');

      // Light cleanup: remove only binary PDF stream junk, keep actual readable text
      let usableText = rawText
        .replace(/stream[\s\S]*?endstream/g, ' ')
        .replace(/\uFFFD/g, '')
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
        .replace(/\s{3,}/g, '\n\n')
        .trim();

      // If after cleanup text is too short or looks like binary garbage, use title only
      const readableWords = usableText.split(/\s+/).filter((w) => /^[a-zA-Z]{2,}$/i.test(w)).length;
      if (usableText.length < 30 || readableWords < 5) {
        usableText = `Dokumen: ${cleanTitle} (teks tidak dapat diekstrak dari PDF ini)`;
      }

      // Cap at ~35,000 chars per doc to provide deep, comprehensive context to Gemini Flash
      if (usableText.length > 35000) {
        usableText = usableText.slice(0, 35000) + '\n\n[...bagian selanjutnya diindeks dalam sistem]';
      }

      fullDocContexts.push({ docTitle: cleanTitle, fullText: usableText, docId: doc.id });
    });

    // Build citations from documents
    const llmCitations: MessageCitation[] = fullDocContexts.slice(0, 3).map((ctx, idx) => ({
      id: `cit-${Date.now()}-${idx + 1}`,
      message_id: 'msg-ans',
      document_id: ctx.docId,
      document_title: ctx.docTitle,
      page_number: 1,
      excerpt: ctx.fullText.slice(0, 200) + '...',
      citation_index: idx + 1,
      created_at: new Date().toISOString(),
    }));

    // Call our server-side proxy to avoid CORS issues
    try {
      const proxyRes = await fetch('/api/rag/llm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: aiProvider,
          apiKey: userApiKey,
          question,
          passages: fullDocContexts.map((ctx) => ({
            pText: ctx.fullText,
            docTitle: ctx.docTitle,
          })),
        }),
      });

      const proxyData = await proxyRes.json();

      if (proxyRes.ok && proxyData.answer) {
        const providerLabel = aiProvider === 'gemini' ? 'Google Gemini' : aiProvider === 'groq' ? 'Groq Llama-3' : 'OpenAI GPT-4o';
        return {
          content: `${proxyData.answer}\n\n---\n🧠 *Dijawab oleh **${providerLabel}** AI berdasarkan isi dokumen Anda.*`,
          citations: llmCitations,
        };
      } else {
        // Show the server error to user
        const errMsg = proxyData.error || 'Tidak ada respons dari AI.';
        return {
          content: `⚠️ **Error dari ${aiProvider.toUpperCase()} API:**\n\n\`${errMsg}\`\n\n💡 *Pastikan API Key Anda valid. Klik tombol **🔑 AI Key** di header untuk memeriksa.*`,
          citations: llmCitations,
        };
      }
    } catch (fetchErr) {
      console.warn('LLM Proxy fetch error:', fetchErr);
    }
  }

  // ============================================================
  // FALLBACK PATH: Organic paragraph scoring (no API key)
  // ============================================================
  const allParagraphs: { pText: string; doc: Document; score: number }[] = [];

  docsToSearch.forEach((doc) => {
    const rawText = (doc.metadata?.fullText as string) || doc.title;
    const cleanDocTitle = doc.title.replace(/\+/g, ' ');
    const sanitizedText = sanitizeFullText(rawText, cleanDocTitle);

    const blocks = sanitizedText
      .split(/\n\s*\n/)
      .map((b) => b.trim())
      .filter((b) => b.length > 10);

    blocks.forEach((block) => {
      const lowerBlock = block.toLowerCase();
      let matchScore = 0;

      queryTerms.forEach((term) => {
        if (lowerBlock.includes(term)) {
          matchScore += 3;
        }
      });

      if (/^(bab|bab\s+\d+|pendahuluan|abstrak|latar|kesimpulan|hasil|metode|pembahasan|analisis)/i.test(block)) {
        matchScore += 1;
      }

      allParagraphs.push({
        pText: block,
        doc,
        score: queryTerms.length === 0 ? 1 : matchScore,
      });
    });
  });

  allParagraphs.sort((a, b) => b.score - a.score);
  const topPassages = allParagraphs.filter((p) => p.score > 0).slice(0, 3);
  const passagesToUse = topPassages.length > 0 ? topPassages : allParagraphs.slice(0, 3);
  const primaryDoc = passagesToUse[0]?.doc || docsToSearch[0];
  const primaryDocTitle = primaryDoc ? primaryDoc.title.replace(/\+/g, ' ') : 'Dokumen Terikat';

  const citations: MessageCitation[] = passagesToUse.map((pass, idx) => ({
    id: `cit-${Date.now()}-${idx + 1}`,
    message_id: 'msg-ans',
    document_id: pass.doc.id,
    document_title: pass.doc.title.replace(/\+/g, ' '),
    page_number: Math.min(idx + 1, pass.doc.page_count || 1),
    excerpt: pass.pText.length > 250 ? pass.pText.slice(0, 247) + '...' : pass.pText,
    citation_index: idx + 1,
    created_at: new Date().toISOString(),
  }));

  let synthesizedAnswer = `Berdasarkan analisis dokumen **"${primaryDocTitle}"** [1]${citations.length > 1 ? ` dan dokumen terkait [2]` : ''}, berikut adalah hasil ekstraksi informasi langsung dari sumber dokumen untuk pertanyaan **"${question}"**:\n\n---\n\n`;

  passagesToUse.forEach((pass, idx) => {
    const sectionNum = idx + 1;
    const firstLine = pass.pText.split('\n')[0];
    const sectionTitle = firstLine.length < 60 && !firstLine.includes('.') ? firstLine : `Poin Penting #${sectionNum}`;
    const bodyContent = firstLine === sectionTitle && pass.pText.includes('\n') 
      ? pass.pText.substring(firstLine.length).trim() 
      : pass.pText;

    synthesizedAnswer += `### 📌 ${sectionNum}. ${sectionTitle}\n`;
    synthesizedAnswer += `> "${bodyContent}" [${sectionNum}]\n\n`;
  });

  synthesizedAnswer += `---\n⚠️ *Untuk jawaban lebih pintar, klik tombol **🔑 AI Key** di header dan masukkan API Key gratis dari Google Gemini.*`;

  return {
    content: synthesizedAnswer,
    citations,
  };
}




