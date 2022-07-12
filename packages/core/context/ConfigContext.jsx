import React, { createContext, useContext, useState } from 'react'

import { setConfigKeyValue } from '../helpers/configHelpers'

export const ConfigContext = createContext({})
export const useConfigContext = () => useContext(ConfigContext)

export const ConfigContextProvider = ({ children }) => {
  const merge = require('lodash.merge')

  const [ configDefaults, setConfigDefaults ] = useState({}) // Default config object, loaded from local file
  const [ config, setConfig ] = useState({}) // Working config object, loaded from supplied object, or external json url
  const [ configRuntime, setConfigRuntime ] = useState() // Working config runtime function generated by sideloaded runtime function
  const [ data, setData ] = useState(config?.data || [])// Working config.data set for visualization

  const [ missingRequiredSections, setMissingRequiredSections ] = useState(false)// Integrity check for supplied data - set in visualization

  // Global Actions
  const updateConfig = (newConfig, runtimeInjection = null) => {
    // Create new keys on newConfig from defaults that don't exist
    Object.keys(configDefaults).forEach(key => {
      if (newConfig[key] && 'object' === typeof newConfig[key] && !Array.isArray(newConfig[key])) {
        newConfig[key] = { ...configDefaults[key], ...newConfig[key] }
      }
    })

    /* Developer Note - Runtimes --------------------------------------------------------
       A component's optional "runtime" (config.runtime) is generated by first loading
       the initial config file/object, then dynamically processing certain config values
       through a sideloaded runtime function. This function generates, then returns,
       the config object in a modified format containing the processed config.runtime
       values. Runtime values are specific for use with a selected component subtype
       or option (i.e. swapping X and Y axis), based on the original (or updated)
       config values. The runtime config values are then referenced for use in the
       final visualization's render.
     -------------------------------------------------------------------------------- */

    // Process any runtime functions provided (opional)
    // 1a) Check if runtime function provided (from initial load), then
    if (runtimeInjection) runtimeInjection(newConfig)

    // 1b) Check if runtime function is in context (for updateField use)
    if (configRuntime) configRuntime(newConfig)

    // 2) If runtime was supplied to useLoadConfig hook, and isn't stored in ConfigContext,
    // then push the runtime function to ConfigContext
    if (runtimeInjection && !configRuntime) setConfigRuntime(() => runtimeInjection)

    //TODO: COVE Refactor - Use newData variable as base to filter and exclude returned data
    //setExcludedData
    //setFilteredData

    setConfig({ ...newConfig })
  }

  const updateField = (fieldPayload, setValue) => {
    let newConfig = {}
    let updateFieldObj = setConfigKeyValue(fieldPayload, setValue)

    merge(newConfig, config, updateFieldObj)

    updateConfig(newConfig)
  }

  //Build Context
  const configContext = {
    config,
    configDefaults,
    configRuntime,
    data,
    missingRequiredSections,
    configActions: {
      setConfig,
      setConfigDefaults,
      setConfigRuntime,
      setData,
      setMissingRequiredSections,
      updateField,
      updateConfig
    }
  }

  return (
    <ConfigContext.Provider value={configContext}>
      {children}
    </ConfigContext.Provider>
  )
}

ConfigContextProvider.displayName = 'ConfigContext'
ConfigContext.displayName = 'ConfigContext'