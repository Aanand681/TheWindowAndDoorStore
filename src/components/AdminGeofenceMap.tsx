"use client";

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polygon, Polyline, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix leaflet icon issue in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom styled marker for City Center
const cityCenterIcon = typeof window !== 'undefined' ? L.divIcon({
  className: 'custom-city-marker',
  html: `<div style="background-color: #2563eb; width: 16px; height: 16px; border: 3px solid white; border-radius: 50%; box-shadow: 0 0 6px rgba(0,0,0,0.5);"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
}) : undefined;

function MapEvents({ onAddPoint }: { onAddPoint: (latlng: L.LatLng) => void }) {
  useMapEvents({
    click(e) {
      onAddPoint(e.latlng);
    },
  });
  return null;
}

function MapResizer() {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);
    return () => clearTimeout(timer);
  }, [map]);
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

  const handleMovePoint = (index: number, newLatLng: L.LatLng) => {
    const updated = [...polygon];
    updated[index] = { lat: newLatLng.lat, lng: newLatLng.lng };
    onChangePolygon(updated);
  };

  const handleDeletePoint = (index: number) => {
    const updated = polygon.filter((_, idx) => idx !== index);
    onChangePolygon(updated);
  };

  return (
    <MapContainer center={[lat, lon]} zoom={12} style={{ height: '100%', width: '100%' }}>
      <MapResizer />
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapEvents onAddPoint={handleAddPoint} />
      
      {/* Draggable Polygon Boundary Markers */}
      {polygon.map((p, i) => (
        <Marker
          key={`${i}-${p.lat.toFixed(5)}-${p.lng.toFixed(5)}`}
          position={[p.lat, p.lng]}
          draggable={true}
          eventHandlers={{
            dragend(e) {
              const marker = e.target;
              const pos = marker.getLatLng();
              handleMovePoint(i, pos);
            },
          }}
        >
          <Popup>
            <div style={{ minWidth: 120 }}>
              <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 2 }}>Boundary Pin</div>
              <div style={{ fontSize: 11, color: '#64748b', marginBottom: 6 }}>
                Drag pin to adjust position
              </div>
              <button
                type="button"
                style={{
                  background: '#ef4444',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 4,
                  padding: '4px 8px',
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                  width: '100%',
                }}
                onClick={(ev) => {
                  ev.stopPropagation();
                  handleDeletePoint(i);
                }}
              >
                Delete this Pin
              </button>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Line between 2 points */}
      {polygon.length === 2 && (
        <Polyline positions={polygon.map(p => [p.lat, p.lng])} color="#ef4444" weight={2} dashArray="4, 4" />
      )}
      
      {/* Closed Polygon for 3+ points */}
      {polygon.length > 2 && (
        <Polygon positions={polygon.map(p => [p.lat, p.lng])} color="#ef4444" fillColor="#ef4444" fillOpacity={0.2} weight={2} />
      )}

      {/* City Center Marker (Blue Dot) */}
      {cityCenterIcon ? (
        <Marker position={[lat, lon]} icon={cityCenterIcon}>
          <Popup>
            <div style={{ fontWeight: 600, fontSize: 12 }}>City Center / Office Origin</div>
          </Popup>
        </Marker>
      ) : (
        <Marker position={[lat, lon]}>
          <Popup>
            <div style={{ fontWeight: 600, fontSize: 12 }}>City Center / Office Origin</div>
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
}
