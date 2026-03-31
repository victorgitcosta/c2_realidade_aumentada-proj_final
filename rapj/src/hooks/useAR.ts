import { useRef, useCallback } from 'react'

let globalARInitialised = false

export function useAR(onMarkerFound: () => void) {
  const markerListenerAttached = useRef(false)

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

  const initAR = useCallback(() => {
    const wrapper = document.querySelector('#ar-wrapper') as HTMLElement | null
    if (!wrapper) return

    const base = import.meta.env.BASE_URL 

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
            <a-asset-item id="chest-model" src="${base}models/Chest.glb"></a-asset-item>
          </a-assets>

          <a-entity camera cursor="rayOrigin: mouse; fuse: false" raycaster="objects: .tocavel"></a-entity>

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
              <a-circle rotation="-90 0 0" radius="0.8" color="#000" opacity="0.3" position="0 0.01 0"></a-circle>
            </a-entity>

            <a-light type="ambient" color="#FFF" intensity="2.0"></a-light>
            <a-light type="directional" color="#FFF" intensity="1.5" position="5 10 5"></a-light>
          </a-marker>
        </a-scene>
      `
      globalARInitialised = true

      const arModel = document.querySelector('#ar-model')
      arModel?.addEventListener('model-loaded', (e: any) => {
        const model = e.detail.model
        model.traverse((node: any) => {
          if (!node.isMesh) return
          node.material.metalness = 0
          node.material.roughness = 1
          if (node.material.map) {
            node.material.map.encoding = (window as any).THREE?.sRGBEncoding ?? 3001
          }
          node.material.needsUpdate = true
        })
      })
    }

    showAR()
    setTimeout(attachMarkerListener, 800)
  }, [attachMarkerListener])

  // ── Show: reveal wrapper and tell body that AR is active ──────────────
  function showAR() {
    const wrapper = document.querySelector('#ar-wrapper') as HTMLElement | null
    if (wrapper) wrapper.style.display = 'block'
    
    // Let CSS handle the async video injection
    document.body.classList.add('ar-active')
  }

  // ── Hide: conceal wrapper and tell body AR is inactive ────────────────
  function hideAR() {
    const wrapper = document.querySelector('#ar-wrapper') as HTMLElement | null
    if (wrapper) wrapper.style.display = 'none'

    document.body.classList.remove('ar-active')
  }

  return { initAR, hideAR }
}