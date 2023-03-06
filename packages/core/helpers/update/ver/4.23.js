const update_4_23 = (config) => {
  const ver = 4.23

  let newConfig = { ...config }

  if (!config.validated || config.validated < ver) {

    // Convert theme definition in config to color only
    if (newConfig.theme && newConfig.theme.includes('theme-')) {
      newConfig.theme = newConfig.theme.split('-')[1]
    }

    // Move old visual config entries into new key
    if (newConfig.visual) {
      newConfig.componentStyle = {
        accent: newConfig.visual.accent,
        background: newConfig.visual.background,
        border: newConfig.visual.border,
        shadow: newConfig.visual.shadow
      }
    }

    // Remove old visual config entries
    delete newConfig.visual

    // Config alterations complete
    // Add validation mark to config...
    newConfig.validated = ver
  }

  return newConfig
}

export default update_4_23
