import {useState, useEffect} from 'react'

interface GeoState {
    lat: number | null
    lng: number | null
    accuracy: number | null
    error: string | null
    loading: boolean
}

export function useGeolocation(): GeoState {
    const [state, setState] = useState<GeoState>({
        lat: null, lng: null, accuracy: null, error: null, loading: true,
    })
    useEffect(() => {
        if (!navigator.geolocation) {
            setState(s => ({ ...s, error: 'Geolocation not supported', loading: false}))
            return
        }

        const watchId = navigator.geolocation.watchPosition(
            ({ coords }) => setState({
        lat: coords.latitude,
        lng: coords.longitude,
        accuracy: coords.accuracy,
        error: null,
        loading: false,
      }),
      (err) => setState(s => ({ ...s, error: err.message, loading: false })),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    )

    return () => navigator.geolocation.clearWatch(watchId)
  }, [])

  return state
}

