import settingsGetter from './settingsGetter';

function translate( key ){
	return new Promise( (resolve) => {
		settingsGetter.get().then(data => {
	        //console.log(data.templates, data);
	        if( data && data.translations){
	           resolve(data.translations[key]);
	        }
	        else{
	        	resolve('');
	        }
	    });
	});
}

export default translate