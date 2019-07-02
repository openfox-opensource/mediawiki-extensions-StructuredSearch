import queryString from 'query-string';
import FormMain from './FormMain';
import utils from './utils';
import fieldsDetector from './fieldsDetector';



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
				query = utils.toQueryStr( FormMain.filterParams( state) );
			if( historySearch.isSearchEquleToDefault( paramsSettings, state ) ){
				query = '';
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
		if( !window.location.search){
			return;
		}
		//if no NS we need to add or no results would given
		if( !searchParams.namespace ){
			searchParams.namespace = historySearch.getDefaultSearch( paramsSettings, 'namespace');
		}
		for( let paramKey in searchParams){
			let paramValue = searchParams[ paramKey ];
			if( paramValue === ''){
				delete( searchParams[paramKey] );
				continue;
			}
			if( 'advanced_search' === paramKey){
					paramKey = 'search';
			} 
			if( fieldsDetector.isMultiple( paramsSettings[paramKey] ) ){
				let paramValueSplitted = paramValue.split('|');
				for(let part of paramValueSplitted){
					if( fieldsDetector.isRange( paramsSettings[paramKey] ) ){
						FormMain.setValue(paramKey, paramValueSplitted);
					}
					else{
						FormMain.addValue(paramKey, part);
					}
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
	static getDefaultSearch( paramsSettings, paramKeyToGet ){
		let defaultValues = {};
		for(let paramKey in paramsSettings){
			//just one param - 
			if(paramKeyToGet && paramKeyToGet != paramKey){
				continue;
			}
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
		return paramKeyToGet ? defaultValues[paramKeyToGet] :  defaultValues;
	}
	static isSearchEquleToDefault( paramsSettings, search ){
		let defaultSearch = historySearch.getDefaultSearch( paramsSettings );
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