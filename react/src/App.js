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
       
            historySearch.setSearchFromHistory(this.state.inputs);
        
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
    if (window.mw && window.mw.config.get("structuredSearchProps")) {
      const structuredSearchProps = window.mw.config.get("structuredSearchProps");
      console.log("structuredSearchProps:", structuredSearchProps);

      // Helper function to apply filters
      const applyFilter = (fieldName, filterValue) => {
        const value = { value: filterValue, label: filterValue };
        if (FormMain && typeof FormMain.addValue === "function") {
          console.log(`Applying filter - Field: ${fieldName}, Value:`, value);
          FormMain.addValue(fieldName, value);
        } else {
          console.warn(`FormMain or FormMain.addValue is not defined for field: ${fieldName}`);
        }
      };
      if (structuredSearchProps.namespaces) {
        console.log("namespaces filter found:", structuredSearchProps.namespaces);
        applyFilter("namespaces", structuredSearchProps.namespaces);
      }
      // Apply category filter
    
      if (structuredSearchProps.category) {
        console.log("Category filter found:", structuredSearchProps.category);
        applyFilter("category", structuredSearchProps.category);
      }
      // Apply pageType filter
      if (structuredSearchProps.pageType) {
        console.log("Page type filter found:", structuredSearchProps.pageType);
        applyFilter("in_kit", structuredSearchProps.pageType);
      }
    
    
      if (structuredSearchProps.title) {
        console.log("title found:", structuredSearchProps.title);
        const titleElement = document.getElementById("parser-search-title");
        if (titleElement) {
          titleElement.textContent = structuredSearchProps.title;
        }
      }
     // Apply limit
      // if (structuredSearchProps.limit) {
      //   let limit = structuredSearchProps.limit;
      //   console.log("Setting limit:", limit);

      //   if (typeof limit === "string") {
      //     limit = parseInt(limit, 10); // Ensure limit is a number
      //   }

      //   if (FormMain && typeof FormMain.addValue === "function") {
      //     FormMain.addValue("limit", limit);
      //   } else {
      //     console.warn(" FormMain or FormMain.addValue is not defined to set the limit.");
      //   }
      // }
    } else {
      console.warn("No structuredSearchProps found in mw.config.");
    }
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
    const structuredSearchProps = window.mw?.config.get('structuredSearchProps');
    const isFilterHidden = structuredSearchProps?.filter === "hidden";
  
    // If filter=hidden, do not render the sidebar at all
    if (isFilterHidden) {
      return null; // This prevents rendering anything
    }
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
