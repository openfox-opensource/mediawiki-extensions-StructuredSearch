import React, { Component } from "react";
import settingsGetter from './libs/settingsGetter';
import FormInput from './libs/FormInput';
import FormMain from './libs/FormMain';
import EventEmitter from './libs/EventEmitter';
import utils from './libs/utils';
import translate from './libs/translations';
import fieldsDetector from './libs/fieldsDetector';
import './App.css';


class TopBar extends Component {
  constructor() {
   
      super();
      const structuredSearchProps = window.mw?.config.get('structuredSearchProps') || {};
      
      this.state = {
        labels: [],
        chevronDir: 'down',
        useTableView: false, // <-- Track the selected view
        enableDisplayToggle: Object.keys(structuredSearchProps).length > 0
      };
    
    
    EventEmitter.on("FormDataChanged", allData => {
      this.refreshAllInputsByData( allData );
    });

    EventEmitter.on("autocompleteMenuOpen", isOpen => {
      this.setState({
        searchSuggestionsOpen : isOpen
      });
    });
    EventEmitter.on("autocompleteMenuResults", results => {
      this.setState({
        searchSuggestionsNotEmpty : !!results.length
      });
    });
  }
  componentDidMount() {
    EventEmitter.on("toggleDisplayView", (useTableView) => {
      this.setState({ useTableView });
    });
    for(let key of [
      'structuredsearch-clear',
      'structuredsearch-toggle-sidebar'
      ]){
      translate(key).then( val => {
        let stateToChange = {};
        stateToChange[key] = val;
        this.setState(stateToChange);

      });
    }

      settingsGetter.get().then(data => {
        if( data ){
          this.setState({
            inputs: data.params,
            labels : []
          });
          this.refreshAllInputsByData( FormMain.getAllValuesRaw() );
        }
       }
      );
      this.setStickyCheck();
      EventEmitter.on("hideSidebar", allData => {
        this.setState( {chevronDir : 'down'});
      });    
      EventEmitter.on("showSidebar", allData => {
        this.setState( {chevronDir : 'up'});
      });
  }
  componentWillUnmount(){
    EventEmitter.off("toggleDisplayView");
  }
  setStickyCheck( ) {
    const observer = new IntersectionObserver((records, observer) => {
      for (const record of records) {
        const targetInfo = record.boundingClientRect;
        if(targetInfo.top > 0){
          this.setState({sticky:false});
        }
        else if(targetInfo.top < 0){
          this.setState({sticky:true})
        }
      }
    }, {threshold: [0,1]});
    observer.observe(document.querySelector('.checking-sticky'))
  }
  standardizeItem( item) {
    if( 'string' === typeof item ){
      item = [{
        label:item,
        value:item
      }];
    }
    return item;
  }
  removeLabel( fieldName, valueObj) {
    if('undefined' !== typeof this.state.inputs && 'range' === this.state.inputs[fieldName].widget.type){
      FormMain.clearField(fieldName);
    }
    else{
      FormMain.removeValue(fieldName, valueObj);
    }
    FormMain.fireChangeEvent();
  }

  submitClicked( event ){
    event.preventDefault();
    FormMain.submitData();
  }
  refreshAllInputsByData( allData ) {
      let newLabels = {}, alreadyIncluded = [],binds = [].concat( FormMain.binds );
      for(let fieldKey of Object.keys(allData)){
        if( alreadyIncluded.includes(fieldKey)){
          continue;
        }
        if(allData[fieldKey] && utils.safeGet(this, 'state.inputs') && !this.state.inputs[fieldKey].withoutLabels ){
          //console.log(allData[fieldKey],"allData[fieldKey]");
          newLabels[fieldKey] = [];
          //console.log(allData[fieldKey],"allData[fieldKey]");
          allData[fieldKey] = this.standardizeItem( allData[fieldKey] );
          if( fieldsDetector.isRange( this.state.inputs[fieldKey] ) ){
            let data = allData[fieldKey];
            //console.log('dataRange', data);
            if(data && (data[0] || data[1]) ){
              newLabels[fieldKey] = [{
                label : data.join('-'),
                value: data.join('-'),
                field: fieldKey
              }];
            }
          }
          else{
            for(let item of allData[fieldKey]){
              newLabels[fieldKey].push({
                label : item.label,
                value: item.value,
                field: fieldKey
              });
            }
          }
          if(newLabels[fieldKey] && newLabels[fieldKey].length){
            for(let bind of binds){
              if(bind.includes(fieldKey)){
                for(let boundFieldKey of bind){
                  if(boundFieldKey !== fieldKey){
                    //console.log(boundFieldKey,allData[boundFieldKey], "boundFieldKey,allData[boundFieldKey]" );
                    if( !allData[boundFieldKey] || !allData[boundFieldKey].length ){
                      delete(newLabels[fieldKey]);
                      break;
                    }
                    else{
                      newLabels[fieldKey][0].label += ' ' + allData[boundFieldKey][0].label;
                    }
                    alreadyIncluded.push( boundFieldKey );
                  }
                }
              }
            }
          }
        }
      }
      
      this.setState({labels:newLabels});
  }
  clearClicked() {
    let changed = false;
    if( 'undefined' != typeof this.state.inputs){    
      for(let paramKey in this.state.inputs){
        let paramDef = this.state.inputs[ paramKey ];
        if( fieldsDetector.isMultiple(paramDef) && !fieldsDetector.isSearchOrNs( paramDef ) ){
          changed = FormMain.clearField( paramKey ) || changed;
        }
      }
    }
    if(changed){
      FormMain.fireChangeEvent();
    }
  }
  toggleSidebar(){
    EventEmitter.emit('toggleSidebar');
  }
  renderSimpleFilters() {
    let allInputs = [];
  
    if (this.state && typeof this.state.inputs !== 'undefined') {
      let inputsSorted = Object.values(this.state.inputs).sort(utils.sortByWeight);
  
      for (let inputData of inputsSorted) {
        const fieldName = inputData.field;
  
        // Skip 'category' field entirely
        if (fieldName === 'category' || fieldName === 'in_kit') continue;
  
        if (!['topbar', 'hide'].includes(inputData.widget.position)) {
          let inputCopy = { ...inputData };
  
          // Change checkboxes to dropdowns
          if (inputCopy.widget.type === 'checkboxes') {
            inputCopy = {
              ...inputCopy,
              widget: {
                ...inputCopy.widget,
                type: 'select',
                is_not_multiple: false // allow multiple selections
              }
            };
          }
  
          allInputs.push(
            <FormInput key={inputCopy.field} inputData={inputCopy} />
          );
        }
      }
    }
  
    return allInputs.length ? (
      <div className="topbar-filters">
        {allInputs}
      </div>
    ) : <div className="topbar-filters"></div>;
    
  }
  
  
  
  render() {
    const structuredSearchProps = window.mw?.config.get('structuredSearchProps');
    const isInputHidden = structuredSearchProps?.input === "hidden";
    const isFilterHidden = structuredSearchProps?.filter === "hidden";
    const isLabelsHidden = structuredSearchProps?.labels === "hidden";
    // If input=hidden, do not render the TopBar at all
    if (isInputHidden) {
      return null; // Prevents rendering
    }
  
    let allInputs = [],
        //labelsKeyed = [],
        labels = [],
        toggleSidebar = <button type="button" className="hide-on-desktop" onClick={this.toggleSidebar.bind(this)}>{this.state['structuredsearch-toggle-sidebar']}<i className={'fas fa-chevron-' + this.state.chevronDir}></i></button>;
    if('undefined' !== typeof this.state.inputs){
      let inputsSorted = Object.values(this.state.inputs).sort(utils.sortByWeight);
      for(let inputData of inputsSorted){
      //for(let inputDataKey of Object.keys(this.state.inputs)){
        //console.log(this.state.inputs[inputDataKey],inputDataKey,'this.state.inputs[inputDataKey],inputDataKey');
        if('topbar' === inputData.widget.position){
          allInputs.push( <FormInput key={inputData.field} inputData={inputData} /> )
        }
      }
    }
    if(this.state.labels){

      for(let labelKey of Object.keys(this.state.labels)){
        for(let label of this.state.labels[labelKey]){
          let labelText = utils.stripHtml( label.label );
          labels.push( <span key={label.field + ':' + label.value} className="label-wrp">{  labelText }<button type="button" className='label-remove' aria-label={'Remove  ' + utils.stripHtml( label.label )} onClick={this.removeLabel.bind(this, label.field, label)}><i className="fal fa-times"></i></button></span> )
        }
      }

    }
    let appendedClass = '';
    if(this.state.sticky){
      appendedClass += ' sticky-on';
    }
    if(labels.length){
      appendedClass += ' with-labels';
    }
    if(this.state.searchSuggestionsOpen && this.state.searchSuggestionsNotEmpty){
      appendedClass += ' search-suggestions-open';
    }
    return allInputs.length ? 
      <div className={'TopBar sticky-top' + appendedClass}>
        <header className="App-header">
          <form onSubmit={this.submitClicked.bind(this)}>
            {allInputs}{toggleSidebar}
            {!isLabelsHidden && ( <div className={'lables-wrp'}>{labels}</div>  )}
          </form>
         {isFilterHidden && this.renderSimpleFilters()} 
          {!isFilterHidden && (
          <button type="button" onClick={this.clearClicked.bind( this )}  dangerouslySetInnerHTML={{__html:this.state['structuredsearch-clear']}} ></button>
        )}
        {this.state.enableDisplayToggle && (
  <div className="display-buttons" style={{ marginTop: '10px', display: 'inline-block' }}>
    <button
      type="button"
      id="grid-button"
      className="flex-grow"
      style={{ marginRight: '5px' }}
      onClick={() => EventEmitter.emit('toggleDisplayView', false)}
    >
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" clipRule="evenodd" d="M3 3V11H11V3H3ZM9 9H5V5H9V9ZM3 13V21H11V13H3ZM9 19H5V15H9V19ZM13 3V11H21V3H13ZM19 9H15V5H19V9ZM13 13V21H21V13H13ZM19 19H15V15H19V19Z" fill="#5F6368"></path>
      </svg>
    </button>
    <button
      type="button"
      id="card-button"
      style={{ marginRight: '5px' }}
      className="isDisplay flex-grow"
      onClick={() => EventEmitter.emit('toggleDisplayView', true)}
    >
        <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" clipRule="evenodd" d="M0.5 2C0.5 2.82843 1.17157 3.5 2 3.5C2.82843 3.5 3.5 2.82843 3.5 2C3.5 1.17157 2.82843 0.5 2 0.5C1.17157 0.5 0.5 1.17157 0.5 2ZM7 1C6.44772 1 6 1.44772 6 2C6 2.55228 6.44771 3 7 3H16C16.5523 3 17 2.55228 17 2C17 1.44772 16.5523 1 16 1H7ZM7 7C6.44772 7 6 7.44772 6 8C6 8.55228 6.44771 9 7 9H16C16.5523 9 17 8.55228 17 8C17 7.44772 16.5523 7 16 7H7ZM6 14C6 13.4477 6.44772 13 7 13H16C16.5523 13 17 13.4477 17 14C17 14.5523 16.5523 15 16 15H7C6.44771 15 6 14.5523 6 14ZM2 9.5C1.17157 9.5 0.5 8.82843 0.5 8C0.5 7.17157 1.17157 6.5 2 6.5C2.82843 6.5 3.5 7.17157 3.5 8C3.5 8.82843 2.82843 9.5 2 9.5ZM0.5 14C0.5 14.8284 1.17157 15.5 2 15.5C2.82843 15.5 3.5 14.8284 3.5 14C3.5 13.1716 2.82843 12.5 2 12.5C1.17157 12.5 0.5 13.1716 0.5 14Z" fill="black"></path>
      </svg>
      
    </button>
  </div>
)}
          </header>

    </div> : <div className='TopBar TopBar-loader'></div>;
  }
  
}

export default TopBar;
