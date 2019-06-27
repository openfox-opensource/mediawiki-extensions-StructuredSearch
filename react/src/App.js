import React, { Component } from "react";
import settingsGetter from './libs/settingsGetter';
import FormInput from './libs/FormInput';
import EventEmitter from './libs/EventEmitter';
import translate from './libs/translations'
import utils from './libs/utils'
import historySearch from './libs/historySearch'

import './App.css';

class App extends Component {
  constructor() {
    super();
    this.state = { data: [] };
    EventEmitter.on("toggleSidebar", allData => {
      this.toggle( );
    });
    EventEmitter.on("hideSidebar", allData => {
      this.hide( );
    });    
    EventEmitter.on("showSidebar", allData => {
      this.show( );
    });

  }
  toggle(){
      this.setState({hide:!this.state.hide});
  }   
  hide(){
      this.setState({hide:true});
  } 
  show(){
      this.setState({hide:false});
  } 
  componentDidMount() {
    
    EventEmitter.on("FormDataChanged", allData => {
      historySearch.setHistoryFromSearch( this.state.inputs );
      this.forceUpdate();
    });
      settingsGetter.get().then(data => {
        //console.log(data.templates, data);
        if( data ){
          historySearch.setSearchFromHistory( data.params );
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
      let inputsSorted = Object.values(this.state.inputs).sort( utils.sortByWeight );
      for(let inputData of inputsSorted){
       // console.log(this.state.inputs[inputDataKey],inputDataKey,'this.state.inputs[inputDataKey],inputDataKey');
        if( !['topbar','hide'].includes(inputData.widget.position) ){
          allInputs.push( <FormInput key={inputData.field} inputData={inputData} /> )
        }
      }
    }
   
    return (
          <div className={'side-bar' + (this.state.hide ? ' hide' : ' show')}>
            <span className="close-button-wrp">
              <button type="button" className="hide-on-desktop" onClick={this.hide.bind(this)}>X</button>
            </span>
            {allInputs}
          </div>
    );
  }
}

export default App;
