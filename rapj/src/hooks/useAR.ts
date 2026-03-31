import { useRef, useCallback } from 'react'

// Module-level flag: A-Frame can only be initialised once per page load.
// Destroying and recreating <a-scene> breaks AR.js — we keep it alive
// and just toggle visibility instead.
let globalARInitialised = false

export function useAR(onMarkerFound: () => void) {
  const markerListenerAttached = useRef(false)

  // ── Attach markerFound listener (retries until marker element exists) ──
  const attachMarkerListener = useCallback(() => {
    if (markerListenerAttached.current) return
    const marker = document.querySelector('#hiro-marker')
    if (!marker) {
      setTimeout(attachMarkerListener, 400)
      return
    }
    marker.addEventListener('markerFound', onMarkerFound)
    markerListenerAttached.current = true
  }, [onMarkerFound])

  // ── Inject <a-scene> HTML the first time, then just show the wrapper ──
  const initAR = useCallback(() => {
    const wrapper = document.querySelector('#ar-wrapper') as HTMLElement | null
    if (!wrapper) return

    const base = import.meta.env.BASE_URL   // '/' in dev, '/repo-name/' in prod

    if (!globalARInitialised) {
      wrapper.innerHTML = `
        <a-scene
          id="ar-scene"
          embedded
          arjs="sourceType: webcam; debugUIEnabled: false;"
          gesture-detector
          renderer="colorManagement: true; alpha: true;"
          vr-mode-ui="enabled: false"
          style="position:absolute;inset:0;width:100%;height:100%;"
        >
          <a-assets>
            <a-asset-item
              id="chest-model"
              src="${base}models/Chest.glb"
            ></a-asset-item>
          </a-assets>

          <!-- Camera + raycaster so click animations on the model work -->
          <a-entity
            camera
            cursor="rayOrigin: mouse; fuse: false"
            raycaster="objects: .tocavel"
          ></a-entity>

          <!-- Hiro marker — same as your original HTML -->
          <a-marker id="hiro-marker" preset="hiro">
            <a-entity
              id="ar-model"
              class="tocavel"
              gesture-handler
              gltf-model="#chest-model"
              scale="0.7 0.7 0.7"
              position="0 0.5 0"
              animation__grow="property: scale; to: 2 2 2; dur: 60; startEvents: mousedown"
              animation__shrink="property: scale; to: 0.3 0.3 0.3; dur: 60; startEvents: mouseup"
            >
              <a-circle
                rotation="-90 0 0"
                radius="0.8"
                color="#000"
                opacity="0.3"
                position="0 0.01 0"
              ></a-circle>
            </a-entity>

            <a-light type="ambient"     color="#FFF" intensity="2.0"></a-light>
            <a-light type="directional" color="#FFF" intensity="1.5" position="5 10 5"></a-light>
          </a-marker>
        </a-scene>
      `
      globalARInitialised = true

      // Fix model materials after load — mirrors your original <script> block
      const arModel = document.querySelector('#ar-model')
      arModel?.addEventListener('model-loaded', (e: any) => {
        const model = e.detail.model
        model.traverse((node: any) => {
          if (!node.isMesh) return
          node.material.metalness = 0
          node.material.roughness = 1
          if (node.material.map) {
            // THREE is global thanks to A-Frame; sRGBEncoding = 3001
            node.material.map.encoding =
              (window as any).THREE?.sRGBEncoding ?? 3001
          }
          node.material.needsUpdate = true
        })
      })
    }

    showAR()
    // Attach marker listener — waits until <a-marker> is ready
    setTimeout(attachMarkerListener, 800)
  }, [attachMarkerListener])

  // ── Show: reveal wrapper + AR.js-injected <video> ─────────────────────
  function showAR() {
    const wrapper = document.querySelector('#ar-wrapper') as HTMLElement | null
    if (wrapper) wrapper.style.display = 'block'

    // AR.js injects a <video> directly into <body> for the camera feed
    document.querySelectorAll<HTMLVideoElement>('body > video').forEach(v => {
      v.style.display = 'block'
      v.style.zIndex  = '49'
    })
  }

  // ── Hide: conceal wrapper + video (camera keeps running silently) ──────
  function hideAR() {
    const wrapper = document.querySelector('#ar-wrapper') as HTMLElement | null
    if (wrapper) wrapper.style.display = 'none'

    document.querySelectorAll<HTMLVideoElement>('body > video').forEach(v => {
      v.style.display = 'none'
    })
  }

  return { initAR, hideAR }
}