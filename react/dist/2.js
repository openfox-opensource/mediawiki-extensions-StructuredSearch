(window.webpackJsonp=window.webpackJsonp||[]).push([[0],{25:function(e,t,a){},33:function(e,t,a){e.exports=a(71)},38:function(e,t,a){},71:function(e,t,a){"use strict";a.r(t);var n=a(0),i=a.n(n),l=a(6),r=a.n(l),s=(a(38),a(2)),o=a(3),u=a(8),c=a(7),h=a(9),d=a(13),f=a.n(d),v=function(){function e(){Object(s.a)(this,e)}return Object(o.a)(e,null,[{key:"get",value:function(t,a){return new Promise(function(n){e.getUrl(a).then(function(e){f.a.get(e+t).then(function(e){return n(e)})})})}},{key:"post",value:function(t,a,n){return new Promise(function(i){e.getUrl(n).then(function(e){f.a.post(e+t,a).then(function(e){return i(e)})})})}},{key:"addApiEndpoint",value:function(e){return e?"":"api.php?format=json&"}},{key:"getUrl",value:function(t){return new Promise(function(a){if(window.document.body.classList.contains("mediawiki"))var n=setInterval(function(){window.mw&&window.mw.config&&(clearInterval(n),a(window.mw.config.get("wgServer")+window.mw.config.get("wgScriptPath")+"/"+e.addApiEndpoint(t)))},100);else a(window.localStorage.getItem("apiUrl")+e.addApiEndpoint(t))})}}]),e}(),p=function(){function e(){Object(s.a)(this,e)}return Object(o.a)(e,null,[{key:"get",value:function(){return new Promise(function(t){e.onCall?e.waitForResponse().then(function(e){return t(e)}):e.getFromRemote().then(function(a){e.data=a,t(e.data)})})}},{key:"getFromRemote",value:function(){return new Promise(function(t){e.onCall=!0,v.get("action=fennecadvancedsearchparams").then(function(a){e.onCall=!1,t(a?a.data:null)})})}},{key:"waitForResponse",value:function(){return new Promise(function(t){var a=setInterval(function(){e.data&&(clearInterval(a),t(e.data))},200)})}}]),e}(),m=new(function(){function e(){Object(s.a)(this,e),this.events={}}return Object(o.a)(e,[{key:"on",value:function(e,t){this.events[e]||(this.events[e]={listeners:[]}),this.events[e].listeners.push(t)}},{key:"off",value:function(e){delete this.events[e]}},{key:"emit",value:function(e){for(var t=arguments.length,a=new Array(t>1?t-1:0),n=1;n<t;n++)a[n-1]=arguments[n];var i=!0,l=!1,r=void 0;try{for(var s,o=this.events[e].listeners[Symbol.iterator]();!(i=(s=o.next()).done);i=!0){s.value.apply(this,a)}}catch(u){l=!0,r=u}finally{try{i||null==o.return||o.return()}finally{if(l)throw r}}}}]),e}()),y=function(){function e(){Object(s.a)(this,e)}return Object(o.a)(e,null,[{key:"addValue",value:function(t,a){e.allData[t]=e.allData[t]||[],e.allData[t].push(e.standardizeValue(a)),console.log("FormMain.allData",e.allData),e.fireChangeEvent()}},{key:"removeValue",value:function(t,a){var n=e.allData[t].findIndex(function(e){return a.value===e.value});n>-1&&e.allData[t].splice(n,1),e.fireChangeEvent()}},{key:"ChangeValueByKey",value:function(t,a,n){e.allData[t]=e.allData[t]||Array(a).fill(null),e.allData[t][a]=n}},{key:"setValue",value:function(t,a){e.allData[t]=a,e.fireChangeEvent()}},{key:"fireChangeEvent",value:function(){m.emit("FormDataChanged",e.getAllValuesRaw())}},{key:"standardizeValue",value:function(e){return"string"===typeof e?{label:e,value:e}:e}},{key:"getAllValuesRaw",value:function(){return e.allData}},{key:"getAllValuesProcessed",value:function(){for(var t=Object.assign({},e.allData),a=0,n=Object.keys(t);a<n.length;a++){var i=n[a];"object"===typeof t[i]&&"undefined"!==typeof t[i].length&&(t[i]=t[i].map(function(e){return"undefine"!=typeof e.value?e.value:e})),"string"!=typeof t[i]&&t[i].length&&(t[i]=t[i].join("|"))}return t}}]),e}();y.allData={};var g=y;var b=function(e){return new Promise(function(t){p.get().then(function(a){a&&a.translations?t(a.translations[e]):t("")})})},k=a(32),w=a(26),C=a.n(w),E=function(e){function t(e){var a;Object(s.a)(this,t),a=Object(u.a)(this,Object(c.a)(t).call(this,e));var n=e.inputData.widget.options||[];return n=a.extractOptions(n),a.state={inputData:e.inputData,filteredOptions:n,options:n,typed:""},a}return Object(h.a)(t,e),Object(o.a)(t,[{key:"componentDidMount",value:function(){for(var e=this,t=function(){var t=n[a];b(t).then(function(a){var n={};n[t]=a,e.setState(n)})},a=0,n=["fennecadvancedsearch-to-label","fennecadvancedsearch-from-label"];a<n.length;a++)t();var i=!0,l=!1,r=void 0;try{for(var s,o=this.state.options[Symbol.iterator]();!(i=(s=o.next()).done);i=!0){var u=s.value;u.defaultChecked&&(console.log("in",this.state.inputData.field),g.addValue(this.state.inputData.field,u))}}catch(c){l=!0,r=c}finally{try{i||null==o.return||o.return()}finally{if(l)throw r}}}},{key:"extractOptions",value:function(e){var t=[],a=!0,n=!1,i=void 0;try{for(var l,r=e[Symbol.iterator]();!(a=(l=r.next()).done);a=!0){var s=l.value;"string"==typeof s?t.push({value:s,label:s}):t.push(s)}}catch(o){n=!0,i=o}finally{try{a||null==r.return||r.return()}finally{if(n)throw i}}return t}},{key:"valueChanged",value:function(e,t){g.setValue(e,t)}},{key:"checkboxChanges",value:function(e,t,a){a.target.checked?g.addValue(e,t):g.removeValue(e,t)}},{key:"autocompleteChanged",value:function(e,t){var a=this;this.setState({typed:t}),this.state.options.length?this.setState({filteredOptions:this.state.options.filter(function(e){return!t||e.label.indexOf(t)>-1})}):this.isSearchAutomplete()?this.searchAutocomplete(t):v.get("action=fennecadvancedsearchautocomplete&field=".concat(this.state.inputData.field,"&search=").concat(t)).then(function(e){if(e.data.values){for(var t=[],n=e.data.values,i=0,l=Object.keys(n);i<l.length;i++){var r=l[i];t.push({label:n[r],value:r})}a.setState({filteredOptions:t})}})}},{key:"searchAutocomplete",value:function(e){var t=g.getAllValuesProcessed().namespace;v.get("action=opensearch&formatversion=2&search=".concat(e,"&namespace=").concat(t,"&limit=10&suggest=true")).then(function(e){e.data;for(var t=e.data[1],a=e.data[3],n=[],i=0;i<t.length;i++)n.push({label:t[i],value:a[i],href:a[i]});console.log(e,"namespaces")})}},{key:"autocompleteSelected",value:function(e,t,a){this.isSearchAutomplete()?window.location.href=a.value:(g.addValue(e,a),this.setState({typed:""}))}},{key:"isSearchAutomplete",value:function(){return"search"===this.state.inputData.field}},{key:"selectChanged",value:function(e,t){this.setState({selected:t}),this.valueChanged(e,t.value)}},{key:"rangeChanges",value:function(e,t,a){g.ChangeValueByKey(e,t,a.target.value)}},{key:"inputChanges",value:function(e,t){this.valueChanged(e,t.target.value)}},{key:"radioChanges",value:function(e,t,a){this.valueChanged(e,t)}},{key:"getInputHtml",value:function(){if(this.state.inputData&&Object.keys(this.state.inputData).length){var e=this.state.inputData,t=this.getLabel(e),a="field-wrp field-wrp-type-"+e.widget.type+" field-wrp-name-"+e.field,n="";switch(e.widget.type){case"text":case"select":case"checkboxes":case"autocomplete":case"radios":case"range":n=this[e.widget.type+"Build"](this.state.inputData)}return i.a.createElement("div",{className:a},t,":",n)}return""}},{key:"showAdvanced",value:function(){this.setState({showAdvanced:!this.state.showAdvanced})}},{key:"checkboxesBuild",value:function(e){var t=[],a=[],n="main-and-advanced-wrp"+(this.state.showAdvanced?" opened":""),l=!0,r=!1,s=void 0;try{for(var o,u=e.widget.options[Symbol.iterator]();!(l=(o=u.next()).done);l=!0){var c=o.value,h=i.a.createElement("span",{key:e.field+"-"+c.value,className:"checkbox-wrp"},i.a.createElement("input",{type:"checkbox",value:"{option.value}",defaultChecked:c.defaultChecked,onChange:this.checkboxChanges.bind(this,e.field,c)}),i.a.createElement("span",{className:"checkbox-label"},c.label));"advanced"===c.show?a.push(h):"disable"!==c.show&&t.push(h)}}catch(d){r=!0,s=d}finally{try{l||null==u.return||u.return()}finally{if(r)throw s}}return i.a.createElement("div",{className:n},i.a.createElement("div",{className:"main"},t),i.a.createElement("button",{onClick:this.showAdvanced.bind(this)},"More "),i.a.createElement("div",{className:"advanced"},a))}},{key:"radiosBuild",value:function(e){var t=[],a=!0,n=!1,l=void 0;try{for(var r,s=e.widget.options[Symbol.iterator]();!(a=(r=s.next()).done);a=!0){var o=r.value;t.push(i.a.createElement("span",{key:e.field+"-"+o.value,className:"checkbox-wrp"},i.a.createElement("input",{name:e.field,type:"radio",value:"{option.value}",onChange:this.radioChanges.bind(this,e.field,o)}),i.a.createElement("span",{className:"radio-label"},o.label)))}}catch(u){n=!0,l=u}finally{try{a||null==s.return||s.return()}finally{if(n)throw l}}return t}},{key:"selectBuild",value:function(e){var t=this.extractOptions(e.widget.options);return this.state.selected||this.setState({selected:t[0].value}),i.a.createElement(k.a,{className:"select select-"+e.field,value:this.state.selected,onChange:this.selectChanged.bind(this,e.field),options:t})}},{key:"rangeBuild",value:function(e){var t=this.state["fennecadvancedsearch-from-label"],a=this.state["fennecadvancedsearch-to-label"];return i.a.createElement("span",null,i.a.createElement("span",null,t),i.a.createElement("input",{type:"text",className:"range-input range-input-from",name:e.field,onChange:this.rangeChanges.bind(this,e.field,0)}),i.a.createElement("span",null,a),i.a.createElement("input",{type:"text",className:"range-input range-input-to",name:e.field,onChange:this.rangeChanges.bind(this,e.field,1)}))}},{key:"textBuild",value:function(e){return i.a.createElement("input",{type:"text",name:e.field,onChange:this.inputChanges.bind(this,e.field)})}},{key:"autocompleteBuild",value:function(e){return i.a.createElement(C.a,{getItemValue:function(e){return e.label},menuStyle:{position:"absolute"},items:this.state.filteredOptions,renderItem:this.autocompleteRender.bind(this),value:this.state.typed,onChange:this.autocompleteChanged.bind(this),onSelect:this.autocompleteSelected.bind(this,e.field)})}},{key:"autocompleteRender",value:function(e,t){var a=this.isSearchAutomplete()?i.a.createElement("a",{href:e.href},e.label):e.label;return i.a.createElement("div",{style:{background:t?"lightgray":"white"}},a)}},{key:"getLabel",value:function(e){return i.a.createElement("label",{htmlFor:e.field},e.label," ")}},{key:"render",value:function(){var e=this.getInputHtml();return i.a.createElement("div",{className:"form-input"},e)}}]),t}(n.Component),O=a(30),j=a.n(O);a(25);window.mw||(window.mw={message:function(e){return e}});var S=function(e){function t(){var e;return Object(s.a)(this,t),(e=Object(u.a)(this,Object(c.a)(t).call(this))).state={data:[],dataJsoned:"ss"},m.on("dataRecieved",function(t){return e.setState({results:t})}),e}return Object(h.a)(t,e),Object(o.a)(t,[{key:"componentDidMount",value:function(){var e=this;p.get().then(function(t){t&&(e.setState({inputs:t.params}),e.templates=t.templates)})}},{key:"getTempalteByResult",value:function(e){var t=e.namespaceId;return this.templates["template_"+t]||this.templates.default}},{key:"getResultJsx",value:function(e){var t=this.getTempalteByResult(e);return i.a.createElement(j.a,{template:t,data:e})}},{key:"render",value:function(){var e=[],t=[];if(this.state.inputs)for(var a=0,n=Object.keys(this.state.inputs);a<n.length;a++){var l=n[a];"topbar"!==this.state.inputs[l].widget.position&&e.push(i.a.createElement(E,{key:l,inputData:this.state.inputs[l]}))}if(this.state.results)for(var r=0,s=Object.keys(this.state.results);r<s.length;r++){var o=s[r],u=this.state.results[o];t.push(this.getResultJsx(u))}return i.a.createElement("div",{className:"App"},i.a.createElement("div",{className:"side-bar"},e),i.a.createElement("div",{className:"results"},t))}}]),t}(n.Component),D=function(e){function t(){var e;return Object(s.a)(this,t),(e=Object(u.a)(this,Object(c.a)(t).call(this))).state={labels:[]},m.on("FormDataChanged",function(t){for(var a=[],n=0,i=Object.keys(t);n<i.length;n++){var l=i[n];if(t[l]&&e.state.inputs&&e.state.inputs[l]&&("autocomplete"===e.state.inputs[l].widget.type||e.state.inputs[l].withLabels)){var r=!0,s=!1,o=void 0;try{for(var u,c=t[l][Symbol.iterator]();!(r=(u=c.next()).done);r=!0){var h=u.value;a.push({label:h.label,value:h.value,field:l})}}catch(d){s=!0,o=d}finally{try{r||null==c.return||c.return()}finally{if(s)throw o}}}}e.setState({labels:a})}),e}return Object(h.a)(t,e),Object(o.a)(t,[{key:"componentDidMount",value:function(){var e=this;p.get().then(function(t){t&&e.setState({inputs:t.params,labels:[]})})}},{key:"removeLabel",value:function(e,t){g.removeValue(e,t)}},{key:"toQueryStr",value:function(e){return Object.keys(e).map(function(t){return t+"="+e[t]}).join("&")}},{key:"submitClicked",value:function(){var e=g.getAllValuesProcessed();e.action="fennecadvancedsearchsearch";var t=this.toQueryStr(e);v.get(t).then(function(e){m.emit("dataRecieved",e.data.FennecAdvancedSearchSearch)})}},{key:"render",value:function(){var e=[],t=[];if(this.state.inputs)for(var a=0,n=Object.keys(this.state.inputs);a<n.length;a++){var l=n[a];"topbar"===this.state.inputs[l].widget.position&&e.push(i.a.createElement(E,{key:l,inputData:this.state.inputs[l]}))}if(this.state.labels){var r=!0,s=!1,o=void 0;try{for(var u,c=this.state.labels[Symbol.iterator]();!(r=(u=c.next()).done);r=!0){var h=u.value;t.push(i.a.createElement("span",{key:h.field+":"+h.value,className:"label-wrp"},h.label,i.a.createElement("button",{type:"button",className:"label-remove",onClick:this.removeLabel.bind(this,h.field,h)},"X")))}}catch(d){s=!0,o=d}finally{try{r||null==c.return||c.return()}finally{if(s)throw o}}}return i.a.createElement("div",{className:"TopBar"},i.a.createElement("header",{className:"App-header"},t,e),i.a.createElement("button",{type:"button",onClick:this.submitClicked.bind(this)},"\u05d7\u05e4\u05e9"))}}]),t}(n.Component);Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));r.a.render(i.a.createElement(S,null),document.getElementById("root")),r.a.render(i.a.createElement(D,null),document.getElementById("top-bar")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then(function(e){e.unregister()})}},[[33,1,2]]]);
//# sourceMappingURL=main.7994f253.chunk.js.map