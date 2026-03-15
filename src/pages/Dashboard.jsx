import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Leaf, AlertTriangle, Stethoscope, TrendingUp, Plus, Camera, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import StatsCard from '../components/dashboard/StatsCard';
import PlantCard from '../components/plants/PlantCard';
import HealthScoreBadge from '../components/plants/HealthScoreBadge';
import AddPlantDialog from '../components/plants/AddPlantDialog';
import NeedsAttentionWidget from '../components/dashboard/NeedsAttentionWidget';
import DailyTasksWidget from '../components/dashboard/DailyTasksWidget';
import SeasonalPlannerWidget from '../components/dashboard/SeasonalPlannerWidget';
import WeatherAlertsWidget from '../components/dashboard/WeatherAlertsWidget';
import PullToRefresh from '../components/ui/PullToRefresh';

export default function Dashboard() {
  const [showAddPlant, setShowAddPlant] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: plants = [], refetch: refetchPlants } = useQuery({
    queryKey: ['plants', user?.email],
    queryFn: () => base44.entities.Plant.filter({ created_by: user.email }, '-created_date', 50),
    enabled: !!user?.email,
  });

  const { data: diagnoses = [], refetch: refetchDiagnoses } = useQuery({
    queryKey: ['diagnoses', user?.email],
    queryFn: () => base44.entities.Diagnosis.filter({ created_by: user.email }, '-created_date', 10),
    enabled: !!user?.email,
  });

  const avgHealth = plants.length > 0
    ? Math.round(plants.reduce((sum, p) => sum + (p.health_score || 0), 0) / plants.length)
    : 0;

  const criticalPlants = plants.filter(p => (p.health_score || 0) < 40);
  const recentDiagnoses = diagnoses.slice(0, 5);

  const handleRefresh = async () => {
    await Promise.all([refetchPlants(), refetchDiagnoses()]);
  };

  return (
    <PullToRefresh onRefresh={handleRefresh}>
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#1B4332]">
            Welcome back{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''} 🌿
          </h1>
          <p className="text-gray-500 text-sm mt-1">Here's how your garden is doing today</p>
        </div>
        <div className="flex gap-2">
          <Link to="/Diagnose">
            <Button variant="outline" className="border-[#52796F] text-[#52796F] hover:bg-[#52796F]/5">
              <Camera className="w-4 h-4 mr-2" /> Diagnose
            </Button>
          </Link>
          <Button onClick={() => setShowAddPlant(true)} className="bg-[#1B4332] hover:bg-[#2D6A4F]">
            <Plus className="w-4 h-4 mr-2" /> Add Plant
          </Button>
        </div>
      </div>



      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
        <StatsCard title="Total Plants" value={plants.length} icon={Leaf} color="emerald" />
        <StatsCard title="Avg Health" value={avgHealth} subtitle="out of 100" icon={TrendingUp} color="blue" />
        <StatsCard title="Need Attention" value={criticalPlants.length} icon={AlertTriangle} color="amber" />
        <StatsCard title="Diagnoses" value={diagnoses.length} subtitle="total" icon={Stethoscope} color="rose" />
      </div>

      {/* Weather Alerts */}
      <WeatherAlertsWidget plants={plants} />

      {/* Daily Tasks */}
      {plants.length > 0 && <DailyTasksWidget plants={plants} />}

      {/* Needs Attention */}
      <NeedsAttentionWidget plants={plants} />

      {/* Seasonal Planner */}
      {plants.length > 0 && <SeasonalPlannerWidget plants={plants} />}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* My Plants */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#1B4332]">My Plants</h2>
            <Link to="/Plants" className="text-sm text-[#52796F] hover:underline flex items-center gap-1">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          {plants.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {plants.slice(0, 6).map(plant => (
                <PlantCard key={plant.id} plant={plant} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <Leaf className="w-12 h-12 text-[#52796F]/30 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No plants yet. Add your first plant to get started!</p>
              <Button onClick={() => setShowAddPlant(true)} className="mt-4 bg-[#1B4332] hover:bg-[#2D6A4F]">
                <Plus className="w-4 h-4 mr-2" /> Add Plant
              </Button>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Recent Diagnoses */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-[#1B4332] mb-3">Recent Diagnoses</h3>
            {recentDiagnoses.length > 0 ? (
              <div className="space-y-3">
                {recentDiagnoses.map(d => (
                  <div key={d.id} className="flex items-start gap-3 pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                      d.severity === 'critical' ? 'bg-red-500' : d.severity === 'high' ? 'bg-orange-500' : d.severity === 'moderate' ? 'bg-amber-500' : 'bg-emerald-500'
                    }`} />
                    <div>
                      <p className="text-sm text-gray-800 capitalize">{d.diagnosis_type?.replace(/_/g, ' ')}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{d.likely_cause?.substring(0, 60)}{d.likely_cause?.length > 60 ? '...' : ''}</p>
                      <p className="text-xs text-gray-300 mt-1">{d.created_date ? format(new Date(d.created_date), 'MMM d') : ''}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No diagnoses yet. Upload a photo to get started.</p>
            )}
          </div>
        </div>
      </div>

      <AddPlantDialog open={showAddPlant} onOpenChange={setShowAddPlant} onPlantAdded={() => refetchPlants()} plantCount={plants.length} user={user} />
    </div>
    </PullToRefresh>
  );
}