import React, { Component } from "react";
import settingsGetter from './libs/settingsGetter';
import FormInput from './libs/FormInput';
import FormMain from './libs/FormMain';
import EventEmitter from './libs/EventEmitter';
//import translate from './libs/translations'
import utils from './libs/utils'
import historySearch from './libs/historySearch'

import './App.css';

class App extends Component {
  constructor() {
    super();
    this.state = { data: [],hide:true };
    EventEmitter.on("toggleSidebar", allData => {
      this.toggle( );
    });

    let hideSidebar = ()=>{
      this.hide( );
      if( utils.isMobile() ){

        FormMain.submitData();
      }
    }
    document.addEventListener('hideSidebar', hideSidebar);
    document.addEventListener('showSidebar', ()=>{
      this.show()
    });

    EventEmitter.on("hideSidebar", hideSidebar);    
    EventEmitter.on("showSidebar",()=>{
      this.show()
    });    
    EventEmitter.on("dataRecieved", allData => {
      this.hide( );
    });
    window.onpopstate = () => {
      if(this.state.inputs){
        FormMain.reset();
        FormMain.setDefaults( this.state.inputs );
        historySearch.setSearchFromHistory( this.state.inputs );
      }
    };
    

  }
  toggle(){
    //give other components know hiding/showing
    if(this.state.hide){
      EventEmitter.emit("showSidebar");
    }
    else{
      EventEmitter.emit("hideSidebar");
    }
  }   
  hide(){
      this.setState({hide:true});
      document.body.classList.add('sidebar-hidden');
      document.body.classList.remove('sidebar-visible');
      
  } 
  show(){
    console.log("show");
      this.setState({hide:false});
      document.body.classList.remove('sidebar-hidden')
      document.body.classList.add('sidebar-visible');

  } 
  componentDidMount() {
    
    this.hide();
    EventEmitter.on("FormDataChanged", allData => {
      if(this.state && 'undefined' != typeof this.state.inputs ){
        historySearch.setHistoryFromSearch( this.state.inputs );
        this.forceUpdate();
      }
    });
    settingsGetter.get().then(data => {
      //console.log(data.templates, data,"data.templates, data");
      if( data ){
        FormMain.setBinds( data.binds );
        FormMain.setInputsParams( data.params );
        
        this.setState({ 
          inputs: data.params
        }, ()=>{       
          FormMain.setDefaults( data.params );
          historySearch.setSearchFromHistory( data.params );
        });
        
      }
     }
    );
      
  }


  render() {
    let allInputs = [];
    if(this.state && 'undefined' != typeof this.state.inputs ){
      let inputsSorted = Object.values(this.state.inputs).sort( utils.sortByWeight );
      for(let inputData of inputsSorted){
        if( !['topbar','hide'].includes(inputData.widget.position) ){
          allInputs.push( <FormInput key={inputData.field} inputData={inputData} /> )
        }
      }
    }
    //console.log("allInputs", allInputs);
    return allInputs.length ?
          <div className={'side-bar' + (this.state.hide ? ' hide' : ' show')}>
            <span className="close-button-wrp">
              <button type="button" className="hide-on-desktop" onClick={this.hide.bind(this)}><i className="fal fa-times"></i></button>
            </span>
            {allInputs}
          </div> : <div className="side-bar side-bar-loader"></div>;
  }
}

export default App;
