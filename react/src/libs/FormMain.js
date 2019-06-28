import EventEmitter from './EventEmitter'
import ajaxCall from './ajaxCall'
import utils from './utils'

class FormMain{
	static allData = {}
	static addValue(name, value){
		FormMain.allData[ name ] = FormMain.allData[ name ] || [];
		let standardizeValue = FormMain.standardizeValue(value);
		//console.log(FormMain.allData[ name ], standardizeValue);
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
	}
	static standardizeValue( value ){
		return 'string' === typeof value ? {
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

	static submitData(){
		let params = this.getAllValuesProcessed();
	    //console.log(params,'params');
	    params.action = 'fennecadvancedsearchsearch';
	    let urlSuffix = utils.toQueryStr( params);
	    ajaxCall.get(urlSuffix).then(data=>{
	      //console.log(data, "data");
	      EventEmitter.emit('dataRecieved', data.data.error ? {error:true} : data.data.FennecAdvancedSearchSearch);
	    });
	}
	static clearField( paramKey ){
		let currentVal =  FormMain.allData[paramKey],
			newVal = null;
			if('category' == paramKey)
		
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
		return true;
	}

}

export default FormMain;