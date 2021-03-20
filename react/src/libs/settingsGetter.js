import ajaxCall from './ajaxCall';
import utils from './utils';

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
			if(!settingsGetter.onCall){
					settingsGetter.getFromRemote().then(data => {
						settingsGetter.data = settingsGetter.fixData(data);
						resolve(settingsGetter.data)
					});
			}
			else{
				settingsGetter.waitForResponse().then( data => resolve(data));
			}
		});
	}
	static getFromRemote(){
		return new Promise( (resolve) => {
			settingsGetter.onCall = true;
			ajaxCall.get('action=structuredsearchparams').then(data => {
				settingsGetter.onCall = false;
				resolve( data ? data.data : null );
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