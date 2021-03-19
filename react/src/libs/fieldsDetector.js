 const multyFieldsTypes = [
	'select',
	'autocomplete',
	'checkboxes',
	'range'
];

class fieldsDetector{
	static isRange( fieldDef ){
		return ['range','dateRange'].includes( fieldDef.widget.type );
	}
	static isMultiple( fieldDef ){
		return multyFieldsTypes.includes( fieldDef.widget.type )
	}
	static isSearchOrNs( fieldDef ){
		return fieldsDetector.isSearch(fieldDef) || fieldsDetector.isNs(fieldDef);
	}
	static isSearch( fieldDef ){
		return 'search' === fieldDef.field;
	}
	static isNs( fieldDef ){
		return 'namespace' === fieldDef.field;
	}
}

export default fieldsDetector;