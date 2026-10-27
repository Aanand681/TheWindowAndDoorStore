"use client";

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polygon, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix leaflet icon issue in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function MapUpdater({ lat, lon }: { lat: number, lon: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lon], 13);
  }, [lat, lon, map]);

  useEffect(() => {
    // Invalidate size periodically to catch CSS display changes,
    // or when the window resizes.
    const interval = setInterval(() => {
      map.invalidateSize();
    }, 500);
    return () => clearInterval(interval);
  }, [map]);

  return null;
}

export default function MapComponent({ 
  lat, 
  lon, 
  markerLat, 
  markerLon,
  polygon,
  onMarkerDragEnd
}: { 
  lat: number, 
  lon: number, 
  markerLat?: number, 
  markerLon?: number,
  polygon?: { lat: number, lng: number }[],
  onMarkerDragEnd?: (lat: number, lon: number) => void
}) {
  return (
    <MapContainer center={[lat, lon]} zoom={13} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {polygon && polygon.length > 2 && (
        <Polygon 
          positions={polygon.map(p => [p.lat, p.lng])} 
          pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.15 }} 
        />
      )}
      {markerLat && markerLon && (
        <Marker 
          position={[markerLat, markerLon]} 
          draggable={!!onMarkerDragEnd}
          eventHandlers={{
            dragend: (e) => {
              if (onMarkerDragEnd) {
                const marker = e.target;
                const position = marker.getLatLng();
                onMarkerDragEnd(position.lat, position.lng);
              }
            }
          }}
        />
      )}
      <MapUpdater lat={lat} lon={lon} />
    </MapContainer>
  );
}
