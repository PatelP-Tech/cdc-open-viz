import React from 'react'
import PropTypes from 'prop-types'

// Icons
import iconCaretDown from '../../assets/icon-caret-down.svg'
import iconCaretFilledDown from '../../assets/icon-caret-filled-down.svg'
import iconCaretFilledUp from '../../assets/icon-caret-filled-up.svg'
import iconCaretUp from '../../assets/icon-caret-up.svg'
import iconChartBar from '../../assets/icon-chart-bar.svg'
import iconChartBarPaired from '../../assets/icon-chart-bar-paired.svg'
import iconChartBarStacked from '../../assets/icon-chart-bar-stacked.svg'
import iconChartLine from '../../assets/icon-chart-line.svg'
import iconChartPie from '../../assets/icon-chart-pie.svg'
import iconCheck from '../../assets/icon-check.svg'
import iconCircleCheck from '../../assets/icon-circle-check.svg'
import iconCircleCheckActive from '../../assets/icon-circle-check-active.svg'
import iconClose from '../../assets/icon-close.svg'
import iconCode from '../../assets/icon-code.svg'
import iconCommand from '../../assets/icon-command.svg'
import iconDashboard from '../../assets/icon-dashboard.svg'
import iconDataByte from '../../assets/icon-databyte.svg'
import iconDownloadImg from '../../assets/icon-download-img.svg'
import iconDownloadPdf from '../../assets/icon-download-pdf.svg'
import iconEdit from '../../assets/icon-edit.svg'
import iconFileUpload from '../../assets/icon-file-upload.svg'
import iconFilterBars from '../../assets/icon-filter-bars.svg'
import iconGrid from '../../assets/icon-grid.svg'
import iconInfo from '../../assets/icon-info.svg'
import iconLink from '../../assets/icon-link.svg'
import iconLinkExternal from '../../assets/icon-link-external.svg'
import iconMapAl from '../../assets/icon-map-alabama.svg'
import iconMapFolded from '../../assets/icon-map-folded.svg'
import iconMapUsa from '../../assets/icon-map-usa.svg'
import iconMapWorld from '../../assets/icon-map-world.svg'
import iconMinus from '../../assets/icon-minus.svg'
import iconMove from '../../assets/icon-move.svg'
import iconPlus from '../../assets/icon-plus.svg'
import iconQuestionCircle from '../../assets/icon-question-circle.svg'
import iconRotateLeft from '../../assets/icon-rotate-left.svg'
import iconSquareGrid from '../../assets/icon-square-grid.svg'
import iconUpload from '../../assets/icon-upload.svg'
import iconWarningCircle from '../../assets/icon-warning-circle.svg'
import iconWarningTriangle from '../../assets/icon-warning-triangle.svg'

// Styles
import '../../styles/components/ui/icon.scss'

const iconHash = {
  'caretDown': iconCaretDown,
  'caretFilledDown': iconCaretFilledDown,
  'caretFilledUp': iconCaretFilledUp,
  'caretUp': iconCaretUp,
  'chartBar': iconChartBar,
  'chartBarPaired': iconChartBarPaired,
  'chartBarStacked': iconChartBarStacked,
  'chartLine': iconChartLine,
  'chartPie': iconChartPie,
  'check': iconCheck,
  'circleCheck': iconCircleCheck,
  'circleCheckActive': iconCircleCheckActive,
  'close': iconClose,
  'code': iconCode,
  'command': iconCommand,
  'dashboard': iconDashboard,
  'databyte': iconDataByte,
  'downloadImg': iconDownloadImg,
  'downloadPdf': iconDownloadPdf,
  'edit': iconEdit,
  'fileUpload': iconFileUpload,
  'filterBars': iconFilterBars,
  'grid': iconGrid,
  'info': iconInfo,
  'link': iconLink,
  'linkExternal': iconLinkExternal,
  'mapAl': iconMapAl,
  'mapFolded': iconMapFolded,
  'mapUsa': iconMapUsa,
  'mapWorld': iconMapWorld,
  'minus': iconMinus,
  'move': iconMove,
  'plus': iconPlus,
  'questionCircle': iconQuestionCircle,
  'rotateLeft': iconRotateLeft,
  'squareGrid': iconSquareGrid,
  'upload': iconUpload,
  'warningCircle': iconWarningCircle,
  'warningTriangle': iconWarningTriangle
}

const Icon = ({ display = null, base, alt = '', size, color, style, ...attributes }) => {
  const IconObj = iconHash[display] || null

  const filteredAttrs = { ...attributes }
  delete filteredAttrs.className

  const styles = {
    ...style,
    color: color ? color : null,
    width: size ? size + 'px' : null
  }

  return (
    <>
      {base
        ? <IconObj title={alt}/>
        : (
          <span className={`cove-icon${attributes.className ? ' ' + attributes.className : ''}`} style={styles} {...filteredAttrs}>
            <IconObj title={alt}/>
          </span>
        )
      }
    </>
  )
}

Icon.propTypes = {
  /* Define the icon to display */
  display: PropTypes.oneOf(Object.keys(iconHash)),
  /* Returns icon data as plain svg */
  base: PropTypes.bool,
  /* Sets alt text for the icon */
  alt: PropTypes.string,
  /* Override the width of the icon (scales height proportionally)*/
  size: PropTypes.number,
  /* Override the color of the icon */
  color: PropTypes.string
}

export default Icon
