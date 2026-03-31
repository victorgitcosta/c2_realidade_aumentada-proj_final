// src/components/Minimap.tsx
import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { NearbyPoint } from '../types/NearbyPoint'

import iconUrl from 'leaflet/dist/images/marker-icon.png'
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'
L.Icon.Default.mergeOptions({ iconUrl, iconRetinaUrl, shadowUrl })

const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl,
  iconSize:   [25, 41],
  iconAnchor: [12, 41],
})

interface Props {
  lat: number
  lng: number
  nearbyPoints: NearbyPoint[]
}

function Recenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap()
  useEffect(() => { map.setView([lat, lng]) }, [lat, lng, map])
  return null
}

export function Minimap({ lat, lng, nearbyPoints }: Props) {
  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '90vw',
      height: '90vw',
      maxWidth: '350px',
      maxHeight: '350px',
      borderRadius: '50%',
      overflow: 'hidden',
      border: '3px solid rgba(255,255,255,0.85)',
      boxShadow: '0 0 0 2px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.5)',
      zIndex: 1,
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

        {/* Player — blue default marker */}
        <Marker position={[lat, lng]} />

        {/* Fixed target locations — red markers */}
        {nearbyPoints.map(point => (
          <Marker
            key={point.id}
            position={[point.lat, point.lng]}
            icon={redIcon}
          />
        ))}
      </MapContainer>
    </div>
  )
}