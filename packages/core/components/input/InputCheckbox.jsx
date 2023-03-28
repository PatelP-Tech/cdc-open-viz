import React, { useState, useEffect, memo, useRef } from 'react'
import PropTypes from 'prop-types'

// Hooks
import { useVisConfig } from '../../hooks/store/useVisConfig'

// Helpers
import { getConfigKeyValue } from '../../helpers/configHelpers'

// Components
import Icon from '../ui/Icon'
import Label from '../element/Label'

// Styles
import '../../styles/v2/components/input/index.scss'

const InputCheckbox = memo((
  {
    label,
    labelPosition = 'right',
    tooltip,
    size = 'small',
    activeColor = null,
    activeCheckColor = null,
    stretch,
    required,

    configField,
    value: inlineValue,
    className, onClick, ...attributes
  }
) => {
  const { config, updateVisConfigField } = useVisConfig()

  const [ value, setValue ] = useState(false)

  const inputRef = useRef(null)

  // Get initial value
  const configFieldValue = configField && getConfigKeyValue(configField, config)

  // Check initial value
  // Valid value of 'false' could be returned, so checking undefined
  const valueExistsOnConfig = Boolean(configFieldValue && typeof configFieldValue !== undefined)

  // Set initial value
  useEffect(() => {
    if (valueExistsOnConfig) {
      configFieldValue !== value && setValue(configFieldValue)
    } else {
      setValue(inlineValue)
    }
  }, [ valueExistsOnConfig ])

  useEffect(() => {
    if (configField && value !== configFieldValue)
      updateVisConfigField(configField, value)
  }, [ configField, value, updateVisConfigField ])

  const onClickHandler = () => inputRef.current.click()

  const onChangeHandler = (e) => {
    setValue(value => !value)
    onClick && onClick(e)
  }

  const generateWrapperClasses = () => {
    const classList = []

    // Root class
    const root = 'cove-input__checkbox-group'
    classList.push(root)

    // Stretch class
    if (stretch) classList.push('cove-input__checkbox-group--stretch')

    // Props classes
    if (className) classList.push(className)

    return classList.join(' ')
  }

  const generateInputClasses = () => {
    const classList = []

    // Root class
    const root = 'cove-input__checkbox'
    const suffixArr = {
      small: '',
      medium: '--medium',
      large: '--large',
      xlarge: '--xlarge'
    }
    classList.push(root + suffixArr[size])

    // Active class
    if (value) classList.push('cove-input__checkbox--active')

    // Required class
    // if (required && (value === undefined)) classList.push('cove-input--error')

    return classList.join(' ')
  }

  const TooltipLabel = () => {
    const labelProps = (tooltip && tooltip !== "") && { 'data-has-tooltip': true }

    return (
      <div className="cove-input__checkbox-group__label" {...labelProps}>
        <Label tooltip={tooltip} onClick={onClickHandler}>{label}</Label>
      </div>
    )
  }

  return (
    <div className={generateWrapperClasses()} flow={labelPosition}>
      {label && labelPosition === 'left' &&
        <TooltipLabel/>
      }
      <div className={generateInputClasses()}
        tabIndex={0}
        onClick={onClickHandler}
        onKeyUp={(e) => {
          if (e.code === 'Enter' || e.code === 'NumpadEnter' || e.code === 'Space') onClickHandler()
        }}
      >
        <div className={`cove-input__checkbox-box${activeColor ? ' cove-input__checkbox-box--custom-color' : ''}`}
             style={value && activeColor ? { backgroundColor: activeColor } : null}>
          <Icon display="check" className="cove-input__checkbox-check" color={activeCheckColor || '#025eaa'}/>
        </div>
        <input className="cove-input--hidden" type="checkbox" defaultChecked={value} onChange={(e) => onChangeHandler(e)} ref={inputRef} tabIndex={-1} readOnly/>
      </div>
      {label && labelPosition === 'right' &&
        <TooltipLabel/>
      }
    </div>
  )
})

InputCheckbox.propTypes = {
  /** Add label to the input field */
  label: PropTypes.string,
  /** Position the label relative to the checkbox */
  labelPosition: PropTypes.oneOf([ 'left', 'right' ]),
  /** Select the preferred size of the checkbox */
  size: PropTypes.oneOf([ 'small', 'medium', 'large' ]),
  /** Select the preferred color for the checkbox fill when active */
  activeColor: PropTypes.string,
  /** Select the preferred color for the checkbox's check when active */
  activeCheckColor: PropTypes.string,
  /** Add a tooltip to describe the checkbox's usage; JSX markup can also be supplied */
  tooltip: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object
  ]),
  /** Stretch the checkbox and its label to fill the width of its container */
  stretch: PropTypes.bool,
  /** Supply a reference to the config key this input connects to, if any.<br/><br/>
   * **String**<br/>
   * `configField="title"` will connect to the `config.title` value.<br/><br/>
   * **Array**<br/>
   * `configField={[ 'componentStyle', 'shadow' ]}` will connect to the `config.componentStyle.shadow` value. <br/><br/>
   * See [setConfigKeyValue](https://cdcgov.github.io/cdc-open-viz/?path=/docs/helpers-confighelpers-setconfigkeyvalue--docs) for more details. */
  configField: PropTypes.oneOfType([ PropTypes.string, PropTypes.array ]),
  /** Function to call when the input is clicked */
  onClick: PropTypes.func
}

export default InputCheckbox