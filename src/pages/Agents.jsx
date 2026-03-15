import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import AgentChatModal from '../components/agents/AgentChatModal';
import FeatureGate from '../components/subscription/FeatureGate';

const AGENTS = [
  {
    id: 'plant_diagnostic',
    name: 'Plant Diagnostic',
    tagline: "What's wrong with my plant?",
    description: 'Identifies plants, analyzes symptoms, produces diagnoses with confidence scores, and requests follow-up images.',
    emoji: '🔬',
    color: 'from-emerald-50 to-teal-50 border-emerald-200',
    badge: 'bg-emerald-100 text-emerald-700',
    features: ['Plant identification', 'Symptom analysis', 'Confidence scoring', 'Follow-up image requests', 'Next-step recommendations'],
  },
  {
    id: 'horticulture_educator',
    name: 'Horticulture Educator',
    tagline: 'Learn the why behind the what',
    description: 'Explains the science behind recommendations — nutrients, watering physiology, environmental cause-and-effect, and recovery timelines.',
    emoji: '📚',
    color: 'from-blue-50 to-indigo-50 border-blue-200',
    badge: 'bg-blue-100 text-blue-700',
    features: ['Nutrient science', 'Watering physiology', 'Environmental cause-and-effect', 'Recovery timelines', 'Pattern recognition coaching'],
  },
  {
    id: 'image_triage',
    name: 'Image Triage',
    tagline: 'Is my photo good enough to diagnose?',
    description: 'Reviews uploaded photos and determines if they contain sufficient information for diagnosis — preventing garbage-in, garbage-out.',
    emoji: '📸',
    color: 'from-violet-50 to-purple-50 border-violet-200',
    badge: 'bg-violet-100 text-violet-700',
    features: ['Image quality check', 'Visibility assessment', 'Specific angle requests', 'Lighting guidance', 'APPROVED / INSUFFICIENT verdict'],
  },
  {
    id: 'differential_diagnosis',
    name: 'Differential Diagnosis',
    tagline: 'What else could it be?',
    description: 'Ranks all probable causes, weighing supporting vs contradicting evidence — like a clinical differential from a plant specialist.',
    emoji: '⚖️',
    color: 'from-amber-50 to-orange-50 border-amber-200',
    badge: 'bg-amber-100 text-amber-700',
    features: ['Multi-cause ranking', 'Evidence for each diagnosis', 'Contradicting evidence', 'Confirmatory tests', 'Structured differential report'],
  },
  {
    id: 'care_plan',
    name: 'Care Plan',
    tagline: 'Turn diagnosis into action',
    description: 'Converts any diagnosis into a structured execution plan with specific tasks for today, things to stop, what to monitor, and what recovery looks like.',
    emoji: '📋',
    color: 'from-rose-50 to-pink-50 border-rose-200',
    badge: 'bg-rose-100 text-rose-700',
    features: ["Today's action list", 'Stop-doing list', 'Monitoring checklist', 'Reassessment schedule', 'Recovery milestones'],
  },
  {
    id: 'plant_history',
    name: 'Plant History',
    tagline: 'Is my plant getting better?',
    description: 'Analyzes longitudinal image, intervention, and diagnosis data to identify trends, measure progress, and surface recurring patterns.',
    emoji: '📈',
    color: 'from-cyan-50 to-sky-50 border-cyan-200',
    badge: 'bg-cyan-100 text-cyan-700',
    features: ['Visual progression analysis', 'Intervention correlation', 'Trend detection', 'Before-and-after comparison', 'Recurring pattern flagging'],
  },
  {
    id: 'environmental_context',
    name: 'Environmental Context',
    tagline: 'Advice tuned to your climate',
    description: 'Grounds all care advice in your real location, season, and setup — covering frost risk, light placement, humidity, airflow, and seasonal transitions.',
    emoji: '🌍',
    color: 'from-lime-50 to-green-50 border-lime-200',
    badge: 'bg-lime-100 text-lime-700',
    features: ['Seasonality awareness', 'Frost & heat risk', 'Indoor vs outdoor context', 'Light placement', 'Humidity & airflow guidance'],
  },
];

export default function Agents() {
  const [activeAgent, setActiveAgent] = useState(null);
  const [user, setUser] = useState(null);
  useEffect(() => { base44.auth.me().then(setUser).catch(() => {}); }, []);

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1B4332]">🤖 AI Agents</h1>
        <p className="text-gray-500 text-sm mt-1">
          Specialized plant intelligence — each agent is an expert in its domain. Chat with any one below.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {AGENTS.map(agent => (
          <div
            key={agent.id}
            className={`bg-gradient-to-br ${agent.color} border rounded-2xl p-5 flex flex-col gap-3 hover:shadow-md transition-shadow cursor-pointer`}
            onClick={() => setActiveAgent(agent)}
          >
            <div className="flex items-start justify-between">
              <span className="text-3xl">{agent.emoji}</span>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${agent.badge}`}>
                Agent
              </span>
            </div>

            <div>
              <h3 className="font-semibold text-[#1B4332] text-base">{agent.name}</h3>
              <p className="text-xs text-[#52796F] font-medium mt-0.5 italic">{agent.tagline}</p>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">{agent.description}</p>

            <ul className="space-y-1 mt-auto">
              {agent.features.map((f, i) => (
                <li key={i} className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span className="w-1 h-1 rounded-full bg-gray-400 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            <button
              className="mt-2 w-full py-2 rounded-xl text-xs font-semibold text-[#1B4332] bg-white/70 hover:bg-white transition-colors"
              onClick={e => { e.stopPropagation(); setActiveAgent(agent); }}
            >
              Chat with {agent.name} →
            </button>
          </div>
        ))}
      </div>

      {activeAgent && (
        <AgentChatModal agent={activeAgent} onClose={() => setActiveAgent(null)} />
      )}
    </div>
  );
}