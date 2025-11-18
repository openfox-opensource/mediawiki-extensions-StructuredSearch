import ajaxCall from './ajaxCall';
import utils from './utils';
console.log("settingsGetter.js loaded");
class settingsGetter{
	static fixData( data ){
		for( let fieldName of Object.keys(data.params)){
			if(data.params[fieldName].widget && data.params[fieldName].widget.options){
				data.params[fieldName].widget.options = utils.fixObjectToArray(data.params[fieldName].widget.options);
			}
		}
		return data;
		//console.log("data",data);
	}
	static get(){
		return new Promise( (resolve) => {
			let allSettings
			if(window.mw && window.mw.config){
				allSettings = window.mw.config.get('structuredSearchSettings');
				resolve( settingsGetter.fixData(allSettings) );
			}
			else{
				//wait for mw.config to be ready
				setInterval(function(){
					if(window.mw && window.mw.config){
						allSettings = window.mw.config.get('structuredSearchSettings');
						clearInterval(this);
						if(allSettings){
							resolve( settingsGetter.fixData(allSettings) );
						}
						else{
							if(!settingsGetter.onCall){
								settingsGetter.getFromRemote().then(data => {
									settingsGetter.data = settingsGetter.fixData(data);
									console.log("settingsGetter.data",settingsGetter.data);
									resolve(settingsGetter.data)
								});
							}
							else{
								settingsGetter.waitForResponse().then( data => resolve(data));
							}
						}
					}
				},100);
			}
			
			
			
			
			
		});
	}
	static getFromRemote(){
		return new Promise( (resolve) => {
			settingsGetter.onCall = true;
			ajaxCall.get('action=structuredsearchparams').then(data => {
				settingsGetter.onCall = false;
				console.log('[settingsGetter] API response data:', data);
				if (data && data.params) {
					console.log('[settingsGetter] Params keys:', Object.keys(data.params));
					console.log('[settingsGetter] Params with topbar position:', 
						Object.keys(data.params).filter(key => 
							data.params[key]?.widget?.position === 'topbar'
						)
					);
					Object.keys(data.params).forEach(key => {
						if (data.params[key]?.widget?.position === 'topbar') {
							console.log(`[settingsGetter] Topbar field "${key}":`, data.params[key]);
						}
					});
				}
				resolve( data ? data : null );
			});

		});
	}
	static waitForResponse(){
		return new Promise( (resolve) => {
			let waitForData = setInterval(function(){
				if(settingsGetter.data ){
					clearInterval(waitForData);
					resolve(settingsGetter.data);
				}
			},200);
		});
	}
}

export default settingsGetter;