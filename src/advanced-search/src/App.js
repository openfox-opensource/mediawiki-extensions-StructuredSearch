import React, { Component } from "react";
import logo from './logo.svg';
import settingsGetter from './libs/settingsGetter'
import formInputsDataBuilder from './libs/formInputsDataBuilder'
import FormInput from './libs/FormInput'
import FormMain from './libs/FormMain'
import './App.css';

class App extends Component {
  constructor() {
    super();
    this.state = { data: [],dataJsoned:"ss" };
  }
  componentDidMount() {
      settingsGetter.get().then(data => {
        if( data ){
          // console.log(data);
          // let formInputsData =  formInputsDataBuilder.proccess( data );
          // console.log(formInputsData)
          this.setState({ 
            inputs: data,
            //inputs : formInputsData,
            dataJsoned: window.JSON.stringify(data)
          } 
            )
        }
       }
      );
  }
  submitClicked(){
    console.log(FormMain.getAllValues());
  }
  render() {
    let allInputs = [];
    if(this.state.inputs){
      console.log('this.state.inputs',this.state.inputs);
      for(let inputDataKey of Object.keys(this.state.inputs)){
        console.log(this.state.inputs[inputDataKey],inputDataKey,'this.state.inputs[inputDataKey],inputDataKey');
        allInputs.push( <FormInput key={inputDataKey} inputData={this.state.inputs[inputDataKey]} /> )
      }
    }
    return (
      <div className="App">
        <header className="App-header">
          {allInputs}
          <button type='button' onClick={this.submitClicked.bind()} >חפש</button>
        </header>
    </div>
    );
  }
}

export default App;
