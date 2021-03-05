import React, { useContext } from 'react';
import ReactTooltip from 'react-tooltip';
import * as allCurves from '@visx/curve';
import { Group } from '@visx/group';
import { LinePath, Line } from '@visx/shape';
import { scaleLinear, scaleBand } from '@visx/scale';
import { AxisLeft, AxisBottom } from '@visx/axis';
import { BarGroup, BarStack } from '@visx/shape';
import { timeParse, timeFormat } from 'd3-time-format';
import Context from '../context.tsx';

import '../scss/ComboChart.scss';

const font = '#000000';

export default function ComboChart({numberFormatter}) {
  let { data, dimensions, colorScale, seriesHighlight, config } = useContext<any>(Context);

  const { width, height } = dimensions;

  const xMax = width - config.yAxis.size;
  const yMax = height - config.xAxis.size;

  const parseDate = timeParse(config.xAxis.dateParseFormat);
  const format = timeFormat(config.xAxis.dateDisplayFormat);
  const formatDate = (date) => format(new Date(date));

  const getXAxisData = (d: any) => config.xAxis.type === 'date' ? (parseDate(d[config.xAxis.dataKey]) as Date).getTime() : d[config.xAxis.dataKey];
  const getYAxisData = (d: any, seriesKey: string) => d[seriesKey];

  let xScale;
  let seriesScale;
  let yScale;

  if (data) {
    let min = config.yAxis.min !== undefined ? config.yAxis.min : (config.visualizationType === 'Bar' ? 0 : Math.min(...data.map((d) => Math.min(...config.seriesKeys.map((key) => Number(d[key]))))));
    let max = config.yAxis.max !== undefined ? config.yAxis.max : Number.MIN_VALUE;

    //If data value max wasn't provided, calculate it
    if(max === Number.MIN_VALUE){
      //If stacked bar, add together y values to get max, otherwise map data to find max
      if (config.visualizationType === 'Bar' && config.visualizationSubType === 'stacked') {
        const yTotals = data.reduce((allTotals, xValue) => {
          const totalYValues = config.seriesKeys.reduce((yTotal, k) => {
            yTotal += Number(xValue[k]);
            return yTotal;
          }, 0);
          allTotals.push(totalYValues);
          if(totalYValues > max){
            max = totalYValues;
          }
          return allTotals;
        }, [] as number[]);

        max = Math.max(...yTotals);
      } else if(config.visualizationType === 'Bar' && config.visualizationSubType !== 'stacked' && config.confidenceKeys) {
        max = Math.max(...data.map((d) => Number(d[config.confidenceKeys.upper])));
      } else {
        max = Math.max(...data.map((d) => Math.max(...config.seriesKeys.map((key) => Number(d[key])))));
      }
    }

    //Adds Y Axis data padding if applicable
    if(config.yAxis.paddingPercent) { 
      let paddingValue = (max - min) * config.yAxis.paddingPercent;
      min -= paddingValue;
      max += paddingValue;
    }
    
    yScale = scaleLinear<number>({
      domain: [min, max],
      range: [yMax, 0]
    });

    let xAxisDataMapped = data.map(d => getXAxisData(d));

    xScale = config.xAxis.type === 'date' ? 
      scaleLinear<number>({domain: [Math.min(...xAxisDataMapped), Math.max(...xAxisDataMapped)]}) : 
      scaleBand<string>({domain: xAxisDataMapped});

    seriesScale = scaleBand<string>({
      domain: (config.barSeriesKeys || config.seriesKeys)
    });

    xScale.rangeRound([0, xMax]);
    seriesScale.rangeRound([0, xMax]);
  }

  return config && data && colorScale && width && height ? (
    <div className="combo-chart-container">
      <svg width={width} height={height}>
        { config.visualizationType !== 'Line' ? (
          <Group left={config.yAxis.size}>
          { config.visualizationSubType === 'stacked' ? (
            <BarStack
              data={data}
              keys={(config.barSeriesKeys || config.seriesKeys)}
              x={(d: any) => d[config.xAxis.dataKey]}
              xScale={xScale}
              yScale={yScale}
              color={colorScale}
            >
              {barStacks => barStacks.map(barStack => barStack.bars.map(bar => {
                let barThickness = xMax / barStack.bars.length;
                let barThicknessAdjusted = barThickness * (config.barThickness || 0.8);
                let offset = barThickness * (1 - (config.barThickness || 0.8)) / 2;
                return (
                <Group>
                <text 
                  display={config.labels && config.labels.display ? 'block': 'none'}
                  x={barThickness * (bar.index + 0.5) + offset}
                  y={bar.y - 5}
                  fill={bar.color}
                  fontSize={(config.labels && config.labels.fontSize) ? config.labels.fontSize : 16}
                  textAnchor="middle">
                    {numberFormatter(bar.bar ? bar.bar.data[bar.key] : 0)}
                </text>
                  <rect
                    key={`bar-stack-${barStack.index}-${bar.index}`}
                    x={barThickness * bar.index + offset}
                    y={bar.y}
                    height={bar.height}
                    width={barThicknessAdjusted}
                    fill={bar.color}
                    stroke="black"
                    strokeWidth={config.barBorderThickness || 1}
                    opacity={config.legend.highlight && seriesHighlight.length > 0 && seriesHighlight.indexOf(bar.key) === -1 ? 0.5 : 1}
                    display={config.legend.highlight || seriesHighlight.length === 0 || seriesHighlight.indexOf(bar.key) !== -1 ? 'block' : 'none'}
                    data-tip={`<div>
                          ${config.xAxis.label}: ${data[barStack.index][config.xAxis.dataKey]} <br/>
                          ${config.yAxis.label}: ${numberFormatter(bar.bar ? bar.bar.data[bar.key] : 0)} <br/>
                          ${config.seriesLabel ? `${config.seriesLabel}: ${bar.key}` : ''} 
                        </div>`}
                        data-html="true"
                  />
                </Group>
              )}
              ))
              }
            </BarStack>
          ) : (
            <g>
              <BarGroup
                data={data}
                keys={(config.barSeriesKeys || config.seriesKeys)}
                height={yMax}
                x0={(d: any) => d[config.xAxis.dataKey]}
                x0Scale={xScale}
                x1Scale={seriesScale}
                yScale={yScale}
                color={colorScale}
              >
                {(barGroups) => barGroups.map((barGroup) => (
                  <Group key={`bar-group-${barGroup.index}-${barGroup.x0}`} left={xMax / barGroups.length * barGroup.index}>
                    {barGroup.bars.map((bar) => {
                      let barGroupWidth = xMax / barGroups.length * (config.barThickness || 0.8);
                      let offset = xMax / barGroups.length * (1 - (config.barThickness || 0.8)) / 2;
                      let barWidth = barGroupWidth / barGroup.bars.length;
                      return (
                      <Group>
                        <text 
                          display={config.labels && config.labels.display ? 'block': 'none'}
                          x={barWidth * (barGroup.bars.length - bar.index - 0.5) + offset}
                          y={bar.y - 5}
                          fill={bar.color}
                          fontSize={(config.labels && config.labels.fontSize) ? config.labels.fontSize : 16}
                          textAnchor="middle">
                            {numberFormatter(bar.value)}
                        </text>
                        <rect
                          key={`bar-group-bar-${barGroup.index}-${bar.index}-${bar.value}-${bar.key}`}
                          x={barWidth * (barGroup.bars.length - bar.index - 1) + offset}
                          y={bar.y}
                          width={barWidth}
                          height={bar.height}
                          fill={bar.color}
                          stroke="black"
                          strokeWidth={config.barBorderThickness || 1}
                          style={{fill: bar.color}}
                          opacity={config.legend.highlight && seriesHighlight.length > 0 && seriesHighlight.indexOf(bar.key) === -1 ? 0.5 : 1}
                          display={config.legend.highlight || seriesHighlight.length === 0 || seriesHighlight.indexOf(bar.key) !== -1 ? 'block' : 'none'}
                          data-tip={`<div>
                            ${config.xAxis.label}: ${data[barGroup.index][config.xAxis.dataKey]} <br/>
                            ${config.yAxis.label}: ${numberFormatter(bar.value)} <br/>
                            ${config.seriesLabel ? `${config.seriesLabel}: ${bar.key}` : ''} 
                          </div>`}
                          data-html="true"
                        />
                      </Group>
                    )}
                    )}
                  </Group>
                ))}
              </BarGroup>
              {config.confidenceKeys ? data.map((d) => {
                let offset = xMax / data.length / 2;
                let xPos = xScale(getXAxisData(d)) + offset;
                let upperPos = yScale(getYAxisData(d, config.confidenceKeys.lower));
                let lowerPos = yScale(getYAxisData(d, config.confidenceKeys.upper));
                let tickWidth = 5;

                return (
                  <path stroke="black" strokeWidth="2px" d={`
                    M${xPos - tickWidth} ${upperPos}
                    L${xPos + tickWidth} ${upperPos}
                    M${xPos} ${upperPos}
                    L${xPos} ${lowerPos}
                    M${xPos - tickWidth} ${lowerPos}
                    L${xPos + tickWidth} ${lowerPos}`}/>
                );
              }) : ''}
            </g>
          )
          }
        </Group>
        ) : (
          <Group>
          </Group>
        ) }
        
        { config.visualizationType !== 'Bar' ? (
          <Group left={config.yAxis.size}>
            { (config.lineSeriesKeys || config.seriesKeys).map((seriesKey, index) => (
              <Group
                key={`series-${seriesKey}`}
                opacity={config.legend.highlight && seriesHighlight.length > 0 && seriesHighlight.indexOf(seriesKey) === -1 ? 0.5 : 1}
                display={config.legend.highlight || seriesHighlight.length === 0 || seriesHighlight.indexOf(seriesKey) !== -1 ? 'block' : 'none'}
              >
                { data.map((d, dataIndex) => (
                  <Group>
                  <text 
                      display={config.labels && config.labels.display ? 'block': 'none'}
                      x={xScale(getXAxisData(d))}
                      y={yScale(getYAxisData(d, seriesKey))}
                      fill={colorScale ? colorScale(config.seriesLabels ? config.seriesLabels[seriesKey] : seriesKey) : '#000'}
                      fontSize={(config.labels && config.labels.fontSize) ? config.labels.fontSize : 16}
                      textAnchor="middle">
                        {numberFormatter(d[seriesKey])}
                    </text>
                    <circle
                      key={`${seriesKey}-${dataIndex}`}
                      r={3}
                      cx={xScale(getXAxisData(d))}
                      cy={yScale(getYAxisData(d, seriesKey))}
                      strokeWidth="100px"
                      fill={colorScale ? colorScale(config.seriesLabels ? config.seriesLabels[seriesKey] : seriesKey) : '#000'}
                      style={{fill: colorScale ? colorScale(config.seriesLabels ? config.seriesLabels[seriesKey] : seriesKey) : '#000'}}
                      data-tip={`<div>
                        ${config.xAxis.label}: ${d[config.xAxis.dataKey]} <br/>
                        ${config.yAxis.label}: ${numberFormatter(d[seriesKey])} <br/>
                        ${config.seriesLabel ? `${config.seriesLabel}: ${seriesKey}` : ''} 
                      </div>`}
                      data-html="true"
                    />
                  </Group>
                ))}
                <LinePath
                  curve={allCurves.curveLinear}
                  data={data}
                  x={(d) => xScale(getXAxisData(d))}
                  y={(d) => yScale(getYAxisData(d, seriesKey))}
                  stroke={colorScale ? colorScale(config.seriesLabels ? config.seriesLabels[seriesKey] : seriesKey) : '#000'}
                  strokeWidth={2}
                  strokeOpacity={1}
                  shapeRendering="geometricPrecision"
                />
              </Group>
            ))
            }
          </Group>
        ) : (
          <Group>
          </Group>
        ) }
        { config.regions ? config.regions.map((region) => {
          const from = xScale((parseDate(region.from) as Date).getTime());
          const to = xScale((parseDate(region.to) as Date).getTime());
          const width = to - from;

          return (
            <Group className="regions" left={config.yAxis.size}>
              <path stroke="black" d={`M${from} -5
                        L${from} 5
                        M${from} 0
                        L${to} 0
                        M${to} -5
                        L${to} 5`} />
              <rect 
                x={from} 
                y={0} 
                width={width} 
                height={yMax} 
                fill={region.background} 
                opacity={0.3} />
              <text 
                x={from + (width / 2)} 
                y={region.fontSize || 14} 
                fill={region.color} 
                fontSize={region.fontSize || 14}
                textAnchor="middle">
                  {region.label}
              </text>
            </Group>
          )
        }) : '' }
        <AxisLeft
          scale={yScale}
          left={config.yAxis.size}
          label={config.yAxis.label}
          stroke={font}
          numTicks={config.yAxis.numTicks}
        >
          {props => {
            const axisCenter = (props.axisFromPoint.y - props.axisToPoint.y) / 2;
            return (
              <g className="my-custom-left-axis">
                {props.ticks.map((tick, i) => {
                  return (
                    <Group
                      key={`vx-tick-${tick.value}-${i}`}
                      className={'vx-axis-tick'}
                    >
                      <Line
                        from={tick.from}
                        to={tick.to}
                        stroke="black"
                      />
                      { config.yAxis.gridLines ? (
                        <Line
                          from={{x: tick.from.x + xMax, y: tick.from.y}}
                          to={tick.from}
                          stroke="rgba(0,0,0,0.3)"
                        />
                        ) : ''
                      }
                      <text
                        transform={`translate(${tick.to.x}, ${tick.to.y + (config.yAxis.tickFontSize / 2)})`}
                        fontSize={config.yAxis.tickFontSize}
                        textAnchor="end"
                      >
                        {tick.formattedValue}
                      </text>
                    </Group>
                  );
                })}
                <Line 
                  from={props.axisFromPoint}
                  to={props.axisToPoint}
                  stroke="black"
                />
                <text
                  textAnchor="middle"
                  transform={`translate(${-1 * (config.yAxis.size - config.yAxis.labelFontSize)}, ${axisCenter}) rotate(-90)`}
                  fontSize={config.yAxis.labelFontSize || 18}
                  fontWeight="bold"
                >
                  {props.label}
                </text>
              </g>
            );
          }}
        </AxisLeft>
        <AxisBottom
          top={yMax}
          left={config.yAxis.size}
          label={config.xAxis.label}
          tickFormat={config.xAxis.type === 'date' ? formatDate : (tick) => tick}
          scale={xScale}
          stroke={font}
          tickStroke={font}
          numTicks={config.xAxis.numTicks}
        >
          {props => {
            const axisCenter = (props.axisToPoint.x - props.axisFromPoint.x) / 2;
            return (
              <g className="my-custom-bottom-axis">
                {props.ticks.map((tick, i) => {
                  const tickX = tick.to.x;
                  const tickY = tick.to.y + (!config.xAxis.wrap ? config.xAxis.tickFontSize : 0);

                  return (
                    <Group
                      key={`vx-tick-${tick.value}-${i}`}
                      className={'vx-axis-tick'}
                    >
                      <Line
                        from={tick.from}
                        to={tick.to}
                        stroke="black"
                      />
                      { !config.xAxis.wrap ? ( 
                        <text
                          transform={`translate(${tickX}, ${tickY}) rotate(${config.xAxis.tickRotation})`}
                          fontSize={config.xAxis.tickFontSize}
                          textAnchor={config.xAxis.tickRotation !== 0 ? 'end': 'middle'}
                          className="bottom-axis-tick"
                        >
                          {tick.formattedValue}
                        </text> 
                      ) : (
                        <foreignObject className="bottom-axis-tick-container" x={tickX} y={tickY} width={xMax / props.ticks.length - 4} height={config.xAxis.size}>
                          <p className="bottom-axis-tick">{tick.formattedValue}</p>
                        </foreignObject> 
                      )
                      }
                    </Group>
                  );
                })}
                <Line 
                  from={props.axisFromPoint}
                  to={props.axisToPoint}
                  stroke="black"
                />
                <text
                  textAnchor="middle"
                  transform={`translate(${axisCenter}, ${config.xAxis.size - config.xAxis.labelFontSize})`}
                  fontSize={config.xAxis.labelFontSize}
                  fontWeight="bold"
                >
                  {props.label}
                </text>
              </g>
            );
          }}
        </AxisBottom>
      </svg>

      <ReactTooltip />
    </div>
  ) : ( <div className="loader"></div> );
}
