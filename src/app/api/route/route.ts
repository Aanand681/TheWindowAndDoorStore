import { NextResponse } from 'next/server';

const MATRIX_URLS = [
  'https://api.openrouteservice.org/v2/matrix/driving-car',
  'https://api.heigit.org/openrouteservice/v2/matrix/driving-car'
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lon = Number(searchParams.get('lon'));
    const lat = Number(searchParams.get('lat'));
    const officeLon = Number(searchParams.get('officeLon'));
    const officeLat = Number(searchParams.get('officeLat'));

    const rawKey = process.env.ORS_API_KEY;
    if (!rawKey) {
      return NextResponse.json({ error: 'Server is missing ORS_API_KEY. Enter km and hours manually.' }, { status: 500 });
    }
    const apiKey = rawKey.trim().replace(/^["']|["']$/g, '');

    if (!Number.isFinite(lon) || !Number.isFinite(lat) || !Number.isFinite(officeLon) || !Number.isFinite(officeLat)) {
      return NextResponse.json({ error: 'Invalid coordinates provided.' }, { status: 400 });
    }

    const body = JSON.stringify({
      locations: [
        [officeLon, officeLat],
        [lon, lat]
      ],
      sources: [0],
      destinations: [1],
      metrics: ['distance', 'duration'],
      units: 'km'
    });

    let lastError = null;

    for (const url of MATRIX_URLS) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { Authorization: apiKey, 'Content-Type': 'application/json' },
          body
        });

        if (!response.ok) {
          const text = await response.text();
          lastError = { status: response.status, message: text.slice(0, 300) };
          if (response.status !== 403 && response.status < 500) break;
          continue;
        }

        const json = await response.json();
        const km = json.distances?.[0]?.[0];
        const seconds = json.durations?.[0]?.[0];

        if (typeof km !== 'number' || typeof seconds !== 'number') {
          return NextResponse.json({ error: 'No driving route found from the selected office. Enter km and hours manually.' }, { status: 422 });
        }

        return NextResponse.json({ km, seconds });
      } catch (error: any) {
        lastError = { status: 0, message: String(error?.message || error) };
      }
    }

    const status = lastError?.status || 0;
    const errorMessage = status === 403 
      ? 'OpenRouteService rejected the API key. Check ORS_API_KEY in .env.local.'
      : status === 429 
        ? 'OpenRouteService rate limit reached. Try again later.'
        : 'The routing service is unavailable. Enter km and hours manually.';

    return NextResponse.json({ error: errorMessage }, { status: 502 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
