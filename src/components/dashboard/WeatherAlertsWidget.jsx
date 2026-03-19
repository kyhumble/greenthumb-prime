import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Cloud, Thermometer, Droplets, Wind, AlertTriangle, Info, Loader2, RefreshCw, MapPin, Snowflake, Flame, CloudRain } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SEVERITY_STYLES = {
  critical: { bg: 'bg-red-50 border-red-200', icon: 'text-red-500', badge: 'bg-red-100 text-red-700', label: 'Critical' },
  warning:  { bg: 'bg-amber-50 border-amber-200', icon: 'text-amber-500', badge: 'bg-amber-100 text-amber-700', label: 'Warning' },
  info:     { bg: 'bg-blue-50 border-blue-100', icon: 'text-blue-400', badge: 'bg-blue-100 text-blue-600', label: 'Info' },
};

const TYPE_ICONS = {
  frost: Snowflake, heat: Flame, wind: Wind, rain: CloudRain, drought: Droplets, general: Info,
};

const LOCATION_CONSENT_KEY = 'greenthumb_location_consent';

export default function WeatherAlertsWidget({ plants }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [locationDenied, setLocationDenied] = useState(false);
  const [showConsentPrompt, setShowConsentPrompt] = useState(false);

  const outdoorPlants = plants.filter(p => p.location === 'outdoor' || p.location === 'greenhouse');

  const fetchAlerts = (lat, lon) => {
    setLoading(true);
    setError('');
    base44.functions.invoke('getWeatherAlerts', { lat, lon, plants: outdoorPlants })
      .then(res => { setData(res.data); setLoading(false); })
      .catch(() => { setError('Failed to load weather data.'); setLoading(false); });
  };

  const requestLocation = () => {
    if (!navigator.geolocation) { setError('Geolocation not supported.'); return; }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      pos => fetchAlerts(pos.coords.latitude, pos.coords.longitude),
      () => { setLocationDenied(true); setLoading(false); }
    );
  };

  const handleConsentAccept = () => {
    localStorage.setItem(LOCATION_CONSENT_KEY, 'granted');
    setShowConsentPrompt(false);
    requestLocation();
  };

  const handleConsentDeny = () => {
    localStorage.setItem(LOCATION_CONSENT_KEY, 'denied');
    setShowConsentPrompt(false);
    setLocationDenied(true);
  };

  useEffect(() => {
    if (outdoorPlants.length === 0) return;
    const consent = localStorage.getItem(LOCATION_CONSENT_KEY);
    if (consent === 'granted') {
      requestLocation();
    } else if (consent === 'denied') {
      setLocationDenied(true);
    } else {
      // No prior consent — show prompt instead of auto-requesting
      setShowConsentPrompt(true);
    }
  }, [plants.length]);

  if (!outdoorPlants.length) return null;

  const w = data?.weather;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-6">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
        <div className="flex items-center gap-2">
          <Cloud className="w-5 h-5 text-[#52796F]" />
          <h3 className="text-sm font-semibold text-[#1B4332]">Weather Care Alerts</h3>
          {w && (
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {w.tempF}°F · {w.humidity}% humidity
            </span>
          )}
        </div>
        <button
          onClick={() => {
            const consent = localStorage.getItem(LOCATION_CONSENT_KEY);
            if (consent === 'granted') {
              requestLocation();
            } else {
              setShowConsentPrompt(true);
            }
          }}
          disabled={loading}
          className="text-gray-400 hover:text-[#52796F] transition-colors"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
        </button>
      </div>

      <div className="p-5">
        {/* Location consent prompt */}
        {showConsentPrompt && (
          <div className="mb-4 bg-[#F0F7F4] border border-[#52796F]/20 rounded-xl p-4">
            <div className="flex items-start gap-2 mb-3">
              <MapPin className="w-4 h-4 text-[#52796F] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-[#1B4332] mb-1">Enable Weather Alerts?</p>
                <p className="text-xs text-gray-500">
                  Your location is used to provide weather-based care alerts for your outdoor plants.
                  Your location is only used to fetch local weather data and is not stored on our servers.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleConsentAccept} className="bg-[#1B4332] hover:bg-[#2D6A4F] text-xs h-8">
                Allow Location Access
              </Button>
              <Button size="sm" variant="outline" onClick={handleConsentDeny} className="text-xs h-8">
                Not Now
              </Button>
            </div>
          </div>
        )}

        {/* Location denied */}
        {locationDenied && !showConsentPrompt && (
          <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 rounded-xl p-3">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>Location access denied. Enable it in your browser to get weather alerts.</span>
          </div>
        )}

        {/* Loading */}
        {loading && !data && (
          <div className="flex items-center gap-2 text-sm text-gray-400 py-4 justify-center">
            <Loader2 className="w-4 h-4 animate-spin" /> Checking weather for your outdoor plants…
          </div>
        )}

        {/* Error */}
        {error && <p className="text-sm text-red-500">{error}</p>}

        {/* Weather summary bar */}
        {w && (
          <div className="grid grid-cols-4 gap-2 mb-4">
            {[
              { icon: Thermometer, label: 'Now', value: `${w.tempF}°F` },
              { icon: Droplets, label: 'Humidity', value: `${w.humidity}%` },
              { icon: Wind, label: 'Wind', value: `${w.windSpeed} mph` },
              { icon: CloudRain, label: 'Tomorrow', value: `${w.tomorrowMin}–${w.tomorrowMax}°F` },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-3 text-center">
                <Icon className="w-4 h-4 mx-auto text-[#52796F] mb-1" />
                <p className="text-xs font-semibold text-gray-700">{value}</p>
                <p className="text-[10px] text-gray-400">{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Overall conditions */}
        {data?.overall_conditions && (
          <p className="text-xs text-gray-500 italic mb-3">{data.overall_conditions}</p>
        )}

        {/* Alerts */}
        {data?.alerts?.length > 0 ? (
          <div className="space-y-2">
            {data.alerts.map((alert, i) => {
              const style = SEVERITY_STYLES[alert.severity] || SEVERITY_STYLES.info;
              const Icon = TYPE_ICONS[alert.type] || Info;
              return (
                <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border ${style.bg}`}>
                  <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${style.icon}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800">{alert.message}</p>
                    {alert.plants_affected && (
                      <p className="text-xs text-[#52796F] mt-0.5">🌿 {alert.plants_affected}</p>
                    )}
                  </div>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full flex-shrink-0 ${style.badge}`}>
                    {style.label}
                  </span>
                </div>
              );
            })}
          </div>
        ) : data && data.alerts?.length === 0 ? (
          <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 rounded-xl p-3">
            <span>✅</span>
            <span>Conditions look good for your outdoor plants today.</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}