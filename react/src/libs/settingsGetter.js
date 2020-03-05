import ajaxCall from './ajaxCall';

class settingsGetter{
	static get(){
		return new Promise( (resolve) => {
			if(!settingsGetter.onCall){
					settingsGetter.getFromRemote().then(data => {
						settingsGetter.data = data;
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