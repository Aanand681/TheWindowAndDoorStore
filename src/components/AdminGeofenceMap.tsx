"use client";

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polygon, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix leaflet icon issue in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function MapEvents({ onAddPoint }: { onAddPoint: (latlng: L.LatLng) => void }) {
  useMapEvents({
    click(e) {
      onAddPoint(e.latlng);
    },
  });
  return null;
}

export default function AdminGeofenceMap({ 
  lat, 
  lon, 
  polygon,
  onChangePolygon
}: { 
  lat: number, 
  lon: number, 
  polygon: {lat: number, lng: number}[],
  onChangePolygon: (poly: {lat: number, lng: number}[]) => void
}) {
  const handleAddPoint = (latlng: L.LatLng) => {
    onChangePolygon([...polygon, { lat: latlng.lat, lng: latlng.lng }]);
  };

  return (
    <MapContainer center={[lat, lon]} zoom={12} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapEvents onAddPoint={handleAddPoint} />
      
      {polygon.map((p, i) => (
        <Marker key={i} position={[p.lat, p.lng]} />
      ))}
      
      {polygon.length > 2 && (
        <Polygon positions={polygon.map(p => [p.lat, p.lng])} color="red" />
      )}
      <Marker position={[lat, lon]} /> {/* City Center */}
    </MapContainer>
  );
}
