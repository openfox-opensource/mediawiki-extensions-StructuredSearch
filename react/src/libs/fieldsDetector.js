 const multyFieldsTypes = [
	'select',
	'autocomplete',
	'checkboxes',
	'range'
];

class fieldsDetector{
	static isRange( fieldDef ){
		return 'range' === fieldDef.widget.type;
	}
	static isMultiple( fieldDef ){
		return multyFieldsTypes.includes( fieldDef.widget.type )
	}
	static isSearch( fieldDef ){
		return 'search' === fieldDef.field;
;	}
}

export default fieldsDetector;