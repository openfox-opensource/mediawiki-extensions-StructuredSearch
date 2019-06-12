<?php

namespace MediaWiki\Extension\FennecAdvancedSearch; 

class Utils{
	static public function categoryAutocomplete( $term ){
		$conf = \MediaWiki\MediaWikiServices::getInstance()->getMainConfig();
		$categoryInclude = $conf->get('FennecAdvancedSearchCategoryInclude');
		return  $categoryInclude ? self::preccessDefaultCategories( $categoryInclude ) : self::getCategiresFromDb($term);
	}
	static public function cargoAutocomplete( $term, $fieldName ){
		$dbrCargo = \CargoUtils::getDB();
		$splitted = preg_split('/:/', $fieldName);
		$tableName = $splitted[0];
		$columnName = $splitted[1];
		$res = $dbrCargo->select($tableName,[
						'DISTINCT(' . $columnName . '__full) as val'
		]);
		$results = [];
		
		while ( $row = $dbrCargo->fetchObject( $res ) ) {
			if( strpos($row->val, $term) === 0 ){
				$results[$row->val] = $row->val;
			}
		}
		return $results;
	}
	static public function preccessDefaultCategories( $cats ){
		$newCats = [];
		foreach ($cats as $cat) {
				$catTitle = \Title::newFromText($cat);
				if($catTitle){
					$newCats[$catTitle->getDbKey()] = $catTitle->getText();
				}
			}
		return $newCats;	
	}
	// static public function onBeforePageDisplay(\OutputPage $out, \Skin $skin ){
	// 	$title = $out->getTitle();
	// 	//FennecAdvancedSearchApiSearch::getResultsAdditionalFieldsFromTitles([$title]);
	// 	// $b = new InCargoFeature();
	// 	// print_r($b->_getKeywords());
	// }

	static public function getCategiresFromDb( $term ){
		$dbr = wfGetDB( DB_REPLICA );
		$conf = \MediaWiki\MediaWikiServices::getInstance()->getMainConfig();
		$categoryExclude = $conf->get('FennecAdvancedSearchCategoryExclude');
		foreach ($categoryExclude as &$cat) {
			$catTitle = \Title::newFromText($cat);
			if($catTitle){
				$cat = $catTitle->getDbKey();
			}
		}
		//die( print_r(get_class($dbr)  ));
		//die('page_title IN (' . $dbr->makeList( $results[1] ) . ')');
		$res = $dbr->select(
			array( 'category' ),
			array( 'cat_title', 'cat_id' ),
			array(
				"cat_title LIKE " . $dbr->addQuotes('%' . $term) ,
			),
			__METHOD__
		);
		$categoriesToReturn = [];
		while ( $row = $dbr->fetchObject( $res ) ) {
			if(in_array($row->cat_title, $categoryExclude)){
				continue;
			}
			$categoriesToReturn[$row->cat_title ] = preg_replace("/_/", " ", $row->cat_title );
			
		}
		return $categoriesToReturn;
	}
	public static function getSearchParamsFiltered() {
		$params = self::getSearchParams();
		foreach ($params as &$param) {
			if( isset($param['widget']['autocomplete_callback'])){
				unset($param['widget']['autocomplete_callback']);
			}
		}
				//die(print_r($params));
		return $params;
	}
	public static function getSearchParams() {
		$conf = \MediaWiki\MediaWikiServices::getInstance()->getMainConfig();
		$params = $conf->get('FennecAdvancedSearchParams');
		\Hooks::run( 'FennecAdvancedSearchParams', [ &$params ] );
		//die(print_r($params,1));
		return $params;
	}
	public static function replaceCargoFieldToElasticField( $field ) {
		return preg_replace('/:/', '__',$field);
	}
	public static function isSearchableField( $key ) {
		return 'category' == $key || self::isCargoField( $key );
	}
	public static function isCargoField( $key ) {
		return strpos($key, ':');
	}
	public static function getFeatureKey( $key ) {
		return 'in' . (self::isCargoField($key) ? '_' : '')  . self::replaceCargoFieldToElasticField($key);
	}
}