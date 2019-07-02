import React, { Component } from "react";
import EventEmitter from './libs/EventEmitter';
import translate from './libs/translations';
import ReactMustache from 'react-mustache'
import settingsGetter from './libs/settingsGetter';
import FormMain from './libs/FormMain';



class Results extends Component {
  constructor() {
    super();
    this.state = {};
    translate('fennecadvancedsearch-no-results').then( translatedStr =>{
        this.noResults = translatedStr;
    });
    translate('fennecadvancedsearch-on-results-error').then( translatedStr =>{
        this.noResultsError = translatedStr;
    });    
    translate('fennecadvancedsearch-next').then( translatedStr =>{
        this.nextText = translatedStr;
    });
    translate('fennecadvancedsearch-on-search-text').then( translatedStr =>{
        this.onSearchText = translatedStr;
    });
    EventEmitter.on('searchStarted', data => {
      this.setState({
        searchStarted:true,
        onTop:data.reset,
      });
    });
    EventEmitter.on('dataRecieved', data => {
      let results = data.results;
      //console.log("results",results,data);
      if(results && results.error){
        this.setState({
          lastIsError:true,
          results:[],
          searchReturned:true,
          searchStarted:false,
          onTop:false
        })
      }
      else{
        let newResults;
        if(!data.reset){
          newResults = this.state.results || {};
          newResults = Object.assign(newResults, results);
        }
        else{
          newResults = results;
        }
        this.setState({
          offset: data.continue ? data.continue.sroffset : null,
          lastIsError:false,
          results:newResults,
          searchReturned:true,
          searchStarted:false,
          onTop:false
        })
      }

    });
    settingsGetter.get().then(data => {
        //console.log(data.templates, data);
        if( data ){
          this.templates = data.templates;
        }
    });
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
  next(){
    FormMain.setNext( this.state.offset );
  }
  render(){
  	let results =[], errorHtml,nextButton, 
        searchTop ='', searchBottom = '';
    if(this.state.searchStarted){
      if(this.state.onTop){
        searchTop = <div className="loading loading-top"  dangerouslySetInnerHTML={{__html:this.onSearchText}}></div>
      }
      else{
        searchBottom = <div className="loading loading-bottom" dangerouslySetInnerHTML={{__html:this.onSearchText}}></div>
      }
    }
    if(this.state.results){
      for(let resultKey of Object.keys(this.state.results)){
        let result = this.state.results[resultKey];
        results.push(this.getResultJsx( result ) )
      }
      if( this.state.searchReturned && !Object.keys(this.state.results).length){
        if( this.state.lastIsError ){
          errorHtml = <div className="no-results no-results-error" key={'error'}  dangerouslySetInnerHTML={{__html:this.noResultsError}}></div>
        }
        else{
          errorHtml = <div className="no-results no-results-empty" key={'error'} dangerouslySetInnerHTML={{__html:this.noResults}}></div>;
        }
        
      }
      if(this.state.offset){
        nextButton = <button type="button" onClick={this.next.bind(this)} dangerouslySetInnerHTML={{__html:this.nextText}}></button>
      }
    }
    return <div className='results'>
            	{searchTop}
              {results}
              {errorHtml}
              {nextButton}
              {searchBottom}
     		</div>;
  }
 }

 export default Results;