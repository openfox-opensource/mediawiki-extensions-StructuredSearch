import React, { Component } from "react";
import settingsGetter from './libs/settingsGetter';
import FormInput from './libs/FormInput';
import FormMain from './libs/FormMain';
import ajaxCall from './libs/ajaxCall';
import EventEmitter from './libs/EventEmitter';
import utils from './libs/utils';
import translate from './libs/translations';
import './App.css';


class TopBar extends Component {
  constructor() {
    super();
    this.state = { labels: [] };
    EventEmitter.on("FormDataChanged", allData => {
      this.refreshAllInputsByData( allData );
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
    FormMain.removeValue(fieldName, valueObj);
  }
  
  submitClicked( event ){
    event.preventDefault();
    FormMain.submitData();
  }
  refreshAllInputsByData( allData ) {
      let newLabels = {};
      //console.log("FormDataChanged", allData,this.state.inputs)
      for(let fieldKey of Object.keys(allData)){
        ;
        if(allData[fieldKey] && this.state.inputs && this.state.inputs[fieldKey] && 
          ( 
            ('sidebar' === this.state.inputs[fieldKey].widget.position && 'search' != this.state.inputs[fieldKey].field )
           || this.state.inputs[fieldKey].withLabels) 
          ){
          //console.log(allData[fieldKey],"allData[fieldKey]");
          newLabels[fieldKey] = [];
          allData[fieldKey] = this.standardizeItem( allData[fieldKey] );
          for(let item of allData[fieldKey]){
            newLabels[fieldKey].push({
              label : item.label,
              value: item.value,
              field: fieldKey
            });
          }
        }
      }
      this.setState({labels:newLabels});
  }
  clearClicked() {
    FormMain.clear();
  }
  toggleSidebar(){
    EventEmitter.emit('toggleSidebar');
  }
  render() {
    let allInputs = [], 
        labelsKeyed = [], 
        labels = [],
        toggleSidebar = <button type="button" onClick={this.toggleSidebar.bind(this)}>{this.state['fennecadvancedsearch-toggle-sidebar']}<i className="fas fa-chevron-down"></i></button>;
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
      
    return (
      <div className="TopBar sticky-top">
        <header className="App-header">
          <form onSubmit={this.submitClicked.bind(this)}>
            {allInputs}{toggleSidebar}
            <div className={'lables-wrp'}>{labels}</div>
          </form>
          <button type="button" onClick={this.clearClicked.bind( this )}>{this.state['fennecadvancedsearch-clear']}</button>
        </header>
        
    </div>
    );
  }
}

export default TopBar;
