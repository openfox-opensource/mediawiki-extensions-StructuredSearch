import React, { Component } from "react";
import queryString from 'query-string';
import EventEmitter from './libs/EventEmitter';
import translate from './libs/translations';
import ReactMustache from 'react-mustache'
import settingsGetter from './libs/settingsGetter';
import FormMain from './libs/FormMain';
import Mustache from 'mustache';

// document.addEventListener('DOMContentLoaded', () => {
//     if (window.mw && window.mw.config.get('structuredSearchProps')) {
// 		console.log(window.mw.config.get('structuredSearchProps'));
//         const structuredSearchProps = window.mw.config.get('structuredSearchProps');
// 		console.log(structuredSearchProps);
//         // Helper function to apply filters
//         function applyFilter(fieldName, filterValue) {
//             const value = {
//                 value: filterValue,
//                 label: filterValue
//             };

//             if (FormMain && typeof FormMain.addValue === "function") {
//                 console.log(`Applying filter - Field: ${fieldName}, Value:`, value);
//                 FormMain.addValue(fieldName, value);
//             } else {
//                 console.log(`FormMain or FormMain.addValue is not defined for field: ${fieldName}`);
//             }
//         }

//         // Handle categories
//         if (structuredSearchProps.category) {
//             console.log('Category filter found:', structuredSearchProps.category);
//             applyFilter('category', structuredSearchProps.category);
//         } else {
//             console.log('No category filter value found in structuredSearchProps.');
//         }

//         // Handle pageType
//         if (structuredSearchProps.pageType) {
//             console.log('Page type filter found:', structuredSearchProps.pageType);
//            applyFilter('in_kit', structuredSearchProps.pageType);
//         } else {
//             console.log('No pageType filter value found in structuredSearchProps.');
//         }

//         // Handle limit
//         let limit =null; // Default limit
//         if (structuredSearchProps.limit) {
//             limit = structuredSearchProps.limit;
//             if (FormMain && typeof FormMain.addValue === "function" && structuredSearchProps.limit !== undefined) {
//               FormMain.addValue('limit', limit);
//             //applyFilter('limit', structuredSearchProps.limit);
          
//             } else {
//                 console.log('FormMain or FormMain.addValue is not defined to set the limit.');
//             }
//         } else {
//           if (FormMain && typeof FormMain.addValue === "function") {
//            // FormMain.addValue('limit', 100);
//         }
//         else {
//           console.log('FormMain or FormMain.addValue is not defined to set the limit.');
//       }
//       }
    
        
//     } else {
//         console.log('No structuredSearchProps found in mw.config.');
//     }

  
//   });
  
class Results extends Component {
  constructor() {
    let params = queryString.parse(window.location.search);
    super();
    const structuredSearchProps = window.mw?.config.get('structuredSearchProps') || {};
    this.state = {
      searchStarted: params.advanced_search ? true : false,
      searchReturned: false,
      hasInputHidden: structuredSearchProps.input === "hidden" || "",
      resultClass: structuredSearchProps.class || "", 
      displayTemplate: structuredSearchProps.display || "",
      
    };
    console.log(' display', structuredSearchProps.display );
    translate('structuredsearch-no-results').then(translatedStr => {
      this.noResults = translatedStr;
    });
    translate('structuredsearch-on-results-error').then(translatedStr => {
      this.noResultsError = translatedStr;
    });
    translate('structuredsearch-next').then(translatedStr => {
      this.nextText = translatedStr;
    });
    translate('structuredsearch-on-search-text').then(translatedStr => {
      this.onSearchText = translatedStr;
    });
    translate('structuredsearch-results-sum').then(translatedStr => {
      this.resultsSumText = translatedStr;
    });
    EventEmitter.on('searchStarted', data => {
      let paramsToChange = {
        searchStarted: true,
        onTop: data.reset,
        searchReturned: false
      };
      if (data.reset) {
        paramsToChange.results = [];
        paramsToChange.lastIsError = false;
        paramsToChange.total = 0;
        setTimeout(() => {
          this.scrollUp();
        }, 200);
      }
      this.setState(paramsToChange);

    });
    EventEmitter.on('dataRecieved', data => {
      let results = data.results;
      //console.log("results",results,data);
      if (results && results.error) {
        this.setState({
          lastIsError: true,
          results: [],
          searchReturned: true,
          searchStarted: false,
          onTop: false
        })
      }
      else {
        let newResults;
        if (!data.reset) {
          newResults = this.state.results || {};
          newResults = Object.assign(newResults, results);
        }
        else {
          newResults = results;
        }
        let newTotal = (data.searchinfo?.totalhits || 0);
        this.setState({
          offset: data.continue ? data.continue.sroffset : null,
          total: newTotal,
          lastIsError: false,
          results: newResults,
          searchReturned: true,
          searchStarted: false,
          onTop: false
        })
      }

    });
    settingsGetter.get().then(data => {
      
      if (data) {
        this.templates = data.templates;
      }
    });
  }
  resultClicked(title, event) {
    // console.log("resultClicked StructuredSearchResultclicked", title, event);
    FormMain.fireGlobalEvent({ title: title }, 'StructuredSearchResultclicked');
  }
//   getTemplateByResult(result) {
//     let ns = result.namespaceId;
// console.log("result", result);
// if( FormMain.display ){
//   console.log("display");
  
// console.log(FormMain.display);


//     // Retrieve the custom display template if provided
//     let customTemplate =  FormMain.display ; // Assume FormMain stores the display parameter
//     console.log("customTemplate",customTemplate);
    
  
//         console.log(`Using custom display template: ${customTemplate}`);
//         return this.templates[customTemplate] || this.templates['default'];
//     }

//     // Fallback to namespace-specific or default template
//     return this.templates['template_' + ns] || this.templates['default'];
// }
getTemplateByResult(result) {
  let ns = result.namespaceId;
  const displayTemplate = this.state.displayTemplate?.trim() || FormMain.getValue('display');

  if (displayTemplate && this.templates?.[displayTemplate]) {
    return this.templates[displayTemplate];
  }

  if (ns && this.templates?.['template_' + ns]) {
    return this.templates['template_' + ns];
  }

  return this.templates?.['default'] || null;
}



  split(words) {
    let wordArray = words.split(' ');
    return wordArray;
  }
  linkToTheSearchTerms(result){
    if(result.snippetReplaced){
      return;
    }
   
    //let wordSearch = document.querySelector('.field-wrp-name-search');
    // let wordInput = wordSearch.getElementsByTagName('input');
    // let arrayWordsInputValue = this.split(wordInput[0].value);
    let tempContainer = document.createElement('div');
    tempContainer.innerHTML = result.snippet;
    let allSpansInResultSnippet = tempContainer.querySelectorAll('.searchmatch');
    let title = result.full_title;
    //replace all the spans with links of title + '#:~:text=' + span.textContent
    for (let index = 0; index < allSpansInResultSnippet.length; index++) {
      let a = document.createElement('a');
      a.text = allSpansInResultSnippet[index].textContent;
      a.href = title + '#:~:text=' + allSpansInResultSnippet[index].textContent;
      allSpansInResultSnippet[index].replaceWith(a);
    }
    // for (let index = 0; index < allSpansInResultSnippet.length; index++) {
    //   let a = document.createElement('a');
    //   a.text = allSpansInResultSnippet[index].textContent;
    //   let wordNumSuffix = this.state.wordNum ? `,${this.state.wordNum}` : "";
    //   console.log(' word', this.state.wordNum );
      
    //   a.href = title + `#:~:text=${allSpansInResultSnippet[index].textContent}${wordNumSuffix}`;
    //   allSpansInResultSnippet[index].replaceWith(a);
    // }
    result.snippet= result.snippet = tempContainer.innerHTML; 
    result.snippetReplaced = true;
  }
  getResultJsx(result) {
    let template = this.getTemplateByResult(result);
    this.linkToTheSearchTerms(result);
console.log(result);

    if (window.mw && window.mw.config.get('structuredSearchProps')) {
        if (!template) {
            console.error("No template found for result:", result);
            return null; // Skip rendering if no template is found
        }

        let renderedHtml = Mustache.render(template, result);
      

        return (
            <div ref={(el) => {
                if (el) {
                    el.innerHTML = renderedHtml; // Inject raw HTML inside the div
                    let firstChild = el.firstElementChild;
                    if (firstChild) {
                        el.replaceWith(...el.childNodes); // Remove the wrapping div
                    }
                }
            }} />
        );
    }

    return <ReactMustache template={template} data={result} onClick={this.resultClicked.bind(result.full_title, this)} />;
}


  
  scrollUp() {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }
  next() {
    FormMain.setNext(this.state.offset);
  }
  render() {
    let results = [], errorHtml, nextButton,
      resultsSum = '', searchTop = '', searchBottom = '';
    if (this.state.searchStarted) {
      if (this.state.onTop) {
        searchTop = <div className="loading loading-top" dangerouslySetInnerHTML={{ __html: this.onSearchText }}></div>
      }
      else {
        searchBottom = <div className="loading loading-bottom" dangerouslySetInnerHTML={{ __html: this.onSearchText }}></div>
      }
    }
    if (this.state.results) {
      for (let resultKey of Object.keys(this.state.results)) {
        let result = this.state.results[resultKey];
        results.push(this.getResultJsx(result))
      }
      if (this.state.searchReturned && !Object.keys(this.state.results).length) {
        if (this.state.lastIsError) {
          errorHtml = <div className="no-results no-results-error" key={'error'} dangerouslySetInnerHTML={{ __html: this.noResultsError }}></div>
        }
        else {
          errorHtml = <div className="no-results no-results-empty" key={'error'} dangerouslySetInnerHTML={{ __html: this.noResults }}></div>;
        }

      }
      // console.log("this.state.offset && results.length",this.state.offset , results.length)÷÷
      if (this.state.offset && results.length) {
        const button = (
          <button type="button" onClick={this.next.bind(this)} dangerouslySetInnerHTML={{ __html: this.nextText }}></button>
        );
      
        nextButton = window.mw.config.get('structuredSearchProps') ? <div>{button}</div> : button;
      }
      
    }
    if (!this.state.hasInputHidden && results && this.resultsSumText && this.state.total) {

      let resultText = this.resultsSumText.replace('$1', this.state.total)
      resultsSum = <div className="results-sum-message" dangerouslySetInnerHTML={{ __html: resultText }}></div>;
    }
    return <div className={`results ${this.state.resultClass}`}>
      {searchTop}
      {resultsSum}
      {results}
      {errorHtml}
      {nextButton}
      {searchBottom}
    </div>;
  }
}

export default Results;
// import React, { Component } from "react";
// import queryString from 'query-string';
// import EventEmitter from './libs/EventEmitter';
// import translate from './libs/translations';
// import ReactMustache from 'react-mustache'
// import settingsGetter from './libs/settingsGetter';
// import FormMain from './libs/FormMain';
// import Mustache from 'mustache';

// document.addEventListener('DOMContentLoaded', () => {
//     if (window.mw && window.mw.config.get('structuredSearchProps')) {
// 		console.log(window.mw.config.get('structuredSearchProps'));
//         const structuredSearchProps = window.mw.config.get('structuredSearchProps');
// 		console.log(structuredSearchProps);
//         // Helper function to apply filters
//         function applyFilter(fieldName, filterValue) {
//             const value = {
//                 value: filterValue,
//                 label: filterValue
//             };

//             if (FormMain && typeof FormMain.addValue === "function") {
//                 console.log(`Applying filter - Field: ${fieldName}, Value:`, value);
//                 FormMain.addValue(fieldName, value);
//             } else {
//                 console.log(`FormMain or FormMain.addValue is not defined for field: ${fieldName}`);
//             }
//         }

//         // Handle categories
//         if (structuredSearchProps.category) {
//             console.log('Category filter found:', structuredSearchProps.category);
//             applyFilter('category', structuredSearchProps.category);
//         } else {
//             console.log('No category filter value found in structuredSearchProps.');
//         }

//         // Handle pageType
//         if (structuredSearchProps.pageType) {
//             console.log('Page type filter found:', structuredSearchProps.pageType);
//            applyFilter('in_kit', structuredSearchProps.pageType);
//         } else {
//             console.log('No pageType filter value found in structuredSearchProps.');
//         }
//       let  displayTemplate=""
//         if (structuredSearchProps.display) {
//           console.log('display', structuredSearchProps.display);
//         // applyFilter('display', structuredSearchProps.display);
//         displayTemplate=structuredSearchProps.display
//       } else {
//           console.log('No pageType filter value found in structuredSearchProps.');
//       }
//         // Handle limit
//         let limit =null; // Default limit
//         if (structuredSearchProps.limit) {
//             limit = structuredSearchProps.limit;
//             if (FormMain && typeof FormMain.addValue === "function" && structuredSearchProps.limit !== undefined) {
//               FormMain.addValue('limit', limit);
//             //applyFilter('limit', structuredSearchProps.limit);
          
//             } else {
//                 console.log('FormMain or FormMain.addValue is not defined to set the limit.');
//             }
//         } else {
//           if (FormMain && typeof FormMain.addValue === "function") {
//            // FormMain.addValue('limit', 100);
//         }
//         else {
//           console.log('FormMain or FormMain.addValue is not defined to set the limit.');
//       }
//       }
    
        
//     } else {
//         console.log('No structuredSearchProps found in mw.config.');
//     }

  
//   });
  
// class Results extends Component {
//   constructor() {
//     let params = queryString.parse(window.location.search);
//     super();
//     const structuredSearchProps = window.mw?.config.get('structuredSearchProps') || {};
//     this.state = {
//       searchStarted: params.advanced_search ? true : false,
//       searchReturned: false,
      
//     };
//     console.log(' display', structuredSearchProps.display );
//     translate('structuredsearch-no-results').then(translatedStr => {
//       this.noResults = translatedStr;
//     });
//     translate('structuredsearch-on-results-error').then(translatedStr => {
//       this.noResultsError = translatedStr;
//     });
//     translate('structuredsearch-next').then(translatedStr => {
//       this.nextText = translatedStr;
//     });
//     translate('structuredsearch-on-search-text').then(translatedStr => {
//       this.onSearchText = translatedStr;
//     });
//     translate('structuredsearch-results-sum').then(translatedStr => {
//       this.resultsSumText = translatedStr;
//     });
//     EventEmitter.on('searchStarted', data => {
//       let paramsToChange = {
//         searchStarted: true,
//         onTop: data.reset,
//         searchReturned: false
//       };
//       if (data.reset) {
//         paramsToChange.results = [];
//         paramsToChange.lastIsError = false;
//         paramsToChange.total = 0;
//         setTimeout(() => {
//           this.scrollUp();
//         }, 200);
//       }
//       this.setState(paramsToChange);

//     });
//     EventEmitter.on('dataRecieved', data => {
//       let results = data.results;
//       //console.log("results",results,data);
//       if (results && results.error) {
//         this.setState({
//           lastIsError: true,
//           results: [],
//           searchReturned: true,
//           searchStarted: false,
//           onTop: false
//         })
//       }
//       else {
//         let newResults;
//         if (!data.reset) {
//           newResults = this.state.results || {};
//           newResults = Object.assign(newResults, results);
//         }
//         else {
//           newResults = results;
//         }
//         let newTotal = (data.searchinfo?.totalhits || 0);
//         this.setState({
//           offset: data.continue ? data.continue.sroffset : null,
//           total: newTotal,
//           lastIsError: false,
//           results: newResults,
//           searchReturned: true,
//           searchStarted: false,
//           onTop: false
//         })
//       }

//     });
//     settingsGetter.get().then(data => {
      
//       if (data) {
//         this.templates = data.templates;
//       }
//     });
//   }
//   resultClicked(title, event) {
//     // console.log("resultClicked StructuredSearchResultclicked", title, event);
//     FormMain.fireGlobalEvent({ title: title }, 'StructuredSearchResultclicked');
//   }
// //   getTemplateByResult(result) {
// //     let ns = result.namespaceId;
// // console.log("result", result);
// // if( FormMain.display ){
// //   console.log("display");
  
// // console.log(FormMain.display);


// //     // Retrieve the custom display template if provided
// //     let customTemplate =  FormMain.display ; // Assume FormMain stores the display parameter
// //     console.log("customTemplate",customTemplate);
    
  
// //         console.log(`Using custom display template: ${customTemplate}`);
// //         return this.templates[customTemplate] || this.templates['default'];
// //     }

// //     // Fallback to namespace-specific or default template
// //     return this.templates['template_' + ns] || this.templates['default'];
// // }
// // getTemplateByResult(result) {
// //   let ns = result.namespaceId;
// //   const displayTemplate = this.state.displayTemplate?.trim() || FormMain.getValue('display');

// //   if (displayTemplate && this.templates?.[displayTemplate]) {
// //     return this.templates[displayTemplate];
// //   }

// //   if (ns && this.templates?.['template_' + ns]) {
// //     return this.templates['template_' + ns];
// //   }

// //   return this.templates?.['default'] || null;
// // }

// getTemplateByResult(result) {
//   const displayTemplate = structuredSearchProps.display?.trim();
//   if (displayTemplate && this.templates?.[displayTemplate]) {
//       return this.templates[displayTemplate];
//   }
//   return this.templates?.['template_' + result.namespaceId] || this.templates?.['default'] || null;
// }


//   split(words) {
//     let wordArray = words.split(' ');
//     return wordArray;
//   }
//   linkToTheSearchTerms(result){
//     if(result.snippetReplaced){
//       return;
//     }
   
//     //let wordSearch = document.querySelector('.field-wrp-name-search');
//     // let wordInput = wordSearch.getElementsByTagName('input');
//     // let arrayWordsInputValue = this.split(wordInput[0].value);
//     let tempContainer = document.createElement('div');
//     tempContainer.innerHTML = result.snippet;
//     let allSpansInResultSnippet = tempContainer.querySelectorAll('.searchmatch');
//     let title = result.full_title;
//     //replace all the spans with links of title + '#:~:text=' + span.textContent
//     for (let index = 0; index < allSpansInResultSnippet.length; index++) {
//       let a = document.createElement('a');
//       a.text = allSpansInResultSnippet[index].textContent;
//       a.href = title + '#:~:text=' + allSpansInResultSnippet[index].textContent;
//       allSpansInResultSnippet[index].replaceWith(a);
//     }
//     // for (let index = 0; index < allSpansInResultSnippet.length; index++) {
//     //   let a = document.createElement('a');
//     //   a.text = allSpansInResultSnippet[index].textContent;
//     //   let wordNumSuffix = this.state.wordNum ? `,${this.state.wordNum}` : "";
//     //   console.log(' word', this.state.wordNum );
      
//     //   a.href = title + `#:~:text=${allSpansInResultSnippet[index].textContent}${wordNumSuffix}`;
//     //   allSpansInResultSnippet[index].replaceWith(a);
//     // }
//     result.snippet= result.snippet = tempContainer.innerHTML; 
//     result.snippetReplaced = true;
//   }
//   getResultJsx(result) {
//     let template = this.getTemplateByResult(result);
//     this.linkToTheSearchTerms(result);
// console.log(result);

//     if (window.mw && window.mw.config.get('structuredSearchProps')) {
//         if (!template) {
//             console.error("No template found for result:", result);
//             return null; // Skip rendering if no template is found
//         }

//         let renderedHtml = Mustache.render(template, result);
      

//         return (
//             <div ref={(el) => {
//                 if (el) {
//                     el.innerHTML = renderedHtml; // Inject raw HTML inside the div
//                     let firstChild = el.firstElementChild;
//                     if (firstChild) {
//                         el.replaceWith(...el.childNodes); // Remove the wrapping div
//                     }
//                 }
//             }} />
//         );
//     }

//     return <ReactMustache template={template} data={result} onClick={this.resultClicked.bind(result.full_title, this)} />;
// }


  
//   scrollUp() {
//     window.scrollTo({
//       top: 0,
//       left: 0,
//       behavior: 'smooth'
//     });
//   }
//   next() {
//     FormMain.setNext(this.state.offset);
//   }
//   render() {
//     let results = [], errorHtml, nextButton,
//       resultsSum = '', searchTop = '', searchBottom = '';
//     if (this.state.searchStarted) {
//       if (this.state.onTop) {
//         searchTop = <div className="loading loading-top" dangerouslySetInnerHTML={{ __html: this.onSearchText }}></div>
//       }
//       else {
//         searchBottom = <div className="loading loading-bottom" dangerouslySetInnerHTML={{ __html: this.onSearchText }}></div>
//       }
//     }
//     if (this.state.results) {
//       for (let resultKey of Object.keys(this.state.results)) {
//         let result = this.state.results[resultKey];
//         results.push(this.getResultJsx(result))
//       }
//       if (this.state.searchReturned && !Object.keys(this.state.results).length) {
//         if (this.state.lastIsError) {
//           errorHtml = <div className="no-results no-results-error" key={'error'} dangerouslySetInnerHTML={{ __html: this.noResultsError }}></div>
//         }
//         else {
//           errorHtml = <div className="no-results no-results-empty" key={'error'} dangerouslySetInnerHTML={{ __html: this.noResults }}></div>;
//         }

//       }
//       // console.log("this.state.offset && results.length",this.state.offset , results.length)÷÷
//       if (this.state.offset && results.length) {
//         const button = (
//           <button type="button" onClick={this.next.bind(this)} dangerouslySetInnerHTML={{ __html: this.nextText }}></button>
//         );
      
//         nextButton = window.mw.config.get('structuredSearchProps') ? <div>{button}</div> : button;
//       }
      
//     }
//     if (!this.state.hasInputHidden && results && this.resultsSumText && this.state.total) {

//       let resultText = this.resultsSumText.replace('$1', this.state.total)
//       resultsSum = <div className="results-sum-message" dangerouslySetInnerHTML={{ __html: resultText }}></div>;
//     }
//     return <div className={`results ${structuredSearchProps.class || ''}`}>
//       {searchTop}
//       {resultsSum}
//       {results}
//       {errorHtml}
//       {nextButton}
//       {searchBottom}
//     </div>;
//   }
// }

// export default Results;