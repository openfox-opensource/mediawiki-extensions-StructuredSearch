import React, { Component } from "react";
import settingsGetter from './libs/settingsGetter';
import FormInput from './libs/FormInput';
import EventEmitter from './libs/EventEmitter';
import ReactMustache from 'react-mustache'
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
          this.templates = data.templates;
        }
       }
      );
      
  }
  getTempalteByResult( result ){
    let ns = result.namespaceId;
    return this.templates['template_' + ns] || this.templates['default'];
  }
  getResultJsx( result ){
    let template = this.getTempalteByResult( result ); 
    //console.log(template,'template',result);
    return <ReactMustache template={template} data={result} />;
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
