import React, { Component } from "react";
import queryString from 'query-string';
import EventEmitter from './libs/EventEmitter';
import translate from './libs/translations';
import ReactMustache from 'react-mustache'
import settingsGetter from './libs/settingsGetter';
import FormMain from './libs/FormMain';
import Mustache from 'mustache';
import {Parser} from 'html-to-react';
import TableViewComponent from './TableViewComponent'; 
const htmlToReactParser = new Parser();

  
class Results extends Component {
  constructor() {
    let params = queryString.parse(window.location.search);
    super();
    const structuredSearchProps = window.mw?.config.get('structuredSearchProps') || {};
    console.log("structuredSearchPropsRE", structuredSearchProps);
    
    this.state = {
      searchStarted: params.advanced_search ? true : false,
      searchReturned: false,
      hasResultsSumHidden: structuredSearchProps.resultsSumMessage === "hidden" ,
      resultClass: structuredSearchProps.class || "", 
      displayTemplate: structuredSearchProps.display || "",
      useTableView: false,
      enableDisplayToggle: Object.keys(structuredSearchProps).length > 0,
     // loading: true, 
    };
   
    console.log("table",this.state.enableDisplayToggle );
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
        searchReturned: false,
       // loading: true, // Show loader when new search starts
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
      console.log("data.continue:", data.continue);
      console.log("results length:", Object.keys(results).length);
      console.log("total expected:", data.searchinfo?.totalhits);
      if (!data || !data.results) {
        console.error("Error: No results received", data);
    }
      if (results && results.error) {
        this.setState({
          lastIsError: true,
          results: [],
          searchReturned: true,
          searchStarted: false,
          onTop: false,
          loading: false, // Hide loader on error
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
          onTop: false,
          loading: false, // Hide loader once results are received
        })
      }

    });
    settingsGetter.get().then(data => {
      
      if (data) {
        this.templates = data.templates;
      }
    });
  }
  componentDidMount() {
    this.retryInterval = setInterval(() => {
      this.checkStructuredSearchProps();
    }, 500);
  
    setTimeout(() => clearInterval(this.retryInterval), 2000); // Stop after 60 seconds
    window.addEventListener("scroll", this.handleScroll);
    EventEmitter.on("toggleDisplayView", (useTableView) => {
      this.setState({ useTableView });
    });
  }

  componentWillUnmount() {
  
    window.removeEventListener("scroll", this.handleScroll);
    clearInterval(this.retryInterval);
    EventEmitter.off("toggleDisplayView");
  }

  handleScroll = () => {
    console.log("handscroll1");
    console.log("offset:", this.state.offset, "loading:", this.state.loading);
    if (this.state.loading || !this.state.offset) return; // Prevent multiple triggers
    console.log("handscroll");
    // Select the last child inside .results
    const resultsContainer = document.querySelector(".results");
    if (!resultsContainer) return;

    const resultItems = resultsContainer.children; // Get all results
    const lastResult = resultItems[resultItems.length - 1]; // Get the last loaded result

    if (!lastResult) return;
console.log("lastchild");

    if (this.isElementInViewport(lastResult)) {
        // Ensure we only trigger `next()` once per batch
        this.setState({ loading: true }, () => {
            this.next(); // Load more results
        });
    }
};

// Helper function to check if an element is visible in viewport
isElementInViewport = (el) => {
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    return rect.top < window.innerHeight && rect.bottom >= 0;
};



  next = () => {
    console.log("next");
    if (!this.state.offset) return;
    console.log("nextresults");
    FormMain.setNext(this.state.offset);
  };
  
  // Ensure `checkStructuredSearchProps` is defined as a class method
  checkStructuredSearchProps = () => {
  //  const structuredSearchProps = window.mw?.config.get("structuredSearchProps");
    if (structuredSearchProps && Object.keys(structuredSearchProps).length > 0) {
      console.log("structuredSearchProps received in App:", structuredSearchProps);
      this.setState({
        structuredSearchProps
      });
      clearInterval(this.retryInterval);
    }
    const structuredSearchProps = window.mw?.config.get('structuredSearchProps') || {};
    console.log("structuredSearchProps fetched in componentDidMount:", structuredSearchProps);

    this.setState({
      hasResultsSumHidden: structuredSearchProps.resultsSumMessage === "hidden",
      resultClass: structuredSearchProps.class || "",
      displayTemplate: structuredSearchProps.display || ""
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

      let reactElement = htmlToReactParser.parse(renderedHtml);;
      console.log("reactElement", reactElement);
      return reactElement;
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
  // next() {
  //   FormMain.setNext(this.state.offset);
  // }
  render() {
    const namespace = window.mw?.config.get("wgNamespaceNumber");
    const isTemplatePage = namespace === 10;
   
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
      // if (this.state.offset && results.length) {
      //   const button = (
      //     <button type="button" onClick={this.next.bind(this)} dangerouslySetInnerHTML={{ __html: this.nextText }}></button>
      //   );
      
      //   nextButton = window.mw.config.get('structuredSearchProps') ? <div class="load-results" >{button}</div> : button;
      // }
      
    }
    if (!this.state.hasResultsSumHidden && results && this.resultsSumText && this.state.total) {

      let resultText = this.resultsSumText.replace('$1', this.state.total)
      resultsSum = <div className="results-sum-message" dangerouslySetInnerHTML={{ __html: resultText }}></div>;
    }
    // return <div className={`results ${this.state.resultClass}`}>
    //      {/* Scrolling Loader */}
    //      {!isTemplatePage && this.state.loading && (
    //       <div className="loading-overlay">
    //         <div className="spinner"></div>
    //       </div>
    //     )}
       
    //   {searchTop}
    //   {resultsSum}
    //   {results}
    //   {errorHtml}
    //   {nextButton}
    //   {searchBottom}
    // </div>;
  
    return <div className={`results ${this.state.resultClass}`}>
  {!isTemplatePage && this.state.loading && (
    <div className="loading-overlay">
      <div className="spinner"></div>
    </div>
  )}

  {searchTop}
  {resultsSum}

  {this.state.useTableView
    ? <TableViewComponent results={Object.values(this.state.results || {})} />
    : results}

  {errorHtml}
  {nextButton}
  {searchBottom}
</div>;

  }
}

export default Results;
