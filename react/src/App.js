import React, { Component } from "react";
import settingsGetter from './libs/settingsGetter';
import FormInput from './libs/FormInput';
import EventEmitter from './libs/EventEmitter';
import translate from './libs/translations'

import './App.css';

class App extends Component {
  constructor() {
    super();
    this.state = { data: [] };


  }
  componentDidMount() {
    EventEmitter.on("FormDataChanged", allData => {
      this.forceUpdate();
    });
      settingsGetter.get().then(data => {
        //console.log(data.templates, data);
        if( data ){

          this.setState({ 
            inputs: data.params
          });
        }
       }
      );
      
  }


  render() {
    let allInputs = [];
    if(this.state.inputs){
      //console.log('this.state.inputs',this.state.inputs);
      for(let inputDataKey of Object.keys(this.state.inputs)){
       // console.log(this.state.inputs[inputDataKey],inputDataKey,'this.state.inputs[inputDataKey],inputDataKey');
        if('topbar' !== this.state.inputs[inputDataKey].widget.position){
          allInputs.push( <FormInput key={inputDataKey} inputData={this.state.inputs[inputDataKey]} /> )
          }
        }
    }
   
    return (
          <div className='side-bar'>
            {allInputs}
          </div>
    );
  }
}

export default App;
