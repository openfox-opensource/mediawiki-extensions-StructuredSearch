 const multyFieldsTypes = [
	'select',
	'autocomplete',
	'checkboxes'
];

class fieldsDetector{
	static isMultiple( fieldDef ){
		return multyFieldsTypes.includes( fieldDef.widget.type )
	}
	static isSearch( fieldDef ){
		return 'search' === fieldDef.field;
;	}
}

export default fieldsDetector;