
class ajaxCall{
	static get( urlSuffix, dontAddApi ){
		return new Promise( (resolve) => {
			ajaxCall.getUrl(dontAddApi).then( urlPrefix =>{
				fetch(urlPrefix + urlSuffix)
					.then(response => response.json())
					.then(data => resolve(data));
			});
		});
	}
	static post(urlSuffix, postBody, dontAddApi){
		return new Promise( (resolve) => {
			ajaxCall.getUrl(dontAddApi).then( urlPrefix =>{
				fetch(urlPrefix + urlSuffix, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify(postBody)
				})
				.then(response => response.json())
				.then(data => resolve(data));
			});
		});
	}
	static addApiEndpoint(dontAddApi){
		return dontAddApi ? '': 'api.php?format=json&';
	}
	static getUrl(dontAddApi){
		return new Promise( (resolve) => {
			if(window.document.body.classList.contains('mediawiki')){
				let waitForMw = setInterval( function(){
					if(window.mw && window.mw.config && window.mw.config.get('wgScriptPath')){
						clearInterval( waitForMw );
						resolve( window.mw.config.get('wgServer') + window.mw.config.get('wgScriptPath') + '/' + ajaxCall.addApiEndpoint(dontAddApi) );
					}
				},100);
			}
			else{
				resolve( window.localStorage.getItem('apiUrl') + ajaxCall.addApiEndpoint(dontAddApi));

			}
		});
	}
}

export default ajaxCall;