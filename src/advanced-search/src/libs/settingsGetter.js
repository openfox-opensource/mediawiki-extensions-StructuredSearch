import axios  from 'axios';


class settingsGetter{
	static get(){
		let apiUrl = window.mw && window.mw.config ? 
			window.mw.config.get('wgServer') + '/' + window.mw.config.get('wgScriptPath') : 
			window.localStorage.getItem('apiUrl');
		apiUrl += 'api.php?action=fennecadvancedsearch&format=json';
		return new Promise( (resolve) => {
			axios.get( apiUrl ).then( data => {
				window.console.log(data, 'data');
				resolve(data ? data.data.FennecAdvancedSearch : null);
			});
		});
	}
}

export default settingsGetter;