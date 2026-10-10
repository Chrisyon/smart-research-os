'use client';

import React, { useState } from 'react';
import { Layers, RotateCcw, CheckCircle2, ChevronLeft, ChevronRight, Sparkles, Shuffle, HelpCircle } from 'lucide-react';
import { Flashcard } from '@/types';

const SAMPLE_FLASHCARDS: Flashcard[] = [
  {
    id: 'fc-1',
    deck_id: 'deck-1',
    question: 'What is the primary motivation for replacing RNNs with Self-Attention in Transformers?',
    answer: 'RNNs process tokens sequentially, creating a temporal bottleneck that prevents parallelization across GPUs. Self-attention computes dependencies across all sequence positions simultaneously in parallel.',
    difficulty: 'medium',
    created_at: '2026-10-10T00:00:00.000Z',
  },
  {
    id: 'fc-2',
    deck_id: 'deck-1',
    question: 'Why is scaling by 1/sqrt(d_k) necessary in Scaled Dot-Product Attention?',
    answer: 'For large values of d_k, the dot products grow large in magnitude, pushing the softmax function into regions with extremely small gradients. Dividing by sqrt(d_k) stabilizes the variance.',
    difficulty: 'hard',
    created_at: '2026-10-10T00:00:00.000Z',
  },
  {
    id: 'fc-3',
    deck_id: 'deck-1',
    question: 'What is the role of Parameterized Quantum Circuits in Quantum Neural Networks?',
    answer: 'PQCs act as the trainable layer weights in a quantum network, applying tunable qubit rotations to execute quantum optimization routines.',
    difficulty: 'medium',
    created_at: '2026-10-10T00:00:00.000Z',
  },
];

export const FlashcardHub: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [cards, setCards] = useState<Flashcard[]>(SAMPLE_FLASHCARDS);

  const currentCard = cards[currentIndex] || cards[0];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((i) => (i + 1) % cards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((i) => (i - 1 + cards.length) % cards.length);
  };

  const handleShuffle = () => {
    setIsFlipped(false);
    setCards([...cards].sort(() => Math.random() - 0.5));
    setCurrentIndex(0);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      {/* Title Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-semibold uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5" /> AI Study & Mastery Hub
          </div>
          <h1 className="text-2xl font-bold text-white">Interactive Research Flashcards</h1>
          <p className="text-xs text-gray-400">Card {currentIndex + 1} of {cards.length}</p>
        </div>

        <button
          onClick={handleShuffle}
          className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-300 flex items-center gap-2 transition-colors border border-white/10"
        >
          <Shuffle className="w-4 h-4 text-cyan-400" /> Shuffle Cards
        </button>
      </div>

      {/* 3D Flip Flashcard */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="w-full min-h-[320px] rounded-3xl glass-panel border border-white/10 p-10 cursor-pointer flex flex-col justify-between transition-all duration-500 hover:border-cyan-500/40 glow-indigo relative group"
      >
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span className="font-mono text-cyan-400 uppercase tracking-widest text-[10px] font-bold">
            {isFlipped ? 'ANSWER REVEALED' : 'QUESTION'}
          </span>
          <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-gray-300">
            Click card to flip
          </span>
        </div>

        <div className="my-auto py-6">
          {!isFlipped ? (
            <h2 className="text-xl font-bold text-white leading-relaxed text-center">
              {currentCard.question}
            </h2>
          ) : (
            <p className="text-base text-cyan-100 leading-relaxed text-center font-serif">
              {currentCard.answer}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-white/10 text-xs text-gray-400">
          <span className="capitalize text-cyan-300">Difficulty: {currentCard.difficulty}</span>
          <span className="text-gray-500 group-hover:text-cyan-400 transition-colors flex items-center gap-1">
            <RotateCcw className="w-3.5 h-3.5" /> Flip Card
          </span>
        </div>
      </div>

      {/* Rating & Navigation Controls */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={handlePrev}
          className="p-3 rounded-2xl bg-gray-900 border border-white/10 hover:border-cyan-500/40 text-gray-300 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Self-Assessment Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleNext}
            className="px-5 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition-all"
          >
            Easy (Mastered)
          </button>
          <button
            onClick={handleNext}
            className="px-5 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold transition-all"
          >
            Medium (Review Later)
          </button>
          <button
            onClick={handleNext}
            className="px-5 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 text-xs font-bold transition-all"
          >
            Hard (Re-study)
          </button>
        </div>

        <button
          onClick={handleNext}
          className="p-3 rounded-2xl bg-gray-900 border border-white/10 hover:border-cyan-500/40 text-gray-300 hover:text-white transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
