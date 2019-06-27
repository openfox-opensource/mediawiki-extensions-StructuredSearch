import queryString from 'query-string';
import FormMain from './FormMain';
import utils from './utils';

const multyFieldsTypes = [
	'select',
	'autocomplete',
	'checkboxes'
];

class historySearch{
	static setHistoryFromSearch( paramsSettings){
		clearTimeout( historySearch.timeout );
		historySearch.timeout = setTimeout( function(){
			historySearch.doSetHistoryFromSearch( paramsSettings );
		}, 80 );
	}
	static doSetHistoryFromSearch( paramsSettings ){
		if( historySearch.isFreezed ){
			return;
		}
		else{
			let state = this.getState(),
				query = utils.toQueryStr(state);
			if( historySearch.isSearchEquleToDefault( paramsSettings, state ) ){
				return;
			}
			//console.log(state, query);
			if( historySearch.lastQuery != query){
				historySearch.lastQuery = query;
				window.history.pushState(state, '', window.location.pathname + '?' + query)
			}
		}
	}
	static setSearchFromHistory( paramsSettings ){
		let searchParams = queryString.parse(window.location.search);
		//console.log(paramsSettings, "paramsSettings")
		for( let paramKey in searchParams){
			let paramValue = searchParams[ paramKey ];
			if( 'advanced_search' === paramKey){
					paramKey = 'search';
				}
			if( multyFieldsTypes.includes( paramsSettings[paramKey].widget.type ) ){
				let paramValueSplitted = paramValue.split('|');
				for(let part of paramValueSplitted){
					FormMain.addValue(paramKey, part);
				}
			}
			else{
				
				FormMain.setValue(paramKey, paramValue);
			}

		}
		if( !historySearch.isSearchEquleToDefault(paramsSettings, searchParams) ){
			FormMain.submitData();
		}
		//console.log();
	}
	static getState(){
		let state = FormMain.getAllValuesProcessed();
		return this.fixState( state );
	}
	static fixState( state ){
		if(state.search){
			state.advanced_search = state.search;
			delete( state.search );
		}
		return state;
	}
	static getDefaultSearch( paramsSettings ){
		let defaultValues = {};
		for(let paramKey in paramsSettings){
			let  defaults = [],
				paramsSettingsPart = paramsSettings[ paramKey ];
			if( paramsSettingsPart.widget && paramsSettingsPart.widget.options){
				for(let option of paramsSettingsPart.widget.options){
					if(option.defaultChecked){
						defaults.push(option.value);
					}
				}
			}
			if( defaults.length){
				defaultValues[paramKey] = defaults.join('|');
			}
		}
		return defaultValues;
	}
	static isSearchEquleToDefault( paramsSettings, search ){
		let defaultSearch = historySearch.getDefaultSearch( paramsSettings );
		console.log(historySearch.fixQueryStr(utils.toQueryStr(defaultSearch)),  historySearch.fixQueryStr(utils.toQueryStr(search)),"historySearch.fixQueryStr(utils.toQueryStr(defaultSearch)) ===  historySearch.fixQueryStr(utils.toQueryStr(search));");
		return historySearch.fixQueryStr(utils.toQueryStr(defaultSearch)) ===  historySearch.fixQueryStr(utils.toQueryStr(search));
	}
	static fixQueryStr( str ){
		return str.replace('advanced_search=','search=');
	}
	static freeze(){
		historySearch.isFreezed = true;
	}
	static unfreeze(){
		historySearch.isFreezed = false;
	}
}

export default historySearch;