import queryString from 'query-string';
import FormMain from './FormMain';
import utils from './utils';
import fieldsDetector from './fieldsDetector';


window.FormMain=FormMain;
class historySearch{
	static setHistoryFromSearch( paramsSettings){
		clearTimeout( historySearch.timeout );
		historySearch.timeout = setTimeout( function(){
			historySearch.doSetHistoryFromSearch( paramsSettings );
		}, 80 );
	}
	static doSetHistoryFromSearch( paramsSettings ){
		if('undefined' === typeof window.mw || 'undefined' === typeof window.mw.Title){
			setTimeout( function(){
				historySearch.doSetHistoryFromSearch( paramsSettings );
			}, 100 );
			return;
		}
		if( historySearch.isFreezed ){
			return;
		}
		else{
			let state = this.getState(),
				searchParamsFromLocation = queryString.parse(window.location.search),
				pathname = window.location.pathname;

			//for case of index.php?title=special:advanced_search
			if(searchParamsFromLocation.title){
				pathname = (new window.mw.Title('special:advanced_search')).getUrl();
				pathname += searchParamsFromLocation.title;
			}
			let query = utils.toQueryStr( FormMain.filterParams( state) );
			if( historySearch.isSearchEquleToDefault( paramsSettings, state ) ){
				query = '';
			}
			if(query){
				if(searchParamsFromLocation.debug){
					state.debug = searchParamsFromLocation.debug;
				}
				query = utils.toQueryStr( FormMain.filterParams( state) );
			}
			if( historySearch.lastQuery !== query){
				historySearch.lastQuery = query;
				window.history.pushState(state, '',  pathname + '?' + query)
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
		FormMain.freezed = true;
		for( let paramKey in searchParams){
			let paramValue = searchParams[ paramKey ];
			if( 'advanced_search' === paramKey){
					paramKey = 'search';
			}
			if( paramValue === '' || !paramsSettings[paramKey]){
				delete( searchParams[paramKey] );
				continue;
			}
			if( fieldsDetector.isMultiple( paramsSettings[paramKey] ) ){
				let paramValueSplitted = paramValue ? paramValue.split('|').filter( part => (part || 0 === part)) : [];
				//console.log(paramValueSplitted)
				if( fieldsDetector.isRange( paramsSettings[paramKey] ) ){
					FormMain.setValue(paramKey, paramValueSplitted);
				}
				else{
					for(let part of paramValueSplitted){
						part = FormMain.getFullResultFromParams( part,  paramKey, paramsSettings);
						FormMain.addValue(paramKey, part);
					}
				}
			}
			else{	
				FormMain.setValue(paramKey, paramValue);
			}

		}
		FormMain.freezed = false;
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
			if(paramKeyToGet && paramKeyToGet !== paramKey){
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
		return str.replace('advanced_search=','search=').replace(/title=.+(&|$)/,'');
	}
	static freeze(){
		historySearch.isFreezed = true;
	}
	static unfreeze(){
		historySearch.isFreezed = false;
	}
}

export default historySearch;