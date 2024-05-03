import { Legend } from './Legend'
import { Axis } from './Axis'
import { Column } from './Column'
import { Series } from './Series'
import { Table } from './Table'
import { Config as MarkupInclude } from '../../markup-include/src/types/Config'
import { ConfidenceInterval } from './ConfidenceInterval'
import { BaseVisualizationType } from './BaseVisualizationType'
import { ConfigureData } from './ConfigureData'

export type Visualization = ConfigureData & {
  autoLoad: boolean
  columns: Record<string, Column>
  confidenceKeys: ConfidenceInterval
  contentEditor: {}
  dataFileName: string
  dataFileSourceType: string
  dataFormat: any
  datasets: Record<string, any>
  editing: boolean
  general: any
  hide: any[]
  legend: Legend
  markupInclude: MarkupInclude
  multiDashboards?: any[]
  newViz: boolean
  openModal: boolean
  orientation: 'vertical' | 'horizontal'
  originalFormattedData: any
  series: Series
  showEditorPanel: boolean
  table: Table
  theme: string
  title: string
  type: BaseVisualizationType
  uid: string // this is the actual key of the visualization object
  usesSharedFilter: any
  visual: {}
  visualizationSubType: string
  visualizationType: string
  xAxis: Axis
}
