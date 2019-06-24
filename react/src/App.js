import React, { Component } from "react";
import settingsGetter from './libs/settingsGetter';
import FormInput from './libs/FormInput';
import EventEmitter from './libs/EventEmitter';
import translate from './libs/translations'
import sortByWeight from './libs/sortByWeight'

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
      let inputsSorted = Object.values(this.state.inputs).sort( sortByWeight );
      console.log("inputsSorted",inputsSorted);
      for(let inputData of inputsSorted){
       // console.log(this.state.inputs[inputDataKey],inputDataKey,'this.state.inputs[inputDataKey],inputDataKey');
        if( !['topbar','hide'].includes(inputData.widget.position) ){
          allInputs.push( <FormInput key={inputData.field} inputData={inputData} /> )
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
