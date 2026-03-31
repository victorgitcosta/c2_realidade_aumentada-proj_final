// src/App.tsx
import { useGeolocation } from './hooks/useGeolocation'
import { Minimap } from './components/Minimap'

export default function App() {
  const { lat, lng, accuracy, error, loading } = useGeolocation()

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>GPS Minimap</h1>

      {loading && <p>Acquiring GPS signal…</p>}
      {error   && <p style={{ color: 'red' }}>⚠ {error}</p>}
      {lat !== null && lng !== null && (
        <>
          <p>Lat: {lat.toFixed(6)}</p>
          <p>Lng: {lng.toFixed(6)}</p>
          <Minimap lat={lat} lng={lng} accuracy={accuracy ?? 0} />
        </>
      )}
    </div>
  )
}