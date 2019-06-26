import queryString from 'query-string';
import FormMain from './FormMain';
import utils from './utils';

const multyFieldsTypes = [
	'select',
	'autocomplete',
	'checkboxes'
];

class historySearch{
	static setHistoryFromSearch(){
		clearTimeout( historySearch.timeout );
		historySearch.timeout = setTimeout( function(){
			historySearch.doSetHistoryFromSearch();
		}, 80 );
	}
	static doSetHistoryFromSearch(){
		if( historySearch.isFreezed ){
			return;
		}
		else{
			let state = this.getState(),
				query = utils.toQueryStr(state);
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
	static freeze(){
		historySearch.isFreezed = true;
	}
	static unfreeze(){
		historySearch.isFreezed = false;
	}
}

export default historySearch;