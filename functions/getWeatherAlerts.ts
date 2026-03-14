import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { lat, lon, plants } = await req.json();
    if (!lat || !lon) return Response.json({ error: 'Location required' }, { status: 400 });

    // Fetch current + forecast weather from Open-Meteo (free, no key)
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,precipitation,wind_speed_10m,weather_code,relative_humidity_2m&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max,weather_code&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&forecast_days=3&timezone=auto`;

    const weatherRes = await fetch(weatherUrl);
    const weatherData = await weatherRes.json();

    const current = weatherData.current;
    const daily = weatherData.daily;

    // Build a concise weather summary for LLM
    const tempF = current.temperature_2m;
    const feelsLike = current.apparent_temperature;
    const humidity = current.relative_humidity_2m;
    const windSpeed = current.wind_speed_10m;
    const precipitation = current.precipitation;
    const tomorrowMax = daily?.temperature_2m_max?.[1];
    const tomorrowMin = daily?.temperature_2m_min?.[1];
    const tomorrowRain = daily?.precipitation_sum?.[1];

    const plantList = (plants || [])
      .filter(p => p.location === 'outdoor' || p.location === 'greenhouse')
      .map(p => `${p.plant_name}${p.plant_category ? ` (${p.plant_category})` : ''}`)
      .join(', ');

    if (!plantList) {
      return Response.json({ alerts: [], weather: { tempF, humidity, windSpeed, precipitation } });
    }

    const prompt = `You are a plant care expert. Given current and upcoming weather, generate specific care alerts for these outdoor/greenhouse plants: ${plantList}.

Current weather:
- Temperature: ${tempF}°F (feels like ${feelsLike}°F)
- Humidity: ${humidity}%
- Wind: ${windSpeed} mph
- Current precipitation: ${precipitation} inches

Tomorrow's forecast:
- High: ${tomorrowMax}°F, Low: ${tomorrowMin}°F
- Rain: ${tomorrowRain} inches

Generate 2-5 specific, actionable alerts. Focus on: frost risk (below 35°F), heat stress (above 95°F), strong winds, heavy rain, drought conditions, or anything requiring immediate action.
Each alert must have: message (the actionable instruction), severity (info|warning|critical), and type (frost|heat|wind|rain|drought|general).
Only include alerts that are genuinely relevant — skip if conditions are perfectly fine.`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          alerts: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                message: { type: 'string' },
                severity: { type: 'string', enum: ['info', 'warning', 'critical'] },
                type: { type: 'string' },
                plants_affected: { type: 'string' }
              }
            }
          },
          overall_conditions: { type: 'string' }
        }
      }
    });

    return Response.json({
      alerts: result.alerts || [],
      overall_conditions: result.overall_conditions || '',
      weather: {
        tempF: Math.round(tempF),
        feelsLike: Math.round(feelsLike),
        humidity,
        windSpeed: Math.round(windSpeed),
        precipitation,
        tomorrowMax: Math.round(tomorrowMax),
        tomorrowMin: Math.round(tomorrowMin),
        tomorrowRain
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});