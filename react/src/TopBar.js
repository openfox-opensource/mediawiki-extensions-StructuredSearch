import React, { Component } from "react";
import settingsGetter from './libs/settingsGetter';
import FormInput from './libs/FormInput';
import FormMain from './libs/FormMain';
import ajaxCall from './libs/ajaxCall';
import EventEmitter from './libs/EventEmitter';
import utils from './libs/utils';
import translate from './libs/translations';
import fieldsDetector from './libs/fieldsDetector';
import './App.css';


class TopBar extends Component {
  constructor() {
    super();
    this.state = { labels: [], chevronDir:'down'};
    EventEmitter.on("FormDataChanged", allData => {
      this.refreshAllInputsByData( allData );
    });
    EventEmitter.on("autocompleteMenuOpen", isOpen => {
      this.setState({
        searchSuggestionsOpen : isOpen
      });
    });

  }
  componentDidMount() {
    for(let key of [
      'fennecadvancedsearch-clear',
      'fennecadvancedsearch-toggle-sidebar'
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
    if('range' === this.state.inputs[fieldName].widget.type){
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
      let newLabels = {}, alreadyIcluded = [],binds = [].concat( FormMain.binds );
      //console.log("FormDataChanged", allData,this.state.inputs)
      for(let fieldKey of Object.keys(allData)){
        if( alreadyIcluded.includes(fieldKey)){
          continue;
        }
        ;
        if(allData[fieldKey] && this.state.inputs && this.state.inputs[fieldKey] &&
          (
            ('sidebar' === this.state.inputs[fieldKey].widget.position && 'search' != this.state.inputs[fieldKey].field )
           || this.state.inputs[fieldKey].withLabels)
          ){
          //console.log(allData[fieldKey],"allData[fieldKey]");
          newLabels[fieldKey] = [];
          console.log(allData[fieldKey],"allData[fieldKey]");
          allData[fieldKey] = this.standardizeItem( allData[fieldKey] );
          if( 'range' === this.state.inputs[fieldKey].widget.type ){
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
                  if(boundFieldKey != fieldKey){
                    //console.log(boundFieldKey,allData[boundFieldKey], "boundFieldKey,allData[boundFieldKey]" );
                    if( !allData[boundFieldKey] || !allData[boundFieldKey].length ){
                      delete(newLabels[fieldKey]);
                      break;
                    }
                    else{
                      newLabels[fieldKey][0].label += ' ' + allData[boundFieldKey][0].label;
                    }
                    alreadyIcluded.push( boundFieldKey );
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
    for(let paramKey in this.state.inputs){
      let paramDef = this.state.inputs[ paramKey ];
      if( fieldsDetector.isMultiple(paramDef) && !fieldsDetector.isSearchOrNs( paramDef ) ){
        changed = FormMain.clearField( paramKey ) || changed;
      }
    }
    if(changed){
      FormMain.fireChangeEvent();
    }
  }
  toggleSidebar(){
    EventEmitter.emit('toggleSidebar');
  }
  render() {
    let allInputs = [],
        labelsKeyed = [],
        labels = [],
        toggleSidebar = <button type="button" className="hide-on-desktop" onClick={this.toggleSidebar.bind(this)}>{this.state['fennecadvancedsearch-toggle-sidebar']}<i className={'fas fa-chevron-' + this.state.chevronDir}></i></button>;
    if(this.state.inputs){
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
          labels.push( <span key={label.field + ':' + label.value} className="label-wrp">{label.label}<button type="button" className='label-remove' onClick={this.removeLabel.bind(this, label.field, label)}><i className="fal fa-times"></i></button></span> )
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
    if(this.state.searchSuggestionsOpen){
      appendedClass += ' search-suggestions-open';
    }
    return allInputs.length ? 
      <div className={'TopBar sticky-top' + appendedClass}>
        <header className="App-header">
          <form onSubmit={this.submitClicked.bind(this)}>
            {allInputs}{toggleSidebar}
            <div className={'lables-wrp'}>{labels}</div>
          </form>
          <button type="button" onClick={this.clearClicked.bind( this )}  dangerouslySetInnerHTML={{__html:this.state['fennecadvancedsearch-clear']}} ></button>
        </header>

    </div> : <div className='TopBar TopBar-loader'></div>;
  }
}

export default TopBar;
