(window.webpackJsonp=window.webpackJsonp||[]).push([[0],{27:function(e,t,a){},36:function(e,t,a){e.exports=a(83)},41:function(e,t,a){},83:function(e,t,a){"use strict";a.r(t);var n=a(0),l=a.n(n),r=a(6),i=a.n(r),s=(a(41),a(2)),u=a(3),o=a(8),c=a(7),h=a(9),d=a(12),f=a.n(d),v=function(){function e(){Object(s.a)(this,e)}return Object(u.a)(e,null,[{key:"get",value:function(t,a){return new Promise(function(n){e.getUrl(a).then(function(e){f.a.get(e+t).then(function(e){return n(e)})})})}},{key:"post",value:function(t,a,n){return new Promise(function(l){e.getUrl(n).then(function(e){f.a.post(e+t,a).then(function(e){return l(e)})})})}},{key:"addApiEndpoint",value:function(e){return e?"":"api.php?format=json&"}},{key:"getUrl",value:function(t){return new Promise(function(a){if(window.document.body.classList.contains("mediawiki"))var n=setInterval(function(){window.mw&&window.mw.config&&(clearInterval(n),a(window.mw.config.get("wgServer")+window.mw.config.get("wgScriptPath")+"/"+e.addApiEndpoint(t)))},100);else a(window.localStorage.getItem("apiUrl")+e.addApiEndpoint(t))})}}]),e}(),p=function(){function e(){Object(s.a)(this,e)}return Object(u.a)(e,null,[{key:"get",value:function(){return new Promise(function(t){e.onCall?e.waitForResponse().then(function(e){return t(e)}):e.getFromRemote().then(function(a){e.data=a,t(e.data)})})}},{key:"getFromRemote",value:function(){return new Promise(function(t){e.onCall=!0,v.get("action=fennecadvancedsearchparams").then(function(a){e.onCall=!1,t(a?a.data:null)})})}},{key:"waitForResponse",value:function(){return new Promise(function(t){var a=setInterval(function(){e.data&&(clearInterval(a),t(e.data))},200)})}}]),e}(),m=new(function(){function e(){Object(s.a)(this,e),this.events={}}return Object(u.a)(e,[{key:"on",value:function(e,t){this.events[e]||(this.events[e]={listeners:[]}),this.events[e].listeners.push(t)}},{key:"off",value:function(e){delete this.events[e]}},{key:"emit",value:function(e){for(var t=arguments.length,a=new Array(t>1?t-1:0),n=1;n<t;n++)a[n-1]=arguments[n];var l=!0,r=!1,i=void 0;try{for(var s,u=this.events[e].listeners[Symbol.iterator]();!(l=(s=u.next()).done);l=!0){s.value.apply(this,a)}}catch(o){r=!0,i=o}finally{try{l||null==u.return||u.return()}finally{if(r)throw i}}}}]),e}()),y=function(){function e(){Object(s.a)(this,e)}return Object(u.a)(e,null,[{key:"isArray",value:function(e){return"object"===typeof e&&"undefined"!==typeof e}},{key:"toQueryStr",value:function(e){return Object.keys(e).sort().map(function(t){return t+"="+e[t]}).join("&")}},{key:"sortByWeight",value:function(e,t){var a=e.weight||0,n=t.weight||0;return a>n?1:a<n?-1:0}}]),e}(),g=function(){function e(){Object(s.a)(this,e)}return Object(u.a)(e,null,[{key:"addValue",value:function(t,a){e.allData[t]=e.allData[t]||[];var n=e.standardizeValue(a);e.allData[t].map(function(e){return""+e.value}).includes(""+n.value)||(e.allData[t].push(n),e.fireChangeEvent())}},{key:"removeValue",value:function(t,a){var n=e.allData[t].findIndex(function(e){return""+a.value===""+e.value});n>-1&&e.allData[t].splice(n,1),e.fireChangeEvent()}},{key:"ChangeValueByKey",value:function(t,a,n){e.allData[t]=e.allData[t]||Array(a).fill(null),e.allData[t][a]=n,e.fireChangeEvent()}},{key:"setValue",value:function(t,a){e.allData[t]=a,e.fireChangeEvent()}},{key:"getValue",value:function(t){return e.allData[t]}},{key:"includes",value:function(t,a){return e.allData[t]&&e.allData[t].filter(function(e){return""+e.value===""+a}).length}},{key:"fireChangeEvent",value:function(){m.emit("FormDataChanged",e.getAllValuesRaw())}},{key:"standardizeValue",value:function(e){return"string"===typeof e?{label:e,value:e}:e}},{key:"getAllValuesRaw",value:function(){return e.allData}},{key:"getAllValuesProcessed",value:function(){var t=Object.assign({},e.allData);console.log(t,"copyOfData");for(var a=0,n=Object.keys(t);a<n.length;a++){var l=n[a];"object"===typeof t[l]&&"undefined"!==typeof t[l].length&&(t[l]=t[l].map(function(e){return"undefined"!=typeof e.value?e.value:e})),"string"!=typeof t[l]&&t[l].length&&(t[l]=t[l].join("|"))}return t}},{key:"submitData",value:function(){var e=this.getAllValuesProcessed();e.action="fennecadvancedsearchsearch";var t=y.toQueryStr(e);v.get(t).then(function(e){m.emit("dataRecieved",e.data.error?{error:!0}:e.data.FennecAdvancedSearchSearch)})}}]),e}();g.allData={};var b=g;var k=function(e){return new Promise(function(t){p.get().then(function(a){a&&a.translations?t(a.translations[e]):t("")})})},w=a(35),E=a(28),O=a.n(E),S=function(e){function t(e){var a;Object(s.a)(this,t),a=Object(o.a)(this,Object(c.a)(t).call(this,e));var n=e.inputData.widget.options||[],l=b.getValue(e.inputData.field);if(n=a.extractOptions(n),a.state={inputData:e.inputData,filteredOptions:n,options:n,typed:l&&l.length?l[0].value:""},"select"===e.inputData.widget.type){var r=e.inputData.widget.default||n[0];"string"==typeof r&&(r=[{value:r,label:r}]),a.state.selected=r}return a}return Object(h.a)(t,e),Object(u.a)(t,[{key:"componentDidMount",value:function(){for(var e=this,t=function(){var t=n[a];k(t).then(function(a){var n={};n[t]=a,e.setState(n)})},a=0,n=["fennecadvancedsearch-to-label","fennecadvancedsearch-from-label","fennecadvancedsearch-search-label","fennecadvancedsearch-more-label","fennecadvancedsearch-less-label"];a<n.length;a++)t();var l=!0,r=!1,i=void 0;try{for(var s,u=this.state.options[Symbol.iterator]();!(l=(s=u.next()).done);l=!0){var o=s.value;o.defaultChecked&&b.addValue(this.state.inputData.field,o)}}catch(c){r=!0,i=c}finally{try{l||null==u.return||u.return()}finally{if(r)throw i}}}},{key:"extractOptions",value:function(e){var t=[],a=!0,n=!1,l=void 0;try{for(var r,i=e[Symbol.iterator]();!(a=(r=i.next()).done);a=!0){var s=r.value;"string"==typeof s?t.push({value:s,label:s}):t.push(s)}}catch(u){n=!0,l=u}finally{try{a||null==i.return||i.return()}finally{if(n)throw l}}return t}},{key:"valueChanged",value:function(e,t){b.setValue(e,t)}},{key:"checkboxChanges",value:function(e,t,a){a.target.checked?b.addValue(e,t):b.removeValue(e,t)}},{key:"filterAlreadyChosenOptions",value:function(e){var t=b.getValue(this.state.inputData.field);return t?(t=t.map(function(e){return e.value}),e=e.filter(function(e){return!t.includes(e.value)})):e}},{key:"autocompleteChanged",value:function(e,t){var a=this;if(this.setState({typed:t}),this.state.options.length){var n=this.state.options.filter(function(e){return!t||e.label.indexOf(t)>-1});this.setState({filteredOptions:this.filterAlreadyChosenOptions(n)})}else this.isSearchAutomplete()?this.searchAutocomplete(t):v.get("action=fennecadvancedsearchautocomplete&field=".concat(this.state.inputData.field,"&search=").concat(t)).then(function(e){if(e.data.values){for(var t=[],n=e.data.values,l=0,r=Object.keys(n);l<r.length;l++){var i=r[l];t.push({label:n[i],value:i})}a.setState({filteredOptions:a.filterAlreadyChosenOptions(t)})}})}},{key:"searchAutocomplete",value:function(e){var t=this,a=b.getAllValuesProcessed().namespace;b.setValue(this.state.inputData.field,e),v.get("action=opensearch&formatversion=2&search=".concat(e,"&namespace=").concat(a,"&limit=10&suggest=true")).then(function(e){for(var a=e.data,n=a[1],l=a[3],r=[],i=0;i<n.length;i++){var s,u=void 0,o=n[i].split(":");o.length>1&&(u=o.shift()),s=o.join(":"),r.push({label:s,ns:u,value:l[i],href:l[i]})}t.setState({filteredOptions:r}),console.log(e,"namespaces")})}},{key:"submitClicked",value:function(){b.submitData()}},{key:"autocompleteSelected",value:function(e,t,a){this.isSearchAutomplete()?window.location.href=a.value:(b.addValue(e,a),this.setState({typed:""}))}},{key:"isSearchAutomplete",value:function(){return"search"===this.state.inputData.field}},{key:"selectChanged",value:function(e,t){this.setState({selected:t}),b.addValue(e,t)}},{key:"rangeChanges",value:function(e,t,a){b.ChangeValueByKey(e,t,a.target.value)}},{key:"inputChanges",value:function(e,t){this.valueChanged(e,t.target.value)}},{key:"radioChanges",value:function(e,t,a){this.valueChanged(e,t)}},{key:"getInputHtml",value:function(){if(this.state.inputData&&Object.keys(this.state.inputData).length){var e=this.state.inputData,t=this.getLabel(e),a="field-wrp field-wrp-type-"+e.widget.type+" field-wrp-name-"+e.field,n="";switch(e.widget.type){case"text":case"select":case"checkboxes":case"autocomplete":case"radios":case"range":n=this[e.widget.type+"Build"](this.state.inputData)}return l.a.createElement("div",{className:a},l.a.createElement("span",{className:""},t),n)}return""}},{key:"showAdvanced",value:function(){this.setState({showAdvanced:!this.state.showAdvanced})}},{key:"checkboxesBuild",value:function(e){var t=[],a=[],n="main-and-advanced-wrp"+(this.state.showAdvanced?" opened":""),r=!0,i=!1,s=void 0;try{for(var u,o=e.widget.options[Symbol.iterator]();!(r=(u=o.next()).done);r=!0){var c=u.value,h="far ",d="",f=c.defaultChecked;b.includes(e.field,c.value)?(d=" selected",h+="fa-check-square",f=1):h+="fa-square";var v=(e.field+"-"+c.value).replace(/\s|:/g,"-"),p=l.a.createElement("span",{key:e.field+"-"+c.value,className:"checkbox-wrp"+d},l.a.createElement("input",{id:v,type:"checkbox",value:c.value,defaultChecked:f,onChange:this.checkboxChanges.bind(this,e.field,c)}),l.a.createElement("label",{htmlFor:v},l.a.createElement("i",{className:h}),l.a.createElement("span",{className:"checkbox-label",dangerouslySetInnerHTML:{__html:c.label}})));"advanced"===c.show?a.push(p):"disable"!==c.show&&t.push(p)}}catch(g){i=!0,s=g}finally{try{r||null==o.return||o.return()}finally{if(i)throw s}}var m=this.state.showAdvanced?this.state["fennecadvancedsearch-less-label"]:this.state["fennecadvancedsearch-more-label"],y=a.length?l.a.createElement("button",{type:"button",onClick:this.showAdvanced.bind(this)},m):"";return l.a.createElement("div",{className:n},l.a.createElement("div",{className:"main"},t),y,l.a.createElement("div",{className:"advanced"},a))}},{key:"radiosBuild",value:function(e){var t=[],a=!0,n=!1,r=void 0;try{for(var i,s=e.widget.options[Symbol.iterator]();!(a=(i=s.next()).done);a=!0){var u=i.value;t.push(l.a.createElement("span",{key:e.field+"-"+u.value,className:"checkbox-wrp"},l.a.createElement("input",{name:e.field,type:"radio",value:"{option.value}",onChange:this.radioChanges.bind(this,e.field,u)}),l.a.createElement("span",{className:"radio-label"},u.label)))}}catch(o){n=!0,r=o}finally{try{a||null==s.return||s.return()}finally{if(n)throw r}}return t}},{key:"selectBuild",value:function(e){var t=this.extractOptions(e.widget.options);return l.a.createElement(w.a,{className:"select select-"+e.field,value:this.state.selected,onChange:this.selectChanged.bind(this,e.field),options:t})}},{key:"rangeBuild",value:function(e){var t,a,n=this.state["fennecadvancedsearch-from-label"],r=this.state["fennecadvancedsearch-to-label"],i=b.getValue(e.field);if(i){y.isArray(i)&&(i=i[0]),i.value&&(i=i.value),console.log(i,"currentValue");var s=i.split("|");t=s[0],a=s[1]}return l.a.createElement("span",null,l.a.createElement("span",null,n),l.a.createElement("input",{type:"number",className:"range-input range-input-from",name:e.field,defaultValue:t,onChange:this.rangeChanges.bind(this,e.field,0)}),l.a.createElement("span",null,r),l.a.createElement("input",{type:"number",className:"range-input range-input-to",defaultValue:a,name:e.field,onChange:this.rangeChanges.bind(this,e.field,1)}))}},{key:"textBuild",value:function(e){var t=b.getValue(e.field);return l.a.createElement("input",{type:"text",value:t,name:e.field,onChange:this.inputChanges.bind(this,e.field)})}},{key:"autocompleteBuild",value:function(e){var t=this.isSearchAutomplete()?l.a.createElement("button",{type:"button",onClick:this.submitClicked.bind(this),dangerouslySetInnerHTML:{__html:this.state["fennecadvancedsearch-search-label"]}}):"";return l.a.createElement("div",{className:"autocomplete-wrp"},l.a.createElement(O.a,{getItemValue:function(e){return e.label},menuStyle:{position:"absolute",top:"45px",right:0,left:"auto",zIndex:5,background:"#FFF"},items:this.state.filteredOptions,renderItem:this.autocompleteRender.bind(this),value:this.state.typed,onChange:this.autocompleteChanged.bind(this),onSelect:this.autocompleteSelected.bind(this,e.field)}),t)}},{key:"autocompleteRender",value:function(e,t){var a=this.isSearchAutomplete()&&e.ns?l.a.createElement("span",{className:"ns-wrapper"},e.ns):"",n=this.isSearchAutomplete()?l.a.createElement("a",{href:e.href},a,l.a.createElement("span",{className:"label-wrapper"},e.label)):e.label;return l.a.createElement("div",{className:"autocomplete-item "+(t?"highlighted":"regular"),key:e.label},n)}},{key:"getLabel",value:function(e){return e.label?l.a.createElement("label",{htmlFor:e.field,dangerouslySetInnerHTML:{__html:e.label+":"}}):""}},{key:"stripHTML",value:function(e){var t=document.createElement("div");return t.innerHTML=e,t.innerText}},{key:"render",value:function(){var e=this.getInputHtml();return l.a.createElement("div",{className:"form-input form-input-wrp-"+this.state.inputData.field.replace(/:/g,"-")},e)}}]),t}(n.Component),C=a(32),j=a.n(C),D=["select","autocomplete","checkboxes"],A=function(){function e(){Object(s.a)(this,e)}return Object(u.a)(e,null,[{key:"setHistoryFromSearch",value:function(){clearTimeout(e.timeout),e.timeout=setTimeout(function(){e.doSetHistoryFromSearch()},80)}},{key:"doSetHistoryFromSearch",value:function(){if(!e.isFreezed){var t=b.getAllValuesProcessed(),a=y.toQueryStr(t);e.lastQuery!=a&&(e.lastQuery=a,window.history.pushState(t,"",window.location.pathname+"?"+a))}}},{key:"setSearchFromHistory",value:function(e){var t=j.a.parse(window.location.search);for(var a in t){var n=t[a];if(D.includes(e[a].widget.type)){var l=n.split("|"),r=!0,i=!1,s=void 0;try{for(var u,o=l[Symbol.iterator]();!(r=(u=o.next()).done);r=!0){var c=u.value;b.addValue(a,c)}}catch(h){i=!0,s=h}finally{try{r||null==o.return||o.return()}finally{if(i)throw s}}}else b.setValue(a,n)}}},{key:"freeze",value:function(){e.isFreezed=!0}},{key:"unfreeze",value:function(){e.isFreezed=!1}}]),e}(),x=(a(27),function(e){function t(){var e;return Object(s.a)(this,t),(e=Object(o.a)(this,Object(c.a)(t).call(this))).state={data:[]},e}return Object(h.a)(t,e),Object(u.a)(t,[{key:"componentDidMount",value:function(){var e=this;m.on("FormDataChanged",function(t){A.setHistoryFromSearch(e.state.inputs),e.forceUpdate()}),p.get().then(function(t){t&&(A.setSearchFromHistory(t.params),e.setState({inputs:t.params}))})}},{key:"render",value:function(){var e=[];if(this.state.inputs){var t=Object.values(this.state.inputs).sort(y.sortByWeight),a=!0,n=!1,r=void 0;try{for(var i,s=t[Symbol.iterator]();!(a=(i=s.next()).done);a=!0){var u=i.value;["topbar","hide"].includes(u.widget.position)||e.push(l.a.createElement(S,{key:u.field,inputData:u}))}}catch(o){n=!0,r=o}finally{try{a||null==s.return||s.return()}finally{if(n)throw r}}}return l.a.createElement("div",{className:"side-bar"},e)}}]),t}(n.Component)),V=function(e){function t(){var e;return Object(s.a)(this,t),(e=Object(o.a)(this,Object(c.a)(t).call(this))).state={labels:[]},m.on("FormDataChanged",function(t){e.refreshAllInputsByData(t)}),e}return Object(h.a)(t,e),Object(u.a)(t,[{key:"componentDidMount",value:function(){var e=this;p.get().then(function(t){t&&(e.setState({inputs:t.params,labels:[]}),e.refreshAllInputsByData(b.getAllValuesRaw()))})}},{key:"standardizeItem",value:function(e){return"string"===typeof e&&(e=[{label:e,value:e}]),e}},{key:"removeLabel",value:function(e,t){b.removeValue(e,t)}},{key:"submitClicked",value:function(e){e.preventDefault(),b.submitData()}},{key:"refreshAllInputsByData",value:function(e){for(var t={},a=0,n=Object.keys(e);a<n.length;a++){var l=n[a];if(e[l]&&this.state.inputs&&this.state.inputs[l]&&("sidebar"===this.state.inputs[l].widget.position&&"search"!=this.state.inputs[l].field||this.state.inputs[l].withLabels)){t[l]=[],e[l]=this.standardizeItem(e[l]);var r=!0,i=!1,s=void 0;try{for(var u,o=e[l][Symbol.iterator]();!(r=(u=o.next()).done);r=!0){var c=u.value;t[l].push({label:c.label,value:c.value,field:l})}}catch(h){i=!0,s=h}finally{try{r||null==o.return||o.return()}finally{if(i)throw s}}}}this.setState({labels:t})}},{key:"render",value:function(){var e=[],t=[];if(this.state.inputs){var a=Object.values(this.state.inputs).sort(y.sortByWeight),n=!0,r=!1,i=void 0;try{for(var s,u=a[Symbol.iterator]();!(n=(s=u.next()).done);n=!0){var o=s.value;"topbar"===o.widget.position&&e.push(l.a.createElement(S,{key:o.field,inputData:o}))}}catch(k){r=!0,i=k}finally{try{n||null==u.return||u.return()}finally{if(r)throw i}}}if(this.state.labels)for(var c=0,h=Object.keys(this.state.labels);c<h.length;c++){var d=h[c],f=!0,v=!1,p=void 0;try{for(var m,g=this.state.labels[d][Symbol.iterator]();!(f=(m=g.next()).done);f=!0){var b=m.value;t.push(l.a.createElement("span",{key:b.field+":"+b.value,className:"label-wrp"},b.label,l.a.createElement("button",{type:"button",className:"label-remove",onClick:this.removeLabel.bind(this,b.field,b)},l.a.createElement("i",{className:"fal fa-times"}))))}}catch(k){v=!0,p=k}finally{try{f||null==g.return||g.return()}finally{if(v)throw p}}}return l.a.createElement("div",{className:"TopBar"},l.a.createElement("header",{className:"App-header"},l.a.createElement("form",{onSubmit:this.submitClicked.bind(this)},e,l.a.createElement("div",{className:"lables-wrp"},t))))}}]),t}(n.Component),I=a(33),N=a.n(I),B=function(e){function t(){var e;return Object(s.a)(this,t),(e=Object(o.a)(this,Object(c.a)(t).call(this))).state={},k("fennecadvancedsearch-no-results").then(function(t){e.noResults=t}),k("fennecadvancedsearch-on-results-error").then(function(t){e.noResultsError=t}),m.on("dataRecieved",function(t){console.log("results",t),t.error?e.setState({lastIsError:!0,results:[],searchReturned:!0}):e.setState({lastIsError:!1,results:t,searchReturned:!0})}),p.get().then(function(t){t&&(e.templates=t.templates)}),e}return Object(h.a)(t,e),Object(u.a)(t,[{key:"getTempalteByResult",value:function(e){var t=e.namespaceId;return this.templates["template_"+t]||this.templates.default}},{key:"getResultJsx",value:function(e){var t=this.getTempalteByResult(e);return l.a.createElement(N.a,{template:t,data:e})}},{key:"render",value:function(){var e=[];if(this.state.results){for(var t=0,a=Object.keys(this.state.results);t<a.length;t++){var n=a[t],r=this.state.results[n];e.push(this.getResultJsx(r))}this.state.searchReturned&&!this.state.results.length&&e.push(l.a.createElement("div",{key:"error"},this.state.lastIsError?this.noResultsError:this.noResults))}return l.a.createElement("div",{className:"results"},e)}}]),t}(n.Component);Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));i.a.render(l.a.createElement(x,null),document.getElementById("side-bar")),i.a.render(l.a.createElement(V,null),document.getElementById("top-bar")),i.a.render(l.a.createElement(B,null),document.getElementById("results")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then(function(e){e.unregister()})}},[[36,1,2]]]);
//# sourceMappingURL=main.229c3329.chunk.js.map