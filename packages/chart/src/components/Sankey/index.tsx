import { useContext, useState, useRef, useEffect } from 'react'

// External Libraries
import { PlacesType, Tooltip as ReactTooltip } from 'react-tooltip'
import { SankeyGraph, sankey, sankeyLinkHorizontal, sankeyLeft } from 'd3-sankey'
import { Group } from '@visx/group'
import { Text } from '@visx/text'
import ReactDOMServer from 'react-dom/server'

// Cdc
import './sankey.scss'
import 'react-tooltip/dist/react-tooltip.css'
import ConfigContext from '@cdc/chart/src/ConfigContext'
import { ChartContext } from '../../types/ChartContext'
import type { SankeyNode, SankeyProps } from './types'

const Sankey = ({ width, height, runtime }: SankeyProps) => {
  const DEBUG = true
  const { config } = useContext<ChartContext>(ConfigContext)
  const { sankey: sankeyConfig } = config
  // !info - changed config.sankey.data here to work with our current upload pattern saved on config.data
  const data = config?.data[0]
  const [largestGroupWidth, setLargestGroupWidth] = useState(0)
  const groupRefs = useRef([])

  //Tooltip
  const [tooltipID, setTooltipID] = useState<string>('')

  const handleNodeClick = (nodeId: string) => {
    setTooltipID(nodeId)
  }

  const clearNodeClick = () => {
    setTooltipID('')
  }

  //Mobile Pop Up
  const [showPopup, setShowPopup] = useState(false)

  useEffect(() => {
    if (window.innerWidth < 768 && window.innerHeight > window.innerWidth) {
      setShowPopup(true)
    }
  }, [window.innerWidth])

  const closePopUp = () => {
    setShowPopup(false)
  }

  // Uses Visx Groups innerRef to get all Group elements that are mapped.
  // Sets the largest group width in state and subtracts that group the svg width to calculate overall width.
  useEffect(() => {
    let largest = 0
    groupRefs?.current?.map(g => {
      const groupWidth = g?.getBoundingClientRect().width
      if (groupWidth > largest) {
        largest = groupWidth
      }
    })
    setLargestGroupWidth(largest)
  }, [groupRefs, sankeyConfig, window.innerWidth])

  //Retrieve all the unique values for the Nodes
  const uniqueNodes = Array.from(new Set(data?.links?.flatMap(link => [link.source, link.target])))

  // Convert JSON data to the format required
  const sankeyData: SankeyGraph<SankeyNode, { source: number; target: number }> = {
    nodes: uniqueNodes.map(nodeId => ({ id: nodeId })),
    links: data?.links?.map(link => ({
      source: uniqueNodes.findIndex(node => node === link.source),
      target: uniqueNodes.findIndex(node => node === link.target),
      value: link.value
    }))
  }

  let textPositionHorizontal = 5
  const BUFFER = 50

  // Set the sankey diagram properties  console.log('largestGroupWidth', largestGroupWidth)

  const sankeyGenerator = sankey<SankeyNode, { source: number; target: number }>()
    .nodeWidth(sankeyConfig.nodeSize.nodeWidth)
    .nodePadding(sankeyConfig.nodePadding)
    .iterations(sankeyConfig.iterations)
    .nodeAlign(sankeyLeft)
    .extent([
      [sankeyConfig.margin.margin_x, Number(sankeyConfig.margin.margin_y)],
      [width - textPositionHorizontal - largestGroupWidth, config.heights.vertical - BUFFER]
    ])

  const { nodes, links } = sankeyGenerator(sankeyData)

  const nodeStyle = (id: string) => {
    let textPositionHorizontal = 30
    let textPositionVertical = 0
    let classStyle = 'node-value--storynode'
    let storyNodes = true

    // TODO: need a dynamic way to apply classes here instead of checking static values.

    if (data?.storyNodeText?.every(node => node.StoryNode !== id)) {
      storyNodes = false
      textPositionVertical = 10
      textPositionHorizontal = 8
      classStyle = 'node-value'
    }

    return { textPositionHorizontal, textPositionVertical, classStyle, storyNodes }
  }

  const activeConnection = (id: String) => {
    const currentNode = sankeyData.nodes.find(node => node.id === id)

    const sourceNodes = []
    const activeLinks = []

    if (currentNode) {
      links.forEach(link => {
        const targetObj: any = link.target
        const sourceObj: any = link.source
        if (targetObj.id === id) {
          sourceNodes.push(sourceObj.id)
        }
      })

      sourceNodes.forEach(id => {
        links.forEach(link => {
          const targetObj: any = link.target
          const sourceObj: any = link.source
          if (targetObj.id === tooltipID && sourceObj.id === id) {
            activeLinks.push(link)
          }
        })
      })
    }

    return { sourceNodes, activeLinks }
  }

  const tooltipVal = `${(data?.tooltips.find(item => item.node === tooltipID) || {}).value}`
  const tooltipSummary = `${(data?.tooltips.find(item => item.node === tooltipID) || {}).summary}`
  const tooltipColumn1Label = (data?.tooltips.find(item => item.node === tooltipID) || {}).column1Label
  const tooltipColumn2Label = (data?.tooltips.find(item => item.node === tooltipID) || {}).column2Label
  const tooltipColumn1 = (data?.tooltips.find(item => item.node === tooltipID) || {}).column1
  const tooltipColumn2 = (data?.tooltips.find(item => item.node === tooltipID) || {}).column2

  const ColumnList = ({ columnData }) => {
    return (
      <ul>
        {columnData?.map((entry, index) => (
          <li key={index}>
            {entry.label}: {entry.value} ({entry.additional_info}%)
          </li>
        ))}
      </ul>
    )
  }

  const tooltipColumn1Data = ReactDOMServer.renderToString(<ColumnList columnData={tooltipColumn1} />)
  const tooltipColumn2Data = ReactDOMServer.renderToString(<ColumnList columnData={tooltipColumn2} />)

  const sankeyToolTip = `<div class="sankey-chart__tooltip">
                    <span class="sankey-chart__tooltip--tooltip-header">${tooltipID}</span>
                    <span class="sankey-chart__tooltip--tooltip-header">${tooltipVal}</span>
                    <div class="divider"></div>
                    <span><strong>Summary: </strong>${tooltipSummary}</span>
                    <div class="divider"></div>
                      <div class="sankey-chart__tooltip--info-section">
                        <div>
                          <span><strong>${tooltipColumn1Label}<strong></span>
                          ${tooltipColumn1Data}
                        </div>
                        <div>
                          <span><strong>${tooltipColumn2Label}<strong></span>
                          ${tooltipColumn2Data}
                        </div>
                      </div>
                    </div>`

  // Draw the nodes
  const allNodes = sankeyData.nodes.map((node, i) => {
    let { textPositionHorizontal, textPositionVertical, classStyle, storyNodes } = nodeStyle(node.id)
    let { sourceNodes } = activeConnection(tooltipID)

    let opacityValue = sankeyConfig.opacity.nodeOpacityDefault
    let nodeColor = sankeyConfig.nodeColor.default

    if (tooltipID !== node.id && tooltipID !== '' && !sourceNodes.includes(node.id)) {
      nodeColor = sankeyConfig.nodeColor.inactive
      opacityValue = sankeyConfig.opacity.nodeOpacityInactive
    }

    return (
      <Group className='' key={i}>
        <rect
          height={node.y1! - node.y0! + 2} // increasing node size to account for smaller nodes
          width={sankeyGenerator.nodeWidth()}
          x={node.x0}
          y={node.y0! - 1} //adjusting here the node starts so it looks more center with the link
          fill={nodeColor}
          fillOpacity={opacityValue}
          rx={sankeyConfig.rxValue}
          // todo: move enable tooltips to sankey
          data-tooltip-html={data.tooltips && config.enableTooltips ? sankeyToolTip : null}
          data-tooltip-id={`cdc-open-viz-tooltip-${runtime.uniqueId}-sankey`}
          onClick={() => handleNodeClick(node.id)}
          style={{ pointerEvents: 'visible', cursor: 'pointer' }}
        />
        {storyNodes ? (
          <>
            <Text
              /* Text Position Horizontal
              x0 is the left edge of the node
              # - positions text # units to the right of the left edge of the node */
              x={node.x0! + textPositionHorizontal}
              textAnchor={sankeyData.nodes.length - 1 === i ? 'end' : 'start'}
              verticalAnchor='end'
              /*Text Position Vertical
              y1 and y0 are the top and bottom edges of the node
              y1+y0 = total height
              dividing by 2 gives you the midpoint of the node
              minus 30 raises the vertical position to be higher
              */
              y={(node.y1! + node.y0!) / 2 - 30}
              /* Using x and y in combination with dominant baseline allows for a more
              precise positioning of the text within the svg
              dominant baseline allows for different vertical alignments
              text-before-edge aligns the text's bottom edge with the bottom edge of the container
              */
              fill={sankeyConfig.nodeFontColor}
              fontWeight='bold' // font weight
              style={{ pointerEvents: 'none' }}
              className='node-text'
            >
              {(data?.storyNodeText?.find(storyNode => storyNode.StoryNode === node.id) || {}).segmentTextBefore}
            </Text>
            <Text verticalAnchor='end' className={classStyle} x={node.x0! + textPositionHorizontal} y={(node.y1! + node.y0! + 25) / 2} fill={sankeyConfig.storyNodeFontColor || sankeyConfig.nodeFontColor} fontWeight='bold' textAnchor='start' style={{ pointerEvents: 'none' }}>
              {typeof node.value === 'number' ? node.value.toLocaleString() : node.value}
            </Text>
            <Text
              x={node.x0! + textPositionHorizontal}
              // plus 50 will move the vertical position down
              y={(node.y1! + node.y0!) / 2 + 50}
              fill={sankeyConfig.nodeFontColor}
              fontWeight='bold'
              textAnchor={sankeyData.nodes.length === i ? 'end' : 'start'}
              style={{ pointerEvents: 'none' }}
              className='node-text'
              verticalAnchor='end'
            >
              {(data?.storyNodeText?.find(storyNode => storyNode.StoryNode === node.id) || {}).segmentTextAfter}
            </Text>
          </>
        ) : (
          <>
            <text x={node.x0! + textPositionHorizontal} y={(node.y1! + node.y0!) / 2 + textPositionVertical} dominantBaseline='text-before-edge' fill={sankeyConfig.nodeFontColor} fontWeight='bold' textAnchor='start' style={{ pointerEvents: 'none' }}>
              <tspan id={node.id} className='node-id'>
                {node.id}
              </tspan>
            </text>
            <text
              x={node.x0! + textPositionHorizontal}
              /* adding 30 allows the node value to be on the next line underneath the node id */
              y={(node.y1! + node.y0!) / 2 + 30}
              dominantBaseline='text-before-edge'
              fill={sankeyConfig.nodeFontColor}
              //fontSize={16}
              fontWeight='bold'
              textAnchor='start'
              style={{ pointerEvents: 'none' }}
            >
              <tspan className={classStyle}>{sankeyConfig.nodeValueStyle.textBefore + (typeof node.value === 'number' ? node.value.toLocaleString() : node.value) + sankeyConfig.nodeValueStyle.textAfter}</tspan>
            </text>
          </>
        )}
      </Group>
    )
  })

  // Draw the links
  const allLinks = links.map((link, i) => {
    const linkGenerator = sankeyLinkHorizontal()
    const path = linkGenerator(link)
    let opacityValue = sankeyConfig.opacity.LinkOpacityDefault
    let strokeColor = sankeyConfig.linkColor.default

    let { activeLinks } = activeConnection(tooltipID)

    if (!activeLinks.includes(link) && tooltipID !== '') {
      strokeColor = sankeyConfig.linkColor.inactive
      opacityValue = sankeyConfig.opacity.LinkOpacityInactive
    }

    return <path key={i} d={path!} stroke={strokeColor} fill='none' strokeOpacity={opacityValue} strokeWidth={link.width! + 2} />
  })

  // max depth - calculates how many nodes deep the chart goes.
  const maxDepth: number = sankeyData.nodes.reduce((maxDepth, node) => {
    return Math.max(maxDepth, node.depth)
  }, -1)

  // finalNodesAtMaxDepth - get only the right most nodes on the chart.
  const finalNodesAtMaxDepth = sankeyData.nodes.filter(node => node.depth === maxDepth)

  const finalNodes = finalNodesAtMaxDepth.map((node, i) => {
    let { textPositionHorizontal, textPositionVertical, classStyle, storyNodes } = nodeStyle(node.id)
    let { sourceNodes } = activeConnection(tooltipID)

    let opacityValue = sankeyConfig.opacity.nodeOpacityDefault
    let nodeColor = sankeyConfig.nodeColor.default

    if (tooltipID !== node.id && tooltipID !== '' && !sourceNodes.includes(node.id)) {
      nodeColor = sankeyConfig.nodeColor.inactive
      opacityValue = sankeyConfig.opacity.nodeOpacityInactive
    }

    return (
      <Group className='' key={i} innerRef={el => (groupRefs.current[i] = el)}>
        <rect
          height={node.y1! - node.y0! + 2} // increasing node size to account for smaller nodes
          width={sankeyGenerator.nodeWidth()}
          x={node.x0}
          y={node.y0! - 1} //adjusting here the node starts so it looks more center with the link
          fill={nodeColor}
          fillOpacity={opacityValue}
          rx={sankeyConfig.rxValue}
          // todo: move enable tooltips to sankey
          data-tooltip-html={data.tooltips && config.enableTooltips ? sankeyToolTip : null}
          data-tooltip-id={`tooltip`}
          onClick={() => handleNodeClick(node.id)}
          style={{ pointerEvents: 'visible', cursor: 'pointer' }}
        />
        {storyNodes ? (
          <>
            <Text
              /* Text Position Horizontal
              x0 is the left edge of the node
              # - positions text # units to the right of the left edge of the node */
              x={node.x0! + textPositionHorizontal}
              textAnchor={sankeyData.nodes.length - 1 === i ? 'end' : 'start'}
              verticalAnchor='end'
              /*Text Position Vertical
              y1 and y0 are the top and bottom edges of the node
              y1+y0 = total height
              dividing by 2 gives you the midpoint of the node
              minus 30 raises the vertical position to be higher
              */
              y={(node.y1! + node.y0!) / 2 - 30}
              /* Using x and y in combination with dominant baseline allows for a more
              precise positioning of the text within the svg
              dominant baseline allows for different vertical alignments
              text-before-edge aligns the text's bottom edge with the bottom edge of the container
              */
              fill={sankeyConfig.nodeFontColor}
              fontWeight='bold' // font weight
              style={{ pointerEvents: 'none' }}
              className='node-text'
            >
              {(data?.storyNodeText?.find(storyNode => storyNode.StoryNode === node.id) || {}).segmentTextBefore}
            </Text>
            <Text verticalAnchor='end' className={classStyle} x={node.x0! + textPositionHorizontal} y={(node.y1! + node.y0! + 25) / 2} fill={sankeyConfig.storyNodeFontColor || sankeyConfig.nodeFontColor} fontWeight='bold' textAnchor='start' style={{ pointerEvents: 'none' }}>
              {typeof node.value === 'number' ? node.value.toLocaleString() : node.value}
            </Text>
            <Text
              x={node.x0! + textPositionHorizontal}
              // plus 50 will move the vertical position down
              y={(node.y1! + node.y0!) / 2 + 50}
              fill={sankeyConfig.nodeFontColor}
              fontWeight='bold'
              textAnchor={sankeyData.nodes.length === i ? 'end' : 'start'}
              style={{ pointerEvents: 'none' }}
              className='node-text'
              verticalAnchor='end'
            >
              {(data?.storyNodeText?.find(storyNode => storyNode.StoryNode === node.id) || {}).segmentTextAfter}
            </Text>
          </>
        ) : (
          <>
            <text x={node.x0! + textPositionHorizontal} y={(node.y1! + node.y0!) / 2 + textPositionVertical} dominantBaseline='text-before-edge' fill={sankeyConfig.nodeFontColor} fontWeight='bold' textAnchor='start' style={{ pointerEvents: 'none' }}>
              <tspan id={node.id} className='node-id'>
                {node.id}
              </tspan>
            </text>
            <text
              x={node.x0! + textPositionHorizontal}
              /* adding 30 allows the node value to be on the next line underneath the node id */
              y={(node.y1! + node.y0!) / 2 + 30}
              dominantBaseline='text-before-edge'
              fill={sankeyConfig.nodeFontColor}
              //fontSize={16}
              fontWeight='bold'
              textAnchor='start'
              style={{ pointerEvents: 'none' }}
            >
              <tspan className={classStyle}>{sankeyConfig.nodeValueStyle.textBefore + (typeof node.value === 'number' ? node.value.toLocaleString() : node.value) + sankeyConfig.nodeValueStyle.textAfter}</tspan>
            </text>
          </>
        )}
      </Group>
    )
  })

  return (
    <>
      <div className='sankey-chart'>
        <svg className='sankey-chart__diagram' width={width} height={Number(config.heights.vertical)} style={{ overflow: 'visible' }}>
          <Group className='links'>{allLinks}</Group>
          <Group className='nodes'>{allNodes}</Group>
          <Group className='finalNodes' style={{ display: 'none' }}>
            {finalNodes}
          </Group>
        </svg>

        {/* ReactTooltip needs to remain even if tooltips are disabled -- it handles when a user clicks off of the node and resets
        the sankey diagram. When tooltips are disabled this will nothing */}
        <ReactTooltip id={`cdc-open-viz-tooltip-${runtime.uniqueId}-sankey`} afterHide={() => clearNodeClick()} events={['click']} place={'bottom'} style={{ backgroundColor: `rgba(238, 238, 238, 1)`, color: 'black', boxShadow: `0 3px 10px rgb(0 0 0 / 0.2)` }} />
        {showPopup && (
          <div className='popup'>
            <div className='popup-content'>
              <button className='visually-hidden' onClick={closePopUp}>
                Select for accessible version.
              </button>
              <p>
                <strong>Please change the orientation of your screen or increase the size of your browser to view the diagram better.</strong>
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
export default Sankey
