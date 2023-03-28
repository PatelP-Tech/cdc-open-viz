import React, { Fragment, useCallback } from 'react'

// Third Party
import { Bar } from '@visx/shape'
import { Group } from '@visx/group'
import { scaleLinear } from '@visx/scale'
import { Text } from '@visx/text'

import chroma from 'chroma-js'

// Hooks
import { useVisConfig } from '@cdc/core/hooks/store/useVisConfig'

// Visualization
const ChartLinearBarPaired = (
  {
    width,
    height,
    originalWidth,
    colorScale,
    formatNumber,
    seriesHighlight,
    getTextWidth
  }
) => {
  // console.log('originalWidth', originalWidth, 'width', width, 'height', height)
  const { config } = useVisConfig()

  const halfWidth = useCallback(() => (width / 2), [ width ])

  if (!config || config?.series?.length < 2) return

  const borderWidth = config.barHasBorder === 'true' ? 1 : 0

  const fontSize = { small: 16, medium: 18, large: 20 }
  const offset = 1.02 // Offset of the left bar from the Axis

  const groupOne = {
    parentKey: config.dataDescription.seriesKey,
    dataKey: config.series[0].dataKey,
    color: colorScale(config.runtime.seriesLabels[config.series[0].dataKey]),
    max: Math.max.apply(
      Math,
      config.data.map(item => item[config.series[0].dataKey])
    ),
    labelColor: ''
  }

  const groupTwo = {
    parentKey: config.dataDescription.seriesKey,
    dataKey: config.series[1].dataKey,
    color: colorScale(config.runtime.seriesLabels[config.series[1].dataKey]),
    max: Math.max.apply(
      Math,
      config.data.map(item => item[config.series[1].dataKey])
    ),
    labelColor: ''
  }

  const xScale = scaleLinear({
    domain: [ 0, Math.max(groupOne.max * offset, groupTwo.max * 1.1) ],
    range: [ 0, halfWidth ]
  })

  // Set label color
  let labelColor = '#000000'

  if (chroma.contrast(labelColor, groupOne.color) < 4.9) {
    groupOne.labelColor = '#FFFFFF'
  }

  if (chroma.contrast(labelColor, groupTwo.color) < 4.9) {
    groupTwo.labelColor = '#FFFFFF'
  }

  const label = config.yAxis.label ? `${config.yAxis.label}: ` : ''

  const dataTipOne = d => (`
    <p>
      ${config.dataDescription.seriesKey}: ${groupOne.dataKey}<br/>
      ${config.xAxis.dataKey}: ${d[config.xAxis.dataKey]}<br/>
      ${label}${formatNumber(d[groupOne.dataKey])}
    </p>
  `)

  const dataTipTwo = d => (`
    <p>
      ${config.dataDescription.seriesKey}: ${groupTwo.dataKey}<br/>
      ${config.xAxis.dataKey}: ${d[config.xAxis.dataKey]}<br/>
      ${label}${formatNumber(d[groupTwo.dataKey])}
    </p>
  `)

  return (
    width > 0 && (
      <>
        <style>
          {`
            #cdc-visualization__paired-bar-chart,
            #cdc-visualization__paired-bar-chart > .visx-group {
              transform-origin: center
            }
          `}
        </style>

        <svg
          id="cdc-visualization__paired-bar-chart"
          width={originalWidth}
          height={height}
          viewBox={`0 0 ${width + Number(config.runtime.yAxis.size)} ${height}`}
          role="img"
          tabIndex={0}
        >
          <Group top={0} left={Number(config.xAxis.size)}>
            {config.data
              .filter(item => config.series[0].dataKey === groupOne.dataKey)
              .map((datapoint, index) => {
                let transparentBar = config.legend.behavior === 'highlight' && seriesHighlight.length > 0 && seriesHighlight.indexOf(config.series[0].dataKey) === -1
                let displayBar = config.legend.behavior === 'highlight' || seriesHighlight.length === 0 || seriesHighlight.indexOf(config.series[0].dataKey) !== -1

                let barWidth = xScale(datapoint[config.series[0].dataKey])
                let barHeight = Number(config.barHeight) ? Number(config.barHeight) : 25

                // update bar Y to give dynamic Y when user applyes BarSpace
                let y = 0
                y = index !== 0 ? (Number(config.barSpace) + barHeight + borderWidth) * index : y

                const totalheight = (Number(config.barSpace) + barHeight + borderWidth) * config.data.length
                // config.heights.horizontal = totalheight TODO: fix this

                // check if text fits inside the bar including suffix/prefix, comma, fontSize ..etc
                const textWidth = getTextWidth(formatNumber(datapoint[groupOne.dataKey]), `normal ${fontSize[config.fontSize]}px sans-serif`)
                const textFits = textWidth < barWidth - 5 // minus padding dx(5)

                // TODO: Appears to be an issue with the data format being incorrect?
                //  Maybe something happening with the tranformedData section on Chart.js, since thats been taken out?
                return (
                  <Fragment key={index}>
                    <Group className="horizontal">
                      <Bar
                        id={`bar-${groupOne.dataKey}-${datapoint[config.dataDescription.xKey]}`}
                        className="bar group-1"

                        x={halfWidth() - barWidth}
                        y={y}

                        display={displayBar ? 'block' : 'none'}
                        width={barWidth}
                        height={barHeight}
                        fill={groupOne.color}
                        stroke="#333"
                        strokeWidth={borderWidth}
                        opacity={transparentBar ? 0.5 : 1}

                        data-tooltip-html={dataTipOne(datapoint)}
                        data-tooltip-id={`cdc-open-viz-tooltip-${config.runtime.uniqueId}`}
                      />
                      {config.yAxis.displayNumbersOnBar && displayBar && (
                        <Text
                          textAnchor={textFits ? 'start' : 'end'}
                          verticalAnchor="middle" x={halfWidth() - barWidth} y={y + config.barHeight / 2}
                          dx={textFits ? 5 : -5}
                          fill={textFits ? groupOne.labelColor : '#000'}
                        >
                          {formatNumber(datapoint[groupOne.dataKey])}
                        </Text>
                      )}
                    </Group>
                  </Fragment>
                )
              })
            }

            {config.data
              .filter(item => config.series[1].dataKey === groupTwo.dataKey)
              .map((datapoint, index) => {
                let transparentBar = config.legend.behavior === 'highlight' && seriesHighlight.length > 0 && seriesHighlight.indexOf(config.series[1].dataKey) === -1
                let displayBar = config.legend.behavior === 'highlight' || seriesHighlight.length === 0 || seriesHighlight.indexOf(config.series[1].dataKey) !== -1

                let barWidth = xScale(datapoint[config.series[1].dataKey])
                let barHeight = config.barHeight ? Number(config.barHeight) : 25

                // Update bar Y to give dynamic Y when user applyes BarSpace
                let y = 0
                y = index !== 0 ? (Number(config.barSpace) + barHeight + borderWidth) * index : y

                const totalheight = (Number(config.barSpace) + barHeight + borderWidth) * config.data.length
                // config.heights.horizontal = totalheight TODO: fix this

                // Check if text fits inside the bar including suffix/prefix, comma, fontSize ..etc
                const textWidth = getTextWidth(formatNumber(datapoint[groupTwo.dataKey]), `normal ${fontSize[config.fontSize]}px sans-serif`)
                const isTextFits = textWidth < barWidth - 5 // minus padding dx(5)

                return (
                  <Fragment key={index}>
                    <style>
                      {`
                        .bar-${groupTwo.dataKey}-${datapoint[config.xAxis.dataKey]} {
                          transform-origin: ${halfWidth()}px ${y}px
                        }
                      `}
                    </style>

                    <Group className="horizontal">
                      <Bar
                        id={`bar-${groupTwo.dataKey}-${datapoint[config.dataDescription.xKey]}`}
                        className="bar group-2"

                        x={halfWidth()}
                        y={y}

                        display={displayBar ? 'block' : 'none'}
                        width={barWidth}
                        height={barHeight}
                        fill={groupTwo.color}
                        stroke="#333"
                        strokeWidth={borderWidth}
                        opacity={transparentBar ? 0.5 : 1}

                        data-tooltip-id={`cdc-open-viz-tooltip-${config.runtime.uniqueId}`}
                        data-tooltip-html={dataTipTwo(datapoint)}
                      />

                      {config.yAxis.displayNumbersOnBar && displayBar && (
                        <Text
                          x={halfWidth + barWidth}
                          y={y + config.barHeight / 2}

                          textAnchor={isTextFits ? 'end' : 'start'}
                          verticalAnchor="middle"
                          dx={isTextFits ? -5 : 5}
                          fill={isTextFits ? groupTwo.labelColor : '#000'}
                        >
                          {formatNumber(datapoint[groupTwo.dataKey])}
                        </Text>
                      )}
                    </Group>
                  </Fragment>
                )
              })
            }
          </Group>
        </svg>
      </>
    )
  )
}

export default ChartLinearBarPaired