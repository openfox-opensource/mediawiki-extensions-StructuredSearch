(window.webpackJsonp=window.webpackJsonp||[]).push([[0],{103:function(e,t,a){e.exports=a(237)},108:function(e,t,a){},237:function(e,t,a){"use strict";a.r(t);var n=a(0),r=a.n(n),i=a(14),s=a.n(i),l=(a(108),a(9)),u=a(10),o=a(11),c=a(20),d=a(19),h=a(50),f=a.n(h),v=function(){function e(){Object(u.a)(this,e)}return Object(o.a)(e,null,[{key:"get",value:function(t,a){return new Promise(function(n){e.getUrl(a).then(function(e){f.a.get(e+t).then(function(e){return n(e)})})})}},{key:"post",value:function(t,a,n){return new Promise(function(r){e.getUrl(n).then(function(e){f.a.post(e+t,a).then(function(e){return r(e)})})})}},{key:"addApiEndpoint",value:function(e){return e?"":"api.php?format=json&"}},{key:"getUrl",value:function(t){return new Promise(function(a){if(window.document.body.classList.contains("mediawiki"))var n=setInterval(function(){window.mw&&window.mw.config&&window.mw.config.get("wgScriptPath")&&(clearInterval(n),a(window.mw.config.get("wgServer")+window.mw.config.get("wgScriptPath")+"/"+e.addApiEndpoint(t)))},100);else a(window.localStorage.getItem("apiUrl")+e.addApiEndpoint(t))})}}]),e}(),m=function(){function e(){Object(u.a)(this,e)}return Object(o.a)(e,null,[{key:"isMobile",value:function(){return window.innerWidth<=992}},{key:"isArray",value:function(e){return"object"===typeof e&&"undefined"!==typeof e.length}},{key:"toQueryStr",value:function(e){return Object.keys(e).sort().map(function(t){return e[t]?t+"="+e[t]:""}).filter(function(e){return e}).join("&")}},{key:"sortByWeight",value:function(e,t){var a=Number(e.weight)||0,n=Number(t.weight)||0;return a>n?1:a<n?-1:0}},{key:"fixObjectToArray",value:function(t){if(e.isArray(t))return t;var a=[];for(var n in t)a.push(n);return a}},{key:"safeGet",value:function(e,t){return"string"===typeof t&&(t=t.split(/[\.|\[|\]]/).filter(function(e){return e||0===e})),t.reduce(function(e,t){return e&&e[t]?e[t]:null},e)}},{key:"stripHtml",value:function(e){var t=document.createElement("div");return t.innerHTML=e,t.innerText}}]),e}(),p=function(){function e(){Object(u.a)(this,e)}return Object(o.a)(e,null,[{key:"fixData",value:function(e){for(var t=0,a=Object.keys(e.params);t<a.length;t++){var n=a[t];e.params[n].widget&&e.params[n].widget.options&&(e.params[n].widget.options=m.fixObjectToArray(e.params[n].widget.options))}return e}},{key:"get",value:function(){return new Promise(function(t){e.onCall?e.waitForResponse().then(function(e){return t(e)}):e.getFromRemote().then(function(a){e.data=e.fixData(a),t(e.data)})})}},{key:"getFromRemote",value:function(){return new Promise(function(t){e.onCall=!0,v.get("action=structuredsearchparams").then(function(a){e.onCall=!1,t(a?a.data:null)})})}},{key:"waitForResponse",value:function(){return new Promise(function(t){var a=setInterval(function(){e.data&&(clearInterval(a),t(e.data))},200)})}}]),e}(),y=new(function(){function e(){Object(u.a)(this,e),this.events={}}return Object(o.a)(e,[{key:"on",value:function(e,t){this.events[e]||(this.events[e]={listeners:[]}),this.events[e].listeners.push(t)}},{key:"off",value:function(e){delete this.events[e]}},{key:"emit",value:function(e){if("undefined"!==typeof this.events[e]){for(var t=arguments.length,a=new Array(t>1?t-1:0),n=1;n<t;n++)a[n-1]=arguments[n];var r,i=Object(l.a)(this.events[e].listeners);try{for(i.s();!(r=i.n()).done;){r.value.apply(this,a)}}catch(s){i.e(s)}finally{i.f()}}else console.warn("No event"+e)}}]),e}()),g=["select","autocomplete","checkboxes","range"],b=function(){function e(){Object(u.a)(this,e)}return Object(o.a)(e,null,[{key:"isRange",value:function(e){return["range","dateRange"].includes(e.widget.type)}},{key:"isMultiple",value:function(e){return g.includes(e.widget.type)}},{key:"isSearchOrNs",value:function(t){return e.isSearch(t)||e.isNs(t)}},{key:"isSearch",value:function(e){return"search"===e.field}},{key:"isNs",value:function(e){return"namespace"===e.field}}]),e}(),k=function(){function e(){Object(u.a)(this,e)}return Object(o.a)(e,null,[{key:"addValue",value:function(t,a){e.allData[t]=e.allData[t]||[];var n=e.standardizeValue(a);e.allData[t].map(function(e){return""+e.value}).includes(""+n.value)||(e.allData[t].push(n),e.fireChangeEvent())}},{key:"removeValue",value:function(t,a){var n=e.allData[t].findIndex(function(e){return""+a.value===""+e.value});n>-1&&e.allData[t].splice(n,1),e.allData[t].length||e.removeBoundFields(t),e.fireChangeEvent()}},{key:"ChangeValueByKey",value:function(t,a,n){e.allData[t]=e.allData[t]||Array(a).fill(null),e.allData[t][a]=n,e.fireChangeEvent()}},{key:"setValue",value:function(t,a){e.allData[t]=a,e.fireChangeEvent()}},{key:"getValue",value:function(t){return e.allData[t]}},{key:"includes",value:function(t,a){return e.allData[t]&&e.allData[t].filter(function(e){return""+e.value===""+a}).length}},{key:"fireChangeEvent",value:function(){y.emit("FormDataChanged",e.getAllValuesRaw()),delete e.offset,e.freezed||m.isMobile()||e.delayedSubmitData()}},{key:"standardizeValue",value:function(e){return"object"!==typeof e||!e.value&&0!==e.value?{label:e,value:e}:e}},{key:"getAllValuesRaw",value:function(){return e.allData}},{key:"getAllValuesProcessed",value:function(){for(var t=Object.assign({},e.allData),a=0,n=Object.keys(t);a<n.length;a++){var r=n[a];t[r]&&("object"===typeof t[r]&&"undefined"!==typeof t[r].length&&(t[r]=t[r].map(function(e){return"undefined"!=typeof e.value?e.value:e})),"string"!=typeof t[r]&&t[r].length&&(t[r]=t[r].join("|")))}return t}},{key:"setNext",value:function(t){t&&(e.offset=t,e.submitData(!1))}},{key:"setBinds",value:function(t){e.binds=t.map(function(e){return e.fields})}},{key:"setInputsParams",value:function(t){e.inputsParams=t}},{key:"setDefaults",value:function(t){for(var a in t){var n=t[a];if(b.isMultiple(n)){var r,i=m.safeGet(n,"widget.options")||[],s=Object(l.a)(i);try{for(s.s();!(r=s.n()).done;){var u=r.value;if(u.defaultChecked){var o=e.getFullResultFromParams(u.value,n.field,t);e.addValue(n.field,o)}}}catch(c){s.e(c)}finally{s.f()}}}e.inputsParams=t}},{key:"delayedSubmitData",value:function(){clearTimeout(e.delayedSubmitDataTimeout),e.delayedSubmitDataTimeout=setTimeout(function(){e.submitData()},1500)}},{key:"submitData",value:function(){var t=!(arguments.length>0&&void 0!==arguments[0])||arguments[0],a=!(arguments.length>1&&void 0!==arguments[1])||arguments[1],n=this.getAllValuesProcessed();n.action="structuredsearchsearch",e.offset&&(n.offset=e.offset),a&&(n=e.filterParams(n));var r=m.toQueryStr(n);y.emit("searchStarted",{reset:t,params:n}),e.fireGlobalEvent(n),v.get(r).then(function(e){var a=e.data.error?{results:{error:!0}}:e.data.StructuredSearchSearch;a.reset=t,y.emit("dataRecieved",a)})}},{key:"fireGlobalEvent",value:function(e){var t,a=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"StructuredSearch";"function"===typeof Event?t=new Event(a):(t=document.createEvent("Event")).initEvent(a,!1,!1),t.params=e,document.dispatchEvent(t)}},{key:"clearField",value:function(t){var a=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null,n=e.allData[t],r=null;return!!n&&(r=m.isArray(n)?[]:"object"==typeof n?{}:"",e.allData[t]=r,e.removeBoundFields(t,a),!0)}},{key:"removeBoundFields",value:function(t,a){var n,r=e.getBounds(t),i=Object(l.a)(r);try{for(i.s();!(n=i.n()).done;){var s=n.value;s!==a&&e.clearField(s,t)}}catch(u){i.e(u)}finally{i.f()}}},{key:"filterParams",value:function(t){for(var a=0,n=Object.keys(t);a<n.length;a++){var r,i=n[a],s=e.getBounds(i)||[],u=Object(l.a)(s);try{for(u.s();!(r=u.n()).done;){var o=r.value;if(!t[o]||["[]","{}"].includes(window.JSON.stringify(t[o]))){delete t[i];break}}}catch(c){u.e(c)}finally{u.f()}}return t}},{key:"getBounds",value:function(t){var a,n=[],r=Object(l.a)(e.binds);try{for(r.s();!(a=r.n()).done;){var i=a.value;if(i.includes(t)){var s=[].concat(i);s.splice(s.indexOf(t),1),n=n.concat(s)}}}catch(u){r.e(u)}finally{r.f()}return n}},{key:"getFullResultFromParams",value:function(e,t,a){var n,r=m.safeGet(a,t+".widget.options");if(b.isMultiple(a[t])&&r){var i,s=Object(l.a)(r);try{for(s.s();!(i=s.n()).done;){var u=i.value;if(u.value===e){n=u;break}}}catch(o){s.e(o)}finally{s.f()}}return n||e}},{key:"reset",value:function(){e.allData=[]}}]),e}();k.allData={},k.binds=[];var w=k;var S=function(e){return new Promise(function(t){p.get().then(function(a){a&&a.translations?t(a.translations[e]):t("")})})},E=a(102),O=a(38),j=a.n(O),C=a(93),D=a.n(C),x=a(94),N=a(241),T=a(240),M=(a(131),function(e){Object(c.a)(a,e);var t=Object(d.a)(a);function a(e){var n;Object(u.a)(this,a),n=t.call(this,e);var r=e.inputData.widget.options||[],i=w.getValue(e.inputData.field);if(r=n.extractOptions(r),n.state={inputData:e.inputData,filteredOptions:r,options:r,typed:i&&i.length?i[0].value:""},"select"===e.inputData.widget.type){var s=e.inputData.widget.default||r[0];"string"===typeof s&&(s=[{value:s,label:s}]),n.state.selected=s}return n}return Object(o.a)(a,[{key:"componentDidMount",value:function(){for(var e=this,t=function(){var t=n[a];S(t).then(function(a){var n={};n[t]=a,e.setState(n)})},a=0,n=["structuredsearch-to-label","structuredsearch-from-label","structuredsearch-search-label","structuredsearch-more-label","structuredsearch-less-label","structuredsearch-show-more"];a<n.length;a++)t();var r,i=Object(l.a)(this.state.options);try{for(i.s();!(r=i.n()).done;){var s=r.value;s.defaultChecked&&w.addValue(this.state.inputData.field,s)}}catch(u){i.e(u)}finally{i.f()}}},{key:"extractOptions",value:function(e){e=m.fixObjectToArray(e);var t,a=[],n=Object(l.a)(e);try{for(n.s();!(t=n.n()).done;){var r=t.value;if("string"===typeof r){try{throw new Error(r)}catch(i){console.log(i)}a.push({value:r,label:r})}else a.push(r)}}catch(s){n.e(s)}finally{n.f()}return a}},{key:"valueChanged",value:function(e,t){w.setValue(e,t)}},{key:"checkboxChanges",value:function(e,t,a){a.target.checked?w.addValue(e,t):w.removeValue(e,t)}},{key:"filterAlreadyChosenOptions",value:function(e){var t=w.getValue(this.state.inputData.field);return t?(t=t.map(function(e){return e.value}),e=e.filter(function(e){return!t.includes(e.value)})):e}},{key:"autocompleteChanged",value:function(e,t){var a=this;if(this.setState({typed:t}),this.state.options.length){var n=this.state.options.filter(function(e){return!t||e.label.indexOf(t)>-1});this.setState({filteredOptions:this.filterAlreadyChosenOptions(n)})}else this.isSearchAutomplete()?this.searchAutocomplete(t):v.get("action=structuredsearchautocomplete&field=".concat(this.state.inputData.field,"&search=").concat(t)).then(function(e){if(e.data.values){for(var t=[],n=e.data.values,r=0,i=Object.keys(n);r<i.length;r++){var s=i[r];t.push({label:n[s],value:s})}a.setState({filteredOptions:a.filterAlreadyChosenOptions(t)})}})}},{key:"searchAutocomplete",value:function(e){var t=this,a=w.getAllValuesProcessed().namespace;w.setValue(this.state.inputData.field,e),v.get("action=opensearch&formatversion=2&search=".concat(e,"&namespace=").concat(a,"&limit=10&suggest=true")).then(function(e){for(var a=e.data,n=a[1],r=a[3],i=[],s=0;s<n.length;s++){var l,u=void 0,o=n[s].split(":");o.length>1&&(u=o.shift()),l=o.join(":"),i.push({label:l,ns:u,value:r[s],href:r[s]})}t.setState({filteredOptions:i}),y.emit("autocompleteMenuResults",i)})}},{key:"submitClicked",value:function(){w.submitData()}},{key:"autocompleteInputKeyDown",value:function(e){13===e.keyCode&&setTimeout(function(){var e=document.querySelector(".field-wrp-name-search input"),t=e.value.length;e.setSelectionRange(t,t)},10)}},{key:"autocompleteSelected",value:function(e,t,a){this.isSearchAutomplete()?(w.fireGlobalEvent({title:a.value},"StructuredSearchPageClicked"),window.location.href=a.value):(w.addValue(e,a),this.setState({typed:""}))}},{key:"onAutocompleteMenuVisibilityChange",value:function(e){y.emit("autocompleteMenuOpen",e)}},{key:"isSearchAutomplete",value:function(){return b.isSearch(this.state.inputData)}},{key:"selectChanged",value:function(e,t){this.setState({selected:t}),"<select>"===t.value?this.state.inputData.widget.is_not_multiple&&w.clearField(e):this.state.inputData.widget.is_not_multiple?w.setValue(e,[t]):""+t.value&&w.addValue(e,t)}},{key:"datepickerChanges",value:function(e,t){var a=Object(N.a)(t,"dd/MM/yyyy");w.setValue(e,a)}},{key:"dateRangeChanges",value:function(e,t,a){var n=Object(N.a)(a,"dd/MM/yyyy");w.ChangeValueByKey(e,t,n)}},{key:"rangeChanges",value:function(e,t,a){w.ChangeValueByKey(e,t,a.target.value)}},{key:"inputChanges",value:function(e,t){this.valueChanged(e,t.target.value)}},{key:"radioChanges",value:function(e,t,a){this.valueChanged(e,t)}},{key:"getInputHtml",value:function(){if(this.state.inputData&&Object.keys(this.state.inputData).length){var e=this.state.inputData,t=this.getLabel(e),a="field-wrp field-wrp-type-"+e.widget.type+" field-wrp-name-"+e.field,n="";switch(e.widget.type){case"text":case"select":case"checkboxes":case"autocomplete":case"radios":case"date":case"range":case"dateRange":n=this[e.widget.type+"Build"](this.state.inputData)}return r.a.createElement("div",{className:a},r.a.createElement("span",{className:""},t),n)}return""}},{key:"showAdvanced",value:function(){this.setState({showAdvanced:!this.state.showAdvanced})}},{key:"getPlaceholder",value:function(e){return e.widget.placeholder?e.widget.placeholder:m.stripHtml(e.label)}},{key:"checkboxesBuild",value:function(e){var t,a=[],n=[],i="main-and-advanced-wrp"+(this.state.showAdvanced?" opened":""),s=Object(l.a)(m.fixObjectToArray(e.widget.options));try{for(s.s();!(t=s.n()).done;){var u=t.value,o="far ",c="",d=0;w.includes(e.field,u.value)?(c=" selected",o+="fa-check-square",d=1):o+="fa-square";var h=(e.field+"-"+u.value).replace(/\s|:/g,"-"),f=r.a.createElement("span",{key:e.field+"-"+u.value,className:"checkbox-wrp"+c},r.a.createElement("input",{id:h,type:"checkbox",value:u.value,checked:d,onChange:this.checkboxChanges.bind(this,e.field,u)}),r.a.createElement("label",{htmlFor:h},r.a.createElement("i",{className:o}),r.a.createElement("span",{className:"checkbox-label",dangerouslySetInnerHTML:{__html:u.label}})));"advanced"===u.show?n.push(f):"disable"!==u.show&&a.push(f)}}catch(y){s.e(y)}finally{s.f()}var v=this.state.showAdvanced?this.state["structuredsearch-less-label"]:this.state["structuredsearch-more-label"],p=n.length?r.a.createElement("button",{"data-tip":!0,"data-for":"global",type:"button",onClick:this.showAdvanced.bind(this),dangerouslySetInnerHTML:{__html:v}}):"";return r.a.createElement("div",{className:i},r.a.createElement("div",{className:"main"},a),p,r.a.createElement(x.a,{id:"global","aria-haspopup":"true",role:"example"},this.state["structuredsearch-show-more"]),r.a.createElement("div",{className:"advanced"},n))}},{key:"radiosBuild",value:function(e){var t,a=[],n=Object(l.a)(e.widget.options);try{for(n.s();!(t=n.n()).done;){var i=t.value;a.push(r.a.createElement("span",{key:e.field+"-"+i.value,className:"checkbox-wrp"},r.a.createElement("input",{name:e.field,type:"radio",value:"{option.value}",onChange:this.radioChanges.bind(this,e.field,i)}),r.a.createElement("span",{className:"radio-label"},i.label)))}}catch(s){n.e(s)}finally{n.f()}return a}},{key:"selectBuild",value:function(e){var t=this.extractOptions(e.widget.options);return r.a.createElement(E.a,{className:"select select-"+e.field,value:this.state.selected,onChange:this.selectChanged.bind(this,e.field),options:t})}},{key:"dateBuild",value:function(e){var t=w.getValue(e.field),a=this.getPlaceholder(e),n=e.type_settings&&"year"===e.type_settings.date_type,i=m.isArray(t)?t[0]:t,s=t?Object(T.a)(i.value?i.value:i,"dd/MM/yyyy",new Date):null;return s=!s||isNaN(s.getTime())?null:s,r.a.createElement(j.a,{placeholder:a,selected:s,showYearPicker:n,dateFormat:n?"yyyy":"dd/MM/yyyy",name:e.field,onChange:this.datepickerChanges.bind(this,e.field)})}},{key:"dateRangeBuild",value:function(e){var t,a,n=this.state["structuredsearch-from-label"],i=this.state["structuredsearch-to-label"],s=w.getValue(e.field);if(s){var l=s&&!m.isArray(s)?s.split("|"):s||[];t=l[0]?Object(T.a)(l[0],"dd/MM/yyyy",new Date):null,a=l[1]?Object(T.a)(l[1],"dd/MM/yyyy",new Date):null}return r.a.createElement(r.a.Fragment,null,r.a.createElement("div",null,r.a.createElement("span",null,n),r.a.createElement(j.a,{className:"date-range-input range-input-from",name:e.field,selectsStart:!0,selected:t,dateFormat:"dd/MM/yyyy",onChange:this.dateRangeChanges.bind(this,e.field,0)})),r.a.createElement("div",null,r.a.createElement("span",null,i),r.a.createElement(j.a,{className:"date-range-input range-input-to",selected:a,selectsEnd:!0,name:e.field,dateFormat:"dd/MM/yyyy",onChange:this.dateRangeChanges.bind(this,e.field,1)})))}},{key:"rangeBuild",value:function(e){var t,a,n=this.state["structuredsearch-from-label"],i=this.state["structuredsearch-to-label"],s=w.getValue(e.field);if(s){s&&s.value&&(s=s.value);var l=s&&!m.isArray(s)?s.split("|"):s||[];t=l[0],a=l[1]}return r.a.createElement("span",null,r.a.createElement("span",null,n),r.a.createElement("input",{type:"number",className:"range-input range-input-from",name:e.field,defaultValue:t,onChange:this.rangeChanges.bind(this,e.field,0)}),r.a.createElement("span",null,i),r.a.createElement("input",{type:"number",className:"range-input range-input-to",defaultValue:a,name:e.field,onChange:this.rangeChanges.bind(this,e.field,1)}))}},{key:"textBuild",value:function(e){var t=w.getValue(e.field),a=this.getPlaceholder(e);return r.a.createElement("input",{type:"text",placeholder:a,value:t?t.value:"",name:e.field,onChange:this.inputChanges.bind(this,e.field)})}},{key:"autocompleteBuild",value:function(e){var t=this.isSearchAutomplete()?r.a.createElement("button",{type:"button",onClick:this.submitClicked.bind(this),dangerouslySetInnerHTML:{__html:this.state["structuredsearch-search-label"]}}):"",a=this.getPlaceholder(e);return r.a.createElement("div",{className:"autocomplete-wrp"},r.a.createElement(D.a,{getItemValue:function(e){return e.label},menuStyle:{position:"absolute",top:"45px",right:0,left:"auto",zIndex:5,background:"#FFF"},items:this.state.filteredOptions,renderItem:this.autocompleteRender.bind(this),value:this.state.typed,autoHighlight:!1,inputProps:{placeholder:a,type:"search",onKeyDown:this.autocompleteInputKeyDown.bind(this)},onMenuVisibilityChange:this.onAutocompleteMenuVisibilityChange.bind(this),onChange:this.autocompleteChanged.bind(this),onSelect:this.autocompleteSelected.bind(this,e.field)}),t)}},{key:"autocompleteRender",value:function(e,t){var a=e.label;return r.a.createElement("div",{className:"autocomplete-item "+(t?"highlighted":"regular"),key:e.label},a)}},{key:"getLabel",value:function(e){return e.label?r.a.createElement("label",{htmlFor:e.field,dangerouslySetInnerHTML:{__html:e.label}}):""}},{key:"stripHTML",value:function(e){var t=document.createElement("div");return t.innerHTML=e,t.innerText}},{key:"render",value:function(){var e=this.getInputHtml();return r.a.createElement("div",{className:"form-input form-input-wrp-"+this.state.inputData.field.replace(/:/g,"-")},e)}}]),a}(n.Component)),A=a(26),V=a.n(A);window.FormMain=w;var F=function(){function e(){Object(u.a)(this,e)}return Object(o.a)(e,null,[{key:"setHistoryFromSearch",value:function(t){clearTimeout(e.timeout),e.timeout=setTimeout(function(){e.doSetHistoryFromSearch(t)},80)}},{key:"doSetHistoryFromSearch",value:function(t){if(!e.isFreezed){var a=this.getState(),n=V.a.parse(window.location.search),r=window.location.pathname;n.title&&(r="/"+n.title);var i=m.toQueryStr(w.filterParams(a));e.isSearchEquleToDefault(t,a)&&(i=""),i&&(n.debug&&(a.debug=n.debug),i=m.toQueryStr(w.filterParams(a))),e.lastQuery!==i&&(e.lastQuery=i,window.history.pushState(a,"",r+"?"+i))}}},{key:"setSearchFromHistory",value:function(t){var a=V.a.parse(window.location.search);if(window.location.search){for(var n in a.namespace||(a.namespace=e.getDefaultSearch(t,"namespace")),w.freezed=!0,a){var r=a[n];if("advanced_search"===n&&(n="search"),""!==r&&t[n])if(b.isMultiple(t[n])){var i=r?r.split("|").filter(function(e){return e||0===e}):[];if(b.isRange(t[n]))w.setValue(n,i);else{var s,u=Object(l.a)(i);try{for(u.s();!(s=u.n()).done;){var o=s.value;o=w.getFullResultFromParams(o,n,t),w.addValue(n,o)}}catch(c){u.e(c)}finally{u.f()}}}else w.setValue(n,r);else delete a[n]}w.freezed=!1,e.isSearchEquleToDefault(t,a)||w.submitData()}}},{key:"getState",value:function(){var e=w.getAllValuesProcessed();return this.fixState(e)}},{key:"fixState",value:function(e){return e.search&&(e.advanced_search=e.search,delete e.search),e}},{key:"getDefaultSearch",value:function(e,t){var a={};for(var n in e)if(!t||t===n){var r=[],i=e[n];if(i.widget&&i.widget.options){var s,u=Object(l.a)(i.widget.options);try{for(u.s();!(s=u.n()).done;){var o=s.value;o.defaultChecked&&r.push(o.value)}}catch(c){u.e(c)}finally{u.f()}}r.length&&(a[n]=r.join("|"))}return t?a[t]:a}},{key:"isSearchEquleToDefault",value:function(t,a){var n=e.getDefaultSearch(t);return e.fixQueryStr(m.toQueryStr(n))===e.fixQueryStr(m.toQueryStr(a))}},{key:"fixQueryStr",value:function(e){return e.replace("advanced_search=","search=").replace(/title=.+(&|$)/,"")}},{key:"freeze",value:function(){e.isFreezed=!0}},{key:"unfreeze",value:function(){e.isFreezed=!1}}]),e}(),R=(a(92),function(e){Object(c.a)(a,e);var t=Object(d.a)(a);function a(){var e;return Object(u.a)(this,a),(e=t.call(this)).state={data:[],hide:!0},y.on("toggleSidebar",function(t){e.toggle()}),y.on("hideSidebar",function(t){e.hide(),m.isMobile()&&w.submitData()}),y.on("showSidebar",function(t){e.show()}),y.on("dataRecieved",function(t){e.hide()}),window.onpopstate=function(){e.state.inputs&&(w.reset(),w.setDefaults(e.state.inputs),F.setSearchFromHistory(e.state.inputs))},e}return Object(o.a)(a,[{key:"toggle",value:function(){this.state.hide?y.emit("showSidebar"):y.emit("hideSidebar")}},{key:"hide",value:function(){this.setState({hide:!0}),document.body.classList.add("sidebar-hidden"),document.body.classList.remove("sidebar-visible")}},{key:"show",value:function(){this.setState({hide:!1}),document.body.classList.remove("sidebar-hidden"),document.body.classList.add("sidebar-visible")}},{key:"componentDidMount",value:function(){var e=this;this.hide(),y.on("FormDataChanged",function(t){e.state&&"undefined"!=typeof e.state.inputs&&(F.setHistoryFromSearch(e.state.inputs),e.forceUpdate())}),p.get().then(function(t){t&&(w.setBinds(t.binds),w.setInputsParams(t.params),e.setState({inputs:t.params},function(){w.setDefaults(t.params),F.setSearchFromHistory(t.params)}))})}},{key:"render",value:function(){var e=[];if(this.state&&"undefined"!=typeof this.state.inputs){var t,a=Object.values(this.state.inputs).sort(m.sortByWeight),n=Object(l.a)(a);try{for(n.s();!(t=n.n()).done;){var i=t.value;["topbar","hide"].includes(i.widget.position)||e.push(r.a.createElement(M,{key:i.field,inputData:i}))}}catch(s){n.e(s)}finally{n.f()}}return e.length?r.a.createElement("div",{className:"side-bar"+(this.state.hide?" hide":" show")},r.a.createElement("span",{className:"close-button-wrp"},r.a.createElement("button",{type:"button",className:"hide-on-desktop",onClick:this.hide.bind(this)},r.a.createElement("i",{className:"fal fa-times"}))),e):r.a.createElement("div",{className:"side-bar side-bar-loader"})}}]),a}(n.Component)),I=function(e){Object(c.a)(a,e);var t=Object(d.a)(a);function a(){var e;return Object(u.a)(this,a),(e=t.call(this)).state={labels:[],chevronDir:"down"},y.on("FormDataChanged",function(t){e.refreshAllInputsByData(t)}),y.on("autocompleteMenuOpen",function(t){e.setState({searchSuggestionsOpen:t})}),y.on("autocompleteMenuResults",function(t){e.setState({searchSuggestionsNotEmpty:!!t.length})}),e}return Object(o.a)(a,[{key:"componentDidMount",value:function(){for(var e=this,t=function(){var t=n[a];S(t).then(function(a){var n={};n[t]=a,e.setState(n)})},a=0,n=["structuredsearch-clear","structuredsearch-toggle-sidebar"];a<n.length;a++)t();p.get().then(function(t){t&&(e.setState({inputs:t.params,labels:[]}),e.refreshAllInputsByData(w.getAllValuesRaw()))}),this.setStickyCheck(),y.on("hideSidebar",function(t){e.setState({chevronDir:"down"})}),y.on("showSidebar",function(t){e.setState({chevronDir:"up"})})}},{key:"setStickyCheck",value:function(){var e=this;new IntersectionObserver(function(t,a){var n,r=Object(l.a)(t);try{for(r.s();!(n=r.n()).done;){var i=n.value.boundingClientRect;i.top>0?e.setState({sticky:!1}):i.top<0&&e.setState({sticky:!0})}}catch(s){r.e(s)}finally{r.f()}},{threshold:[0,1]}).observe(document.querySelector(".checking-sticky"))}},{key:"standardizeItem",value:function(e){return"string"===typeof e&&(e=[{label:e,value:e}]),e}},{key:"removeLabel",value:function(e,t){"undefined"!==typeof this.state.inputs&&"range"===this.state.inputs[e].widget.type?w.clearField(e):w.removeValue(e,t),w.fireChangeEvent()}},{key:"submitClicked",value:function(e){e.preventDefault(),w.submitData()}},{key:"refreshAllInputsByData",value:function(e){for(var t={},a=[],n=[].concat(w.binds),r=0,i=Object.keys(e);r<i.length;r++){var s=i[r];if(!a.includes(s)&&(e[s]&&m.safeGet(this,"state.inputs")&&!this.state.inputs[s].withoutLabels)){if(t[s]=[],e[s]=this.standardizeItem(e[s]),b.isRange(this.state.inputs[s])){var u=e[s];u&&(u[0]||u[1])&&(t[s]=[{label:u.join("-"),value:u.join("-"),field:s}])}else{var o,c=Object(l.a)(e[s]);try{for(c.s();!(o=c.n()).done;){var d=o.value;t[s].push({label:d.label,value:d.value,field:s})}}catch(k){c.e(k)}finally{c.f()}}if(t[s]&&t[s].length){var h,f=Object(l.a)(n);try{for(f.s();!(h=f.n()).done;){var v=h.value;if(v.includes(s)){var p,y=Object(l.a)(v);try{for(y.s();!(p=y.n()).done;){var g=p.value;if(g!==s){if(!e[g]||!e[g].length){delete t[s];break}t[s][0].label+=" "+e[g][0].label,a.push(g)}}}catch(k){y.e(k)}finally{y.f()}}}}catch(k){f.e(k)}finally{f.f()}}}}this.setState({labels:t})}},{key:"clearClicked",value:function(){var e=!1;if("undefined"!=typeof this.state.inputs)for(var t in this.state.inputs){var a=this.state.inputs[t];b.isMultiple(a)&&!b.isSearchOrNs(a)&&(e=w.clearField(t)||e)}e&&w.fireChangeEvent()}},{key:"toggleSidebar",value:function(){y.emit("toggleSidebar")}},{key:"render",value:function(){var e=[],t=[],a=r.a.createElement("button",{type:"button",className:"hide-on-desktop",onClick:this.toggleSidebar.bind(this)},this.state["structuredsearch-toggle-sidebar"],r.a.createElement("i",{className:"fas fa-chevron-"+this.state.chevronDir}));if("undefined"!==typeof this.state.inputs){var n,i=Object.values(this.state.inputs).sort(m.sortByWeight),s=Object(l.a)(i);try{for(s.s();!(n=s.n()).done;){var u=n.value;"topbar"===u.widget.position&&e.push(r.a.createElement(M,{key:u.field,inputData:u}))}}catch(g){s.e(g)}finally{s.f()}}if(this.state.labels)for(var o=0,c=Object.keys(this.state.labels);o<c.length;o++){var d,h=c[o],f=Object(l.a)(this.state.labels[h]);try{for(f.s();!(d=f.n()).done;){var v=d.value,p=m.stripHtml(v.label);t.push(r.a.createElement("span",{key:v.field+":"+v.value,className:"label-wrp"},p,r.a.createElement("button",{type:"button",className:"label-remove",onClick:this.removeLabel.bind(this,v.field,v)},r.a.createElement("i",{className:"fal fa-times"}))))}}catch(g){f.e(g)}finally{f.f()}}var y="";return this.state.sticky&&(y+=" sticky-on"),t.length&&(y+=" with-labels"),this.state.searchSuggestionsOpen&&this.state.searchSuggestionsNotEmpty&&(y+=" search-suggestions-open"),e.length?r.a.createElement("div",{className:"TopBar sticky-top"+y},r.a.createElement("header",{className:"App-header"},r.a.createElement("form",{onSubmit:this.submitClicked.bind(this)},e,a,r.a.createElement("div",{className:"lables-wrp"},t)),r.a.createElement("button",{type:"button",onClick:this.clearClicked.bind(this),dangerouslySetInnerHTML:{__html:this.state["structuredsearch-clear"]}}))):r.a.createElement("div",{className:"TopBar TopBar-loader"})}}]),a}(n.Component),B=a(100),_=a.n(B),P=function(e){Object(c.a)(a,e);var t=Object(d.a)(a);function a(){var e;Object(u.a)(this,a);var n=V.a.parse(window.location.search);return(e=t.call(this)).state={searchStarted:!!n.advanced_search},S("structuredsearch-no-results").then(function(t){e.noResults=t}),S("structuredsearch-on-results-error").then(function(t){e.noResultsError=t}),S("structuredsearch-next").then(function(t){e.nextText=t}),S("structuredsearch-on-search-text").then(function(t){e.onSearchText=t}),S("structuredsearch-results-sum").then(function(t){e.resultsSumText=t}),y.on("searchStarted",function(t){var a={searchStarted:!0,onTop:t.reset};t.reset&&(a.results=[],a.lastIsError=!1,a.total=0,setTimeout(function(){e.scrollUp()},200)),e.setState(a)}),y.on("dataRecieved",function(t){var a,n=t.results;n&&n.error?e.setState({lastIsError:!0,results:[],searchReturned:!0,searchStarted:!1,onTop:!1}):(t.reset?a=n:(a=e.state.results||{},a=Object.assign(a,n)),e.setState({offset:t.continue?t.continue.sroffset:null,total:t.searchinfo?t.searchinfo.totalhits:0,lastIsError:!1,results:a,searchReturned:!0,searchStarted:!1,onTop:!1}))}),p.get().then(function(t){t&&(e.templates=t.templates)}),e}return Object(o.a)(a,[{key:"resultClicked",value:function(e,t){console.log("resultClicked StructuredSearchResultclicked",e,t),w.fireGlobalEvent({title:e},"StructuredSearchResultclicked")}},{key:"getTempalteByResult",value:function(e){var t=e.namespaceId;return this.templates["template_"+t]||this.templates.default}},{key:"getResultJsx",value:function(e){var t=this.getTempalteByResult(e);return r.a.createElement(_.a,{template:t,data:e,onClick:this.resultClicked.bind(e.full_title,this)})}},{key:"scrollUp",value:function(){window.scrollTo({top:0,left:0,behavior:"smooth"})}},{key:"next",value:function(){w.setNext(this.state.offset)}},{key:"render",value:function(){var e,t,a=[],n="",i="",s="";if(this.state.searchStarted&&(this.state.onTop?i=r.a.createElement("div",{className:"loading loading-top",dangerouslySetInnerHTML:{__html:this.onSearchText}}):s=r.a.createElement("div",{className:"loading loading-bottom",dangerouslySetInnerHTML:{__html:this.onSearchText}})),this.state.results){for(var l=0,u=Object.keys(this.state.results);l<u.length;l++){var o=u[l],c=this.state.results[o];a.push(this.getResultJsx(c))}this.state.searchReturned&&!Object.keys(this.state.results).length&&(e=this.state.lastIsError?r.a.createElement("div",{className:"no-results no-results-error",key:"error",dangerouslySetInnerHTML:{__html:this.noResultsError}}):r.a.createElement("div",{className:"no-results no-results-empty",key:"error",dangerouslySetInnerHTML:{__html:this.noResults}})),this.state.offset&&a.length&&(t=r.a.createElement("button",{type:"button",onClick:this.next.bind(this),dangerouslySetInnerHTML:{__html:this.nextText}}))}if(a&&this.resultsSumText&&this.state.total){var d=this.resultsSumText.replace("$1",this.state.total);n=r.a.createElement("div",{className:"results-sum-message",dangerouslySetInnerHTML:{__html:d}})}return r.a.createElement("div",{className:"results"},i,n,a,e,t,s)}}]),a}(n.Component);Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));s.a.render(r.a.createElement(R,null),document.getElementById("side-bar")),s.a.render(r.a.createElement(I,null),document.getElementById("top-bar")),s.a.render(r.a.createElement(P,null),document.getElementById("results")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then(function(e){e.unregister()})},92:function(e,t,a){}},[[103,1,2]]]);
//# sourceMappingURL=main.aa9fae89.chunk.js.map