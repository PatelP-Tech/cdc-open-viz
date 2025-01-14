import React, { useContext, useState } from 'react'
import ConfigContext from '../../../ConfigContext'
import { useBarChart } from '../../../hooks/useBarChart'
import { BarStack } from '@visx/shape'
import { Group } from '@visx/group'
import { Text } from '@visx/text'
import BarChartContext from './context'
import Regions from '../../Regions'
import { isDateScale } from '@cdc/core/helpers/cove/date'

import createBarElement from '@cdc/core/components/createBarElement'

const BarChartStackedVertical = () => {
  const [barWidth, setBarWidth] = useState(0)
  const { xScale, yScale, xMax, yMax } = useContext(BarChartContext)
  const { transformedData, colorScale, seriesHighlight, config, formatNumber, formatDate, parseDate, setSharedFilter } = useContext(ConfigContext)
  const { isHorizontal, barBorderWidth, applyRadius, hoveredBar, getAdditionalColumn, onMouseLeaveBar, onMouseOverBar, barStackedSeriesKeys } = useBarChart()
  const { orientation } = config
  const data = config.brush.active && config.brush.data?.length ? config.brush.data : transformedData

  return (
    config.visualizationSubType === 'stacked' &&
    !isHorizontal && (
      <>
        <BarStack data={data} keys={barStackedSeriesKeys} x={d => d[config.runtime.xAxis.dataKey]} xScale={xScale} yScale={yScale} color={colorScale}>
          {barStacks =>
            barStacks.reverse().map(barStack =>
              barStack.bars.map(bar => {
                let transparentBar = config.legend.behavior === 'highlight' && seriesHighlight.length > 0 && seriesHighlight.indexOf(bar.key) === -1
                let displayBar = config.legend.behavior === 'highlight' || seriesHighlight.length === 0 || seriesHighlight.indexOf(bar.key) !== -1
                let barThickness = config.xAxis.type === 'date-time' ? config.barThickness * (xScale.range()[1] - xScale.range()[0]) : xMax / barStack.bars.length
                let barThicknessAdjusted = barThickness * (config.xAxis.type === 'date-time' ? 1 : config.barThickness || 0.8)
                let offset = (barThickness * (1 - (config.barThickness || 0.8))) / 2
                // tooltips
                const rawXValue = bar.bar.data[config.runtime.xAxis.dataKey]
                const xAxisValue = config.runtime.xAxis.type === 'date' ? formatDate(parseDate(rawXValue)) : rawXValue
                const yAxisValue = formatNumber(bar.bar ? bar.bar.data[bar.key] : 0, 'left')
                if (!yAxisValue) return
                const barX = xScale(config.runtime.xAxis.type === 'date' ? parseDate(rawXValue) : rawXValue) - (config.xAxis.type === 'date' && config.xAxis.sortDates ? barThicknessAdjusted / 2 : 0)
                const style = applyRadius(barStack.index)
                const xAxisTooltip = config.runtime.xAxis.label ? `${config.runtime.xAxis.label}: ${xAxisValue}` : xAxisValue
                const additionalColTooltip = getAdditionalColumn(hoveredBar)
                const tooltipBody = `${config.runtime.seriesLabels[bar.key]}: ${yAxisValue}`
                const tooltip = `<ul>
                  <li class="tooltip-heading"">${xAxisTooltip}</li>
                  <li class="tooltip-body ">${tooltipBody}</li>
                  <li class="tooltip-body ">${additionalColTooltip}</li>
                    </li></ul>`

                setBarWidth(barThicknessAdjusted)

                return (
                  <Group key={`${barStack.index}--${bar.index}--${orientation}`}>
                    <Group key={`bar-stack-${barStack.index}-${bar.index}`} id={`barStack${barStack.index}-${bar.index}`} className='stack vertical'>
                      <Text display={config.labels && displayBar ? 'block' : 'none'} opacity={transparentBar ? 0.5 : 1} x={barX + barWidth / 2} y={bar.y - 5} fill={'#000'} textAnchor='middle'>
                        {yAxisValue}
                      </Text>
                      {createBarElement({
                        config: config,
                        seriesHighlight,
                        index: barStack.index,
                        background: colorScale(config.runtime.seriesLabels[bar.key]),
                        borderColor: '#333',
                        borderStyle: 'solid',
                        borderWidth: `${config.barHasBorder === 'true' ? barBorderWidth : 0}px`,
                        width: barThicknessAdjusted,
                        height: bar.height,
                        x: barX,
                        y: bar.y,
                        onMouseOver: () => onMouseOverBar(xAxisValue, bar.key),
                        onMouseLeave: onMouseLeaveBar,
                        tooltipHtml: tooltip,
                        tooltipId: `cdc-open-viz-tooltip-${config.runtime.uniqueId}`,
                        onClick: e => {
                          e.preventDefault()
                          if (setSharedFilter) {
                            bar[config.xAxis.dataKey] = xAxisValue
                            setSharedFilter(config.uid, bar)
                          }
                        },
                        styleOverrides: {
                          animationDelay: `${barStack.index * 0.5}s`,
                          transformOrigin: `${barThicknessAdjusted / 2}px ${bar.y + bar.height}px`,
                          opacity: transparentBar ? 0.2 : 1,
                          display: displayBar ? 'block' : 'none'
                        }
                      })}
                    </Group>
                  </Group>
                )
              })
            )
          }
        </BarStack>
        <Regions xScale={xScale} yMax={yMax} barWidth={barWidth} totalBarsInGroup={1} />
      </>
    )
  )
}

export default BarChartStackedVertical
