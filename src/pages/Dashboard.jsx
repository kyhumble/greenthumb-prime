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

export default function Dashboard() {
  const [showAddPlant, setShowAddPlant] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: plants = [], refetch: refetchPlants } = useQuery({
    queryKey: ['plants'],
    queryFn: () => base44.entities.Plant.list('-created_date', 50),
  });

  const { data: diagnoses = [] } = useQuery({
    queryKey: ['diagnoses'],
    queryFn: () => base44.entities.Diagnosis.list('-created_date', 10),
  });

  const avgHealth = plants.length > 0
    ? Math.round(plants.reduce((sum, p) => sum + (p.health_score || 0), 0) / plants.length)
    : 0;

  const criticalPlants = plants.filter(p => (p.health_score || 0) < 40);
  const recentDiagnoses = diagnoses.slice(0, 5);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Welcome back{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''} 🌿
          </h1>
          <p className="text-gray-400 text-sm mt-1">Here's how your garden is doing today</p>
        </div>
        <div className="flex gap-2">
          <Link to="/Diagnose">
            <Button variant="outline" className="border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl">
              <Camera className="w-4 h-4 mr-2" /> Diagnose
            </Button>
          </Link>
          <Button onClick={() => setShowAddPlant(true)} className="bg-[#16A34A] hover:bg-[#15803D] rounded-xl shadow-sm">
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

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* My Plants */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">My Plants</h2>
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
              <Button onClick={() => setShowAddPlant(true)} className="mt-4 bg-[#16A34A] hover:bg-[#15803D] rounded-xl">
                <Plus className="w-4 h-4 mr-2" /> Add Plant
              </Button>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Alerts */}
          {criticalPlants.length > 0 && (
            <div className="bg-white rounded-2xl border border-red-50 p-5">
              <h3 className="text-sm font-semibold text-red-600 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Plants Needing Attention
              </h3>
              <div className="space-y-3">
                {criticalPlants.slice(0, 3).map(plant => (
                  <Link key={plant.id} to={`/PlantProfile?id=${plant.id}`} className="flex items-center gap-3 hover:bg-red-50 rounded-lg p-2 -mx-2 transition-colors">
                    <HealthScoreBadge score={plant.health_score} size="sm" />
                    <div>
                      <p className="text-sm font-medium text-gray-800">{plant.plant_name}</p>
                      <p className="text-xs text-gray-500">{plant.species || 'Unknown species'}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Recent Diagnoses */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Recent Diagnoses</h3>
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

      <AddPlantDialog open={showAddPlant} onOpenChange={setShowAddPlant} onPlantAdded={() => refetchPlants()} />
    </div>
  );
}