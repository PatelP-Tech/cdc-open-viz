import React, { useEffect } from 'react'

// Context
import { ConfigContextProvider } from '@cdc/core/context/ConfigContext'

// Data
import defaults from './data/initial-state'

// Hooks
import useLoadConfig from '@cdc/core/hooks/useLoadConfig'
import useChartCreateRuntime from './hooks/useChartCreateRuntime'

// Components - Core
import Editor from '@cdc/core/components/Editor'
import ErrorBoundary from '@cdc/core/components/ErrorBoundary'
import Ghost from '@cdc/core/components/elements/Ghost'
import OverlayFrame from '@cdc/core/components/ui/OverlayFrame'

// Components - Local
import Chart from './components/Chart'
import EditorPanels from './components/EditorPanels'

// Styles
import './scss/cove-chart.scss'

// Visualization
const DataProxy = ({ configObj, configUrlObj, setParentConfig, editorMode, isConsumed }) => {
  const [ loadingConfig, reloadConfig ] = useLoadConfig(configObj, configUrlObj, defaults, useChartCreateRuntime)

  useEffect(() => {
    reloadConfig()
  }, [ configObj, configUrlObj ])

  return (<>
    {isConsumed ?
      <>
        {loadingConfig ?
          <Ghost display="editor"/> :
          <Editor EditorPanels={EditorPanels} setParentConfig={setParentConfig}>
            <Chart/>
          </Editor>
        }
      </> :
      <>
        {editorMode ?
          <>
            {loadingConfig ?
              <Ghost display="editor"/> :
              <Editor EditorPanels={EditorPanels}>
                <Chart/>
              </Editor>
            }
          </> :
          <>
            {loadingConfig ?
              <></> :
              <Chart/>
            }
          </>
        }
      </>
    }
  </>)
}

const CdcChart = ({ configObj, configUrlObj, setConfig: setParentConfig, editorMode, isConsumed }) => {
  return (
    <ErrorBoundary component="CdcChart">
      <ConfigContextProvider>
        <DataProxy configObj={configObj} configUrlObj={configUrlObj} setParentConfig={setParentConfig} editorMode={editorMode} isConsumed={isConsumed}/>
        <OverlayFrame/>
      </ConfigContextProvider>
    </ErrorBoundary>
  )
}

export default CdcChart