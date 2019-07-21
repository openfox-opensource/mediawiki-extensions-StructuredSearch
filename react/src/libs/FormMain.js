import EventEmitter from './EventEmitter'
import ajaxCall from './ajaxCall'
import fieldsDetector from './fieldsDetector'
import utils from './utils'

class FormMain{
	static allData = {}
	static binds = []
	static addValue(name, value){
		FormMain.allData[ name ] = FormMain.allData[ name ] || [];
		let standardizeValue = FormMain.standardizeValue(value);
		console.log(FormMain.allData[ name ], standardizeValue);
		if( !FormMain.allData[ name ].map( item => ('' + item.value)).includes( '' + standardizeValue.value ) ){
			FormMain.allData[ name ].push( standardizeValue );
			FormMain.fireChangeEvent();
		}
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
		FormMain.fireChangeEvent();
	}
	static ChangeValueByKey(name, key, value){
		FormMain.allData[ name ] = FormMain.allData[ name ] || Array(key).fill(null);
		FormMain.allData[ name ][ key ] = value;
		FormMain.fireChangeEvent();

	}
	static setValue(name, value){
		FormMain.allData[ name ] = value;
		FormMain.fireChangeEvent();
	}
	static getValue(name){
		return FormMain.allData[ name ];
	}
	static includes(name, valueToCheck){
		return FormMain.allData[ name ] && FormMain.allData[ name ].filter( item => '' + item.value === '' + valueToCheck).length;
	}
	static fireChangeEvent(){
		EventEmitter.emit("FormDataChanged", FormMain.getAllValuesRaw());
		delete(FormMain.offset);
		if( !FormMain.freezed && !utils.isMobile() ){
	      FormMain.delayedSubmitData();
	    }
	}
	static standardizeValue( value ){
		return !('object' === typeof value && value.value ) ? {
			label: value,
			value: value
		} : value;
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
				copyOfData[dataKey] = copyOfData[dataKey].map(val => {return 'undefined' != typeof val.value ?val.value: val});
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
	    if(!params.search){
	    	return;
	    }
	    params.action = 'fennecadvancedsearchsearch';
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
	    ajaxCall.get(urlSuffix).then(data=>{
	      //console.log(data, "data");
	      let eventData = data.data.error ? { results: {error:true}} : data.data.FennecAdvancedSearchSearch;
	      eventData.reset = reset;
	      EventEmitter.emit('dataRecieved', eventData);
	    });
	}
	static clearField( paramKey, removeByField = null){
		let currentVal =  FormMain.allData[paramKey],
			newVal = null;
			//if('category' == paramKey)
		console.log(paramKey,currentVal,"currentVal,pa")
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
			if( fieldBound != removeByField ){
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
	static getFullResultFromParams(val, fieldName, paramsSettings){
		let foundOption, options = utils.safeGet(paramsSettings, fieldName + '.widget.options');
		console.log("paramsSettings, fieldName + '.widget.options'",paramsSettings, fieldName + '.widget.options', fieldsDetector.isMultiple(paramsSettings[fieldName]));
		if(fieldsDetector.isMultiple(paramsSettings[fieldName]) ){
			if(options){
				for(let option of options){
					if(option.value == val){
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

}

export default FormMain;