'use client';

import React, { useState, useEffect } from 'react';
import { 
  Key, 
  Sparkles, 
  Check, 
  ExternalLink, 
  ShieldCheck, 
  Cpu, 
  X, 
  HelpCircle, 
  AlertTriangle, 
  CheckCircle2, 
  Loader2, 
  AlertCircle 
} from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose }) => {
  const [provider, setProvider] = useState<'gemini' | 'groq' | 'openai'>('gemini');
  const [apiKey, setApiKey] = useState<string>('');
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [showKey, setShowKey] = useState<boolean>(false);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedKey = localStorage.getItem('ainya_api_key') || '';
      const savedProvider = (localStorage.getItem('ainya_ai_provider') as 'gemini' | 'groq' | 'openai') || 'gemini';
      setApiKey(savedKey);
      setProvider(savedProvider);
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const trimmedKey = apiKey.trim();

  // Real-time format validation
  const getFormatValidation = () => {
    if (!trimmedKey) return null;

    if (provider === 'gemini') {
      if (trimmedKey.startsWith('AIzaSy') || trimmedKey.startsWith('AQ.') || trimmedKey.length >= 20) {
        return { valid: true, message: 'Format valid: Sesuai dengan Google AI Studio API Key.' };
      }
      return {
        valid: false,
        message: 'Format tidak sesuai. Pastikan key disalin lengkap dari Google AI Studio.',
      };
    }

    if (provider === 'groq') {
      if (trimmedKey.startsWith('gsk_')) {
        return { valid: true, message: 'Format valid: Sesuai dengan Groq Cloud API Key.' };
      }
      return {
        valid: false,
        message: 'Format salah! API Key Groq biasanya diawali dengan "gsk_...".',
      };
    }

    if (provider === 'openai') {
      if (trimmedKey.startsWith('sk-')) {
        return { valid: true, message: 'Format valid: Sesuai dengan OpenAI API Key.' };
      }
      return {
        valid: false,
        message: 'Format salah! API Key OpenAI diawali dengan "sk-...".',
      };
    }

    return null;
  };

  const validation = getFormatValidation();

  const handleTestConnection = async () => {
    if (!trimmedKey) {
      setTestResult({ success: false, message: 'Masukkan API Key terlebih dahulu.' });
      return;
    }

    if (provider === 'gemini' && !trimmedKey.startsWith('AIzaSy') && !trimmedKey.startsWith('AQ.') && trimmedKey.length < 20) {
      setTestResult({
        success: false,
        message: 'Format key tidak valid. Silakan periksa kembali API Key Google Gemini Anda.',
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/rag/llm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          apiKey: trimmedKey,
          question: 'Tes koneksi sistem: Jawab dengan persis kata "Koneksi Berhasil!"',
          passages: [],
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setTestResult({
          success: true,
          message: `Koneksi Berhasil! Model ${provider.toUpperCase()} aktif dan merespons.`,
        });
      } else {
        setTestResult({
          success: false,
          message: data.error || 'Gagal menghubungi AI provider.',
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setTestResult({
        success: false,
        message: `Terjadi error jaringan: ${msg}`,
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ainya_api_key', trimmedKey);
      localStorage.setItem('ainya_ai_provider', provider);
      setIsSaved(true);
      setTimeout(() => {
        setIsSaved(false);
        onClose();
      }, 1200);
    }
  };

  const handleClear = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ainya_api_key');
      setApiKey('');
      setTestResult(null);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border panel-border rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative">
        {/* Header */}
        <div className="p-5 border-b panel-border bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                Pengaturan AI Engine (Ainya Brain)
              </h3>
              <p className="text-xs text-slate-400">Hubungkan API Key untuk kecerdasan AI generatif penuh</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Status Badge */}
          <div className={`p-3.5 rounded-xl border flex items-center gap-3 text-xs ${
            trimmedKey ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300' : 'bg-amber-950/30 border-amber-500/40 text-amber-300'
          }`}>
            <ShieldCheck className="w-5 h-5 shrink-0" />
            <div>
              <span className="font-semibold block">
                {trimmedKey ? `Status: Terhubung (${provider.toUpperCase()} AI Active)` : 'Status: RAG Organik Lokal Active'}
              </span>
              <span className="text-[11px] opacity-80">
                {trimmedKey 
                  ? 'Ainya menggunakan model LLM generatif untuk menjawab pertanyaan secara cerdas & otomatis.' 
                  : 'Ainya saat ini menggunakan pencarian paragraf dinamis lokal. Masukkan API key gratis untuk otak AI penuh!'}
              </span>
            </div>
          </div>

          {/* Provider Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Pilih Provider AI</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => { setProvider('gemini'); setTestResult(null); }}
                className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                  provider === 'gemini'
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200 shadow-sm'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Cpu className="w-4 h-4 text-indigo-400" />
                <span>Google Gemini</span>
                <span className="text-[9px] text-emerald-400 font-mono">Disarankan (Gratis)</span>
              </button>

              <button
                type="button"
                onClick={() => { setProvider('groq'); setTestResult(null); }}
                className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                  provider === 'groq'
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200 shadow-sm'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Key className="w-4 h-4 text-purple-400" />
                <span>Groq Llama-3</span>
                <span className="text-[9px] text-purple-400 font-mono">Super Cepat</span>
              </button>

              <button
                type="button"
                onClick={() => { setProvider('openai'); setTestResult(null); }}
                className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                  provider === 'openai'
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200 shadow-sm'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>OpenAI GPT-4o</span>
                <span className="text-[9px] text-slate-400 font-mono">Berbayar</span>
              </button>
            </div>
          </div>

          {/* Quick Guide for Gemini */}
          {provider === 'gemini' && (
            <div className="bg-indigo-950/30 border border-indigo-500/30 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-indigo-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  Cara Ambil API Key Gemini Gratis:
                </span>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold underline underline-offset-2"
                >
                  <span>Buka AI Studio</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <ol className="text-[11px] text-slate-300 space-y-1 list-decimal list-inside leading-relaxed opacity-90">
                <li>Buka link <strong>aistudio.google.com/app/apikey</strong></li>
                <li>Klik tombol <strong>&quot;Create API Key&quot;</strong></li>
                <li>Pastikan copy key yang tertera (biasanya diawali <code className="bg-indigo-900/60 text-indigo-200 px-1 py-0.5 rounded font-mono font-bold">AQ...</code> atau <code className="bg-indigo-900/60 text-indigo-200 px-1 py-0.5 rounded font-mono font-bold">AIzaSy...</code>)</li>
              </ol>
            </div>
          )}

          {/* API Key Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Masukkan {provider === 'gemini' ? 'Google Gemini' : provider === 'groq' ? 'Groq' : 'OpenAI'} API Key
              </label>
            </div>

            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setTestResult(null);
                }}
                placeholder={provider === 'gemini' ? 'AIzaSy...' : provider === 'groq' ? 'gsk_...' : 'sk-...'}
                className={`w-full bg-slate-950 border rounded-xl px-4 py-2.5 text-xs text-slate-100 font-mono placeholder:text-slate-600 focus:outline-none transition-colors pr-20 ${
                  validation && !validation.valid
                    ? 'border-rose-500/70 focus:border-rose-500'
                    : validation && validation.valid
                    ? 'border-emerald-500/70 focus:border-emerald-500'
                    : 'panel-border focus:border-indigo-500'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-slate-400 hover:text-slate-200 bg-slate-900 px-2 py-1 rounded border panel-border"
              >
                {showKey ? 'Sembunyikan' : 'Tampilkan'}
              </button>
            </div>

            {/* Validation Feedback */}
            {validation && (
              <div
                className={`mt-2 p-2.5 rounded-lg border flex items-start gap-2 text-xs ${
                  validation.valid
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                }`}
              >
                {validation.valid ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                )}
                <span>{validation.message}</span>
              </div>
            )}

            {/* Test Connection Button & Status */}
            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting || !trimmedKey}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-xs font-medium border border-slate-700 transition-colors flex items-center gap-1.5"
              >
                {isTesting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                    <span>Menguji Koneksi...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Tes Koneksi API</span>
                  </>
                )}
              </button>
              <span className="text-[10px] text-slate-500">Uji apakah API key aktif & valid</span>
            </div>

            {testResult && (
              <div
                className={`mt-2 p-2.5 rounded-lg border flex items-start gap-2 text-xs ${
                  testResult.success
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}

            <p className="text-[10px] text-slate-500 mt-2 flex items-center gap-1">
              <HelpCircle className="w-3 h-3 shrink-0" />
              <span>API Key disimpan secara aman di localStorage browser PC Anda saja.</span>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t panel-border bg-slate-950/60 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleClear}
            className="px-4 py-2 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold transition-all"
          >
            Hapus Key
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all shadow-md flex items-center gap-1.5"
            >
              {isSaved ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Tersimpan!</span>
                </>
              ) : (
                <span>Simpan Pengaturan</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
