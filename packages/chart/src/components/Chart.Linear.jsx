import React, { useEffect, useState } from 'react'
import ReactTooltip from 'react-tooltip'

//Third Party
import { Group } from '@visx/group'
import { Line } from '@visx/shape'
import { Text } from '@visx/text'
import { scaleLinear, scalePoint } from '@visx/scale'
import { AxisLeft, AxisBottom } from '@visx/axis'

//Context
import { useGlobalContext } from '@cdc/core/context/GlobalContext'
import { useConfigContext } from '@cdc/core/context/ConfigContext'

//Hooks
import useReduceData from '../hooks/useReduceData'

//Helpers
import { visxParseDate, visxFormatDate } from '@cdc/core/helpers/visxHelpers'

//Components - Core
import ErrorBoundary from '@cdc/core/components/ErrorBoundary'

//Components - Local
import ChartLinearBar from './Chart.Linear.Bar'
import ChartLinearBarPaired from './Chart.Linear.BarPaired'
import ChartLinearLine from './Chart.Linear.Line'

//Visualization
const ChartLinear = ({ dimensions, colorScale, seriesHighlight, formatNumber }) => {
  const { viewport } = useGlobalContext()
  const { config, data } = useConfigContext()
  const { minValue, maxValue } = useReduceData(config, data)

  const SVG_MARGIN = 32
  const CONTAINER_PERCENT_WIDTH = 0.73

  let chartWidth = dimensions.width - SVG_MARGIN
  let chartHeight = config.aspectRatio ? (chartWidth * config.aspectRatio) : config.height || dimensions.height

  if (config && config.legend && !config.legend.hide && (viewport === 'lg' || viewport === 'md')) {
    //Resize the chart svg width so legend can flex to the right - md and lg viewports
    chartWidth = chartWidth * CONTAINER_PERCENT_WIDTH
  }

  const xMax = chartWidth - config.runtime.yAxis.size
  const yMax = chartHeight - config.runtime.xAxis.size

  const getXAxisData = (d) => config.runtime.xAxis.type === 'date'
    ? (visxParseDate(config.runtime.xAxis.dateParseFormat, d[config.runtime.originalXAxis.dataKey])).getTime()
    : d[config.runtime.originalXAxis.dataKey]
  const getYAxisData = (d, seriesKey) => d[seriesKey]

  let xScale
  let yScale
  let seriesScale

  if (data) {
    let min = config.runtime.yAxis.min !== undefined ? config.runtime.yAxis.min : minValue
    let max = config.runtime.yAxis.max !== undefined ? config.runtime.yAxis.max : Number.MIN_VALUE

    if ((config.visualizationType === 'Bar' || config.visualizationType === 'Combo') && min > 0) {
      min = 0
    }

    //If data value max wasn't provided, calculate it
    if (max === Number.MIN_VALUE) {
      max = maxValue
    }

    //Adds Y Axis data padding if applicable
    if (config.runtime.yAxis.paddingPercent) {
      let paddingValue = (max - min) * config.runtime.yAxis.paddingPercent
      min -= paddingValue
      max += paddingValue
    }

    let xAxisDataMapped = data.map(d => getXAxisData(d))

    if (config.runtime.horizontal) {
      xScale = scaleLinear({
        domain: [ min, max ],
        range: [ 0, xMax ]
      })

      yScale = config.runtime.xAxis.type === 'date' ?
        scaleLinear({ domain: [ Math.min(...xAxisDataMapped), Math.max(...xAxisDataMapped) ] }) :
        scalePoint({ domain: xAxisDataMapped, padding: 0.5 })

      seriesScale = scalePoint({
        domain: (config.runtime.barSeriesKeys || config.runtime.seriesKeys),
        range: [ 0, yMax ]
      })

      yScale.rangeRound([ 0, yMax ])

    } else {
      min = min < 0 ? min * 1.11 : min

      yScale = scaleLinear({
        domain: [ min, max ],
        range: [ yMax, 0 ]
      })

      xScale = scalePoint({ domain: xAxisDataMapped, range: [ 0, xMax ], padding: 0.5 })

      seriesScale = scalePoint({
        domain: (config.runtime.barSeriesKeys || config.runtime.seriesKeys),
        range: [ 0, xMax ]
      })
    }

    if (config.visualizationType === 'Paired Bar') {
      let groupOneMax = Math.max.apply(Math, data.map(d => d[config.series[0].dataKey]))
      let groupTwoMax = Math.max.apply(Math, data.map(d => d[config.series[1].dataKey]))

      // group one
      var g1xScale = scaleLinear({
        domain: [ 0, Math.max(groupOneMax, groupTwoMax) ],
        range: [ xMax / 2, 0 ]
      })

      // group 2
      var g2xScale = scaleLinear({
        domain: g1xScale.domain(),
        range: [ xMax / 2, xMax ]
      })

    }
  }

  useEffect(() => {
    ReactTooltip.rebuild()
  })

  return (
    <ErrorBoundary component="ChartLinear">
      <svg className="cove-chart__visualization--chart-linear" width={chartWidth} height={chartHeight}>
        {/* Higlighted regions */}
        {config.regions ? config.regions.map((region) => {
          if (!Object.keys(region).includes('from') || !Object.keys(region).includes('to')) return null

          const from = xScale((visxParseDate(config.runtime.xAxis.dateParseFormat, region.from)).getTime())
          const to = xScale((visxParseDate(config.runtime.xAxis.dateParseFormat, region.to)).getTime())
          const width = to - from

          return (
            <Group className="regions" left={config.runtime.yAxis.size} key={region.label}>
              <path stroke="#333" d={`M${from} -5
                          L${from} 5
                          M${from} 0
                          L${to} 0
                          M${to} -5
                          L${to} 5`}/>
              <rect
                x={from}
                y={0}
                width={width}
                height={yMax}
                fill={region.background}
                opacity={0.3}/>
              <Text
                x={from + (width / 2)}
                y={5}
                fill={region.color}
                verticalAnchor="start"
                textAnchor="middle">
                {region.label}
              </Text>
            </Group>
          )
        }) : ''}

        {/* Y axis */}
        <AxisLeft
          scale={yScale}
          left={config.runtime.yAxis.size}
          label={config.runtime.yAxis.label}
          stroke="#333"
          numTicks={config.runtime.yAxis.numTicks || undefined}
        >
          {props => {
            const lollipopShapeSize = config.lollipopSize === 'large' ? 14 : config.lollipopSize === 'medium' ? 12 : 10
            const axisCenter = config.runtime.horizontal ? (props.axisToPoint.y - props.axisFromPoint.y) / 2 : (props.axisFromPoint.y - props.axisToPoint.y) / 2
            const horizontalTickOffset = yMax / props.ticks.length / 2 - (yMax / props.ticks.length * (1 - config.barThickness)) + 5
            const belowBarPaddingFromTop = 9
            return (
              <Group className="left-axis">
                {props.ticks.map((tick, i) => {
                  return (
                    <Group
                      key={`vx-tick-${tick.value}-${i}`}
                      className={'vx-axis-tick'}
                    >
                      {!config.runtime.yAxis.hideTicks && (
                        <Line
                          from={tick.from}
                          to={tick.to}
                          stroke="#333"
                          display={config.runtime.horizontal ? 'none' : 'block'}
                        />
                      )}
                      {config.runtime.yAxis.gridLines ? (
                        <Line
                          from={{ x: tick.from.x + xMax, y: tick.from.y }}
                          to={tick.from}
                          stroke="rgba(0,0,0,0.3)"
                        />
                      ) : ''
                      }

                      {(config.orientation === 'horizontal' && config.visualizationSubType !== 'stacked') && (config.yAxis.labelPlacement === 'On Date/Category Axis') && !config.yAxis.hideLabel &&
                        // 17 is a magic number from the offset in barchart.
                        <>
                          <Text
                            transform={`translate(${tick.to.x - 5}, ${config.isLollipopChart ? tick.from.y : tick.from.y - 17}) rotate(-${config.runtime.horizontal ? config.runtime.yAxis.tickRotation : 0})`}
                            verticalAnchor={config.isLollipopChart ? 'middle' : 'middle'}
                            textAnchor={'end'}
                          >{tick.formattedValue}</Text>
                        </>
                      }

                      {(config.orientation === 'horizontal' && config.visualizationSubType === 'stacked') && (config.yAxis.labelPlacement === 'On Date/Category Axis') && !config.yAxis.hideLabel &&
                        // 17 is a magic number from the offset in barchart.
                        <Text
                          transform={`translate(${tick.to.x - 5}, ${tick.from.y - config.barHeight / 2 - 3}) rotate(-${config.runtime.horizontal ? config.runtime.yAxis.tickRotation : 0})`}
                          verticalAnchor={config.isLollipopChart ? 'middle' : 'middle'}
                          textAnchor={'end'}
                        >{tick.formattedValue}</Text>
                      }


                      {config.orientation !== 'horizontal' && config.visualizationType !== 'Paired Bar' && !config.yAxis.hideLabel &&
                        <Text
                          x={config.runtime.horizontal ? tick.from.x + 2 : tick.to.x}
                          y={tick.to.y + (config.runtime.horizontal ? horizontalTickOffset : 0)}
                          verticalAnchor={config.runtime.horizontal ? 'start' : 'middle'}
                          textAnchor={config.runtime.horizontal ? 'start' : 'end'}
                        >
                          {tick.formattedValue}
                        </Text>
                      }

                    </Group>
                  )
                })}
                {!config.yAxis.hideAxis && (
                  <Line
                    from={props.axisFromPoint}
                    to={props.axisToPoint}
                    stroke="#333"
                  />
                )}
                {yScale.domain()[0] < 0 && (
                  <Line
                    from={{ x: props.axisFromPoint.x, y: yScale(0) }}
                    to={{ x: xMax, y: yScale(0) }}
                    stroke="#333"
                  />
                )}
                <Text
                  className="y-label"
                  textAnchor="middle"
                  verticalAnchor="start"
                  transform={`translate(${-1 * config.runtime.yAxis.size}, ${axisCenter}) rotate(-90)`}
                  fontWeight="bold"
                >
                  {props.label}
                </Text>
              </Group>
            )
          }}
        </AxisLeft>

        {/* X axis */}
        {config.visualizationType !== 'Paired Bar' && (
          <AxisBottom
            top={yMax}
            left={config.runtime.yAxis.size}
            label={config.runtime.xAxis.label}
            tickFormat={config.runtime.xAxis.type === 'date' ? visxFormatDate(config.runtime.xAxis.dateDisplayFormat) : (tick) => tick}
            scale={xScale}
            stroke="#333"
            tickStroke="#333"
            numTicks={config.runtime.xAxis.numTicks || undefined}
          >
            {props => {
              const axisCenter = (props.axisToPoint.x - props.axisFromPoint.x) / 2
              return (
                <Group className="bottom-axis">
                  {props.ticks.map((tick, i) => {
                    const tickWidth = xMax / props.ticks.length
                    return (
                      <Group
                        key={`vx-tick-${tick.value}-${i}`}
                        className={'vx-axis-tick'}
                      >
                        {!config.xAxis.hideTicks && (
                          <Line
                            from={tick.from}
                            to={tick.to}
                            stroke="#333"
                          />
                        )}
                        {!config.xAxis.hideLabel && (
                          <Text
                            transform={`translate(${tick.to.x}, ${tick.to.y}) rotate(-${!config.runtime.horizontal ? config.runtime.xAxis.tickRotation : 0})`}
                            verticalAnchor="start"
                            textAnchor={config.runtime.xAxis.tickRotation && config.runtime.xAxis.tickRotation !== '0' ? 'end' : 'middle'}
                            width={config.runtime.xAxis.tickRotation && config.runtime.xAxis.tickRotation !== '0' ? undefined : tickWidth}
                          >
                            {tick.formattedValue}
                          </Text>
                        )}

                      </Group>
                    )
                  })}
                  {!config.xAxis.hideAxis && (
                    <Line
                      from={props.axisFromPoint}
                      to={props.axisToPoint}
                      stroke="#333"
                    />
                  )}
                  <Text
                    x={axisCenter}
                    y={config.runtime.xAxis.size}
                    textAnchor="middle"
                    verticalAnchor="end"
                    fontWeight="bold"
                  >
                    {props.label}
                  </Text>
                </Group>
              )
            }}
          </AxisBottom>
        )}

        {config.visualizationType === 'Paired Bar' &&
          <>
            <AxisBottom
              top={yMax}
              left={config.runtime.yAxis.size}
              label={config.runtime.xAxis.label}
              tickFormat={config.runtime.xAxis.type === 'date' ? visxFormatDate(config.runtime.xAxis.dateDisplayFormat) : (tick) => tick}
              scale={g1xScale}
              stroke="#333"
              tickStroke="#333"
              numTicks={config.runtime.xAxis.numTicks || undefined}
            >
              {props => {
                return (
                  <Group className="bottom-axis">
                    {props.ticks.map((tick, i) => {
                      const tickWidth = xMax / props.ticks.length
                      return (
                        <Group
                          key={`vx-tick-${tick.value}-${i}`}
                          className={'vx-axis-tick'}
                        >
                          <Line
                            from={tick.from}
                            to={tick.to}
                            stroke="#333"
                          />
                          <Text
                            transform={`translate(${tick.to.x}, ${tick.to.y}) rotate(-${60})`}
                            verticalAnchor="start"
                            textAnchor={'end'}
                            width={config.runtime.xAxis.tickRotation && config.runtime.xAxis.tickRotation !== '0' ? undefined : tickWidth}
                          >
                            {tick.formattedValue}
                          </Text>
                        </Group>
                      )
                    })}
                    <Line
                      from={props.axisFromPoint}
                      to={props.axisToPoint}
                      stroke="#333"
                    />
                  </Group>
                )
              }}
            </AxisBottom>
            <AxisBottom
              top={yMax}
              left={config.runtime.yAxis.size}
              label={config.runtime.xAxis.label}
              tickFormat={config.runtime.xAxis.type === 'date' ? visxFormatDate(config.runtime.xAxis.dateDisplayFormat) : (tick) => tick}
              scale={g2xScale}
              stroke="#333"
              tickStroke="#333"
              numTicks={config.runtime.xAxis.numTicks || undefined}
            >
              {props => {
                return (
                  <Group className="bottom-axis">
                    {props.ticks.map((tick, i) => {
                      const tickWidth = xMax / props.ticks.length
                      return (
                        <Group
                          key={`vx-tick-${tick.value}-${i}`}
                          className={'vx-axis-tick'}
                        >
                          <Line
                            from={tick.from}
                            to={tick.to}
                            stroke="#333"
                          />
                          <Text
                            transform={`translate(${tick.to.x}, ${tick.to.y}) rotate(-${60})`}
                            verticalAnchor="start"
                            textAnchor={'end'}
                            width={config.runtime.xAxis.tickRotation && config.runtime.xAxis.tickRotation !== '0' ? undefined : tickWidth}
                          >
                            {tick.formattedValue}
                          </Text>
                        </Group>
                      )
                    })}
                    <Line
                      from={props.axisFromPoint}
                      to={props.axisToPoint}
                      stroke="#333"
                    />
                  </Group>
                )
              }}
            </AxisBottom>
          </>
        }
        {config.visualizationType === 'Paired Bar' && (
          <ChartLinearBarPaired colorScale={colorScale} width={xMax} height={yMax}/>
        )}

        {/* Bar chart */}
        {(config.visualizationType !== 'Line' && config.visualizationType !== 'Paired Bar') && (
          <ChartLinearBar colorScale={colorScale} seriesHighlight={seriesHighlight} formatNumber={formatNumber}
                          xScale={xScale} yScale={yScale} seriesScale={seriesScale} xMax={xMax} yMax={yMax}
                          getXAxisData={getXAxisData} getYAxisData={getYAxisData}/>
        )}

        {/* Line chart */}
        {(config.visualizationType !== 'Bar' && config.visualizationType !== 'Paired Bar') && (
          <ChartLinearLine colorScale={colorScale} seriesHighlight={seriesHighlight} formatNumber={formatNumber}
                           xScale={xScale} yScale={yScale} getXAxisData={getXAxisData} getYAxisData={getYAxisData}/>
        )}
      </svg>
      <ReactTooltip id={`cdc-open-viz-tooltip-${config.runtime.uniqueId}`} html={true} type="light"
                    arrowColor="rgba(0,0,0,0)" className="tooltip"/>
    </ErrorBoundary>
  )
}

export default ChartLinear