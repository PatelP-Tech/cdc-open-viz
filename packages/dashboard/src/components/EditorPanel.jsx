import React, { useState, useEffect, memo, useContext } from 'react'
import {
  Accordion,
  AccordionItem,
  AccordionItemHeading,
  AccordionItemPanel,
  AccordionItemButton,
} from 'react-accessible-accordion';
import { useDebounce } from 'use-debounce';

import ConfigContext from '../ConfigContext';

import ErrorBoundary from '@cdc/core/components/ErrorBoundary';
import fetchRemoteData from '@cdc/core/helpers/fetchRemoteData';
import Tooltip from '@cdc/core/components/ui/Tooltip'
import Icon from '@cdc/core/components/ui/Icon'

// IE11 Custom Event polyfill
(function () {

  if ( typeof window.CustomEvent === "function" ) return false;

  function CustomEvent ( event, params ) {
    params = params || { bubbles: false, cancelable: false, detail: null };
    var evt = document.createEvent( 'CustomEvent' );
    evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
    return evt;
   }

  window.CustomEvent = CustomEvent;
})();

const TextField = memo(({label, section = null, subsection = null, fieldName, updateField, value: stateValue, tooltip, type = "input", i = null, min = null, ...attributes}) => {
  const [ value, setValue ] = useState(stateValue);

  const [ debouncedValue ] = useDebounce(value, 500);

  useEffect(() => {
    if('string' === typeof debouncedValue && stateValue !== debouncedValue ) {
      updateField(section, subsection, fieldName, debouncedValue, i)
    }
  }, [debouncedValue])

  let name = subsection ? `${section}-${subsection}-${fieldName}` : `${section}-${subsection}-${fieldName}`;

  const onChange = (e) => {
    if('number' !== type || min === null){
      setValue(e.target.value);
    } else {
      if(!e.target.value || min <= parseFloat(e.target.value)){
        setValue(e.target.value);
      } else {
        setValue(min.toString());
      }
    }
  };

  let formElement = <input type="text" name={name} onChange={onChange} {...attributes} value={value} />

  if('textarea' === type) {
    formElement = (
      <textarea name={name} onChange={onChange} {...attributes} value={value}></textarea>
    )
  }

  if('number' === type) {
    formElement = <input type="number" name={name} onChange={onChange} {...attributes} value={value} />
  }

  return (
    <label>
      <span className="edit-label column-heading">{label}{tooltip}</span>
      {formElement}
    </label>
  )
})

const CheckBox = memo(({label, value, fieldName, section = null, subsection = null, updateField, ...attributes}) => (
  <label className="checkbox">
    <input type="checkbox" name={fieldName} checked={ value } onChange={() => { updateField(section, subsection, fieldName, !value) }} {...attributes}/>
    <span className="edit-label">{label}</span>
    {section === 'table' && fieldName === 'show'}
  </label>
))

const EditorPanel = memo(() => {
  const {
    config,
    updateConfig,
    loading,
    setParentConfig
  } = useContext(ConfigContext);

  const [ displayPanel, setDisplayPanel ] = useState(true);
  const [ columns, setColumns ] = useState([]);

  // Used to pipe a JSON version of the config you are creating out
  const [ configData, setConfigData ] = useState({})

  useEffect(() => {
    const runSetColumns = async () => {
      let columns = {};
      let dataKeys = Object.keys(config.datasets);

      for(let i = 0; i < dataKeys.length; i++){
        if(!config.datasets[dataKeys[i]].data && config.datasets[dataKeys[i]].dataUrl){
          config.datasets[dataKeys[i]].data = await fetchRemoteData(config.datasets[dataKeys[i]].dataUrl);
          if(config.datasets[dataKeys[i]].dataDescription) {
            try {
              config.datasets[dataKeys[i]].data = transform.autoStandardize(config.datasets[dataKeys[i]].data);
              config.datasets[dataKeys[i]].data = transform.developerStandardize(config.datasets[dataKeys[i]].data, config.datasets[dataKey].dataDescription);
            } catch(e) {
              //Data not able to be standardized, leave as is
            }
          }
        }

        if(config.datasets[dataKeys[i]].data) {
          config.datasets[dataKeys[i]].data.map(row => {
            Object.keys(row).forEach(columnName => columns[columnName] = true)
          })
        }
      }

      setColumns(Object.keys(columns))
    }

    runSetColumns()
  }, [config.datasets]);

  useEffect(() => {
    const parsedData = convertStateToConfig()

    const formattedData = JSON.stringify(JSON.parse(parsedData), undefined, 2);

    setConfigData(formattedData)

    // Emit the data in a regular JS event so it can be consumed by anything.
    const event = new CustomEvent('updateVizConfig', { detail: parsedData})

    window.dispatchEvent(event)

    // Pass up to Editor if needed
    if(setParentConfig) {
      const newConfig = convertStateToConfig("object")
      setParentConfig(newConfig)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config]);

  const updateField = (section, subsection, fieldName, newValue) => {
    // Top level
    if( null === section && null === subsection) {
      let dashboardConfig = config.dashboard;

      dashboardConfig[fieldName] = newValue;

      let updatedConfig = {...config, dashboard: dashboardConfig};

      updateConfig(updatedConfig);
      return
    }

    const isArray = Array.isArray(config[section]);

    let sectionValue = isArray ? [...config[section], newValue] : {...config[section], [fieldName]: newValue};

    if(null !== subsection) {
      if(isArray) {
        sectionValue = [...config[section]]
        sectionValue[subsection] = {...sectionValue[subsection], [fieldName]: newValue}
      } else if(typeof newValue === "string") {
        sectionValue[subsection] = newValue
      } else {
        sectionValue = {...config[section], [subsection]: { ...config[section][subsection], [fieldName]: newValue}}
      }
    }

    let updatedConfig = {...config, [section]: sectionValue};

    updateConfig(updatedConfig)
  }

  const convertStateToConfig = (type = "JSON") => {
    let strippedState = JSON.parse(JSON.stringify(config))
    delete strippedState.newViz
    delete strippedState.runtime

    if(type === "JSON") {
      return JSON.stringify( strippedState )
    }

    return strippedState
  }

  const removeFilter = (index) => {
    let dashboardConfig = config.dashboard;

    dashboardConfig.sharedFilters.splice(index, 1);

    updateConfig({...config, dashboard: dashboardConfig});
  }

  const updateFilterProp = (name, index, value) => {
    let dashboardConfig = config.dashboard;

    dashboardConfig.sharedFilters[index][name] = value;

    updateConfig({...config, dashboard: dashboardConfig});
  }

  const updateFilterSetBy = (filter, index, value) => {
    updateFilterProp('setBy', index, value)
  }

  const addFilterUsedBy = (filter, index, value) => {
    if(!filter.usedBy) filter.usedBy = [];
    filter.usedBy.push(value);
    updateFilterProp('usedBy', index, filter.usedBy);
  }

  const removeFilterUsedBy = (filter, index, value) => {
    let usedByIndex = filter.usedBy.indexOf(value);
    if(usedByIndex !== -1){
      filter.usedBy.splice(usedByIndex, 1);
      updateFilterProp('usedBy', index, filter.usedBy);
    }

  }

  const addNewFilter = () => {
    let dashboardConfig = config.dashboard;

    dashboardConfig.sharedFilters = dashboardConfig.sharedFilters || [];

    dashboardConfig.sharedFilters.push({key: 'Dashboard Filter ' + (dashboardConfig.sharedFilters.length + 1), values: []});

    updateConfig({...config, dashboard: dashboardConfig});
  }

  const Error = () => {
    return (
      <section className="waiting">
        <section className="waiting-container">
          <h3>Error With Configuration</h3>
          <p>{config.runtime.editorErrorMessage}</p>
        </section>
      </section>
    );
  }

  if (loading) return null

  return (
    <ErrorBoundary component="EditorPanel">
      {config.runtime && config.runtime.editorErrorMessage && <Error /> }
      <button className={displayPanel ? `editor-toggle` : `editor-toggle collapsed`} title={displayPanel ? `Collapse Editor` : `Expand Editor`} onClick={() => {updateConfig({...config, editing: false}); setDisplayPanel(!displayPanel)} }></button>
      <section className={displayPanel ? 'editor-panel' : 'hidden editor-panel cove'}>
        <div className="heading-2">Configure</div>
        <section className="form-container">
          <form>
            <Accordion allowZeroExpanded={true}>
              <AccordionItem>
                <AccordionItemHeading>
                  <AccordionItemButton>
                    General
                  </AccordionItemButton>
                </AccordionItemHeading>
                <AccordionItemPanel>
                  <TextField value={config.dashboard.title} section="dashboard" fieldName="title" label="Title" updateField={updateField} />
                  <TextField type="textarea" value={config.dashboard.description} section="dashboard" fieldName="description" label="Description" updateField={updateField} tooltip={
                    <Tooltip style={{textTransform: 'none'}}>
                      <Tooltip.Target><Icon display="question" style={{marginLeft: '0.5rem'}}/></Tooltip.Target>
                      <Tooltip.Content>
                        <p>Enter supporting text to display below the data visualization, if applicable. The following HTML tags are supported: strong, em, sup, and sub.</p>
                      </Tooltip.Content>
                    </Tooltip>
                  }/>
                </AccordionItemPanel>
              </AccordionItem>
              <AccordionItem>
                <AccordionItemHeading>
                  <AccordionItemButton>
                    Filters
                  </AccordionItemButton>
                </AccordionItemHeading>
                <AccordionItemPanel>
                  <ul className="filters-list">
                    {config.dashboard.sharedFilters && config.dashboard.sharedFilters.map((filter, index) => (
                        <fieldset className="edit-block" key={filter.columnName + index}>
                          <button type="button" className="remove-column" onClick={() => {removeFilter(index)}}>Remove</button>
                          <label>
                            <span className="edit-label column-heading">Filter</span>
                            <select value={filter.columnName} onChange={(e) => {updateFilterProp('columnName', index, e.target.value)}}>
                              <option value="">- Select Option -</option>
                              {columns.map((dataKey) => (
                                <option value={dataKey} key={`filter-column-select-item-${dataKey}`}>{dataKey}</option>
                              ))}
                            </select>
                          </label>
                          <label>
                            <span className="edit-label column-heading">Label</span>
                            <input type="text" value={filter.key} onChange={(e) => {updateFilterProp('key', index, e.target.value)}}/>
                          </label>
                          <label>
                            <span className="edit-label column-heading">Show Dropdown</span>
                            <input type="checkbox" value={filter.showDropdown === true} onChange={(e) => {updateFilterProp('showDropdown', index, !filter.showDropdown)}}/>
                          </label>
                          <label>
                            <span className="edit-label column-heading">Set By:</span>
                            <select value={filter.setBy} onChange={e => updateFilterSetBy(filter, index, e.target.value)}>
                              <option value="">- Select Option -</option>
                              {Object.keys(config.visualizations).map((vizKey) => (
                                <option value={vizKey} key={`set-by-select-item-${vizKey}`}>{vizKey}</option>
                              ))}
                            </select>
                          </label>
                          <label>
                            <span className="edit-label column-heading">Used By:</span>
                            <ul>
                              {filter.usedBy && filter.usedBy.map(vizKey => (
                                <li key={`used-by-list-item-${vizKey}`}><span>{vizKey}</span> <button onClick={() => removeFilterUsedBy(filter, index, vizKey)}>X</button></li>
                              ))}
                            </ul>
                            <select onChange={e => addFilterUsedBy(filter, index, e.target.value)}>
                              <option value="">- Select Option -</option>
                              {Object.keys(config.visualizations).filter(vizKey => !config.visualizations[vizKey].usesSharedFilter).map((vizKey) => (
                                <option value={vizKey} key={`used-by-select-item-${vizKey}`}>{vizKey}</option>
                              ))}
                            </select>
                          </label>
                        </fieldset>
                      )
                    )}
                  </ul>

                  <button type="button" onClick={addNewFilter} className="btn btn-primary">Add Filter</button>
                </AccordionItemPanel>
              </AccordionItem>
              <AccordionItem>
                <AccordionItemHeading>
                  <AccordionItemButton>
                    Data Table
                  </AccordionItemButton>
                </AccordionItemHeading>
                <AccordionItemPanel>
                  <CheckBox value={config.table.show} section="table" fieldName="show" label="Show Table" updateField={updateField}  />
                  <CheckBox value={config.table.expanded} section="table" fieldName="expanded" label="Expanded by Default" updateField={updateField} />
                  <CheckBox value={config.table.download} section="table" fieldName="download" label="Display Download Button" updateField={updateField} />
                  <TextField value={config.table.label} section="table" fieldName="label" label="Label" updateField={updateField} />
                </AccordionItemPanel>
              </AccordionItem>
           </Accordion>
          </form>
        </section>
      </section>
    </ErrorBoundary>
  )
})

export default EditorPanel;