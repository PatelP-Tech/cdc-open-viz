import React from 'react'

// Data
import defaults from './data/initial-state'

// Hooks
// import useDashboardRuntime from '../hooks/useDashboardRuntime'

// Components - Core
import ConfigProxy from '@cdc/core/components/hoc/ConfigProxy'
import ErrorBoundary from '@cdc/core/components/hoc/ErrorBoundary'
import View from '@cdc/core/components/hoc/View'

// Components - Local
import Dashboard from './components/Dashboard'

// Styles
import './scss/cove-dashboard.scss'

const CdcDashboard = ({ config: configObj, configUrl, isWizard = false, setConfig: setParentConfig }) => {
  return (
  <ErrorBoundary component="CdcDashboard">
    <ConfigProxy configObj={configObj} configUrl={configUrl} setParentConfig={setParentConfig} defaults={defaults}>
      <View isDashboard={true} isWizard={isWizard}>
        <Dashboard/>
      </View>
    </ConfigProxy>
  </ErrorBoundary>
  )
}

export default CdcDashboard
