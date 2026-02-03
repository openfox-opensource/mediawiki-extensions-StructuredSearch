import React, { Component } from "react";
import settingsGetter from './libs/settingsGetter';
import FormInput from './libs/FormInput';
import FormMain from './libs/FormMain';
import EventEmitter from './libs/EventEmitter';
import utils from './libs/utils';
import translate from './libs/translations';
import fieldsDetector from './libs/fieldsDetector';
import './App.css';


class TopBar extends Component {
  constructor() {
   
      super();
      const structuredSearchProps = window.mw?.config.get('structuredSearchProps') || {};
      
      this.state = {
        labels: [],
        chevronDir: 'down',
        useTableView: false, // <-- Track the selected view
        enableDisplayToggle: Object.keys(structuredSearchProps).length > 0
      };
    
    
    EventEmitter.on("FormDataChanged", allData => {
      this.refreshAllInputsByData( allData );
    });

    EventEmitter.on("autocompleteMenuOpen", isOpen => {
      this.setState({
        searchSuggestionsOpen : isOpen
      });
    });
    EventEmitter.on("autocompleteMenuResults", results => {
      this.setState({
        searchSuggestionsNotEmpty : !!results.length
      });
    });
  }
  
  componentDidMount() {
    this.retryInterval = setInterval(() => {
      this.checkStructuredSearchProps();
    }, 500);
  
    setTimeout(() => {
      if (this.retryInterval) {
        clearInterval(this.retryInterval);
      }
    }, 4000);
    EventEmitter.on("toggleDisplayView", (useTableView) => {
      this.setState({ useTableView });
    });
    
    for(let key of [
      'structuredsearch-clear',
      'structuredsearch-toggle-sidebar'
      ]){
      translate(key).then( val => {
        let stateToChange = {};
        stateToChange[key] = val;
        this.setState(stateToChange);

      });
    }

      settingsGetter.get().then(data => {
        if( data ){
          // Get structuredSearchProps and merge dynamic-fields into params
          const structuredSearchProps = window.mw?.config.get('structuredSearchProps') || {};
          
          // Merge dynamic-fields from structuredSearchProps into data.params
          // This ensures page-specific config takes precedence over defaults
          const mergedParams = this.mergeDynamicFieldsIntoParams(data.params, structuredSearchProps);
          
          this.setState({
            inputs: mergedParams,
            labels : []
          }, () => {
            // Call refreshAllInputsByData in setState callback to ensure inputs state is updated
            // Use setTimeout to ensure FormMain data is set from URL parameters and defaults
            // Use a longer delay to ensure setDefaults and setSearchFromHistory have completed
            setTimeout(() => {
              this.refreshAllInputsByData( FormMain.getAllValuesRaw() );
            }, 100);
          });
        }
       }
      );
      this.setStickyCheck();
      this.setFiltersScrollHide();
      EventEmitter.on("hideSidebar", allData => {
        this.setState( {chevronDir : 'down'});
      });    
      EventEmitter.on("showSidebar", allData => {
        this.setState( {chevronDir : 'up'});
      });
  }
  componentWillUnmount(){
    clearInterval(this.retryInterval);
    EventEmitter.off("toggleDisplayView");
    // Clean up scroll listener
    if (this.filtersScrollHandler) {
      window.removeEventListener('scroll', this.filtersScrollHandler);
    }
    // Clean up resize listener
    if (this.filtersResizeHandler) {
      window.removeEventListener('resize', this.filtersResizeHandler);
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
  
  checkStructuredSearchProps = () => {
    const structuredSearchProps = window.mw?.config.get("structuredSearchProps");
  
    if (structuredSearchProps && Object.keys(structuredSearchProps).length > 0) {
      this.setState({
        enableDisplayToggle: Object.keys(structuredSearchProps).length > 0
      });
  
      if (this.retryInterval) {
        clearInterval(this.retryInterval);
      }
    }
  };
  
  setStickyCheck( ) {
    // Don't enable sticky on mobile parser-search view
    if (utils.isMobile() && typeof document !== 'undefined') {
      const topBarContainer = document.getElementById('top-bar');
      if (topBarContainer && topBarContainer.closest('.parser-search')) {
        return; // Skip sticky observer for mobile parser-search
      }
    }
    
    const observer = new IntersectionObserver((records, observer) => {
      for (const record of records) {
        const targetInfo = record.boundingClientRect;
        if(targetInfo.top > 0){
          this.setState({sticky:false});
        }
        else if(targetInfo.top < 0){
          this.setState({sticky:true})
        }
      }
    }, {threshold: [0,1]});
    const checkingElement = document.querySelector('.checking-sticky');
    if (checkingElement) {
      observer.observe(checkingElement);
    }
  }

  setFiltersScrollHide() {
    // Only apply to parser-search-container, not special page
    const parserSearchContainer = document.querySelector('.parser-search-container');
    if (!parserSearchContainer) {
      return; // Not a parser-search page, skip
    }

    const topBar = document.getElementById('top-bar');
    const checkingSticky = document.querySelector('.checking-sticky');
    
    if (!topBar || !checkingSticky) {
      return; // Elements not found, skip
    }

    // Retry mechanism to wait for .topbar-other-fields to be rendered
    let retryCount = 0;
    const maxRetries = 20; // Try for up to 4 seconds (20 * 200ms)
    const retryInterval = 200; // Check every 200ms

    const trySetupScrollHandler = () => {
      const topbarOtherFields = document.querySelector('.topbar-other-fields');
      
      if (!topbarOtherFields) {
        retryCount++;
        if (retryCount < maxRetries) {
          setTimeout(trySetupScrollHandler, retryInterval);
          return;
        } else {
          return;
        }
      }
      
      // Now set up the scroll handler with the found element
      const setupScrollHandler = () => {
    let ticking = false;
    let stickyStartScrollY = null; // Track scroll position when sticky starts
    let stickyTopOffset = null; // Cache the sticky top offset value
    let originalElementHeight = null; // Cache the original element height before any transforms

    // Function to measure and cache the original element height
    const measureOriginalHeight = () => {
      // Temporarily remove any styles to get accurate measurement
      const tempHeight = topbarOtherFields.style.height;
      const tempMaxHeight = topbarOtherFields.style.maxHeight;
      
      topbarOtherFields.style.height = '';
      topbarOtherFields.style.maxHeight = '';
      
      // Measure the natural height
      originalElementHeight = topbarOtherFields.offsetHeight;
      
      // Restore styles
      topbarOtherFields.style.height = tempHeight;
      topbarOtherFields.style.maxHeight = tempMaxHeight;
    };

    // Measure original height on setup
    measureOriginalHeight();

    // Listen to window resize to recalculate original height
    this.filtersResizeHandler = () => {
      // Only recalculate if we're not currently hiding (not sticky)
      if (stickyStartScrollY === null) {
        measureOriginalHeight();
      }
    };
    window.addEventListener('resize', this.filtersResizeHandler, { passive: true });

    // Get the sticky top offset from computed styles
    const getStickyTopOffset = () => {
      if (stickyTopOffset === null) {
        const computedStyle = window.getComputedStyle(topBar);
        const position = computedStyle.position;
        if (position === 'sticky' || position === 'fixed') {
          // Get the 'top' value - this will be the computed pixel value
          // even if originally set as a CSS variable
          const topValue = computedStyle.top;
          stickyTopOffset = parseFloat(topValue) || 0;
        } else {
          // If not sticky, check if it has a sticky-top class that might apply later
          // For now, try to get the top value anyway
          const topValue = computedStyle.top;
          stickyTopOffset = parseFloat(topValue) || 0;
        }
      }
      return stickyTopOffset;
    };

    this.filtersScrollHandler = () => {
      if (ticking) {
        return;
      }

      ticking = true;
      requestAnimationFrame(() => {
        // Get the sticky top offset (e.g., var(--sidebar-height) value)
        const stickyOffset = getStickyTopOffset();
        
        // Check if #top-bar is sticky by comparing checking-sticky position with sticky offset
        // When sticky, checking-sticky will have scrolled past the sticky offset
        const checkingStickyRect = checkingSticky.getBoundingClientRect();
        
        // Element is sticky when checking-sticky has scrolled past the sticky offset
        const isSticky = checkingStickyRect.top <= stickyOffset;
        
        let hideProgress = 0;
        
        if (isSticky) {
          // Top-bar is sticky - start tracking scroll
          if (stickyStartScrollY === null) {
            // First time becoming sticky - record the scroll position
            // Re-measure height in case screen size changed
            measureOriginalHeight();
            stickyStartScrollY = window.scrollY;
          }
          
          // Use cached original height for calculations
          const elementHeight = originalElementHeight || topbarOtherFields.offsetHeight;
          
          // Calculate how much we've scrolled since becoming sticky
          const scrollSinceSticky = window.scrollY - stickyStartScrollY;
          
          // Calculate hide progress: 0 = fully visible, 1 = fully hidden
          // Hide completely when we've scrolled by the element's full height
          hideProgress = Math.min(1, scrollSinceSticky / elementHeight);
        } else {
          // Not sticky - reset tracking and show element
          stickyStartScrollY = null;
          hideProgress = 0;
          // Re-measure height when not sticky (screen might have resized)
          measureOriginalHeight();
        }
        
        // Use cached original height for calculations
        const elementHeight = originalElementHeight || topbarOtherFields.offsetHeight;
        
        // Set fixed height so form actually shrinks
        if (hideProgress > 0) {
          const remainingHeight = elementHeight * (1 - hideProgress);
          topbarOtherFields.style.height = `${remainingHeight}px`;
          topbarOtherFields.style.overflow = 'hidden';
        } else {
          // Reset to natural height when fully visible
          topbarOtherFields.style.height = '';
          topbarOtherFields.style.overflow = '';
        }
        
        ticking = false;
      });
    };

        window.addEventListener('scroll', this.filtersScrollHandler, { passive: true });
        // Initial call to set correct state on page load
        this.filtersScrollHandler();
      };
      
      // Call the setup function
      setupScrollHandler();
    };

    // Start the retry mechanism
    trySetupScrollHandler();
  }
  standardizeItem( item) {
    if( 'string' === typeof item ){
      item = [{
        label:item,
        value:item
      }];
    }
    return item;
  }
  removeLabel( fieldName, valueObj) {
    if('undefined' !== typeof this.state.inputs && 'range' === this.state.inputs[fieldName]?.widget.type){
      FormMain.clearField(fieldName);
    }
    else{
      FormMain.removeValue(fieldName, valueObj);
    }
    FormMain.fireChangeEvent();
  }

  submitClicked( event ){
    event.preventDefault();
    FormMain.submitData();
  }
  refreshAllInputsByData( allData ) {
      let newLabels = {}, alreadyIncluded = [],binds = [].concat( FormMain.binds );
      // Ensure inputs state is set before processing
      if (!this.state.inputs) {
        return;
      }
      for(let fieldKey of Object.keys(allData)){
        if( alreadyIncluded.includes(fieldKey)){
          continue;
        }
        if(allData[fieldKey] && this.state.inputs[fieldKey] && !this.state.inputs[fieldKey]?.withoutLabels ){
          newLabels[fieldKey] = [];
          allData[fieldKey] = this.standardizeItem( allData[fieldKey] );
          if( fieldsDetector.isRange( this.state.inputs[fieldKey] ) ){
            let data = allData[fieldKey];
            if(data && (data[0] || data[1]) ){
              newLabels[fieldKey] = [{
                label : data.join('-'),
                value: data.join('-'),
                field: fieldKey
              }];
            }
          }
          else{
            for(let item of allData[fieldKey]){
              newLabels[fieldKey].push({
                label : item.label,
                value: item.value,
                field: fieldKey
              });
            }
          }
          if(newLabels[fieldKey] && newLabels[fieldKey].length){
            for(let bind of binds){
              if(bind.includes(fieldKey)){
                for(let boundFieldKey of bind){
                  if(boundFieldKey !== fieldKey){
                    if( !allData[boundFieldKey] || !allData[boundFieldKey].length ){
                      delete(newLabels[fieldKey]);
                      break;
                    }
                    else{
                      newLabels[fieldKey][0].label += ' ' + allData[boundFieldKey][0].label;
                    }
                    alreadyIncluded.push( boundFieldKey );
                  }
                }
              }
            }
          }
        }
      }
      
      this.setState({labels:newLabels});
  }
  clearClicked() {
    let changed = false;
    if( 'undefined' != typeof this.state.inputs){    
      for(let paramKey in this.state.inputs){
        let paramDef = this.state.inputs[ paramKey ];
        if( fieldsDetector.isMultiple(paramDef) && !fieldsDetector.isSearchOrNs( paramDef ) ){
          changed = FormMain.clearField( paramKey ) || changed;
        }
      }
    }
    if(changed){
      FormMain.fireChangeEvent();
    }
  }
  toggleSidebar(){
    EventEmitter.emit('toggleSidebar');
  }
  renderSimpleFilters() {
    let allInputs = [];
  
    if (this.state && typeof this.state.inputs !== 'undefined') {
      let inputsSorted = Object.values(this.state.inputs).sort(utils.sortByWeight);
  
      for (let inputData of inputsSorted) {
        const fieldName = inputData.field;
  
        // Skip 'category' field entirely
        if (fieldName === 'category' || fieldName === 'in_kit' || fieldName === 'search') continue;
  
        // Exclude 'topbar' position - those are rendered inside the form
        // Only include fields that are NOT in sidebar, hide, empty, or topbar
        if (!['sidebar', 'hide', '', 'topbar'].includes(inputData.widget.position)) {
          let inputCopy = { ...inputData };

         

          allInputs.push(
            <FormInput key={inputCopy.field} inputData={inputCopy} />
          );
        }
      }
    }
  
    // New flag: if select=hidden, do not render the topbar-filters div
    const structuredSearchProps = window.mw?.config.get('structuredSearchProps');
    const isSelectHidden = structuredSearchProps?.select === "hidden";
    if (isSelectHidden) {
      return null;
    }
  
    return allInputs.length ? (
      <div className="topbar-filters">
        {allInputs}
      </div>
    ) : <div className="topbar-filters"></div>;
  }
  
  
  
  render() {
    const structuredSearchProps = window.mw?.config.get('structuredSearchProps');
    const isInputHidden = structuredSearchProps?.input === "hidden";
    const isFilterHidden = structuredSearchProps?.filter === "hidden";
    const isLabelsHidden = structuredSearchProps?.labels === "hidden";
    // If input=hidden, do not render the TopBar at all
    if (isInputHidden) {
      return null; // Prevents rendering
    }
  
    let searchInput = null,
        otherTopbarInputs = [],
        //labelsKeyed = [],
        allInputsRaw = [],
        labels = [],
        toggleSidebar = <button type="button" className="hide-on-desktop" onClick={this.toggleSidebar.bind(this)}>{this.state['structuredsearch-toggle-sidebar']}<i className={'fas fa-chevron-' + this.state.chevronDir}></i></button>;
    if('undefined' !== typeof this.state.inputs){
      let inputsSorted = Object.values(this.state.inputs).sort(utils.sortByWeight);
      
      for(let inputData of inputsSorted){
        if('topbar' === inputData.widget.position){
          allInputsRaw.push(inputData);
          
          // Separate search field from other topbar fields
          if (inputData.field === 'search') {
            searchInput = <FormInput key={inputData.field} inputData={inputData} />;
          } else {
            otherTopbarInputs.push( <FormInput key={inputData.field} inputData={inputData} /> );
          }
        }
      }
    }
    if(this.state.labels){

      for(let labelKey of Object.keys(this.state.labels)){
        for(let label of this.state.labels[labelKey]){
          let labelText = utils.stripHtml( label.label );
          labels.push( <span key={label.field + ':' + label.value} className="label-wrp">{  labelText }<button type="button" className='label-remove' aria-label={'Remove  ' + utils.stripHtml( label.label )} onClick={this.removeLabel.bind(this, label.field, label)}><i className="fal fa-times"></i></button></span> )
        }
      }

    }
    let appendedClass = '';
    if(this.state.sticky){
      appendedClass += ' sticky-on';
    }
    if(labels.length){
      appendedClass += ' with-labels';
    }
    if(this.state.searchSuggestionsOpen && this.state.searchSuggestionsNotEmpty){
      appendedClass += ' search-suggestions-open';
    }
    const hasTopbarInputs = searchInput || otherTopbarInputs.length > 0;
    return hasTopbarInputs ? 
      <div className={'TopBar sticky-top' + appendedClass}>
        <header className="App-header">
          <form onSubmit={this.submitClicked.bind(this)}>
            <div className="search-input-with-toggle">
              {searchInput}
              {this.state.enableDisplayToggle && (
                <>
                  {/* Combined toggle button for mobile parser-search */}
                  <div className="display-buttons display-buttons-combined inline-flex flex-row-reverse gap-2">
                    <button
                      type="button"
                      className={`flex align-items-center justify-center ${this.state.useTableView ? 'active' : ''}`}
                      onClick={() => EventEmitter.emit('toggleDisplayView', !this.state.useTableView)}
                      title={this.state.useTableView ? 'Grid View' : 'List View'}
                    >
                      {this.state.useTableView ? (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" clipRule="evenodd" d="M3 3V11H11V3H3ZM9 9H5V5H9V9ZM3 13V21H11V13H3ZM9 19H5V15H9V19ZM13 3V11H21V3H13ZM19 9H15V5H19V9ZM13 13V21H21V13H13ZM19 19H15V15H19V19Z" fill="#5F6368"></path>
                        </svg>
                      ) : (
                        <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" clipRule="evenodd" d="M0.5 2C0.5 2.82843 1.17157 3.5 2 3.5C2.82843 3.5 3.5 2.82843 3.5 2C3.5 1.17157 2.82843 0.5 2 0.5C1.17157 0.5 0.5 1.17157 0.5 2ZM7 1C6.44772 1 6 1.44772 6 2C6 2.55228 6.44771 3 7 3H16C16.5523 3 17 2.55228 17 2C17 1.44772 16.5523 1 16 1H7ZM7 7C6.44772 7 6 7.44772 6 8C6 8.55228 6.44771 9 7 9H16C16.5523 9 17 8.55228 17 8C17 7.44772 16.5523 7 16 7H7ZM6 14C6 13.4477 6.44772 13 7 13H16C16.5523 13 17 13.4477 17 14C17 14.5523 16.5523 15 16 15H7C6.44771 15 6 14.5523 6 14ZM2 9.5C1.17157 9.5 0.5 8.82843 0.5 8C0.5 7.17157 1.17157 6.5 2 6.5C2.82843 6.5 3.5 7.17157 3.5 8C3.5 8.82843 2.82843 9.5 2 9.5ZM0.5 14C0.5 14.8284 1.17157 15.5 2 15.5C2.82843 15.5 3.5 14.8284 3.5 14C3.5 13.1716 2.82843 12.5 2 12.5C1.17157 12.5 0.5 13.1716 0.5 14Z" fill="black"></path>
                        </svg>
                      )}
                    </button>
                  </div>
                  
                  {/* Original two-button layout for desktop */}
                  <div className="display-buttons display-buttons-separate inline-flex flex-row-reverse gap-2">
                    <button
                      type="button"
                      id="grid-button"
                      className="flex align-items-center justify-center"
                      onClick={() => EventEmitter.emit('toggleDisplayView', false)}
                    >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M3 3V11H11V3H3ZM9 9H5V5H9V9ZM3 13V21H11V13H3ZM9 19H5V15H9V19ZM13 3V11H21V3H13ZM19 9H15V5H19V9ZM13 13V21H21V13H13ZM19 19H15V15H19V19Z" fill="#5F6368"></path>
                      </svg>
                    </button>
                    <button
                      type="button"
                      id="card-button"
                      className="isDisplay flex align-items-center justify-center"
                      onClick={() => EventEmitter.emit('toggleDisplayView', true)}
                    >
                        <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M0.5 2C0.5 2.82843 1.17157 3.5 2 3.5C2.82843 3.5 3.5 2.82843 3.5 2C3.5 1.17157 2.82843 0.5 2 0.5C1.17157 0.5 0.5 1.17157 0.5 2ZM7 1C6.44772 1 6 1.44772 6 2C6 2.55228 6.44771 3 7 3H16C16.5523 3 17 2.55228 17 2C17 1.44772 16.5523 1 16 1H7ZM7 7C6.44772 7 6 7.44772 6 8C6 8.55228 6.44771 9 7 9H16C16.5523 9 17 8.55228 17 8C17 7.44772 16.5523 7 16 7H7ZM6 14C6 13.4477 6.44772 13 7 13H16C16.5523 13 17 13.4477 17 14C17 14.5523 16.5523 15 16 15H7C6.44771 15 6 14.5523 6 14ZM2 9.5C1.17157 9.5 0.5 8.82843 0.5 8C0.5 7.17157 1.17157 6.5 2 6.5C2.82843 6.5 3.5 7.17157 3.5 8C3.5 8.82843 2.82843 9.5 2 9.5ZM0.5 14C0.5 14.8284 1.17157 15.5 2 15.5C2.82843 15.5 3.5 14.8284 3.5 14C3.5 13.1716 2.82843 12.5 2 12.5C1.17157 12.5 0.5 13.1716 0.5 14Z" fill="black"></path>
                      </svg>
                      
                    </button>
                  </div>
                </>
              )}
            </div>
            {otherTopbarInputs.length > 0 && (
              <div className="topbar-other-fields">
                {otherTopbarInputs}
              </div>
            )}
            {toggleSidebar}
            {!isLabelsHidden && ( <div className={'lables-wrp'}>{labels}</div>  )}
          </form>
         {isFilterHidden && this.renderSimpleFilters()} 
          {!isFilterHidden && (
          <button type="button" onClick={this.clearClicked.bind( this )}  dangerouslySetInnerHTML={{__html:this.state['structuredsearch-clear']}} ></button>
        )}
          </header>

    </div> : <div className='TopBar TopBar-loader'></div>;
  }
  
}

export default TopBar;
