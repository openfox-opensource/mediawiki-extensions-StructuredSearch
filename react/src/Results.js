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
    return wordArray;
  }
  searchStringsInArray(str, strArray) {
    let location = []
    for (var j = 0; j < strArray.length; j++) {
      if (strArray[j].match(str))
        location.push(j)
    }
    if (location)
      return location;
    else return 0;

  }
  findTheLocationOfSearchStringWithTag(arrayWordsInputValue, arrayStringSnippet) {
    let locationOfStartStringToLink = [];
    let stringToSearch = arrayWordsInputValue[0];
    let locationWordSearch = [];
    for (var i = 0; i < arrayStringSnippet.length; i++) {
      if (arrayStringSnippet[i].includes(stringToSearch))
        locationWordSearch.push(i)
    }
    for (var i = 0; i < locationWordSearch.length; i += 2) {
      for (var j = 0, x = 0, index = 0; j < arrayWordsInputValue.length; j++, x++, index += 2) {
        if (arrayStringSnippet[locationWordSearch[i] + index].includes(arrayWordsInputValue[j])) {
          if (x + 1 === arrayWordsInputValue.length) {
            locationOfStartStringToLink.push(locationWordSearch[i])
          }

        }
        else {
          break;
        }
      }
    }
    return locationOfStartStringToLink;
  }
  findTheLocationOfSearchString(arrayWordsInputValue, arrayStringSnippet) {
    //find the first search word all index
    let locationOfStartStringToLink = [];
    let stringToSearch = arrayWordsInputValue[0];
    let locationWordSearch = [];
    locationWordSearch = this.searchStringsInArray(stringToSearch, arrayStringSnippet);
    for (var i = 0; i < locationWordSearch.length; i++) {
      for (var j = 0, x = 0, index = 0; j < arrayWordsInputValue.length; j++, x++, index++) {
        if (arrayStringSnippet[locationWordSearch[i] + index].includes(arrayWordsInputValue[j])) {
          if (x + 1 === arrayWordsInputValue.length) {
            locationOfStartStringToLink.push(locationWordSearch[i]);
          }

        }
        else {
          // console.log("kkkjj");
          break;
        }
      }
    }
    return locationOfStartStringToLink;
  }
  insertLink(locationToLinkWithTag,arrayWordsInputValue,arraySpllitSnippet){
     for(let i=locationToLinkWithTag-1;i<=(locationToLinkWithTag+arrayWordsInputValue);i++){
      arraySpllitSnippet[i]=arraySpllitSnippet[i].replaceAll('span', 'a');
    }
      return arraySpllitSnippet;
  }
  arrayInputAndStringToLink(arrayWithReplcaeSpanWithA,arrayWordsInputValue,locationToLinkWithTag,locationToLinkWithTagLength){
   let sizeToArray=arrayWordsInputValue.length+2;
   console.log(sizeToArray);
   let arrayToLink = [Array(sizeToArray)];
    for(let i=0,j=1;i<locationToLinkWithTag+(arrayWordsInputValue.length)*2;j++,i++)
    {
      arrayToLink[j]=arrayWordsInputValue[i];
    }
    arrayToLink[0]=arrayWithReplcaeSpanWithA[locationToLinkWithTag-2];
    arrayToLink[arrayWordsInputValue.length+1]=arrayWithReplcaeSpanWithA[locationToLinkWithTag-1+(arrayWordsInputValue.length*2)]
    return arrayToLink;
  }
  linkToWordSearch(result){
    let arraySpllitSnippet=this.spllit(result.snippet);
    let wordSearch = document.querySelector('.field-wrp-name-search');
    let wordInput = wordSearch.getElementsByTagName('input');// Find the search text
    let arrayWordsInputValue = this.spllit(wordInput[0].value);
    let locationToLinkWithTag = this.findTheLocationOfSearchStringWithTag(arrayWordsInputValue, arraySpllitSnippet)
    let arrayWithReplcaeSpanWithA;
    let arrayInputAndString;
    for(let i=0;i<locationToLinkWithTag.length;i++){
      arrayWithReplcaeSpanWithA=this.insertLink(locationToLinkWithTag[i],arrayWordsInputValue.length,arraySpllitSnippet);
    }
    let protocol = window.location.protocol;
    let title = result.full_title;
    for(let i=0;i<locationToLinkWithTag.length;i++){
      for(let j=locationToLinkWithTag[i];j<locationToLinkWithTag[i]+(arrayWordsInputValue.length)*2;j+=2){
        arrayInputAndString=this.arrayInputAndStringToLink(arrayWithReplcaeSpanWithA,arrayWordsInputValue,locationToLinkWithTag[i],locationToLinkWithTag.length);
       let stringLink="";
        for(let x=0;x<arrayWordsInputValue.length+2;x++){
          stringLink+=arrayInputAndString[x]+" ";
        }
        arrayWithReplcaeSpanWithA[j]=arrayWithReplcaeSpanWithA[j].replaceAll('class="searchmatch"','');
        arrayWithReplcaeSpanWithA[j] = arrayWithReplcaeSpanWithA[j].substring(0, 0) + ' href="' + protocol + '/' + title + '#:~:text=' + stringLink + '" '+arrayWithReplcaeSpanWithA[j]
      }
    }
    let stringFix = "";
        for (var i = 0; i < arrayWithReplcaeSpanWithA.length; i++) {
          stringFix += arrayWithReplcaeSpanWithA[i] + " ";
        }
    result.snippet=stringFix;
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