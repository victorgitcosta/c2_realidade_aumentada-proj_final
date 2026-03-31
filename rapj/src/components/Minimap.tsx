// src/components/Minimap.tsx
import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Circle, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix default icon path broken by Vite bundling
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'

L.Icon.Default.mergeOptions({ iconUrl, iconRetinaUrl, shadowUrl })

interface Props {
  lat: number
  lng: number
  accuracy: number
}

// Inner component to recenter the map when position changes
function Recenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap()
  useEffect(() => { map.setView([lat, lng]) }, [lat, lng, map])
  return null
}

export function Minimap({ lat, lng, accuracy }: Props) {
  return (
    <div style={{
      position: 'fixed',
      bottom: '16px',
      left: '16px',
      width: '180px',
      height: '180px',
      borderRadius: '50%',          // ← game-style circular minimap
      overflow: 'hidden',
      border: '3px solid rgba(255,255,255,0.85)',
      boxShadow: '0 0 0 2px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.5)',
      zIndex: 9999,
    }}>
      <MapContainer
        center={[lat, lng]}
        zoom={17}
        zoomControl={false}
        attributionControl={false}
        dragging={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        touchZoom={false}
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Recenter lat={lat} lng={lng} />
        <Marker position={[lat, lng]} />
        {accuracy && (
          <Circle
            center={[lat, lng]}
            radius={accuracy}
            pathOptions={{ color: '#4a90d9', fillOpacity: 0.15, weight: 1 }}
          />
        )}
      </MapContainer>
    </div>
  )
}