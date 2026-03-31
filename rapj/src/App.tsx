import { useState, useCallback } from 'react'
import { Minimap } from './components/Minimap'
import { useAR } from './hooks/useAR'
import { TREASURES } from './data/treasureData'
import type { NearbyPoint } from './types/NearbyPoint'

type Screen = 'map' | 'scanning' | 'found'

const PLAYER_LAT = -3.871955
const PLAYER_LNG = -38.611336

const NEARBY_POINTS: NearbyPoint[] = TREASURES.map(t => ({
  id: t.id, lat: t.lat, lng: t.lng,
}))

const UI: React.CSSProperties = {
  fontFamily: "'Segoe UI', sans-serif",
  color: '#fff',
}

export default function App() {
  const [screen, setScreen]               = useState<Screen>('map')
  const [activeTreasureId, setActiveId]   = useState<number | null>(null)
  const [answer, setAnswer]               = useState('')
  const [submitted, setSubmitted]         = useState(false)

  // onMarkerFound fires when A-Frame detects the Hiro marker
  const handleMarkerFound = useCallback(() => {
    setScreen('found')
  }, [])

  const { initAR, hideAR } = useAR(handleMarkerFound)

  function openScanner(treasureId: number) {
    setActiveId(treasureId)
    setAnswer('')
    setSubmitted(false)
    setScreen('scanning')
    initAR()           // injects <a-scene> on first call, shows on subsequent
  }

  function closeAR() {
    hideAR()
    setScreen('map')
  }

  const treasure = TREASURES.find(t => t.id === activeTreasureId)

  return (
    <div style={UI}>

      {/* ── MAP SCREEN ─────────────────────────────────────────────────── */}
      {screen === 'map' && (
        <div style={{
          width: '100vw', height: '100vh',
          background: 'linear-gradient(160deg, #0d0d1a 0%, #1a2a0d 100%)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'flex-start', 
          paddingTop: '8vh',
          gap: 16,
          boxSizing: 'border-box',
          overflow: 'hidden',
          position: 'relative',
        }}>
          <h1 style={{ margin: 0, fontSize: 28 }}>🗺 Caça ao Tesouro</h1>
          <p style={{ margin: 0, color: '#aaa', textAlign: 'center', padding: '0 24px' }}>
            Vá até um dos 4 marcadores no mapa e escaneie o marcador Hiro
          </p>

          <button
            onClick={() => openScanner(1)}
            style={{
              marginTop: 8,
              background: '#f0a500', color: '#1a1a2e',
              border: 'none', borderRadius: 14,
              padding: '14px 40px', fontSize: 18, fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 24px rgba(240,165,0,0.35)',
              zIndex: 10,
            }}
          >
            📷 Escanear Marcador Hiro
          </button>

          {/* Minimap fixed to bottom-left */}
          <Minimap lat={PLAYER_LAT} lng={PLAYER_LNG} nearbyPoints={NEARBY_POINTS} />
        </div>
      )}

      {/* ── SCANNING SCREEN ────────────────────────────────────────────── */}
      {/* A-Frame is in #ar-wrapper (z-index 50). This div sits above it (z-index 100). */}
      {screen === 'scanning' && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, pointerEvents: 'none' }}>

          {/* Instruction banner */}
          <div style={{
            position: 'absolute', bottom: 80, left: 0, right: 0,
            display: 'flex', justifyContent: 'center',
            pointerEvents: 'none',
          }}>
            <div style={{
              background: 'rgba(0,0,0,0.65)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 12, padding: '10px 24px',
            }}>
              <p style={{ margin: 0, fontSize: 16, textAlign: 'center' }}>
                Aponte a câmera para o marcador Hiro
              </p>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={closeAR}
            style={{
              position: 'absolute', top: 24, right: 24,
              background: 'rgba(0,0,0,0.65)', color: '#fff',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: 10, padding: '8px 18px',
              fontSize: 16, cursor: 'pointer',
              pointerEvents: 'auto',
            }}
          >
            ✕ Fechar
          </button>

          {/* Minimap stays visible while scanning */}
          <Minimap lat={PLAYER_LAT} lng={PLAYER_LNG} nearbyPoints={NEARBY_POINTS} />
        </div>
      )}

      {/* ── FOUND SCREEN ───────────────────────────────────────────────── */}
      {/* A-Frame still visible behind — chest model shows on the marker. */}
      {screen === 'found' && treasure && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'flex-end',
          paddingBottom: 36,
        }}>
          {/* Frosted card anchored to bottom */}
          <div style={{
            width: 'calc(100% - 32px)', maxWidth: 420,
            background: 'rgba(10,10,20,0.88)',
            border: '1px solid rgba(255,215,0,0.35)',
            borderRadius: 20, padding: '24px 24px 20px',
            backdropFilter: 'blur(12px)',
          }}>
            <p style={{
              margin: '0 0 6px',
              color: '#f0a500', fontSize: 12,
              fontWeight: 700, letterSpacing: 1.2,
            }}>
              🎁 TESOURO {treasure.id} ENCONTRADO
            </p>

            <p style={{ margin: '0 0 18px', fontSize: 18, lineHeight: 1.5 }}>
              {treasure.question}
            </p>

            {!submitted ? (
              <>
                <input
                  type="text"
                  value={answer}
                  onChange={e => setAnswer(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && answer.trim() && setSubmitted(true)}
                  placeholder="Sua resposta..."
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    padding: '12px 14px', fontSize: 16,
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: 10, color: '#fff', outline: 'none',
                    marginBottom: 12,
                  }}
                />
                <button
                  onClick={() => answer.trim() && setSubmitted(true)}
                  disabled={!answer.trim()}
                  style={{
                    width: '100%', padding: '13px 0',
                    background: answer.trim() ? '#f0a500' : '#333',
                    color:      answer.trim() ? '#1a1a2e' : '#666',
                    border: 'none', borderRadius: 10,
                    fontSize: 16, fontWeight: 700,
                    cursor: answer.trim() ? 'pointer' : 'default',
                    transition: 'background 0.2s',
                  }}
                >
                  Confirmar Resposta
                </button>
              </>
            ) : (
              <div style={{
                textAlign: 'center', padding: '16px',
                background: 'rgba(0,210,100,0.12)',
                border: '1px solid rgba(0,210,100,0.35)',
                borderRadius: 10,
              }}>
                <p style={{ color: '#4dff91', margin: '0 0 12px' }}>
                  ✓ Resposta enviada: <strong>"{answer}"</strong>
                </p>
                <button
                  onClick={closeAR}
                  style={{
                    background: 'transparent',
                    color: '#f0a500',
                    border: '1px solid #f0a500',
                    borderRadius: 8, padding: '8px 24px',
                    fontSize: 15, cursor: 'pointer',
                  }}
                >
                  Próximo tesouro →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  )
}