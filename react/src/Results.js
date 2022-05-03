import React, { Component } from "react";
import queryString from 'query-string';
import EventEmitter from './libs/EventEmitter';
import translate from './libs/translations';
import ReactMustache from 'react-mustache'
import settingsGetter from './libs/settingsGetter';
import FormMain from './libs/FormMain';



class Results extends Component {
  constructor() {
    let params = queryString.parse(window.location.search);
    super();

    this.state = {
      searchStarted: params.advanced_search ? true : false
    };

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
        let newTotal = (data.searchinfo?.totalhits || 0) + (data.reset ? 0 : this.state.total);
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
      //console.log(data.templates, data);
      if (data) {
        this.templates = data.templates;
      }
    });
  }
  resultClicked(title, event) {
    console.log("rererr");
    // console.log("resultClicked StructuredSearchResultclicked", title, event);
    FormMain.fireGlobalEvent({ title: title }, 'StructuredSearchResultclicked');
  }
  getTempalteByResult(result) {
    let ns = result.namespaceId;
    return this.templates['template_' + ns] || this.templates['default'];
  }
  spllit(words) {
    let wordArray = words.split(' ');
    console.log(wordArray);
    return wordArray;
  }
  searchStringInArray(str, strArray) {
    for (var j = 0; j < strArray.length; j++) {
      if (strArray[j].match(str)) return j;
    }
    return -1;

  }
  insertWordToLink(index, arrayStringOfSearch,wordOfSearch) {//index to word search in array
    let arrayWordToLink = new Array;
    
    for (var i = index - 3, j = 0; i < index + 4; i++, j++) {
      if(index==i)
        arrayWordToLink[j]=wordOfSearch;
      else if ( index - 1 != i)
        arrayWordToLink[j] = arrayStringOfSearch[i];
      else j--;

    }
    return arrayWordToLink;
  }
  linkToWordSearch(result) {
    let indexOfSnippet = result.snippet.indexOf("a");
    result.snippet = result.snippet.replaceAll('span', 'a');//Creat link
    let arrayStringSnippet = this.spllit(result.snippet);
    let title = result.full_title;
    let wordSearch = document.querySelector('.field-wrp-name-search');
    let wordInput = wordSearch.getElementsByTagName('input');// Find the search text
    let wordOfSearch;
    if (wordInput.length) {
      wordOfSearch = wordInput[0].value;
    }
    let stringToSearch = '>' + wordOfSearch + '<';
    let locationWordSearch = this.searchStringInArray(stringToSearch, arrayStringSnippet)
    let arrayToLink = this.insertWordToLink(locationWordSearch, arrayStringSnippet,wordOfSearch);
    let protocol = window.location.protocol;
    if(wordOfSearch)
      result.snippet = result.snippet.substring(0, indexOfSnippet) + ' href="' + protocol + '/' + title + '#:~:text=' + arrayToLink[0] + '%20' + arrayToLink[1] + '-,' + arrayToLink[2] + '%20' + arrayToLink[3] + ',' + arrayToLink[4] + '%20' + arrayToLink[5] + '" ' + result.snippet.substring(indexOfSnippet, result.snippet.length);
  }

  getResultJsx(result) {
    let template = this.getTempalteByResult(result);
    this.linkToWordSearch(result);
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

        nextButton = <button type="button" onClick={this.next.bind(this)} dangerouslySetInnerHTML={{ __html: this.nextText }}></button>
      }
    }
    if (results && this.resultsSumText && this.state.total) {


      let resultText = this.resultsSumText.replace('$1', this.state.total)
      resultsSum = <div className="results-sum-message" dangerouslySetInnerHTML={{ __html: resultText }}></div>;
    }
    return <div className='results'>
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