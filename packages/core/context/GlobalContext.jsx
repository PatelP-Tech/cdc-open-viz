import React, { createContext, useContext, useCallback, useState } from 'react'

// Helpers
import getViewport from '../helpers/getViewport'

// Styles
import '../styles/main.scss'

export const GlobalContext = createContext({
  dimensions: {
    width: 300,
    height: 180
  }
})
export const useGlobalContext = () => useContext(GlobalContext)

export const GlobalContextProvider = ({ children }) => {
  const [ globalContext, setGlobalContext ] = useState({}) // Needs an empty object to assign new settings
  const [ viewMode, setViewMode ] = useState('component')
  const [ wizardActiveTab, setWizardActiveTab ] = useState(0)
  const [ editorMode ] = useState(window.location.href.includes('editor=true'))
  const [ currentViewport, setCurrentViewport ] = useState('lg')

  // Overlay Actions -----------------------------------
  const openOverlay = (obj, disableBgClose = false) => {
    let payload = { object: obj, show: true, disableBgClose: disableBgClose }
    setGlobalContext(context => ({ ...context, overlay: { ...payload } }))
  }

  const toggleOverlay = (display = false) => {
    setGlobalContext(context => ({
      ...context,
      overlay: {
        ...context.overlay,
        show: display
      }
    }))
  }

  // General Actions & Data -----------------------------------
  const getOS = navigator.userAgent.indexOf('Win') !== -1 ? 'Win' : navigator.userAgent.indexOf('Mac') !== -1 ? 'MacOS' : null

  // Observe and register changes to viewport size
  const resizeObserver = new ResizeObserver(entries => {
    for (let entry of entries) {
      let { width } = entry.contentRect
      setCurrentViewport(getViewport(width))
    }
  })

  // Create viewport size observer callback
  const outerContainerRef = useCallback(node => {
    if (node !== null) {
      resizeObserver.observe(node)
    }
  }, [])

  return (
    <GlobalContext.Provider value={{
      globalActions: {
        setGlobalContext,
        setViewMode,
        setWizardActiveTab
      },
      os: getOS,
      viewMode,
      wizardActiveTab,
      editorMode,
      viewport: currentViewport,
      dimensions: globalContext.dimensions,
      overlay: {
        object: globalContext.overlay?.object || null,
        show: globalContext.overlay?.show || false,
        disableBgClose: globalContext.overlay?.disableBgClose || false,
        actions: {
          openOverlay,
          toggleOverlay
        }
      }
    }}>
      <div className={'cove' + (currentViewport ? ' ' + currentViewport : '')} ref={outerContainerRef}>
        {children}
      </div>
    </GlobalContext.Provider>
  )
}

GlobalContextProvider.displayName = 'GlobalContext'
GlobalContext.displayName = 'GlobalContext'