(window.webpackJsonp=window.webpackJsonp||[]).push([[0],{25:function(e,t,a){},33:function(e,t,a){e.exports=a(71)},38:function(e,t,a){},71:function(e,t,a){"use strict";a.r(t);var n=a(0),l=a.n(n),i=a(6),r=a.n(i),s=(a(38),a(2)),u=a(3),o=a(8),c=a(7),h=a(9),d=a(13),f=a.n(d),v=function(){function e(){Object(s.a)(this,e)}return Object(u.a)(e,null,[{key:"get",value:function(t,a){return new Promise(function(n){e.getUrl(a).then(function(e){f.a.get(e+t).then(function(e){return n(e)})})})}},{key:"post",value:function(t,a,n){return new Promise(function(l){e.getUrl(n).then(function(e){f.a.post(e+t,a).then(function(e){return l(e)})})})}},{key:"addApiEndpoint",value:function(e){return e?"":"api.php?format=json&"}},{key:"getUrl",value:function(t){return new Promise(function(a){if(window.document.body.classList.contains("mediawiki"))var n=setInterval(function(){window.mw&&window.mw.config&&(clearInterval(n),a(window.mw.config.get("wgServer")+window.mw.config.get("wgScriptPath")+"/"+e.addApiEndpoint(t)))},100);else a(window.localStorage.getItem("apiUrl")+e.addApiEndpoint(t))})}}]),e}(),p=function(){function e(){Object(s.a)(this,e)}return Object(u.a)(e,null,[{key:"get",value:function(){return new Promise(function(t){e.onCall?e.waitForResponse().then(function(e){return t(e)}):e.getFromRemote().then(function(a){e.data=a,t(e.data)})})}},{key:"getFromRemote",value:function(){return new Promise(function(t){e.onCall=!0,v.get("action=fennecadvancedsearchparams").then(function(a){e.onCall=!1,t(a?a.data:null)})})}},{key:"waitForResponse",value:function(){return new Promise(function(t){var a=setInterval(function(){e.data&&(clearInterval(a),t(e.data))},200)})}}]),e}(),m=new(function(){function e(){Object(s.a)(this,e),this.events={}}return Object(u.a)(e,[{key:"on",value:function(e,t){this.events[e]||(this.events[e]={listeners:[]}),this.events[e].listeners.push(t)}},{key:"off",value:function(e){delete this.events[e]}},{key:"emit",value:function(e){for(var t=arguments.length,a=new Array(t>1?t-1:0),n=1;n<t;n++)a[n-1]=arguments[n];var l=!0,i=!1,r=void 0;try{for(var s,u=this.events[e].listeners[Symbol.iterator]();!(l=(s=u.next()).done);l=!0){s.value.apply(this,a)}}catch(o){i=!0,r=o}finally{try{l||null==u.return||u.return()}finally{if(i)throw r}}}}]),e}()),y=function(){function e(){Object(s.a)(this,e)}return Object(u.a)(e,null,[{key:"addValue",value:function(t,a){e.allData[t]=e.allData[t]||[],e.allData[t].push(e.standardizeValue(a)),e.fireChangeEvent()}},{key:"removeValue",value:function(t,a){var n=e.allData[t].findIndex(function(e){return a.value===e.value});n>-1&&e.allData[t].splice(n,1),e.fireChangeEvent()}},{key:"ChangeValueByKey",value:function(t,a,n){e.allData[t]=e.allData[t]||Array(a).fill(null),e.allData[t][a]=n}},{key:"setValue",value:function(t,a){e.allData[t]=a,e.fireChangeEvent()}},{key:"getValue",value:function(t){return e.allData[t]}},{key:"includes",value:function(t,a){return e.allData[t]&&e.allData[t].filter(function(e){return e.value===a}).length}},{key:"fireChangeEvent",value:function(){m.emit("FormDataChanged",e.getAllValuesRaw())}},{key:"standardizeValue",value:function(e){return"string"===typeof e?{label:e,value:e}:e}},{key:"getAllValuesRaw",value:function(){return e.allData}},{key:"getAllValuesProcessed",value:function(){for(var t=Object.assign({},e.allData),a=0,n=Object.keys(t);a<n.length;a++){var l=n[a];"object"===typeof t[l]&&"undefined"!==typeof t[l].length&&(t[l]=t[l].map(function(e){return"undefined"!=typeof e.value?e.value:e})),"string"!=typeof t[l]&&t[l].length&&(t[l]=t[l].join("|"))}return t}},{key:"toQueryStr",value:function(e){return Object.keys(e).map(function(t){return t+"="+e[t]}).join("&")}},{key:"submitData",value:function(){var e=this.getAllValuesProcessed();e.action="fennecadvancedsearchsearch";var t=this.toQueryStr(e);v.get(t).then(function(e){console.log(e,"data"),m.emit("dataRecieved",e.data.error?{error:!0}:e.data.FennecAdvancedSearchSearch)})}}]),e}();y.allData={};var g=y;var b=function(e){return new Promise(function(t){p.get().then(function(a){a&&a.translations?t(a.translations[e]):t("")})})},k=a(32),w=a(26),E=a.n(w),C=function(e){function t(e){var a;Object(s.a)(this,t),a=Object(o.a)(this,Object(c.a)(t).call(this,e));var n=e.inputData.widget.options||[];if(n=a.extractOptions(n),a.state={inputData:e.inputData,filteredOptions:n,options:n,typed:""},"select"===e.inputData.widget.type){var l=e.inputData.widget.default||n[0];"string"==typeof l&&(l=[{value:l,label:l}]),a.state.selected=l}return a}return Object(h.a)(t,e),Object(u.a)(t,[{key:"componentDidMount",value:function(){for(var e=this,t=function(){var t=n[a];b(t).then(function(a){var n={};n[t]=a,e.setState(n)})},a=0,n=["fennecadvancedsearch-to-label","fennecadvancedsearch-from-label","fennecadvancedsearch-more-label"];a<n.length;a++)t();var l=!0,i=!1,r=void 0;try{for(var s,u=this.state.options[Symbol.iterator]();!(l=(s=u.next()).done);l=!0){var o=s.value;o.defaultChecked&&(console.log("in",this.state.inputData.field),g.addValue(this.state.inputData.field,o))}}catch(c){i=!0,r=c}finally{try{l||null==u.return||u.return()}finally{if(i)throw r}}}},{key:"extractOptions",value:function(e){var t=[],a=!0,n=!1,l=void 0;try{for(var i,r=e[Symbol.iterator]();!(a=(i=r.next()).done);a=!0){var s=i.value;"string"==typeof s?t.push({value:s,label:s}):t.push(s)}}catch(u){n=!0,l=u}finally{try{a||null==r.return||r.return()}finally{if(n)throw l}}return t}},{key:"valueChanged",value:function(e,t){g.setValue(e,t)}},{key:"checkboxChanges",value:function(e,t,a){a.target.checked?g.addValue(e,t):g.removeValue(e,t)}},{key:"filterAlreadyChosenOptions",value:function(e){var t=g.getValue(this.state.inputData.field);return t?(t=t.map(function(e){return e.value}),e=e.filter(function(e){return!t.includes(e.value)})):e}},{key:"autocompleteChanged",value:function(e,t){var a=this;if(this.setState({typed:t}),this.state.options.length){var n=this.state.options.filter(function(e){return!t||e.label.indexOf(t)>-1});this.setState({filteredOptions:this.filterAlreadyChosenOptions(n)})}else this.isSearchAutomplete()?this.searchAutocomplete(t):v.get("action=fennecadvancedsearchautocomplete&field=".concat(this.state.inputData.field,"&search=").concat(t)).then(function(e){if(e.data.values){for(var t=[],n=e.data.values,l=0,i=Object.keys(n);l<i.length;l++){var r=i[l];t.push({label:n[r],value:r})}a.setState({filteredOptions:a.filterAlreadyChosenOptions(t)})}})}},{key:"searchAutocomplete",value:function(e){var t=this,a=g.getAllValuesProcessed().namespace;g.setValue(this.state.inputData.field,e),v.get("action=opensearch&formatversion=2&search=".concat(e,"&namespace=").concat(a,"&limit=10&suggest=true")).then(function(e){for(var a=e.data,n=a[1],l=a[3],i=[],r=0;r<n.length;r++){var s,u=void 0,o=n[r].split(":");o.length>1&&(u=o.shift()),s=o.join(":"),i.push({label:s,ns:u,value:l[r],href:l[r]})}t.setState({filteredOptions:i}),console.log(e,"namespaces")})}},{key:"submitClicked",value:function(){g.submitData()}},{key:"autocompleteSelected",value:function(e,t,a){this.isSearchAutomplete()?window.location.href=a.value:(g.addValue(e,a),this.setState({typed:""}))}},{key:"isSearchAutomplete",value:function(){return"search"===this.state.inputData.field}},{key:"selectChanged",value:function(e,t){this.setState({selected:t}),this.valueChanged(e,t.value)}},{key:"rangeChanges",value:function(e,t,a){g.ChangeValueByKey(e,t,a.target.value)}},{key:"inputChanges",value:function(e,t){this.valueChanged(e,t.target.value)}},{key:"radioChanges",value:function(e,t,a){this.valueChanged(e,t)}},{key:"getInputHtml",value:function(){if(this.state.inputData&&Object.keys(this.state.inputData).length){var e=this.state.inputData,t=this.getLabel(e),a="field-wrp field-wrp-type-"+e.widget.type+" field-wrp-name-"+e.field,n="";switch(e.widget.type){case"text":case"select":case"checkboxes":case"autocomplete":case"radios":case"range":n=this[e.widget.type+"Build"](this.state.inputData)}return l.a.createElement("div",{className:a},l.a.createElement("span",{className:""},t),n)}return""}},{key:"showAdvanced",value:function(){this.setState({showAdvanced:!this.state.showAdvanced})}},{key:"checkboxesBuild",value:function(e){var t=[],a=[],n="main-and-advanced-wrp"+(this.state.showAdvanced?" opened":""),i=!0,r=!1,s=void 0;try{for(var u,o=e.widget.options[Symbol.iterator]();!(i=(u=o.next()).done);i=!0){var c=u.value,h="far "+(g.includes(e.field,c.value)?"fa-check-square":"fa-square"),d=(e.field+"-"+c.value).replace(/\s|:/g,"-"),f=l.a.createElement("span",{key:e.field+"-"+c.value,className:"checkbox-wrp"},l.a.createElement("input",{id:d,type:"checkbox",value:c.value,defaultChecked:c.defaultChecked,onChange:this.checkboxChanges.bind(this,e.field,c)}),l.a.createElement("label",{htmlFor:d},l.a.createElement("i",{className:h}),l.a.createElement("span",{className:"checkbox-label",dangerouslySetInnerHTML:{__html:c.label}})));"advanced"===c.show?a.push(f):"disable"!==c.show&&t.push(f)}}catch(p){r=!0,s=p}finally{try{i||null==o.return||o.return()}finally{if(r)throw s}}var v=a.length?l.a.createElement("button",{type:"button",onClick:this.showAdvanced.bind(this)},this.state["fennecadvancedsearch-more-label"]):"";return l.a.createElement("div",{className:n},l.a.createElement("div",{className:"main"},t),v,l.a.createElement("div",{className:"advanced"},a))}},{key:"radiosBuild",value:function(e){var t=[],a=!0,n=!1,i=void 0;try{for(var r,s=e.widget.options[Symbol.iterator]();!(a=(r=s.next()).done);a=!0){var u=r.value;t.push(l.a.createElement("span",{key:e.field+"-"+u.value,className:"checkbox-wrp"},l.a.createElement("input",{name:e.field,type:"radio",value:"{option.value}",onChange:this.radioChanges.bind(this,e.field,u)}),l.a.createElement("span",{className:"radio-label"},u.label)))}}catch(o){n=!0,i=o}finally{try{a||null==s.return||s.return()}finally{if(n)throw i}}return t}},{key:"selectBuild",value:function(e){var t=this.extractOptions(e.widget.options);return console.log(this.state,"this.state"),l.a.createElement(k.a,{className:"select select-"+e.field,value:this.state.selected,onChange:this.selectChanged.bind(this,e.field),options:t})}},{key:"rangeBuild",value:function(e){var t=this.state["fennecadvancedsearch-from-label"],a=this.state["fennecadvancedsearch-to-label"];return l.a.createElement("span",null,l.a.createElement("span",null,t),l.a.createElement("input",{type:"number",className:"range-input range-input-from",name:e.field,onChange:this.rangeChanges.bind(this,e.field,0)}),l.a.createElement("span",null,a),l.a.createElement("input",{type:"number",className:"range-input range-input-to",name:e.field,onChange:this.rangeChanges.bind(this,e.field,1)}))}},{key:"textBuild",value:function(e){return l.a.createElement("input",{type:"text",name:e.field,onChange:this.inputChanges.bind(this,e.field)})}},{key:"autocompleteBuild",value:function(e){var t=this.isSearchAutomplete()?l.a.createElement("button",{type:"button",onClick:this.submitClicked.bind(this)},"\u05d7\u05e4\u05e9"):"";return l.a.createElement("div",{className:"autocomplete-wrp"},l.a.createElement(E.a,{getItemValue:function(e){return e.label},menuStyle:{position:"absolute",top:"45px",right:0,left:"auto",zIndex:5,background:"#FFF"},items:this.state.filteredOptions,renderItem:this.autocompleteRender.bind(this),value:this.state.typed,onChange:this.autocompleteChanged.bind(this),onSelect:this.autocompleteSelected.bind(this,e.field)}),t)}},{key:"autocompleteRender",value:function(e,t){var a=this.isSearchAutomplete()&&e.ns?l.a.createElement("span",{className:"ns-wrapper"},e.ns):"",n=this.isSearchAutomplete()?l.a.createElement("a",{href:e.href},a,l.a.createElement("span",{className:"label-wrapper"},e.label)):e.label;return l.a.createElement("div",{className:"autocomplete-item "+(t?"highlighted":"regular"),key:e.label},n)}},{key:"getLabel",value:function(e){return e.label?l.a.createElement("label",{htmlFor:e.field,dangerouslySetInnerHTML:{__html:e.label+":"}}):""}},{key:"render",value:function(){var e=this.getInputHtml();return l.a.createElement("div",{className:"form-input form-input-wrp-"+this.state.inputData.field.replace(/:/g,"-")},e)}}]),t}(n.Component),O=(a(25),function(e){function t(){var e;return Object(s.a)(this,t),(e=Object(o.a)(this,Object(c.a)(t).call(this))).state={data:[]},e}return Object(h.a)(t,e),Object(u.a)(t,[{key:"componentDidMount",value:function(){var e=this;m.on("FormDataChanged",function(t){e.forceUpdate()}),p.get().then(function(t){t&&e.setState({inputs:t.params})})}},{key:"render",value:function(){var e=[];if(this.state.inputs)for(var t=0,a=Object.keys(this.state.inputs);t<a.length;t++){var n=a[t];["topbar","hide"].includes(this.state.inputs[n].widget.position)||e.push(l.a.createElement(C,{key:n,inputData:this.state.inputs[n]}))}return l.a.createElement("div",{className:"side-bar"},e)}}]),t}(n.Component)),D=function(e){function t(){var e;return Object(s.a)(this,t),(e=Object(o.a)(this,Object(c.a)(t).call(this))).state={labels:[]},m.on("FormDataChanged",function(t){for(var a=[],n=0,l=Object.keys(t);n<l.length;n++){var i=l[n];if(t[i]&&e.state.inputs&&e.state.inputs[i]&&("autocomplete"===e.state.inputs[i].widget.type&&"search"!=e.state.inputs[i].field||e.state.inputs[i].withLabels)){var r=!0,s=!1,u=void 0;try{for(var o,c=t[i][Symbol.iterator]();!(r=(o=c.next()).done);r=!0){var h=o.value;a.push({label:h.label,value:h.value,field:i})}}catch(d){s=!0,u=d}finally{try{r||null==c.return||c.return()}finally{if(s)throw u}}}}e.setState({labels:a})}),e}return Object(h.a)(t,e),Object(u.a)(t,[{key:"componentDidMount",value:function(){var e=this;p.get().then(function(t){t&&e.setState({inputs:t.params,labels:[]})})}},{key:"removeLabel",value:function(e,t){g.removeValue(e,t)}},{key:"submitClicked",value:function(e){e.preventDefault(),g.submitData()}},{key:"render",value:function(){var e=[],t=[];if(this.state.inputs)for(var a=0,n=Object.keys(this.state.inputs);a<n.length;a++){var i=n[a];"topbar"===this.state.inputs[i].widget.position&&e.push(l.a.createElement(C,{key:i,inputData:this.state.inputs[i]}))}if(this.state.labels){var r=!0,s=!1,u=void 0;try{for(var o,c=this.state.labels[Symbol.iterator]();!(r=(o=c.next()).done);r=!0){var h=o.value;t.push(l.a.createElement("span",{key:h.field+":"+h.value,className:"label-wrp"},h.label,l.a.createElement("button",{type:"button",className:"label-remove",onClick:this.removeLabel.bind(this,h.field,h)},"X")))}}catch(d){s=!0,u=d}finally{try{r||null==c.return||c.return()}finally{if(s)throw u}}}return l.a.createElement("div",{className:"TopBar"},l.a.createElement("header",{className:"App-header"},l.a.createElement("form",{onSubmit:this.submitClicked.bind(this)},e,t)))}}]),t}(n.Component),j=a(30),S=a.n(j),x=function(e){function t(){var e;return Object(s.a)(this,t),(e=Object(o.a)(this,Object(c.a)(t).call(this))).state={},b("fennecadvancedsearch-no-results").then(function(t){e.noResults=t}),b("fennecadvancedsearch-on-results-error").then(function(t){e.noResultsError=t}),m.on("dataRecieved",function(t){console.log("results",t),t.error?e.setState({lastIsError:!0,results:[],searchReturned:!0}):e.setState({lastIsError:!1,results:t,searchReturned:!0})}),p.get().then(function(t){t&&(e.templates=t.templates)}),e}return Object(h.a)(t,e),Object(u.a)(t,[{key:"getTempalteByResult",value:function(e){var t=e.namespaceId;return this.templates["template_"+t]||this.templates.default}},{key:"getResultJsx",value:function(e){var t=this.getTempalteByResult(e);return l.a.createElement(S.a,{template:t,data:e})}},{key:"render",value:function(){var e=[];if(this.state.results){for(var t=0,a=Object.keys(this.state.results);t<a.length;t++){var n=a[t],i=this.state.results[n];e.push(this.getResultJsx(i))}this.state.searchReturned&&!this.state.results.length&&e.push(l.a.createElement("div",{key:"error"},this.state.lastIsError?this.noResultsError:this.noResults))}return l.a.createElement("div",{className:"results"},e)}}]),t}(n.Component);Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));r.a.render(l.a.createElement(O,null),document.getElementById("side-bar")),r.a.render(l.a.createElement(D,null),document.getElementById("top-bar")),r.a.render(l.a.createElement(x,null),document.getElementById("results")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then(function(e){e.unregister()})}},[[33,1,2]]]);
//# sourceMappingURL=main.7327d58d.chunk.js.map