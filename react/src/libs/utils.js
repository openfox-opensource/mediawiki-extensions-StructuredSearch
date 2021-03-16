class utils{

	static isMobile(){
		return window.innerWidth <= 992;
	}
	static isArray( val ){
		return 'object' === typeof val && 'undefined' !== typeof val.length;
	}
	static toQueryStr( params){
	    return Object.keys(params).sort().map(key => (params[key] ? key + '=' + params[key]: '')).filter( part => part ).join('&');
	 }
	static sortByWeight( item1, item2 ){
		let firstWeight = Number(item1.weight) || 0,
			secondWeight = Number(item2.weight) || 0,
	  		ret = firstWeight > secondWeight ? 1 : ( firstWeight < secondWeight ? -1 : 0 );
	  return ret;

	}
	
	static fixObjectToArray( maybeObject ){
		if( !utils.isArray( maybeObject ) ){
			let toArr = [];
			for(let val in maybeObject ){
				toArr.push(val);
			}
			return toArr;
		}
		else{
			return maybeObject;
		}
	}
	static safeGet( objToSearch, propsArray ){
		if('string' === typeof propsArray){
			// eslint-disable-next-line
			propsArray = propsArray.split(/[\.|\[|\]]/).filter( part => part || part === 0);
		}
  		return propsArray.reduce((xs, x) => (xs && xs[x]) ? xs[x] : null, objToSearch);
	}
	static stripHtml(str){
		let tag = document.createElement('div');
		tag.innerHTML = str;
		return tag.innerText;
	}
}


export default utils;