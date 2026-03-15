import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import FeatureGate from '../components/subscription/FeatureGate';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, Loader2, Send, Sprout, Droplets, Sun, Bug, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import ReactMarkdown from 'react-markdown';
import PlantCareGuide from '../components/learn/PlantCareGuide';

const topics = [
  { id: 'watering', label: 'Watering Science', icon: Droplets, prompt: 'Explain the science of plant watering — how plants absorb water, signs of overwatering vs underwatering, and best practices.' },
  { id: 'light', label: 'Light & Photosynthesis', icon: Sun, prompt: 'Explain how light affects plant growth, photosynthesis basics, types of light exposure, and how to optimize placement.' },
  { id: 'pests', label: 'Pest Management', icon: Bug, prompt: 'Explain integrated pest management for home gardeners — common pests, identification, organic treatments, and prevention.' },
  { id: 'nutrients', label: 'Plant Nutrition', icon: Leaf, prompt: 'Explain plant macro and micronutrients, deficiency symptoms, soil pH, and fertilization basics.' },
  { id: 'propagation', label: 'Propagation', icon: Sprout, prompt: 'Explain plant propagation methods — stem cuttings, leaf cuttings, division, air layering, and seed starting.' },
];

export default function Learn() {
  const { data: plants = [] } = useQuery({
    queryKey: ['plants'],
    queryFn: () => base44.entities.Plant.list('-created_date', 50),
  });

  const [mode, setMode] = useState('quick_fix');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState('');
  const [question, setQuestion] = useState('');
  const [activeTopic, setActiveTopic] = useState(null);

  const handleTopicClick = async (topic) => {
    setActiveTopic(topic.id);
    setLoading(true);
    setResponse('');
    const modeInstructions = mode === 'quick_fix'
      ? 'Be concise and practical. Use bullet points. Focus on actionable tips a beginner can follow immediately.'
      : 'Be thorough and scientific. Explain the biology, chemistry, and environmental science. Use proper terminology and detailed explanations.';
    
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `${topic.prompt}\n\n${modeInstructions}\n\nFormat with clear headers and sections.`,
    });
    setResponse(result);
    setLoading(false);
  };

  const handleAskQuestion = async () => {
    if (!question.trim()) return;
    setActiveTopic(null);
    setLoading(true);
    setResponse('');
    const modeInstructions = mode === 'quick_fix'
      ? 'Be concise and practical. Focus on actionable advice.'
      : 'Be thorough and scientific. Provide detailed biological explanations.';
    
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Gardening question: ${question}\n\n${modeInstructions}`,
    });
    setResponse(result);
    setLoading(false);
    setQuestion('');
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1B4332] flex items-center gap-2">
            <BookOpen className="w-6 h-6" /> Learn Gardening
          </h1>
          <p className="text-gray-500 text-sm mt-1">Your AI-powered gardening apprenticeship</p>
        </div>
        <div className="flex bg-gray-100 rounded-lg p-0.5">
          <button
            onClick={() => setMode('quick_fix')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${mode === 'quick_fix' ? 'bg-white text-[#1B4332] shadow-sm' : 'text-gray-500'}`}
          >
            Quick Fix
          </button>
          <button
            onClick={() => setMode('mastery')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${mode === 'mastery' ? 'bg-white text-[#1B4332] shadow-sm' : 'text-gray-500'}`}
          >
            Mastery
          </button>
        </div>
      </div>

      {/* Topic cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {topics.map(topic => (
          <button
            key={topic.id}
            onClick={() => handleTopicClick(topic)}
            className={`bg-white rounded-xl border p-4 text-center hover:shadow-md transition-all duration-200 ${activeTopic === topic.id ? 'border-[#52796F] ring-2 ring-[#52796F]/20' : 'border-gray-100'}`}
          >
            <topic.icon className="w-6 h-6 mx-auto text-[#52796F] mb-2" />
            <p className="text-xs font-medium text-[#1B4332]">{topic.label}</p>
          </button>
        ))}
      </div>

      {/* Ask a question */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
        <p className="text-sm font-medium text-[#1B4332] mb-2">Ask anything about gardening</p>
        <div className="flex gap-2">
          <Textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g. Why are my tomato leaves turning yellow?"
            className="flex-1 min-h-[44px] max-h-24"
            rows={1}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAskQuestion(); } }}
          />
          <Button onClick={handleAskQuestion} disabled={loading || !question.trim()} className="bg-[#1B4332] hover:bg-[#2D6A4F]">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Response */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#52796F] mx-auto mb-3" />
            <p className="text-sm text-gray-500">Thinking...</p>
          </div>
        </div>
      )}

      {response && !loading && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8">
          <div className="prose prose-sm prose-slate max-w-none">
            <ReactMarkdown>{response}</ReactMarkdown>
          </div>
        </div>
      )}

      {/* Per-plant care guides */}
      {plants.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-[#1B4332] mb-1">Your Plant Care Guides</h2>
          <p className="text-sm text-gray-400 mb-4">Click on a plant to get an AI-generated care guide with light, water, soil, and tips.</p>
          <div className="space-y-3">
            {plants.map(plant => (
              <PlantCareGuide key={plant.id} plant={plant} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}