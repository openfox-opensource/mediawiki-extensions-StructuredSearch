import React, { Component } from "react";
import logo from './logo.svg';
import settingsGetter from './libs/settingsGetter';
import FormInput from './libs/FormInput';
import FormMain from './libs/FormMain';
import EventEmitter from './libs/EventEmitter';
import ReactMustache from 'react-mustache'
import './App.css';


class App extends Component {
  constructor() {
    super();
    this.state = { data: [],dataJsoned:"ss" };
    EventEmitter.on('dataRecieved', results => this.setState({results:results}));

  }
  componentDidMount() {
      settingsGetter.get().then(data => {
        console.log(data.templates, data);
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
    console.log(template,'template',result);
    return <ReactMustache template={template} data={result} />;
  }

  render() {
    let allInputs = [], results =[];
    if(this.state.inputs){
      //console.log('this.state.inputs',this.state.inputs);
      for(let inputDataKey of Object.keys(this.state.inputs)){
       // console.log(this.state.inputs[inputDataKey],inputDataKey,'this.state.inputs[inputDataKey],inputDataKey');
        if('topbar' != this.state.inputs[inputDataKey].widget.position){
          allInputs.push( <FormInput key={inputDataKey} inputData={this.state.inputs[inputDataKey]} /> )
          }
        }
    }
    if(this.state.results){
      for(let resultKey of Object.keys(this.state.results)){
        let result = this.state.results[resultKey];
        results.push(this.getResultJsx( result ) )
        //console.log("result",result);
      }
      //  console.log("results",results);
    }
    return (
      <div className="App">
          <div className='side-bar'>
            {allInputs}
          </div>
          <div className='results'>
            {results}
          </div>
    </div>
    );
  }
}

export default App;
