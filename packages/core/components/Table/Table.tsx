import { ReactNode } from 'react'
import Row from './components/Row'
import GroupRow from './components/GroupRow'
import { CellMatrix, GroupCellMatrix } from './types/CellMatrix'

type TableProps = {
  childrenMatrix: CellMatrix | GroupCellMatrix
  tableName: string
  caption: string
  stickyHeader?: boolean
  headContent: ReactNode
  tableOptions: {
    className: string
    'aria-live'?: 'off' | 'assertive' | 'polite'
    hidden?: boolean
    'aria-rowcount'?: number,
    cellMinWidth?: number
  }
  wrapColumns: boolean
}

type Position = 'sticky'

const Table = ({ childrenMatrix, tableName, caption, stickyHeader, headContent, tableOptions, wrapColumns }: TableProps) => {
  const headStyle = stickyHeader ? { position: 'sticky' as Position, top: 0, zIndex: 999 } : {}
  const isGroupedMatrix = !Array.isArray(childrenMatrix)
  return (
    <table {...tableOptions}>
      <caption className='visually-hidden'>{caption}</caption>
      <thead style={headStyle}>{headContent}</thead>
      <tbody>
        {isGroupedMatrix
          ? Object.keys(childrenMatrix).flatMap(groupName => {
              let colSpan = 0
              const rows = childrenMatrix[groupName].map((row, i) => {
                colSpan = row.length
                const key = `${tableName}-${groupName}-row-${i}`
                return <Row key={key} rowKey={key} childRow={row} wrapColumns={wrapColumns} cellMinWidth={tableOptions.cellMinWidth} />
              })
              return [<GroupRow label={groupName} colSpan={colSpan} key={`${tableName}-${groupName}`} />, ...rows]
            })
          : childrenMatrix.map((childRow, i) => {
              const key = `${tableName}-row-${i}`
              return <Row key={key} rowKey={key} childRow={childRow} wrapColumns={wrapColumns} cellMinWidth={tableOptions.cellMinWidth} />
            })}
      </tbody>
    </table>
  )
}

export default Table