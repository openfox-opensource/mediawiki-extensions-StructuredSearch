class utils{

	static isArray( val ){
		return 'object' === typeof val && 'undefined' !== typeof val;
	}
	static toQueryStr( params ){
	    return Object.keys(params).sort().map(key => (params[key] ? key + '=' + params[key]: '')).filter( part => part ).join('&');
	 }
	static sortByWeight( item1, item2 ){
		let firstWeight = item1.weight || 0,
			secondWeight = item2.weight || 0,
	  		ret = firstWeight > secondWeight ? 1 : ( firstWeight < secondWeight ? -1 : 0 );
	  return ret;

	}
	static stripHtml(str){
		let tag = document.createElement('div');
		tag.innerHTML = str;
		return tag.innerText;
	}
}


export default utils;