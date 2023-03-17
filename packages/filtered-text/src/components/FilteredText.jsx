import React from 'react'

// Third Party
import parse from 'html-react-parser'

// Store
import useStore from '@cdc/core/store/store'

// Hooks
import { useVisConfig } from '@cdc/core/hooks/store/useVisConfig'

// Visualization
const FilteredText = () => {
  const { config } = useVisConfig()
  const data = useStore(state => state.data)

  const filteredText = () => {
    let filteredData = []

    if (config.filters && config.filters.length) {
      config.filters.map(filter => {
        if (filter.columnName && filter.columnValue) {
          return filteredData = data.filter(
            (entry) => entry[filter.columnName] === filter.columnValue
          )
        } else {
          return null
        }
      })
    } else {
      // filter by textColumn if selected
      if (data && config.textColumn) {
        return (filteredData = data.filter(
            (entry, index) => entry[config.textColumn] && index === 0)
        )
      }
    }

    return filteredData
  }

  return (<>
    {config.missingRequiredSections && <>Missing data in sections</>}
    {!config.missingRequiredSections && <>
      {
        filteredText().slice(0, 1).map((entry, i) => (
          <p key={i}>
            {parse(entry[config.textColumn] || '')}
          </p>
        ))
      }
    </>
    }
  </>)
}

export default FilteredText