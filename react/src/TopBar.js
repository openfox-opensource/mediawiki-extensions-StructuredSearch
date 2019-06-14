import React, { Component } from "react";
import settingsGetter from './libs/settingsGetter'
import FormInput from './libs/FormInput'
import FormMain from './libs/FormMain'
import ajaxCall from './libs/ajaxCall'
import EventEmitter from './libs/EventEmitter'
import './App.css';


class TopBar extends Component {
  constructor() {
    super();
    this.state = { labels: [] };
    EventEmitter.on("FormDataChanged", allData => {
      let newLabels = [];
      //console.log(this.state.inputs)
      for(let fieldKey of Object.keys(allData)){
        ;
        if(allData[fieldKey] && this.state.inputs && this.state.inputs[fieldKey] && 
          ( 
            ('autocomplete' === this.state.inputs[fieldKey].widget.type && 'search' != this.state.inputs[fieldKey].field )
           || this.state.inputs[fieldKey].withLabels) 
          ){
          //console.log(allData[fieldKey]);
          for(let item of allData[fieldKey]){
            newLabels.push({
              label : item.label,
              value: item.value,
              field: fieldKey
            });
          }
        }
      }
      this.setState({labels:newLabels});
    });
  }
  componentDidMount() {
      settingsGetter.get().then(data => {
        if( data ){
          this.setState({ 
            inputs: data.params,
            labels : []
          } 
            )
        }
       }
      );
  }
  removeLabel( fieldName, valueObj) {
    FormMain.removeValue(fieldName, valueObj);
  }
  
  submitClicked( event ){
    event.preventDefault();
    FormMain.submitData();
  }
  render() {
    let allInputs = [],
        labels = [];
    if(this.state.inputs){
      for(let inputDataKey of Object.keys(this.state.inputs)){
        //console.log(this.state.inputs[inputDataKey],inputDataKey,'this.state.inputs[inputDataKey],inputDataKey');
        if('topbar' === this.state.inputs[inputDataKey].widget.position){
          allInputs.push( <FormInput key={inputDataKey} inputData={this.state.inputs[inputDataKey]} /> )
        }
      }
    }
    if(this.state.labels){
      for(let label of this.state.labels){
        //console.log(this.state.inputs[inputDataKey],inputDataKey,'this.state.inputs[inputDataKey],inputDataKey');
        labels.push( <span key={label.field + ':' + label.value} className="label-wrp">{label.label}<button type="button" className='label-remove' onClick={this.removeLabel.bind(this, label.field, label)}>X</button></span> )
        
      }
    }
    return (
      <div className="TopBar">
        <header className="App-header">
          <form onSubmit={this.submitClicked.bind(this)}>
            {allInputs}
            {labels}
          </form>
        </header>
        
    </div>
    );
  }
}

export default TopBar;
