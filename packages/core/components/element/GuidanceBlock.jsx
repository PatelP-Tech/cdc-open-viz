import { Children } from 'react'
import PropTypes from 'prop-types'

// Components - Core
import Icon from '../ui/Icon'

// Styles
import '../../styles/v2/components/element/guidance-block.scss'

//Define the "slots" to be populated by subcomponents
const GuidanceTitle = () => null
const GuidanceContent = () => null

const GuidanceBlock = ({ linkTo, icon, target = '_blank', accentColor, children, ...attributes }) => {

  //Parse, organize, and pull "slotted" children data from subcomponents
  const childNodes = Children.toArray(children)
  const guidanceTitleChildren = childNodes.find(child => child?.type === GuidanceTitle)
  const guidanceContentChildren = childNodes.find(child => child?.type === GuidanceContent)

  const filteredAttrs = { ...attributes }
  delete filteredAttrs.className //Remove classes from object, spread without conflicting with hardcoded classNames

  return (<>
    {accentColor && (
      <style>
      {`.cove-guidance-block:before {
        background: ${accentColor};
      }`}
      </style>
    )}
    <a
      className="cove-guidance-block"
      href={linkTo || '#'}
      target={target}
      {...filteredAttrs}
    >
      {icon && (
        <div className="cove-guidance-block__icon" style={{ color: accentColor ? accentColor : null }}>
          <Icon display={icon} base/>
        </div>
      )}
      {guidanceTitleChildren && (
        <h3 className="cove-guidance-block__header">
          {guidanceTitleChildren?.props.children}
        </h3>
      )}
      {guidanceContentChildren && (
        <div className="cove-guidance-block__content">
          {guidanceContentChildren?.props.children}
        </div>
      )}
    </a>
  </>)
}

//Create subcomponents as "slots" within component namespace
GuidanceBlock.Title = GuidanceTitle
GuidanceBlock.Content = GuidanceContent

GuidanceBlock.propTypes = {
  /** Specify an internal/external link that is opened when users click the Guidance Block */
  linkTo: PropTypes.string,
  /** Display an icon by your block by supplying a valid Icon component code; see the Components/UI/Icon section for options */
  icon: PropTypes.string,
  /** Specify the `target` namespace for the link to use when opened. `_blank` can be used to open the link in a new tab */
  target: PropTypes.string,
  /** Override the default icon and border accent color */
  accentColor: PropTypes.string
}

export default GuidanceBlock
