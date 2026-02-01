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
    this.state = {
      data: [],
      hide: true,
      results: [],
      isLoading: false
    };
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
      this.setState({hide:false});
      document.body.classList.remove('sidebar-hidden')
      document.body.classList.add('sidebar-visible');

  } 
  componentDidMount() {   
    this.retryInterval = setInterval(() => {
      this.checkStructuredSearchProps();
  }, 500);
  // Stop checking after 60 seconds
  setTimeout(() => {
      if (this.retryInterval) {
          clearInterval(this.retryInterval);
      }
  }, 6000);
  

    if (window.mw && window.mw.config.get("structuredSearchProps")) {
      const structuredSearchProps = window.mw.config.get("structuredSearchProps");
      // Apply all structured search properties
      this.applyStructuredSearchProps(structuredSearchProps);
    }
    this.hide();
    EventEmitter.on("FormDataChanged", allData => {
      if(this.state && 'undefined' != typeof this.state.inputs ){
        historySearch.setHistoryFromSearch( this.state.inputs );
        this.forceUpdate();
      }
    });
      settingsGetter.get().then(data => {
        if( data ){
          const structuredSearchProps = window.mw?.config.get('structuredSearchProps') || {};
          
          // Merge dynamic-fields from structuredSearchProps into data.params
          // This ensures page-specific config takes precedence over defaults
          const mergedParams = this.mergeDynamicFieldsIntoParams(data.params, structuredSearchProps);
          
          FormMain.setBinds( data.binds );
          FormMain.setInputsParams( mergedParams );
        
        this.setState({ 
          inputs: mergedParams
        }, ()=>{       
          FormMain.setDefaults( mergedParams );
         
          historySearch.setSearchFromHistory( mergedParams );
        });
        
      }
     }
    );
      
    // Simulate loading results
    this.setState({ isLoading: true });
    setTimeout(() => {
      this.setState({ results: ['Result 1', 'Result 2', 'Result 3'], isLoading: false });
    }, 2000);
  }

  // Ensure `checkStructuredSearchProps` is defined as a class method
  checkStructuredSearchProps = () => {
    const structuredSearchProps = window.mw?.config.get("structuredSearchProps");

    if (structuredSearchProps && Object.keys(structuredSearchProps).length > 0) {
      this.setState({
        structuredSearchProps
      });

      // Apply all structured search properties
      this.applyStructuredSearchProps(structuredSearchProps);
    }
    if (this.retryInterval) {
      clearInterval(this.retryInterval);
    }
  }

  // Helper function to deep merge dynamic-fields from structuredSearchProps into params
  mergeDynamicFieldsIntoParams = (params, structuredSearchProps) => {
    if (!structuredSearchProps || !structuredSearchProps['dynamic-fields']) {
      return params;
    }

    const dynamicFields = structuredSearchProps['dynamic-fields'];
    const mergedParams = { ...params };

    // Merge each dynamic field into params
    for (const fieldName of Object.keys(dynamicFields)) {
      const dynamicFieldConfig = dynamicFields[fieldName];
      
      if (mergedParams[fieldName]) {
        // Field exists in params - merge the configs
        // Page-specific config from dynamic-fields takes precedence
        mergedParams[fieldName] = {
          ...mergedParams[fieldName],
          ...dynamicFieldConfig,
          // Deep merge widget properties
          widget: {
            ...mergedParams[fieldName].widget,
            ...(dynamicFieldConfig.widget || {})
          }
        };
      } else {
        // Field doesn't exist in params - add it
        mergedParams[fieldName] = dynamicFieldConfig;
      }
    }

    return mergedParams;
  }

  // Consolidated method to apply structured search properties
  applyStructuredSearchProps = (structuredSearchProps) => {
    // Helper function to apply filters
    const applyFilter = (fieldName, filterValue) => {
      const value = { value: filterValue, label: filterValue };
      if (FormMain && typeof FormMain.addValue === "function") {
        FormMain.addValue(fieldName, value);
      }
    };

    // Apply namespaces filter
    if (structuredSearchProps.namespaces) {
      applyFilter("namespaces", structuredSearchProps.namespaces);
    }

    // Apply category filter
    if (structuredSearchProps.category) {
      applyFilter("category", structuredSearchProps.category);
    }

    // Apply pageType filter
    if (structuredSearchProps.pageType) {
      applyFilter("in_kit", structuredSearchProps.pageType);
    }

    // Apply title
    if (structuredSearchProps.title) {
      const titleElement = document.getElementById("parser-search-title");
      if (titleElement) {
        titleElement.textContent = structuredSearchProps.title;
      }
    }

    // Apply limit - limit is used in submitData, not added to FormMain.allData
    // It's read directly from structuredSearchProps in FormMain.submitData()
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