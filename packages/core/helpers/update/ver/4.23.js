const update_4_23 = async config => {
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

      if (newConfig.visual.accent) delete newConfig.visual.accent
      if (newConfig.visual.background) delete newConfig.visual.background
      if (newConfig.visual.border) delete newConfig.visual.border
      if (newConfig.visual.shadow) delete newConfig.visual.shadow
    }

    // Remove old visual config entries

    // Config alterations complete
    // Add validation mark to config...
    newConfig.validated = ver
  }

  return newConfig
}

export default update_4_23