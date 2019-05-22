class FormMain{
	static allData = {}
	static addValue(name, value){
		FormMain.allData[ name ] = FormMain.allData[ name ] || [];
		FormMain.allData[ name ].push( value );
	}
	static removeValue(name, value){
		let ind = FormMain.allData[ name ].indexOf(value);
		if( ind > -1){
			FormMain.allData[ name ].splice(ind , 1)
		}
	}
	static setValue(name, value){
		FormMain.allData[ name ] = value;
	}
	static getAllValues(){
		return FormMain.allData;
	}

}

export default FormMain;