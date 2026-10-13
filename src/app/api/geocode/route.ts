import { NextResponse } from 'next/server';

const cache = new Map();

function isInNorthwesternOntario(lat: number, lon: number) {
  return lat >= 48.0 && lat <= 54.5 && lon >= -95.5 && lon <= -89.0;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const text = (searchParams.get('text') || '').trim();

    if (text.length < 5) {
      return NextResponse.json({ error: 'Address is too short. Include the street and town.' }, { status: 400 });
    }

    const auth = String(process.env.GEOCODER_CA_AUTH || '').trim().replace(/^["']|["']$/g, '');
    const cacheKey = text.toLowerCase();

    if (cache.has(cacheKey)) {
      return NextResponse.json({ results: cache.get(cacheKey) });
    }

    const params = new URLSearchParams({
      locate: text,
      geoit: 'XML',
      json: '1',
      standard: '1',
      showpostal: '1',
      region: 'ON'
    });

    if (auth) params.set('auth', auth);

    const response = await fetch(`https://geocoder.ca/?${params.toString()}`);

    if (!response.ok) {
      return NextResponse.json({ error: `Geocoder.ca returned ${response.status}. Try again or paste coordinates manually.` }, { status: 502 });
    }

    const raw = await response.text();
    let data;
    try {
      data = JSON.parse(raw);
    } catch (parseError) {
      return NextResponse.json({ error: 'Geocoder.ca returned an unreadable response. Paste coordinates manually.' }, { status: 502 });
    }

    if (data.error) {
      const errCode = String((typeof data.error === 'object' ? data.error.code : data.error) || '');
      if (errCode === '001') return NextResponse.json({ error: 'Geocoder.ca rejected this server IP. Remove the IP restriction on your token.' }, { status: 502 });
      if (errCode === '002') return NextResponse.json({ error: 'Geocoder.ca credits are used up. Paste coordinates manually.' }, { status: 502 });
      if (errCode === '003') return NextResponse.json({ error: 'Geocoder.ca token not found. Check GEOCODER_CA_AUTH in .env.local.' }, { status: 502 });
      return NextResponse.json({ error: 'No match found. Add the town name or paste coordinates manually.' }, { status: 404 });
    }

    const std = data.standard || data;
    const lat = Number(data.latt);
    const lon = Number(data.longt);
    const confidence = Number(std.confidence ?? data.confidence);

    if (!Number.isFinite(lat) || !Number.isFinite(lon) || lat === 0 || lon === 0) {
      return NextResponse.json({ error: 'No match found. Add the town name or paste coordinates manually.' }, { status: 404 });
    }

    if (!isInNorthwesternOntario(lat, lon)) {
      return NextResponse.json({ error: 'The result is outside Northwestern Ontario. Check the town name or paste coordinates manually.' }, { status: 404 });
    }

    const label = [std.stnumber, std.staddress, std.city, std.prov, std.postal].filter(Boolean).join(' ') || text;

    const results = [{
      label,
      city: std.city || '',
      lat,
      lon,
      precise: Boolean(std.stnumber) && confidence >= 0.8,
      confidence: Number.isFinite(confidence) ? confidence : null
    }];

    cache.set(cacheKey, results);
    return NextResponse.json({ results }, { headers: { 'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400' }});

  } catch (error) {
    return NextResponse.json({ error: 'The address service is unavailable. Try again or paste coordinates manually.' }, { status: 502 });
  }
}
