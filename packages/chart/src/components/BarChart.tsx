import React, { useContext, useState } from 'react';

import { Group } from '@visx/group';
import { BarGroup, BarStack } from '@visx/shape';
import { Text } from '@visx/text';

import ErrorBoundary from '@cdc/core/components/ErrorBoundary';

import Context from '../context';

export default function BarChart({ xScale, yScale, seriesScale, xMax, yMax, getXAxisData, getYAxisData }) {
  const { filteredData:data, colorScale, seriesHighlight, config, formatNumber, updateConfig, setParentConfig } = useContext<any>(Context);
  const { visualizationSubType } = config;
  const [ isInitialRender, setIsInitialRender ] = useState(true);
  const [textWidth, setTextWidth] = useState(null);
  const [onBarLabelHeight, setOnBarLabelHeight] = useState(null);
  const [onBarLabelPadding, setOnBarLabelPadding] = useState(15);

  React.useEffect(() => {
    if(visualizationSubType === "horizontal" && config.yAxis.labelPlacement === "On Bar" && isInitialRender) {
      setIsInitialRender(false)
      updateConfig({
        ...config,
        barHeight: onBarLabelHeight,
        barPadding: onBarLabelPadding,
      })
    }

  }, [onBarLabelHeight, config, updateConfig, onBarLabelPadding, visualizationSubType, isInitialRender]);

  React.useEffect(() => {
        // if no tick color set to black
        if(!config.labelColor) {
          updateConfig({
            ...config,
            labelColor: {
              'name': 'bg-black',
              'hex':'#000000'
            }
          })
        }
  }, [config, updateConfig]);


  return (
    <ErrorBoundary component="BarChart">
      <Group left={config.runtime.yAxis.size}>
        { config.visualizationSubType === 'stacked' ? (
          <BarStack
            data={data}
            keys={(config.runtime.barSeriesKeys || config.runtime.seriesKeys)}
            x={(d: any) => d[config.runtime.xAxis.dataKey]}
            xScale={xScale}
            yScale={yScale}
            color={colorScale}
          >
            {barStacks => barStacks.reverse().map(barStack => barStack.bars.map(bar => {
              let yAxisTooltip = config.runtime.yAxis.label ? `${config.runtime.yAxis.label}: ${formatNumber(bar.bar ? bar.bar.data[bar.key] : 0)}` : formatNumber(bar.bar ? bar.bar.data[bar.key] : 0)
              let xAxisTooltip = config.runtime.xAxis.label ? `${config.runtime.xAxis.label}: ${data[bar.index][config.runtime.xAxis.dataKey]}` : data[bar.index][config.runtime.xAxis.dataKey]

              const tooltip = `<div>
              ${yAxisTooltip}<br />
              ${xAxisTooltip}<br />
              ${config.seriesLabel ? `${config.seriesLabel}: ${bar.key}` : ''}`

              let transparentBar = config.legend.behavior === 'highlight' && seriesHighlight.length > 0 && seriesHighlight.indexOf(bar.key) === -1;
              let displayBar = config.legend.behavior === 'highlight' || seriesHighlight.length === 0 || seriesHighlight.indexOf(bar.key) !== -1;
              let barThickness = xMax / barStack.bars.length;
              let barThicknessAdjusted = barThickness * (config.barThickness || 0.8);
              let offset = barThickness * (1 - (config.barThickness || 0.8)) / 2;
              return (
              <Group key={`bar-stack-${barStack.index}-${bar.index}`}>
              <Text 
                display={config.labels && displayBar ? 'block' : 'none'}
                opacity={transparentBar ? 0.5 : 1}
                x={barThickness * (bar.index + 0.5) + offset}
                y={bar.y - 5}
                fill={bar.color}
                textAnchor="middle">
                  {formatNumber(bar.bar ? bar.bar.data[bar.key] : 0)}
              </Text>
                <rect
                  key={`bar-stack-${barStack.index}-${bar.index}`}
                  x={barThickness * bar.index + offset}
                  y={bar.y}
                  height={bar.height}
                  width={barThicknessAdjusted}
                  fill={bar.color}
                  stroke="#333"
                  strokeWidth={config.barBorderThickness || 1}
                  opacity={transparentBar ? 0.5 : 1}
                  display={displayBar ? 'block' : 'none'}
                  data-tip={tooltip}
                  data-for={`cdc-open-viz-tooltip-${config.runtime.uniqueId}`}
                />
              </Group>
            )}
            ))
            }
          </BarStack>
        ) : (
          <Group>
            <BarGroup
              data={data}
              keys={(config.runtime.barSeriesKeys || config.runtime.seriesKeys)}
              height={yMax}
              x0={(d: any) => d[config.runtime.originalXAxis.dataKey]}
              x0Scale={config.runtime.horizontal ? yScale : xScale}
              x1Scale={seriesScale}
              yScale={config.runtime.horizontal ? xScale : yScale}
              color={() => {return '';}}
            >
              {(barGroups) => {

                if (config.visualizationSubType === "horizontal") {
                  const barsPerGroup = config.series.length;
                  let barHeight = config.barHeight ? config.barHeight : 25;
                  let barPadding = barHeight;
                  
                  if(config.yAxis.labelPlacement === "Below Bar" || !config.yAxis.labelPlacement) {
                    if(barHeight < 40) {
                      config.barPadding = 40;
                    } else {
                      config.barPadding = barPadding;
                    }
                  } else {
                    config.barPadding = barPadding / 2;
                  }

                  if(config.yAxis.labelPlacement === "On Bar") {
                    config.barHeight = onBarLabelHeight;
                  } else {
                    config.barHeight = barHeight;
                  }
                  
                  config.height = (barsPerGroup * barHeight) * barGroups.length + (config.barPadding * barGroups.length);
                }

                return barGroups.map((barGroup) => (
                <Group key={`bar-group-${barGroup.index}-${barGroup.x0}`} top={config.runtime.horizontal ? yMax / barGroups.length * barGroup.index : 0} left={config.runtime.horizontal ? 0 : xMax / barGroups.length * barGroup.index}>
                  {barGroup.bars.map((bar) => {

                    let transparentBar = config.legend.behavior === 'highlight' && seriesHighlight.length > 0 && seriesHighlight.indexOf(bar.key) === -1;
                    let displayBar = config.legend.behavior === 'highlight' || seriesHighlight.length === 0 || seriesHighlight.indexOf(bar.key) !== -1;
                    let barHeight = config.visualizationSubType === "horizontal" ? config.barHeight : Math.abs(yScale(bar.value) - yScale(0));
                    let barY = bar.value >= 0 ? bar.y : yScale(0);
                    let barGroupWidth = (config.runtime.horizontal ? yMax : xMax) / barGroups.length * (config.barThickness || 0.8);
                    let offset = (config.runtime.horizontal ? yMax : xMax) / barGroups.length * (1 - (config.barThickness || 0.8)) / 2;
                    let barWidth = barGroupWidth / barGroup.bars.length;
                    let barColor = config.runtime.seriesLabels && config.runtime.seriesLabels[bar.key] ? colorScale(config.runtime.seriesLabels[bar.key]) : colorScale(bar.key);

                    let yAxisValue = formatNumber(bar.value);
                    let xAxisValue = data[barGroup.index][config.runtime.originalXAxis.dataKey];

                    if(config.runtime.horizontal){
                      let tempValue = yAxisValue;
                      yAxisValue = xAxisValue;
                      xAxisValue = tempValue;
                      barWidth = config.barHeight
                    }

                    let yAxisTooltip = config.runtime.yAxis.label ? `${config.runtime.yAxis.label}: ${yAxisValue}` : yAxisValue
                    let xAxisTooltip = config.runtime.xAxis.label ? `${config.runtime.xAxis.label}: ${xAxisValue}` : xAxisValue
                    let onBarLabelPadding = null;
                    
                    // font size and text spacing used for centering text on bar
                    if(config.fontSize === "small") {
                      onBarLabelPadding = 16;
                    } else if(config.fontSize === "medium") {
                      onBarLabelPadding = 18;
                    } else{
                      onBarLabelPadding = 20;
                    }
                    const onBarTextSpacing = 25;
                    const tooltip = `<div>
                    ${yAxisTooltip}<br />
                    ${xAxisTooltip}<br />
                    ${config.seriesLabel ? `${config.seriesLabel}: ${bar.key}` : ''}`

                    return (
                    <Group key={`bar-sub-group-${barGroup.index}-${barGroup.x0}`}>
                      <Text 
                        display={config.labels && displayBar ? 'block' : 'none'}
                        opacity={transparentBar ? 0.5 : 1}
                        x={barWidth * (barGroup.bars.length - bar.index - 0.5) + offset}
                        y={barY - 5}
                        fill={barColor}
                        textAnchor="middle">
                          {formatNumber(bar.value)}
                      </Text>
                      <rect
                        key={`bar-group-bar-${barGroup.index}-${bar.index}-${bar.value}-${bar.key}`}
                        x={config.runtime.horizontal ? 0 : barWidth * (barGroup.bars.length - bar.index - 1) + offset}
                        y={config.runtime.horizontal ? barWidth * (barGroup.bars.length - bar.index - 1) : barY}
                        width={config.runtime.horizontal ?  bar.y : barWidth}
                        height={config.runtime.horizontal ? barWidth : barHeight}
                        fill={barColor}
                        stroke="#333"
                        strokeWidth={config.barBorderThickness || 1}
                        style={{fill: barColor}}
                        opacity={transparentBar ? 0.5 : 1}
                        display={displayBar ? 'block' : 'none'}
                        data-tip={tooltip}
                        data-for={`cdc-open-viz-tooltip-${config.runtime.uniqueId}`}
                      />
                      {visualizationSubType === "horizontal" && textWidth + 100 < bar.y ? 
                      config.yAxis.labelPlacement === "On Bar" &&
                        <Group>
                            <Text
                              innerRef={
                                (e) => {
                                  if(e) {
                                    // use font sizes and padding to set the bar height
                                    let elem = e.getBBox()
                                    setTextWidth(elem.width)
                                    setOnBarLabelHeight( (elem.height * 2) + (onBarLabelPadding * 2) + onBarTextSpacing / 2 )
                                    setOnBarLabelPadding( onBarLabelHeight / 2 )
                                  }
                                }
                              }
                              x={ bar.y - onBarLabelPadding }
                              y={ barHeight * (barGroup.bars.length - bar.index - 1) + ( onBarLabelPadding * 2 ) }
                              fill={ config.labelColor ? config.labelColor.hex : "#000" }
                              textAnchor="end"
                            >
                              { yAxisValue }
                            </Text>
                            <Text
                              x={ bar.y - onBarLabelPadding }
                              y={ barWidth * (barGroup.bars.length - bar.index - 1) + ( onBarLabelPadding * 2 ) + onBarTextSpacing }
                              fill={ config.labelColor ? config.labelColor.hex : "#000" }
                              textAnchor="end"
                            >
                              { xAxisValue }
                            </Text>
                        </Group>
                      :
                      (visualizationSubType === "horizontal" && config.yAxis.labelPlacement === "On Bar") &&
                        <Group>
                            <Text
                                x={ bar.y + onBarLabelPadding }
                                y={ barWidth * (barGroup.bars.length - bar.index - 1) + ( onBarLabelPadding * 2 ) }
                                fill={ "#000" }
                                textAnchor="start"
                                verticalAnchor="end"
                              >{yAxisValue}</Text>
                            <Text
                                x={ bar.y + onBarLabelPadding }
                                y={ barWidth * (barGroup.bars.length - bar.index - 1) + ( onBarLabelPadding * 2 ) + onBarTextSpacing }
                                fill={ "#000" }
                                textAnchor="start"
                                verticalAnchor="end"
                              >
                                { xAxisValue }
                              </Text>
                        </Group>
                      }
                    </Group>
                  )}
                  )}
                </Group>
              ))}}
            </BarGroup>
            {Object.keys(config.confidenceKeys).length > 0 ? data.map((d) => {
              let xPos = xScale(getXAxisData(d));
              let upperPos = yScale(getYAxisData(d, config.confidenceKeys.lower));
              let lowerPos = yScale(getYAxisData(d, config.confidenceKeys.upper));
              let tickWidth = 5;

              return (
                <path key={`confidence-interval-${d[config.runtime.originalXAxis.dataKey]}`} stroke="#333" strokeWidth="2px" d={`
                  M${xPos - tickWidth} ${upperPos}
                  L${xPos + tickWidth} ${upperPos}
                  M${xPos} ${upperPos}
                  L${xPos} ${lowerPos}
                  M${xPos - tickWidth} ${lowerPos}
                  L${xPos + tickWidth} ${lowerPos}`}/>
              );
            }) : ''}
          </Group>
        )}
      </Group>
    </ErrorBoundary>
  );
}
