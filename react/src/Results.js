import React, { Component } from "react";
import EventEmitter from './libs/EventEmitter';
import translate from './libs/translations';
import ReactMustache from 'react-mustache'


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
    EventEmitter.on('dataRecieved', results => {
      console.log("results",results);
      if(results.error){
        this.setState({
          lastIsError:true,
          results:[],
          searchReturned:true
        })
      }
      else{
        this.setState({
          lastIsError:false,
          results:results,
          searchReturned:true
        })
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
  render(){
  	let results =[]
  	if(this.state.results){
      for(let resultKey of Object.keys(this.state.results)){
        let result = this.state.results[resultKey];
        results.push(this.getResultJsx( result ) )
      }
      if( this.state.searchReturned && !this.state.results.length){
        results.push( <div key={'error'}>{ this.state.lastIsError ? this.noResultsError : this.noResults}</div>)
        
      }
    }
  	return <div className='results'>
            	{results}
     		</div>;
  }
 }

 export default Results;