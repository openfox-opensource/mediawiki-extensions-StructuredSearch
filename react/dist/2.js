(window.webpackJsonp=window.webpackJsonp||[]).push([[0],{108:function(e,t,a){e.exports=a(249)},113:function(e,t,a){},249:function(e,t,a){"use strict";a.r(t);var n=a(1),i=a.n(n),r=a(19),l=a.n(r),s=(a(113),a(10)),u=a(11),o=a(12),c=a(21),d=a(20),h=a(54),f=a.n(h),v=function(){function e(){Object(u.a)(this,e)}return Object(o.a)(e,null,[{key:"get",value:function(t,a){return new Promise(function(n){e.getUrl(a).then(function(e){f.a.get(e+t).then(function(e){return n(e)})})})}},{key:"post",value:function(t,a,n){return new Promise(function(i){e.getUrl(n).then(function(e){f.a.post(e+t,a).then(function(e){return i(e)})})})}},{key:"addApiEndpoint",value:function(e){return e?"":"api.php?format=json&"}},{key:"getUrl",value:function(t){return new Promise(function(a){if(window.document.body.classList.contains("mediawiki"))var n=setInterval(function(){window.mw&&window.mw.config&&window.mw.config.get("wgScriptPath")&&(clearInterval(n),a(window.mw.config.get("wgServer")+window.mw.config.get("wgScriptPath")+"/"+e.addApiEndpoint(t)))},100);else a(window.localStorage.getItem("apiUrl")+e.addApiEndpoint(t))})}}]),e}(),p=function(){function e(){Object(u.a)(this,e)}return Object(o.a)(e,null,[{key:"isMobile",value:function(){return window.innerWidth<=992}},{key:"isArray",value:function(e){return"object"===typeof e&&"undefined"!==typeof e.length}},{key:"toQueryStr",value:function(e){return Object.keys(e).sort().map(function(t){return e[t]?t+"="+e[t]:""}).filter(function(e){return e}).join("&")}},{key:"sortByWeight",value:function(e,t){var a=Number(e.weight)||0,n=Number(t.weight)||0;return a>n?1:a<n?-1:0}},{key:"fixObjectToArray",value:function(t){if(e.isArray(t))return t;var a=[];for(var n in t)a.push(n);return a}},{key:"safeGet",value:function(e,t){return"string"===typeof t&&(t=t.split(/[\.|\[|\]]/).filter(function(e){return e||0===e})),t.reduce(function(e,t){return e&&e[t]?e[t]:null},e)}},{key:"stripHtml",value:function(e){var t=document.createElement("div");return t.innerHTML=e,t.innerText}}]),e}(),m=function(){function e(){Object(u.a)(this,e)}return Object(o.a)(e,null,[{key:"fixData",value:function(e){for(var t=0,a=Object.keys(e.params);t<a.length;t++){var n=a[t];e.params[n].widget&&e.params[n].widget.options&&(e.params[n].widget.options=p.fixObjectToArray(e.params[n].widget.options))}return e}},{key:"get",value:function(){return new Promise(function(t){e.onCall?e.waitForResponse().then(function(e){return t(e)}):e.getFromRemote().then(function(a){e.data=e.fixData(a),t(e.data)})})}},{key:"getFromRemote",value:function(){return new Promise(function(t){e.onCall=!0,v.get("action=structuredsearchparams").then(function(a){e.onCall=!1,t(a?a.data:null)})})}},{key:"waitForResponse",value:function(){return new Promise(function(t){var a=setInterval(function(){e.data&&(clearInterval(a),t(e.data))},200)})}}]),e}(),y=new(function(){function e(){Object(u.a)(this,e),this.events={}}return Object(o.a)(e,[{key:"on",value:function(e,t){this.events[e]||(this.events[e]={listeners:[]}),this.events[e].listeners.push(t)}},{key:"off",value:function(e){delete this.events[e]}},{key:"emit",value:function(e){if("undefined"!==typeof this.events[e]){for(var t=arguments.length,a=new Array(t>1?t-1:0),n=1;n<t;n++)a[n-1]=arguments[n];var i,r=Object(s.a)(this.events[e].listeners);try{for(r.s();!(i=r.n()).done;){i.value.apply(this,a)}}catch(l){r.e(l)}finally{r.f()}}else console.warn("No event"+e)}}]),e}()),g=["select","autocomplete","checkboxes","range","dateRange"],b=function(){function e(){Object(u.a)(this,e)}return Object(o.a)(e,null,[{key:"isRange",value:function(e){return["range","dateRange"].includes(e.widget.type)}},{key:"isMultiple",value:function(e){return g.includes(e.widget.type)}},{key:"isSearchOrNs",value:function(t){return e.isSearch(t)||e.isNs(t)}},{key:"isSearch",value:function(e){return"search"===e.field}},{key:"isNs",value:function(e){return"namespace"===e.field}}]),e}(),k=function(){function e(){Object(u.a)(this,e)}return Object(o.a)(e,null,[{key:"addValue",value:function(t,a){e.allData[t]=e.allData[t]||[];var n=e.standardizeValue(a);e.allData[t].map(function(e){return""+e.value}).includes(""+n.value)||(e.allData[t].push(n),e.fireChangeEvent())}},{key:"removeValueByKey",value:function(t,a){e.allData[t]&&e.allData[t].splice(a,1),e.fireChangeEvent()}},{key:"removeValue",value:function(t,a){var n=e.allData[t].findIndex(function(e){return""+a.value===""+e.value});n>-1&&e.allData[t].splice(n,1),e.allData[t].length||e.removeBoundFields(t),e.fireChangeEvent()}},{key:"ChangeValueByKey",value:function(t,a,n){e.allData[t]=e.allData[t]||Array(a).fill(null),e.allData[t][a]=n,e.fireChangeEvent()}},{key:"setValue",value:function(t,a){e.allData[t]=a,e.fireChangeEvent()}},{key:"getValue",value:function(t){return e.allData[t]}},{key:"includes",value:function(t,a){return e.allData[t]&&e.allData[t].filter(function(e){return""+e.value===""+a}).length}},{key:"fireChangeEvent",value:function(){y.emit("FormDataChanged",e.getAllValuesRaw()),delete e.offset,e.freezed||p.isMobile()||e.delayedSubmitData()}},{key:"standardizeValue",value:function(e){return"object"!==typeof e||!e.value&&0!==e.value?{label:e,value:e}:e}},{key:"getAllValuesRaw",value:function(){return e.allData}},{key:"getAllValuesProcessed",value:function(){for(var t=Object.assign({},e.allData),a=0,n=Object.keys(t);a<n.length;a++){var i=n[a];t[i]&&("object"===typeof t[i]&&"undefined"!==typeof t[i].length&&(t[i]=t[i].map(function(e){return e&&"undefined"!=typeof e.value?e.value:e})),"string"!=typeof t[i]&&t[i].length&&(console.log("copyOfData[dataKey]",t[i]),t[i]=t[i].join("|")))}return t}},{key:"setNext",value:function(t){t&&(e.offset=t,e.submitData(!1))}},{key:"setBinds",value:function(t){e.binds=t.map(function(e){return e.fields})}},{key:"setInputsParams",value:function(t){e.inputsParams=t}},{key:"setDefaults",value:function(t){for(var a in t){var n=t[a];if(b.isMultiple(n)){var i,r=p.safeGet(n,"widget.options")||[],l=Object(s.a)(r);try{for(l.s();!(i=l.n()).done;){var u=i.value;if(u.defaultChecked){var o=e.getFullResultFromParams(u.value,n.field,t);e.addValue(n.field,o)}}}catch(c){l.e(c)}finally{l.f()}}}e.inputsParams=t}},{key:"delayedSubmitData",value:function(){clearTimeout(e.delayedSubmitDataTimeout),e.delayedSubmitDataTimeout=setTimeout(function(){e.submitData()},1500)}},{key:"submitData",value:function(){var t=!(arguments.length>0&&void 0!==arguments[0])||arguments[0],a=!(arguments.length>1&&void 0!==arguments[1])||arguments[1],n=this.getAllValuesProcessed();n.action="structuredsearchsearch",e.offset&&(n.offset=e.offset),a&&(n=e.filterParams(n));var i=p.toQueryStr(n);y.emit("searchStarted",{reset:t,params:n}),e.fireGlobalEvent(n),v.get(i).then(function(e){var a=e.data.error?{results:{error:!0}}:e.data.StructuredSearchSearch;a.reset=t,y.emit("dataRecieved",a)})}},{key:"fireGlobalEvent",value:function(e){var t,a=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"StructuredSearch";"function"===typeof Event?t=new Event(a):(t=document.createEvent("Event")).initEvent(a,!1,!1),t.params=e,document.dispatchEvent(t)}},{key:"clearField",value:function(t){var a=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null,n=e.allData[t],i=null;return!!n&&(i=p.isArray(n)?[]:"object"==typeof n?{}:"",e.allData[t]=i,e.removeBoundFields(t,a),!0)}},{key:"removeBoundFields",value:function(t,a){var n,i=e.getBounds(t),r=Object(s.a)(i);try{for(r.s();!(n=r.n()).done;){var l=n.value;l!==a&&e.clearField(l,t)}}catch(u){r.e(u)}finally{r.f()}}},{key:"filterParams",value:function(t){for(var a=0,n=Object.keys(t);a<n.length;a++){var i,r=n[a],l=e.getBounds(r)||[],u=Object(s.a)(l);try{for(u.s();!(i=u.n()).done;){var o=i.value;if(!t[o]||["[]","{}"].includes(window.JSON.stringify(t[o]))){delete t[r];break}}}catch(c){u.e(c)}finally{u.f()}}return t}},{key:"getBounds",value:function(t){var a,n=[],i=Object(s.a)(e.binds);try{for(i.s();!(a=i.n()).done;){var r=a.value;if(r.includes(t)){var l=[].concat(r);l.splice(l.indexOf(t),1),n=n.concat(l)}}}catch(u){i.e(u)}finally{i.f()}return n}},{key:"getFullResultFromParams",value:function(e,t,a){var n,i=p.safeGet(a,t+".widget.options");if(b.isMultiple(a[t])&&i){var r,l=Object(s.a)(i);try{for(l.s();!(r=l.n()).done;){var u=r.value;if(u.value===e){n=u;break}}}catch(o){l.e(o)}finally{l.f()}}return n||e}},{key:"reset",value:function(){e.allData=[]}}]),e}();k.allData={},k.binds=[];var w=k;var S=function(e){return new Promise(function(t){m.get().then(function(a){a&&a.translations?t(a.translations[e]):t("")})})},E=a(107),O=a(40),D=a.n(O),j=a(98),C=a.n(j),x=a(99),N=a(253),T=a(252),M=(a(137),function(e){Object(c.a)(a,e);var t=Object(d.a)(a);function a(e){var n;Object(u.a)(this,a),n=t.call(this,e);var i=e.inputData.widget.options||[],r=w.getValue(e.inputData.field);if(i=n.extractOptions(i),n.state={inputData:e.inputData,filteredOptions:i,options:i,typed:r&&r.length?r[0].value:""},"select"===e.inputData.widget.type){var l=e.inputData.widget.default||i[0];"string"===typeof l&&(l=[{value:l,label:l}]),n.state.selected=l}return n}return Object(o.a)(a,[{key:"componentDidMount",value:function(){for(var e=this,t=function(){var t=n[a];S(t).then(function(a){var n={};n[t]=a,e.setState(n)})},a=0,n=["structuredsearch-to-label","structuredsearch-from-label","structuredsearch-search-label","structuredsearch-more-label","structuredsearch-less-label","structuredsearch-show-more"];a<n.length;a++)t();var i,r=Object(s.a)(this.state.options);try{for(r.s();!(i=r.n()).done;){var l=i.value;l.defaultChecked&&w.addValue(this.state.inputData.field,l)}}catch(u){r.e(u)}finally{r.f()}}},{key:"extractOptions",value:function(e){e=p.fixObjectToArray(e);var t,a=[],n=Object(s.a)(e);try{for(n.s();!(t=n.n()).done;){var i=t.value;if("string"===typeof i){try{throw new Error(i)}catch(r){console.log(r)}a.push({value:i,label:i})}else a.push(i)}}catch(l){n.e(l)}finally{n.f()}return a}},{key:"valueChanged",value:function(e,t){w.setValue(e,t)}},{key:"checkboxChanges",value:function(e,t,a){a.target.checked?w.addValue(e,t):w.removeValue(e,t)}},{key:"filterAlreadyChosenOptions",value:function(e){var t=w.getValue(this.state.inputData.field);return t?(t=t.map(function(e){return e.value}),e=e.filter(function(e){return!t.includes(e.value)})):e}},{key:"autocompleteChanged",value:function(e,t){var a=this;if(this.setState({typed:t}),this.state.options.length){var n=this.state.options.filter(function(e){return!t||e.label.indexOf(t)>-1});this.setState({filteredOptions:this.filterAlreadyChosenOptions(n)})}else this.isSearchAutomplete()?this.searchAutocomplete(t):v.get("action=structuredsearchautocomplete&field=".concat(this.state.inputData.field,"&search=").concat(t)).then(function(e){if(e.data.values){for(var t=[],n=e.data.values,i=0,r=Object.keys(n);i<r.length;i++){var l=r[i];t.push({label:n[l],value:l})}a.setState({filteredOptions:a.filterAlreadyChosenOptions(t)})}})}},{key:"searchAutocomplete",value:function(e){var t=this,a=w.getAllValuesProcessed().namespace;w.setValue(this.state.inputData.field,e),v.get("action=opensearch&formatversion=2&search=".concat(e,"&namespace=").concat(a,"&limit=10&suggest=true")).then(function(e){var a=e.data,n=a[1],i=a[3],r=[];if(n)for(var l=0;l<n.length;l++){var s,u=void 0,o=n[l].split(":");o.length>1&&(u=o.shift()),s=o.join(":"),r.push({label:s,ns:u,value:i[l],href:i[l]})}t.setState({filteredOptions:r}),y.emit("autocompleteMenuResults",r)})}},{key:"submitClicked",value:function(){w.submitData()}},{key:"autocompleteInputKeyDown",value:function(e){13===e.keyCode&&setTimeout(function(){var e=document.querySelector(".field-wrp-name-search input"),t=e.value.length;e.setSelectionRange(t,t)},10)}},{key:"autocompleteSelected",value:function(e,t,a){this.isSearchAutomplete()?(w.fireGlobalEvent({title:a.value},"StructuredSearchPageClicked"),window.location.href=a.value):(w.addValue(e,a),this.setState({typed:""}))}},{key:"onAutocompleteMenuVisibilityChange",value:function(e){y.emit("autocompleteMenuOpen",e)}},{key:"isSearchAutomplete",value:function(){return b.isSearch(this.state.inputData)}},{key:"selectChanged",value:function(e,t){this.setState({selected:t}),"<select>"===t.value?this.state.inputData.widget.is_not_multiple&&w.clearField(e):this.state.inputData.widget.is_not_multiple?w.setValue(e,[t]):""+t.value&&w.addValue(e,t)}},{key:"datepickerChanges",value:function(e,t){var a=Object(N.a)(t,"dd/MM/yyyy");w.setValue(e,a)}},{key:"dateRangeChanges",value:function(e,t,a){if(a){console.log("dateSelected",a);var n=Object(N.a)(a,"dd/MM/yyyy");w.ChangeValueByKey(e,t,n)}else w.removeValueByKey(e,t)}},{key:"rangeChanges",value:function(e,t,a){w.ChangeValueByKey(e,t,a.target.value)}},{key:"inputChanges",value:function(e,t){this.valueChanged(e,t.target.value)}},{key:"radioChanges",value:function(e,t,a){this.valueChanged(e,t)}},{key:"getInputHtml",value:function(){if(this.state.inputData&&Object.keys(this.state.inputData).length){var e=this.state.inputData,t=this.getLabel(e),a="field-wrp field-wrp-type-"+e.widget.type+" field-wrp-name-"+e.field,n="";switch(e.widget.type){case"text":case"select":case"checkboxes":case"autocomplete":case"radios":case"date":case"range":case"dateRange":n=this[e.widget.type+"Build"](this.state.inputData)}return i.a.createElement("div",{className:a},i.a.createElement("span",{className:""},t),n)}return""}},{key:"showAdvanced",value:function(){this.setState({showAdvanced:!this.state.showAdvanced})}},{key:"getPlaceholder",value:function(e){return e.widget.placeholder?e.widget.placeholder:p.stripHtml(e.label)}},{key:"checkboxesBuild",value:function(e){var t,a=[],n=[],r="main-and-advanced-wrp"+(this.state.showAdvanced?" opened":""),l=Object(s.a)(p.fixObjectToArray(e.widget.options));try{for(l.s();!(t=l.n()).done;){var u=t.value,o="far ",c="",d=0;w.includes(e.field,u.value)?(c=" selected",o+="fa-check-square",d=1):o+="fa-square";var h=(e.field+"-"+u.value).replace(/\s|:/g,"-"),f=i.a.createElement("span",{key:e.field+"-"+u.value,className:"checkbox-wrp"+c},i.a.createElement("input",{id:h,"aria-label":e.field,type:"checkbox",value:u.value,checked:d,onChange:this.checkboxChanges.bind(this,e.field,u)}),i.a.createElement("label",{htmlFor:h},i.a.createElement("i",{className:o}),i.a.createElement("span",{className:"checkbox-label",dangerouslySetInnerHTML:{__html:u.label}})));"advanced"===u.show?n.push(f):"disable"!==u.show&&a.push(f)}}catch(y){l.e(y)}finally{l.f()}var v=this.state.showAdvanced?this.state["structuredsearch-less-label"]:this.state["structuredsearch-more-label"],m=n.length?i.a.createElement("button",{"data-tip":!0,"data-for":"global",type:"button",onClick:this.showAdvanced.bind(this),dangerouslySetInnerHTML:{__html:v}}):"";return i.a.createElement("div",{className:r},i.a.createElement("div",{className:"main"},a),m,i.a.createElement(x.a,{id:"global","aria-haspopup":"true",role:"example"},this.state["structuredsearch-show-more"]),i.a.createElement("div",{className:"advanced"},n))}},{key:"radiosBuild",value:function(e){var t,a=[],n=Object(s.a)(e.widget.options);try{for(n.s();!(t=n.n()).done;){var r=t.value;a.push(i.a.createElement("span",{key:e.field+"-"+r.value,className:"checkbox-wrp"},i.a.createElement("input",{name:e.field,type:"radio",value:"{option.value}",onChange:this.radioChanges.bind(this,e.field,r)}),i.a.createElement("span",{className:"radio-label"},r.label)))}}catch(l){n.e(l)}finally{n.f()}return a}},{key:"selectBuild",value:function(e){var t=this.extractOptions(e.widget.options);return console.log("sssss",e),i.a.createElement(E.a,{inputId:e.field.replace(/:/g,"-"),instanceId:"inst- "+e.field.replace(/:/g,"-"),"aria-label":e.field,name:e.field.replace(/:/g,"-"),className:"select select-"+e.field,value:this.state.selected,onChange:this.selectChanged.bind(this,e.field),options:t})}},{key:"dateBuild",value:function(e){var t=w.getValue(e.field),a=this.getPlaceholder(e),n=e.type_settings&&"year"===e.type_settings.date_type,r=p.isArray(t)?t[0]:t,l=t?Object(T.a)(r.value?r.value:r,"dd/MM/yyyy",new Date):null;return l=!l||isNaN(l.getTime())?null:l,i.a.createElement(D.a,{placeholder:a,selected:l,showYearPicker:n,dateFormat:n?"yyyy":"dd/MM/yyyy",name:e.field,onChange:this.datepickerChanges.bind(this,e.field)})}},{key:"dateRangeBuild",value:function(e){var t,a,n=this.state["structuredsearch-from-label"],r=this.state["structuredsearch-to-label"],l=w.getValue(e.field),s={className:"date-range-input range-input-from",name:e.field+"-1",selectsStart:!0,dateFormat:"dd/MM/yyyy",onChange:this.dateRangeChanges.bind(this,e.field,0)},u={className:"date-range-input range-input-from",name:e.field+"-2",selectsStart:!0,dateFormat:"dd/MM/yyyy",onChange:this.dateRangeChanges.bind(this,e.field,1)};if(l){var o=l&&!p.isArray(l)?l.split("|"):l||[];t=o[0]?Object(T.a)(o[0],"dd/MM/yyyy",new Date):null,a=o[1]?Object(T.a)(o[1],"dd/MM/yyyy",new Date):null,s.selected=t,u.selected=a}return i.a.createElement(i.a.Fragment,null,i.a.createElement("div",null,i.a.createElement("label",null,n,i.a.createElement(D.a,s))),i.a.createElement("div",null,i.a.createElement("label",null,r,i.a.createElement(D.a,u))))}},{key:"rangeBuild",value:function(e){var t,a,n=this.state["structuredsearch-from-label"],r=this.state["structuredsearch-to-label"],l=w.getValue(e.field);if(l){l&&l.value&&(l=l.value);var s=l&&!p.isArray(l)?l.split("|"):l||[];t=s[0],a=s[1]}return i.a.createElement("span",null,i.a.createElement("span",null,n),i.a.createElement("input",{type:"number","aria-label":e.field,className:"range-input range-input-from",name:e.field,defaultValue:t,onChange:this.rangeChanges.bind(this,e.field,0)}),i.a.createElement("span",null,r),i.a.createElement("input",{type:"number","aria-label":e.field+" (to)",className:"range-input range-input-to",defaultValue:a,name:e.field+"_to",onChange:this.rangeChanges.bind(this,e.field,1)}))}},{key:"textBuild",value:function(e){var t=w.getValue(e.field),a=this.getPlaceholder(e);return i.a.createElement("input",{type:"text","aria-label":a||e.field,placeholder:a,value:t?t.value:"",name:e.field,onChange:this.inputChanges.bind(this,e.field)})}},{key:"autocompleteBuild",value:function(e){var t=this.isSearchAutomplete()?i.a.createElement("button",{type:"button",onClick:this.submitClicked.bind(this),dangerouslySetInnerHTML:{__html:this.state["structuredsearch-search-label"]}}):"",a=this.getPlaceholder(e);return i.a.createElement("div",{className:"autocomplete-wrp"},i.a.createElement(C.a,{"aria-label":a||e.field,getItemValue:function(e){return e.label},menuStyle:{position:"absolute",top:"45px",right:0,left:"auto",zIndex:5,background:"#FFF"},items:this.state.filteredOptions,renderItem:this.autocompleteRender.bind(this),value:this.state.typed,autoHighlight:!1,inputProps:{placeholder:a,type:"search",onKeyDown:this.autocompleteInputKeyDown.bind(this)},onMenuVisibilityChange:this.onAutocompleteMenuVisibilityChange.bind(this),onChange:this.autocompleteChanged.bind(this),onSelect:this.autocompleteSelected.bind(this,e.field)}),t)}},{key:"autocompleteRender",value:function(e,t){var a=e.label;return i.a.createElement("div",{className:"autocomplete-item "+(t?"highlighted":"regular"),key:e.label},a)}},{key:"getLabel",value:function(e){return e.label?i.a.createElement("label",{htmlFor:e.field,dangerouslySetInnerHTML:{__html:e.label}}):""}},{key:"stripHTML",value:function(e){var t=document.createElement("div");return t.innerHTML=e,t.innerText}},{key:"render",value:function(){var e=this.getInputHtml();this.state.inputData.field.replace(/:/g,"-");return i.a.createElement("div",{className:"form-input form-input-wrp-"+this.state.inputData.field.replace(/:/g,"-")},e)}}]),a}(n.Component)),V=a(28),A=a.n(V);window.FormMain=w;var R=function(){function e(){Object(u.a)(this,e)}return Object(o.a)(e,null,[{key:"setHistoryFromSearch",value:function(t){clearTimeout(e.timeout),e.timeout=setTimeout(function(){e.doSetHistoryFromSearch(t)},80)}},{key:"doSetHistoryFromSearch",value:function(t){if(!e.isFreezed){var a=this.getState(),n=A.a.parse(window.location.search),i=window.location.pathname;n.title&&(i="/"+n.title);var r=p.toQueryStr(w.filterParams(a));e.isSearchEquleToDefault(t,a)&&(r=""),r&&(n.debug&&(a.debug=n.debug),r=p.toQueryStr(w.filterParams(a))),e.lastQuery!==r&&(e.lastQuery=r,window.history.pushState(a,"",i+"?"+r))}}},{key:"setSearchFromHistory",value:function(t){var a=A.a.parse(window.location.search);if(window.location.search){for(var n in a.namespace||(a.namespace=e.getDefaultSearch(t,"namespace")),w.freezed=!0,a){var i=a[n];if("advanced_search"===n&&(n="search"),""!==i&&t[n])if(b.isMultiple(t[n])){var r=i?i.split("|").filter(function(e){return e||0===e}):[];if(b.isRange(t[n]))w.setValue(n,r);else{var l,u=Object(s.a)(r);try{for(u.s();!(l=u.n()).done;){var o=l.value;o=w.getFullResultFromParams(o,n,t),w.addValue(n,o)}}catch(c){u.e(c)}finally{u.f()}}}else w.setValue(n,i);else delete a[n]}w.freezed=!1,e.isSearchEquleToDefault(t,a)||w.submitData()}}},{key:"getState",value:function(){var e=w.getAllValuesProcessed();return this.fixState(e)}},{key:"fixState",value:function(e){return e.search&&(e.advanced_search=e.search,delete e.search),e}},{key:"getDefaultSearch",value:function(e,t){var a={};for(var n in e)if(!t||t===n){var i=[],r=e[n];if(r.widget&&r.widget.options){var l,u=Object(s.a)(r.widget.options);try{for(u.s();!(l=u.n()).done;){var o=l.value;o.defaultChecked&&i.push(o.value)}}catch(c){u.e(c)}finally{u.f()}}i.length&&(a[n]=i.join("|"))}return t?a[t]:a}},{key:"isSearchEquleToDefault",value:function(t,a){var n=e.getDefaultSearch(t);return e.fixQueryStr(p.toQueryStr(n))===e.fixQueryStr(p.toQueryStr(a))}},{key:"fixQueryStr",value:function(e){return e.replace("advanced_search=","search=").replace(/title=.+(&|$)/,"")}},{key:"freeze",value:function(){e.isFreezed=!0}},{key:"unfreeze",value:function(){e.isFreezed=!1}}]),e}(),I=(a(97),function(e){Object(c.a)(a,e);var t=Object(d.a)(a);function a(){var e;return Object(u.a)(this,a),(e=t.call(this)).state={data:[],hide:!0},y.on("toggleSidebar",function(t){e.toggle()}),y.on("hideSidebar",function(t){e.hide(),p.isMobile()&&w.submitData()}),y.on("showSidebar",function(t){e.show()}),y.on("dataRecieved",function(t){e.hide()}),window.onpopstate=function(){e.state.inputs&&(w.reset(),w.setDefaults(e.state.inputs),R.setSearchFromHistory(e.state.inputs))},e}return Object(o.a)(a,[{key:"toggle",value:function(){this.state.hide?y.emit("showSidebar"):y.emit("hideSidebar")}},{key:"hide",value:function(){this.setState({hide:!0}),document.body.classList.add("sidebar-hidden"),document.body.classList.remove("sidebar-visible")}},{key:"show",value:function(){this.setState({hide:!1}),document.body.classList.remove("sidebar-hidden"),document.body.classList.add("sidebar-visible")}},{key:"componentDidMount",value:function(){var e=this;this.hide(),y.on("FormDataChanged",function(t){e.state&&"undefined"!=typeof e.state.inputs&&(R.setHistoryFromSearch(e.state.inputs),e.forceUpdate())}),m.get().then(function(t){t&&(w.setBinds(t.binds),w.setInputsParams(t.params),e.setState({inputs:t.params},function(){w.setDefaults(t.params),R.setSearchFromHistory(t.params)}))})}},{key:"render",value:function(){var e=[];if(this.state&&"undefined"!=typeof this.state.inputs){var t,a=Object.values(this.state.inputs).sort(p.sortByWeight),n=Object(s.a)(a);try{for(n.s();!(t=n.n()).done;){var r=t.value;["topbar","hide"].includes(r.widget.position)||e.push(i.a.createElement(M,{key:r.field,inputData:r}))}}catch(l){n.e(l)}finally{n.f()}}return e.length?i.a.createElement("div",{className:"side-bar"+(this.state.hide?" hide":" show")},i.a.createElement("span",{className:"close-button-wrp"},i.a.createElement("button",{type:"button",className:"hide-on-desktop",onClick:this.hide.bind(this)},i.a.createElement("i",{className:"fal fa-times"}))),e):i.a.createElement("div",{className:"side-bar side-bar-loader"})}}]),a}(n.Component)),F=function(e){Object(c.a)(a,e);var t=Object(d.a)(a);function a(){var e;return Object(u.a)(this,a),(e=t.call(this)).state={labels:[],chevronDir:"down"},y.on("FormDataChanged",function(t){e.refreshAllInputsByData(t)}),y.on("autocompleteMenuOpen",function(t){e.setState({searchSuggestionsOpen:t})}),y.on("autocompleteMenuResults",function(t){e.setState({searchSuggestionsNotEmpty:!!t.length})}),e}return Object(o.a)(a,[{key:"componentDidMount",value:function(){for(var e=this,t=function(){var t=n[a];S(t).then(function(a){var n={};n[t]=a,e.setState(n)})},a=0,n=["structuredsearch-clear","structuredsearch-toggle-sidebar"];a<n.length;a++)t();m.get().then(function(t){t&&(e.setState({inputs:t.params,labels:[]}),e.refreshAllInputsByData(w.getAllValuesRaw()))}),this.setStickyCheck(),y.on("hideSidebar",function(t){e.setState({chevronDir:"down"})}),y.on("showSidebar",function(t){e.setState({chevronDir:"up"})})}},{key:"setStickyCheck",value:function(){var e=this;new IntersectionObserver(function(t,a){var n,i=Object(s.a)(t);try{for(i.s();!(n=i.n()).done;){var r=n.value.boundingClientRect;r.top>0?e.setState({sticky:!1}):r.top<0&&e.setState({sticky:!0})}}catch(l){i.e(l)}finally{i.f()}},{threshold:[0,1]}).observe(document.querySelector(".checking-sticky"))}},{key:"standardizeItem",value:function(e){return"string"===typeof e&&(e=[{label:e,value:e}]),e}},{key:"removeLabel",value:function(e,t){"undefined"!==typeof this.state.inputs&&"range"===this.state.inputs[e].widget.type?w.clearField(e):w.removeValue(e,t),w.fireChangeEvent()}},{key:"submitClicked",value:function(e){e.preventDefault(),w.submitData()}},{key:"refreshAllInputsByData",value:function(e){for(var t={},a=[],n=[].concat(w.binds),i=0,r=Object.keys(e);i<r.length;i++){var l=r[i];if(!a.includes(l)&&(e[l]&&p.safeGet(this,"state.inputs")&&!this.state.inputs[l].withoutLabels)){if(t[l]=[],e[l]=this.standardizeItem(e[l]),b.isRange(this.state.inputs[l])){var u=e[l];u&&(u[0]||u[1])&&(t[l]=[{label:u.join("-"),value:u.join("-"),field:l}])}else{var o,c=Object(s.a)(e[l]);try{for(c.s();!(o=c.n()).done;){var d=o.value;t[l].push({label:d.label,value:d.value,field:l})}}catch(k){c.e(k)}finally{c.f()}}if(t[l]&&t[l].length){var h,f=Object(s.a)(n);try{for(f.s();!(h=f.n()).done;){var v=h.value;if(v.includes(l)){var m,y=Object(s.a)(v);try{for(y.s();!(m=y.n()).done;){var g=m.value;if(g!==l){if(!e[g]||!e[g].length){delete t[l];break}t[l][0].label+=" "+e[g][0].label,a.push(g)}}}catch(k){y.e(k)}finally{y.f()}}}}catch(k){f.e(k)}finally{f.f()}}}}this.setState({labels:t})}},{key:"clearClicked",value:function(){var e=!1;if("undefined"!=typeof this.state.inputs)for(var t in this.state.inputs){var a=this.state.inputs[t];b.isMultiple(a)&&!b.isSearchOrNs(a)&&(e=w.clearField(t)||e)}e&&w.fireChangeEvent()}},{key:"toggleSidebar",value:function(){y.emit("toggleSidebar")}},{key:"render",value:function(){var e=[],t=[],a=i.a.createElement("button",{type:"button",className:"hide-on-desktop",onClick:this.toggleSidebar.bind(this)},this.state["structuredsearch-toggle-sidebar"],i.a.createElement("i",{className:"fas fa-chevron-"+this.state.chevronDir}));if("undefined"!==typeof this.state.inputs){var n,r=Object.values(this.state.inputs).sort(p.sortByWeight),l=Object(s.a)(r);try{for(l.s();!(n=l.n()).done;){var u=n.value;"topbar"===u.widget.position&&e.push(i.a.createElement(M,{key:u.field,inputData:u}))}}catch(g){l.e(g)}finally{l.f()}}if(this.state.labels)for(var o=0,c=Object.keys(this.state.labels);o<c.length;o++){var d,h=c[o],f=Object(s.a)(this.state.labels[h]);try{for(f.s();!(d=f.n()).done;){var v=d.value,m=p.stripHtml(v.label);t.push(i.a.createElement("span",{key:v.field+":"+v.value,className:"label-wrp"},m,i.a.createElement("button",{type:"button",className:"label-remove","aria-label":"Remove  "+p.stripHtml(v.label),onClick:this.removeLabel.bind(this,v.field,v)},i.a.createElement("i",{className:"fal fa-times"}))))}}catch(g){f.e(g)}finally{f.f()}}var y="";return this.state.sticky&&(y+=" sticky-on"),t.length&&(y+=" with-labels"),this.state.searchSuggestionsOpen&&this.state.searchSuggestionsNotEmpty&&(y+=" search-suggestions-open"),e.length?i.a.createElement("div",{className:"TopBar sticky-top"+y},i.a.createElement("header",{className:"App-header"},i.a.createElement("form",{onSubmit:this.submitClicked.bind(this)},e,a,i.a.createElement("div",{className:"lables-wrp"},t)),i.a.createElement("button",{type:"button",onClick:this.clearClicked.bind(this),dangerouslySetInnerHTML:{__html:this.state["structuredsearch-clear"]}}))):i.a.createElement("div",{className:"TopBar TopBar-loader"})}}]),a}(n.Component),B=a(105),_=a.n(B),P=function(e){Object(c.a)(a,e);var t=Object(d.a)(a);function a(){var e;Object(u.a)(this,a);var n=A.a.parse(window.location.search);return(e=t.call(this)).state={searchStarted:!!n.advanced_search},S("structuredsearch-no-results").then(function(t){e.noResults=t}),S("structuredsearch-on-results-error").then(function(t){e.noResultsError=t}),S("structuredsearch-next").then(function(t){e.nextText=t}),S("structuredsearch-on-search-text").then(function(t){e.onSearchText=t}),S("structuredsearch-results-sum").then(function(t){e.resultsSumText=t}),y.on("searchStarted",function(t){var a={searchStarted:!0,onTop:t.reset};t.reset&&(a.results=[],a.lastIsError=!1,a.total=0,setTimeout(function(){e.scrollUp()},200)),e.setState(a)}),y.on("dataRecieved",function(t){var a,n=t.results;n&&n.error?e.setState({lastIsError:!0,results:[],searchReturned:!0,searchStarted:!1,onTop:!1}):(t.reset?a=n:(a=e.state.results||{},a=Object.assign(a,n)),e.setState({offset:t.continue?t.continue.sroffset:null,total:t.searchinfo?t.searchinfo.totalhits:0,lastIsError:!1,results:a,searchReturned:!0,searchStarted:!1,onTop:!1}))}),m.get().then(function(t){t&&(e.templates=t.templates)}),e}return Object(o.a)(a,[{key:"resultClicked",value:function(e,t){console.log("resultClicked StructuredSearchResultclicked",e,t),w.fireGlobalEvent({title:e},"StructuredSearchResultclicked")}},{key:"getTempalteByResult",value:function(e){var t=e.namespaceId;return this.templates["template_"+t]||this.templates.default}},{key:"getResultJsx",value:function(e){var t=this.getTempalteByResult(e);return i.a.createElement(_.a,{template:t,data:e,onClick:this.resultClicked.bind(e.full_title,this)})}},{key:"scrollUp",value:function(){window.scrollTo({top:0,left:0,behavior:"smooth"})}},{key:"next",value:function(){w.setNext(this.state.offset)}},{key:"render",value:function(){var e,t,a=[],n="",r="",l="";if(this.state.searchStarted&&(this.state.onTop?r=i.a.createElement("div",{className:"loading loading-top",dangerouslySetInnerHTML:{__html:this.onSearchText}}):l=i.a.createElement("div",{className:"loading loading-bottom",dangerouslySetInnerHTML:{__html:this.onSearchText}})),this.state.results){for(var s=0,u=Object.keys(this.state.results);s<u.length;s++){var o=u[s],c=this.state.results[o];a.push(this.getResultJsx(c))}this.state.searchReturned&&!Object.keys(this.state.results).length&&(e=this.state.lastIsError?i.a.createElement("div",{className:"no-results no-results-error",key:"error",dangerouslySetInnerHTML:{__html:this.noResultsError}}):i.a.createElement("div",{className:"no-results no-results-empty",key:"error",dangerouslySetInnerHTML:{__html:this.noResults}})),this.state.offset&&a.length&&(t=i.a.createElement("button",{type:"button",onClick:this.next.bind(this),dangerouslySetInnerHTML:{__html:this.nextText}}))}if(a&&this.resultsSumText&&this.state.total){var d=this.resultsSumText.replace("$1",this.state.total);n=i.a.createElement("div",{className:"results-sum-message",dangerouslySetInnerHTML:{__html:d}})}return i.a.createElement("div",{className:"results"},r,n,a,e,t,l)}}]),a}(n.Component);Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));l.a.render(i.a.createElement(I,null),document.getElementById("side-bar")),l.a.render(i.a.createElement(F,null),document.getElementById("top-bar")),l.a.render(i.a.createElement(P,null),document.getElementById("results")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then(function(e){e.unregister()})},97:function(e,t,a){}},[[108,1,2]]]);
//# sourceMappingURL=main.d9a553e1.chunk.js.map