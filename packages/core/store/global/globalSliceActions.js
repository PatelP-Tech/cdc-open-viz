const globalSliceActions = (set, get) => ({
  // Actions --------------------------------------------------------------------------------------------------------------------------------------------------------------
  setViewMode: (view, value) => set(state => {
    state.viewMode[view] = value
  }),
  setViewport: (viewport) => set(() => ({
    viewport: viewport
  })),
  setDimensions: (dimensions) => set(() => ({
    dimensions: dimensions
  })),

  // Overlay Actions
  openOverlay: (obj, disableBgClose = false) => set(() => ({
    overlay: {
      object: obj,
      show: true,
      disableBgClose: disableBgClose
    }
  })),
  toggleOverlay: (display = false) => set(() => ({
    overlay: {
      show: display
    }
  }))
})

export default globalSliceActions