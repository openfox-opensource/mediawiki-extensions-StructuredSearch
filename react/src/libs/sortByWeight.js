export default function( item1, item2 ){
	let firstWeight = item1.weight || 0,
		secondWeight = item2.weight || 0;
  let ret = firstWeight > secondWeight ? 1 : ( firstWeight < secondWeight ? -1 : 0 );
  return ret;

}