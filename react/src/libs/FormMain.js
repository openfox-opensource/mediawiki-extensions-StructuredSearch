import EventEmitter from './EventEmitter'

class FormMain{
	static allData = {}
	static addValue(name, value){
		FormMain.allData[ name ] = FormMain.allData[ name ] || [];
		FormMain.allData[ name ].push( FormMain.standardizeValue(value) );
		FormMain.fireChangeEvent();
	}
	static removeValue(name, value){
		let ind = FormMain.allData[ name ].findIndex( item => value == item.value);
		if( ind > -1){
			FormMain.allData[ name ].splice(ind , 1)
		}
		FormMain.fireChangeEvent();
	}
	static setValue(name, value){
		FormMain.allData[ name ] = value;
		FormMain.fireChangeEvent();
	}
	static fireChangeEvent(){
		EventEmitter.emit("FormDataChanged", FormMain.getAllValues());
	}
	static standardizeValue( value ){
		return 'string' === typeof value ? {
			label: value,
			value: value
		} : value;
	}
	static getAllValues(){
		return FormMain.allData;
	}

}

export default FormMain;