import EventEmitter from './EventEmitter'
import ajaxCall from './ajaxCall'
import fieldsDetector from './fieldsDetector'
import utils from './utils'
const notEqual = '!==';

class FormMain{
	static allData = {}
	static binds = []
	static addValue(name, value){
		FormMain.allData[ name ] = FormMain.allData[ name ] || [];
		let standardizeValue = FormMain.standardizeValue(value);
		//console.log(FormMain.allData[ name ], standardizeValue,"standardizeValue");
		if( !FormMain.allData[ name ].map( item => ('' + item.value)).includes( '' + standardizeValue.value ) ){
			FormMain.allData[ name ].push( standardizeValue );
			FormMain.processChange();
		}
	}
	static removeValueByKey(name, key){
		if( FormMain.allData[ name ] ){
			FormMain.allData[ name ].splice( key ,1 );
		}
		FormMain.processChange();
	}
	static removeValue(name, value){
		let ind = FormMain.allData[ name ].findIndex( item => ('' + value.value) === ('' + item.value) );
		if( ind > -1){
			FormMain.allData[ name ].splice(ind , 1)
		}
		//if no value left remove bound fields
		if(!FormMain.allData[ name ].length){
			FormMain.removeBoundFields( name );
		}
		FormMain.processChange();
	}
	static ChangeValueByKey(name, key, value){
		FormMain.allData[ name ] = FormMain.allData[ name ] || Array(key).fill(null);
		FormMain.allData[ name ][ key ] = value;
		FormMain.processChange();

	}
	static setValue(name, value){
		FormMain.allData[ name ] = value;
		FormMain.processChange();
	}
	static getValue(name){
		return FormMain.allData[ name ];
	}
	static includes(name, valueToCheck){
		return FormMain.allData[ name ] && FormMain.allData[ name ].filter( item => '' + item.value === '' + valueToCheck).length;
	}
	static processChange(){
		FormMain.removeValueByConditional();
		FormMain.fireChangeEvent();
	}
	static removeValueByConditional(){
		//console.log("FormMain.allData",FormMain.allData,FormMain.conditionals)
		Object.keys(FormMain.allData).forEach( fieldId => {
			if( FormMain.conditionals[ fieldId] ){
				
				if(FormMain.isFieldHiddenByCondition(FormMain.conditionals[ fieldId].hiddenByCondition)){
					FormMain.clearField(fieldId, true)
				}
			}
		});
	}
	static fireChangeEvent(){
		EventEmitter.emit("FormDataChanged", FormMain.getAllValuesRaw());
		delete(FormMain.offset);
		if( !FormMain.freezed && !utils.isMobile() ){
	      FormMain.delayedSubmitData();
	    }
	}
	static standardizeValue( value ){
		let returnedOutput = !('object' === typeof value && (value.value  || 0 === value.value ) ) ? {
			label: value,
			value: value
		} : value;
		return returnedOutput;
	}
	static getAllValuesRaw(){
		return FormMain.allData;
	}
	static getAllValuesProcessed(){
		let copyOfData = Object.assign({}, FormMain.allData);
		//console.log(copyOfData,"copyOfData");
		for( let dataKey of Object.keys(copyOfData)){
			if(!copyOfData[dataKey]){
				continue;
			}
			if('object' === typeof copyOfData[dataKey] && 'undefined' !== typeof copyOfData[dataKey].length){
				copyOfData[dataKey] = copyOfData[dataKey].map(val => {return val && 'undefined' != typeof val.value ?val.value: val});
			}
			if( 'string' != typeof copyOfData[dataKey] && copyOfData[dataKey].length){
				copyOfData[dataKey] = copyOfData[dataKey].join('|');
			}
		}
		return copyOfData;
	}

	static setNext( next ){
		//console.log(next,"next")
		if( next ){
			FormMain.offset = next;
			FormMain.submitData( false );
		}
	}
	static setBinds( binds ){
		FormMain.binds = binds.map( val => val.fields);
	}	
	static setInputsParams( params ){
		FormMain.inputsParams = params;
		FormMain.setConditionalDisplayFieldsFromParams( FormMain.inputsParams );
	}
	static setDefaults( params ){
		for(let paramSettingsKey in params){
			let paramSettings = params[ paramSettingsKey ];
			if( fieldsDetector.isMultiple(paramSettings) ){
				let options = utils.safeGet(paramSettings,'widget.options') || [];
				for(let option of options){
					if( option.defaultChecked ){
						let value = FormMain.getFullResultFromParams( option.value,  paramSettings.field, params);
						FormMain.addValue( paramSettings.field, value);
					}
				}
			}
		}
		FormMain.inputsParams = params;
	}
	static delayedSubmitData(){
		clearTimeout( FormMain.delayedSubmitDataTimeout );
		FormMain.delayedSubmitDataTimeout = setTimeout( function(){
			FormMain.submitData();
		}, 1500 );
	}
	static submitData( reset = true, filter = true){
		let params = this.getAllValuesProcessed();
	    //console.log(params,'params');
	    //saerch not working without search param
	    // if(!params.search){
	    // 	return;
	    // }
	    params.action = 'structuredsearchsearch';
	    if( FormMain.offset ){
	    	params.offset = FormMain.offset;
	    }
	    if(filter){
	    	params = FormMain.filterParams(params);
		}
	    let urlSuffix = utils.toQueryStr( params);
	    //console.log("urlSuffix",urlSuffix);
	    EventEmitter.emit('searchStarted', {
	    	reset:reset,
	    	params:params
	    });
	    FormMain.fireGlobalEvent( params );

	    ajaxCall.get(urlSuffix).then(data=>{
	      //console.log(data, "data");
	      let eventData = data.data.error ? { results: {error:true}} : data.data.StructuredSearchSearch;
	      eventData.reset = reset;
	      EventEmitter.emit('dataRecieved', eventData);
	    });
	}
	static fireGlobalEvent( params, name = 'StructuredSearch' ){
		var event;
		if(typeof(Event) === 'function') {
		  event = new Event( name );
		}else{
		  event = document.createEvent('Event');
		  event.initEvent( name , false, false);
		}
		event.params = params;
		document.dispatchEvent(event);
	}
	static clearField( paramKey, removeByField = null){
		let currentVal =  FormMain.allData[paramKey],
			newVal = null;
			//if('category' == paramKey)
		//console.log(paramKey,currentVal,"currentVal,pa")
		if(!currentVal){
			return false;
		}
		else if ( utils.isArray(currentVal) ) {
			newVal = [];
		}
		else if('object' == typeof currentVal){
			newVal = {};
		}
		else{
			newVal = ''
		}
		FormMain.allData[paramKey] = newVal;
		FormMain.removeBoundFields( paramKey, removeByField);
		

		return true;
	}
	static removeBoundFields( paramKey, removeByField){
		let fieldsBounds = FormMain.getBounds( paramKey );
		for(let fieldBound of fieldsBounds){
			if( fieldBound !== removeByField ){
				FormMain.clearField(fieldBound, paramKey);
			}
		}
	}
	static filterParams( params){
		for( let key of Object.keys(params)){
			let bounds = FormMain.getBounds( key ) || [];
			for(let bound of bounds ){
				if(!params[bound] || ['[]','{}'].includes(window.JSON.stringify(params[bound])) ){
					delete(params[key]);
					break;
				}
			}
		}
		return params;
	}
	static getBounds( paramKey){
		let allBound = [];
		for(let bind of FormMain.binds){
			if(bind.includes(paramKey)){
				let bindWithout = [].concat(bind);
				bindWithout.splice( bindWithout.indexOf(paramKey), 1);
				allBound = allBound.concat(bindWithout);
			}
		}
		return allBound;
	}
	static setConditionalDisplayFieldsFromParams( paramsSettings ){
		let conditionals = {};
		Object.keys(paramsSettings).forEach( fieldId => {
			let input = paramsSettings[fieldId];
			if(input.hiddenByCondition){
				conditionals[input.field] = {
					id: input.field,
					hiddenByCondition: input.hiddenByCondition
				}
			}
		});
		FormMain.conditionals = conditionals;
	}
	static getFullResultFromParams(val, fieldName, paramsSettings){
		let foundOption, options = utils.safeGet(paramsSettings, fieldName + '.widget.options');
		//console.log("paramsSettings, fieldName + '.widget.options'",paramsSettings, fieldName + '.widget.options', fieldsDetector.isMultiple(paramsSettings[fieldName]));
		if(fieldsDetector.isMultiple(paramsSettings[fieldName]) ){
			if(options){
				for(let option of options){
					if(option.value === val){
						foundOption = option;
						break;
					}
				}
			}
		}
		return foundOption ? foundOption : val;
	}
	static reset(){
		FormMain.allData = [];
	}
	static isFieldHiddenByCondition = ( condition ) =>{
		
		//no condition at all, always not hidden
		if(!condition){
			return false;
		}
		let currentData = FormMain.getAllValuesProcessed();
		let fieldToSearch = Object.keys(currentData).find( p => p.includes(':' + condition.fieldId));
		let valueToCompare = fieldToSearch && currentData[fieldToSearch] ? currentData[fieldToSearch] : null;
		if( 'string' == typeof valueToCompare){
			valueToCompare = valueToCompare.split('|');
		}
		//console.log(Object.keys(currentData),fieldToSearch,valueToCompare, condition,"valueToCompare")
		if(condition.arithmetic === notEqual){
			return !valueToCompare || !valueToCompare.length || !valueToCompare.includes(condition.compareValue);
		}
		else{
			return valueToCompare && valueToCompare.includes(condition.compareValue);
		}
	}
}




export default FormMain;