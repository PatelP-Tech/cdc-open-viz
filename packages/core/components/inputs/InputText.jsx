import React, { useState, useEffect, useRef, memo } from 'react'
import { useDebounce } from 'use-debounce'
import PropTypes from 'prop-types'

import { useConfigContext } from '../../context/ConfigContext'

import { getConfigKeyValue } from '../../helpers/configHelpers'

import Label from '../elements/Label'

import '../../styles/v2/components/input/index.scss'

const InputText = (
  {
    label,
    type = 'text',
    tooltip,
    placeholder,
    test,

    configField,
    value: inlineValue,
    min, max, className, ...attributes
  }
) => {

  const { config, configActions } = useConfigContext()

  //Input will only accept either an inline value from the element, or a value from a connected config key
  const [ loadedConfigValue, setLoadedConfigValue ] = useState(false) //Prevents run on render
  const [ value, setValue ] = useState(configField ? getConfigKeyValue(configField, config) : inlineValue || '')
  const [ debouncedValue ] = useDebounce(value, 500)

  const inputRef = useRef(null)

  useEffect(() => {
    if (configField) {
      if (loadedConfigValue || value === undefined) { //Ignores the first pass when initial render sets debounceValue
        if (inlineValue !== debouncedValue) {
          configActions.updateField(configField, debouncedValue)
        }
      }

      // Initial debounceValue changed to configField value
      // UpdateField func is now accessible
      setLoadedConfigValue(true)
    }
  }, [ debouncedValue ])

  const isNumberWithinBounds = (val) => {
    let inBounds = false
    if (val === '') inBounds = true
    if (min || max) {
      if (min && (parseFloat(val) >= parseFloat(min))) {
        inBounds = true
      }
      if (max && (parseFloat(val) <= parseFloat(max))) {
        inBounds = true
      }
    } else {
      inBounds = true
    }
    return inBounds
  }

  // This is some subtext that I found here

  //TODO: COVE Refactor - Expand to support source onChange events
  const onChange = (e) => {
    switch(type) {
      case 'number':
        if (isNumberWithinBounds(e.target.value)) {
          setValue(e.target.value)
        } else {
          setValue(value)
        }
        break
      default:
        setValue(e.target.value)
    }
  }

  let inputAttrs = {
    className: `cove-input${className ? ' ' + className : ''}`,
    type,
    placeholder,
    onChange,
    ...attributes
  }

  let formElement = 'textarea' === type
    ? (<textarea {...inputAttrs} ref={inputRef}>{value}</textarea>)
    : (<input {...inputAttrs} value={value} ref={inputRef}/>)


  return (
    <>
      {label && <Label tooltip={tooltip} onClick={() => inputRef.current.focus()}>{label}</Label>}
      {formElement}
    </>
  )
}

InputText.propTypes = {
  label: PropTypes.string,
  type: PropTypes.oneOf([ 'text', 'textarea', 'number', 'date' ]),
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  tooltip: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.string
  ]),
  placeholder: PropTypes.string,
  min: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string
  ]),
  max: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string
  ]),
  section: PropTypes.string,
  subsection: PropTypes.string,
  fieldName: PropTypes.string,
  updateField: PropTypes.func
}

export default InputText
