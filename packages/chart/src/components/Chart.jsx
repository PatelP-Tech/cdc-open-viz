import React, { useEffect, useState, lazy, Suspense } from 'react'

//Third Party
import { LegendItem, LegendLabel, LegendOrdinal } from '@visx/legend'
import { scaleOrdinal } from '@visx/scale'

//Context
import { useGlobalContext } from '@cdc/core/context/GlobalContext'
import { useConfigContext } from '@cdc/core/context/ConfigContext'

//Data
import { colorPalettesChart as colorPalettes } from '@cdc/core/data/colorPalettes'

//Helpers
import numberFromString from '@cdc/core/helpers/numberFromString'
import { capitalizeFirstLetter } from '@cdc/core/helpers/coveHelpers'

//Components
import Button from '@cdc/core/components/elements/Button'
import Component from '@cdc/core/components/Component'
import DataTable from './DataTable'
import LegendCircle from '@cdc/core/components/LegendCircle'
import RenderFallback from '@cdc/core/components/loaders/RenderFallback'

//Lazy Loads
const LinearChart = lazy(() => import('./Chart.Linear'))
const PieChart = lazy(() => import('./Chart.Pie'))

//Visualization
const Chart = () => {
  const { dimensions } = useGlobalContext()
  const { config, configActions, data, missingRequiredSections } = useConfigContext()
  const { legend, title, description } = config

  //Loader States
  const [ loadingDependencies, setLoadingDependencies ] = useState(true)

  //Data States
  const [ excludedData, setExcludedData ] = useState()
  const [ filteredData, setFilteredData ] = useState()

  //Function States
  const [ colorScale, setColorScale ] = useState(null)
  const [ seriesHighlight, setSeriesHighlight ] = useState([])

  // Generates color palette to pass to child chart component
  useEffect(() => {
    if (data && config.xAxis && config.runtime?.seriesKeys) {
      let palette = colorPalettes[config.palette]
      let numberOfKeys = config.runtime.seriesKeys.length

      while (numberOfKeys > palette.length) {
        palette = palette.concat(palette)
      }

      palette = palette.slice(0, numberOfKeys)

      const newColorScale = () => scaleOrdinal({
        domain: config.runtime.seriesLabelsAll,
        range: palette,
      })

      setColorScale(newColorScale)
    }
    if (config && data && config.sortData) data.sort(sortData)
  }, [ config, data ])

  //Required Dependency Functions
  useEffect(() => {
    let validColorScale = colorScale // Makes sure colorScale function is processed for both the Legend and Chart
    let validDimensions = dimensions && dimensions.width !== 0 // Only checks width - height is calculated using ratio on width

    if (validColorScale && validDimensions) setLoadingDependencies(false)
  }, [ colorScale, dimensions ])

  //Validate Required Sections
  useEffect(() => {
    if (config.visualizationType === 'Pie') {
      configActions.setMissingRequiredSections(undefined === config.yAxis.dataKey)
    } else {
      configActions.setMissingRequiredSections((undefined === config.series || !(config?.series.length > 0)))
    }

    configActions.setMissingRequiredSections(!config.xAxis.dataKey)
  }, [ config.series, config.xAxis.dataKey, config.yAxis.dataKey ])

  const filterData = (filters, data) => {
    let filteredData = []

    data.forEach((row) => {
      let add = true
      filters.forEach((filter) => {
        if (row[filter.columnName] !== filter.active) {
          add = false
        }
      })
      if (add) filteredData.push(row)
    })
    return filteredData
  }

  // Gets filer values from dataset
  const generateValuesForFilter = (columnName, data) => {
    const values = []

    data.forEach((row) => {
      const value = row[columnName]
      if (value && false === values.includes(value)) {
        values.push(value)
      }
    })

    return values
  }

  // Sorts data series for horizontal bar charts
  const sortData = (a, b) => {
    let sortKey = config.visualizationType === 'Bar' && config.visualizationSubType === 'horizontal' ? config.xAxis.dataKey : config.yAxis.sortKey
    let aData = parseFloat(a[sortKey])
    let bData = parseFloat(b[sortKey])

    if (aData < bData) {
      return config.sortData === 'ascending' ? 1 : -1
    } else if (aData > bData) {
      return config.sortData === 'ascending' ? -1 : 1
    } else {
      return 0
    }
  }

  // Called on legend click, highlights/unhighlights the data series with the given label
  const highlight = (label) => {
    const newSeriesHighlight = []

    // If we're highlighting all the series, reset them
    if (seriesHighlight.length + 1 === config.runtime.seriesKeys.length) {
      highlightReset()
      return
    }

    seriesHighlight.forEach((value) => {
      newSeriesHighlight.push(value)
    })

    let newHighlight = label.datum
    if (config.runtime.seriesLabels) {
      for (let i = 0; i < config.runtime.seriesKeys.length; i++) {
        if (config.runtime.seriesLabels[config.runtime.seriesKeys[i]] === label.datum) {
          newHighlight = config.runtime.seriesKeys[i]
          break
        }
      }
    }

    if (newSeriesHighlight.indexOf(newHighlight) !== -1) {
      newSeriesHighlight.splice(newSeriesHighlight.indexOf(newHighlight), 1)
    } else {
      newSeriesHighlight.push(newHighlight)
    }

    setSeriesHighlight(newSeriesHighlight)
  }

  // Called on reset button click, unhighlights all data series
  const highlightReset = () => {
    setSeriesHighlight([])
  }

  // Format numeric data based on settings in config
  const formatNumber = (num) => {
    let original = num
    let prefix = config.dataFormat.prefix
    let suffix = config.dataFormat.suffix

    num = numberFromString(num)

    if (isNaN(num)) return config.runtime.editorErrorMessage = `Unable to parse number from data ${original}. Try reviewing your data and selections in the Data Series section.`

    if (!config.dataFormat) return num
    if (config.dataCutoff) {
      let cutoff = numberFromString(config.dataCutoff)

      if (num < cutoff) {
        prefix = '< ' + (prefix || '')
        num = cutoff
      }
    }
    if (config.dataFormat.roundTo) num = num.toFixed(config.dataFormat.roundTo)
    if (config.dataFormat.commas) num = num.toLocaleString('en-US')

    let result = ''

    if (prefix) {
      result += prefix
    }

    result += num

    if (suffix) {
      result += suffix
    }

    return result
  }

  // JSX for Legend
  const Legend = () => {
    const labelsAreReversed = () => (config.orientation === 'horizontal' && config.legend.reverseLabelOrder)

    return (
      <aside id="legend" className="cove-chart__legend" flow={config.legend.position} role="region" aria-label="legend">
        {legend.label && <h2 className="cove-heading--4 mb-1">{legend.label}</h2>}
        <LegendOrdinal scale={colorScale} itemDirection="row" labelMargin="0 20px 0 0" shapeMargin="0 10px 0">
          {labels => (
            <div className={'cove-chart__legend-container' + (labelsAreReversed() ? ' reverse' : '')}>
              {labels.map((label, i) => {
                const isInactive = () => seriesHighlight.length > 0 && false === seriesHighlight.includes(itemName)

                let itemName = label.datum

                // Filter excluded data keys from legend
                if (config.exclusions.active && config.exclusions.keys?.includes(itemName)) return null

                if (config.runtime.seriesLabels) {
                  let index = config.runtime.seriesLabelsAll.indexOf(itemName)
                  itemName = config.runtime.seriesKeys[index]
                }

                return (
                  <LegendItem
                    className={'cove-chart__legend-item' + (isInactive() ? ' inactive' : '')}
                    tabIndex={0} key={`legend-quantile-${i}`}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        highlight(label)
                      }
                    }}
                    onClick={() => {
                      highlight(label)
                    }}
                  >
                    <LegendCircle fill={label.value}/>
                    <LegendLabel className="cove-chart__legend-text" align="left" margin="0 0 0 4px">{capitalizeFirstLetter(label.text)}</LegendLabel>
                  </LegendItem>
                )
              })}
              {seriesHighlight.length > 0 &&
                <Button className={`cove-chart__legend__reset-button`} onClick={highlightReset}>Reset</Button>}
            </div>
          )}
        </LegendOrdinal>
      </aside>
    )
  }

  const Filters = () => {
    const changeFilterActive = (index, value) => {
      let newFilters = config.filters
      newFilters[index].active = value
      configActions.setConfig({ ...config, filters: newFilters })
      setFilteredData(filterData(newFilters, excludedData))
    }

    const announceChange = (text) => {
    }

    let filterList = ''
    if (config.filters) {

      filterList = config.filters.map((singleFilter, index) => {
        const values = []
        const sortAsc = (a, b) => {
          return a.toString().localeCompare(b.toString(), 'en', { numeric: true })
        }

        const sortDesc = (a, b) => {
          return b.toString().localeCompare(a.toString(), 'en', { numeric: true })
        }

        if (!singleFilter.order || singleFilter.order === '') {
          singleFilter.order = 'asc'
        }

        if (singleFilter.order === 'desc') {
          singleFilter.values = singleFilter.values.sort(sortDesc)
        }

        if (singleFilter.order === 'asc') {
          singleFilter.values = singleFilter.values.sort(sortAsc)
        }

        singleFilter.values.forEach((filterOption, index) => {
          values.push(
            <option key={index} value={filterOption}>
              {filterOption}
            </option>
          )
        })

        return (
          <div className="single-filter" key={index}>
            <label htmlFor={`filter-${index}`}>{singleFilter.label}</label>
            <select
              id={`filter-${index}`}
              className="filter-select"
              data-index="0"
              value={singleFilter.active}
              onChange={(val) => {
                changeFilterActive(index, val.target.value)
                announceChange(`Filter ${singleFilter.label} value has been changed to ${val.target.value}, please reference the data table to see updated values.`)
              }}
            >
              {values}
            </select>
          </div>
        )
      })
    }

    return (<section className="filters-section">{filterList}</section>)
  }

  const handleChartTabbing = config.showSidebar
    ? `#legend`
    : config?.title
      ? `#dataTableSection__${config.title.replace(/\s/g, '')}`
      : `#dataTableSection`

  //Build Chart styles
  let lineDatapointClass = ''
  let barBorderClass = ''

  if (config.lineDatapointStyle === 'hover') lineDatapointClass = ' line--hover'
  if (config.lineDatapointStyle === 'always show') lineDatapointClass = ' line--always'
  if (config.barHasBorder === 'false') barBorderClass = ' no-border'

  const chartProps = {
    dimensions,
    colorScale,
    seriesHighlight,
    formatNumber
  }

  const chartList = {
    'Paired Bar': <LinearChart {...chartProps}/>,
    'Bar': <LinearChart {...chartProps}/>,
    'Line': <LinearChart {...chartProps}/>,
    'Combo': <LinearChart {...chartProps}/>,
    'Pie': <PieChart {...chartProps}/>
  }

  return (
    <Component className="cove-chart" title={title} description={description}
               tableShowIf={config.xAxis.dataKey && config.table.show && config.visualizationType !== 'Paired Bar'}
               theme={config.theme}
      // table={<DataTable/>}
    >
      <Suspense fallback={<RenderFallback style={{height: 418}} text="Rendering chart..." loadSpinSize={75}/>}>
        <div className={`cove-chart__container${config.legend.hide ? ' legend-hidden' : ''}${lineDatapointClass}${barBorderClass}`}>
          <a className="sr-only" href={handleChartTabbing}>
            Skip Over Chart Container
          </a>
          {config.filters && <Filters/>}
          {missingRequiredSections && <>Missing data in sections</>}
          {!loadingDependencies && !missingRequiredSections && !config.newViz && (<>
            <div className="cove-chart__visualization" flow={config.legend.position === 'left' ? 'right' : 'left'}>
              {chartList[config.visualizationType]}
            </div>
            {!config.legend.hide && <Legend/>}
          </>)}
        </div>
      </Suspense>
    </Component>
  )
}

export default Chart
