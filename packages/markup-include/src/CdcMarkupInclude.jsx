import React, { useEffect } from 'react'

// Context
import { ConfigContextProvider } from '@cdc/core/context/ConfigContext'

// Data
import defaults from './data/initial-state'

// Hooks
import useLoadConfig from '@cdc/core/hooks/useLoadConfig'

// Components - Core
import Editor from '@cdc/core/components/Editor'
import ErrorBoundary from '@cdc/core/components/ErrorBoundary'
import Ghost from '@cdc/core/components/elements/Ghost'
import OverlayFrame from '@cdc/core/components/ui/OverlayFrame'

// Components - Local
import EditorPanels from './components/EditorPanels'
import MarkupInclude from './components/MarkupInclude'

// Styles
import './scss/cove-markup-include.scss'

// Visualization
const DataProxy = ({ configObj, configUrlObj, setParentConfig, editorMode, isConsumed }) => {
  const [ loadingConfig, reloadConfig ] = useLoadConfig(configObj, configUrlObj, defaults)

  useEffect(() => {
    reloadConfig()
  }, [ configObj, configUrlObj ])

  return (<>
    {isConsumed ?
      <>
        {loadingConfig ?
          <Ghost display="editor"/> :
          <Editor EditorPanels={EditorPanels} setParentConfig={setParentConfig}>
            <MarkupInclude/>
          </Editor>
        }
      </> :
      <>
        {editorMode ?
          <>
            {loadingConfig ?
              <Ghost display="editor"/> :
              <Editor EditorPanels={EditorPanels}>
                <MarkupInclude/>
              </Editor>
            }
          </> :
          <>
            {loadingConfig ?
              <></> :
              <MarkupInclude/>
            }
          </>
        }
      </>
    }
  </>)
}

const CdcMarkupInclude = ({ configObj, configUrlObj, setConfig: setParentConfig, editorMode, isConsumed }) => {
  return (
    <ErrorBoundary component="CdcMarkupInclude">
      <ConfigContextProvider>
        <DataProxy configObj={configObj} configUrlObj={configUrlObj} setParentConfig={setParentConfig} editorMode={editorMode} isConsumed={isConsumed}/>
        <OverlayFrame/>
      </ConfigContextProvider>
    </ErrorBoundary>
  )
}


export default CdcMarkupInclude
