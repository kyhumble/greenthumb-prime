import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const ALLOWED_FIELDS = new Set([
  'plant_name', 'species', 'scientific_name', 'plant_category',
  'location', 'growth_stage', 'notes', 'health_score', 'planting_date', 'image_url',
]);

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    if (!body?.plant_name || typeof body.plant_name !== 'string' || !body.plant_name.trim()) {
      return Response.json({ error: 'plant_name is required' }, { status: 400 });
    }

    // Only pass through known fields to prevent mass assignment
    const plantData: Record<string, unknown> = {};
    for (const key of ALLOWED_FIELDS) {
      if (body[key] !== undefined) {
        plantData[key] = body[key];
      }
    }

    // Always set created_by to the authenticated user to prevent spoofing
    const plant = await base44.asServiceRole.entities.Plant.create({
      ...plantData,
      created_by: user.email,
    });

    return Response.json(plant);
  } catch (error) {
    console.error('createPlant error:', error);
    return Response.json({ error: 'Failed to create plant. Please try again.' }, { status: 500 });
  }
});
