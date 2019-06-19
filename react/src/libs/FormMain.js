import EventEmitter from './EventEmitter'
import ajaxCall from './ajaxCall'

class FormMain{
	static allData = {}
	static addValue(name, value){
		FormMain.allData[ name ] = FormMain.allData[ name ] || [];
		FormMain.allData[ name ].push( FormMain.standardizeValue(value) );
		FormMain.fireChangeEvent();
	}
	static removeValue(name, value){
		let ind = FormMain.allData[ name ].findIndex( item => value.value === item.value);
		if( ind > -1){
			FormMain.allData[ name ].splice(ind , 1)
		}
		FormMain.fireChangeEvent();
	}
	static ChangeValueByKey(name, key, value){
		FormMain.allData[ name ] = FormMain.allData[ name ] || Array(key).fill(null);
		FormMain.allData[ name ][ key ] = value;
	}
	static setValue(name, value){
		FormMain.allData[ name ] = value;
		FormMain.fireChangeEvent();
	}
	static getValue(name){
		return FormMain.allData[ name ];
	}
	static includes(name, valueToCheck){
		return FormMain.allData[ name ] && FormMain.allData[ name ].filter( item => item.value === valueToCheck).length;
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
		for( let dataKey of Object.keys(copyOfData)){
			if('object' === typeof copyOfData[dataKey] && 'undefined' !== typeof copyOfData[dataKey].length){
				copyOfData[dataKey] = copyOfData[dataKey].map(val => {return 'undefined' != typeof val.value ?val.value: val});
			}
			if( 'string' != typeof copyOfData[dataKey] && copyOfData[dataKey].length){
				copyOfData[dataKey] = copyOfData[dataKey].join('|');
			}
		}
		return copyOfData;
	}
	static toQueryStr( params ){
	    return Object.keys(params).map(key => key + '=' + params[key]).join('&');
	  }
	static submitData(){
		let params = this.getAllValuesProcessed();
	    //console.log(params,'params');
	    params.action = 'fennecadvancedsearchsearch';
	    let urlSuffix = this.toQueryStr( params);
	    ajaxCall.get(urlSuffix).then(data=>{
	      console.log(data, "data");
	      EventEmitter.emit('dataRecieved', data.data.error ? {error:true} : data.data.FennecAdvancedSearchSearch);
	    });
	}

}

export default FormMain;