<?php
/**
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 *
 * @file
 */

namespace MediaWiki\Extension\StructuredSearch;
use MediaWiki\MediaWikiServices;

class ApiSearch extends \ApiBase {
	use \SearchApi;
	public function __construct( $query, $moduleName ) {
		parent::__construct( $query, $moduleName );

	}

	public function execute() {
		global $fennecLocal;
		if($fennecLocal || '127.0.0.1' == $_SERVER["REMOTE_ADDR"]){
			header("Access-Control-Allow-Origin: *");
		}
		$result = $this->getResult();
		
		$result->addValue( NULL, 'StructuredSearchSearch', $this->getSearchParams() );
	}
	public static function getNamespaces(){
		$contLang = \Mediawiki\MediaWikiServices::getInstance()->getContentLanguage();
		return $contLang->getNamespaceIds();
	}
	public function getSearchParams() {
			
		$params = $this->extractRequestParams();
		if(!isset($params['namespaces']) || !strlen($params['namespaces'])){
			$conf = \MediaWiki\MediaWikiServices::getInstance()->getMainConfig();
			$useDefaultNsForSearch = $conf->get('StructuredSearchUseMWDefaultSearchNS');
			if( $useDefaultNsForSearch ){
				$namespaces = $conf->get('NamespacesToBeSearchedDefault');
				$namespaces = array_filter($namespaces);
				$namespaces = array_keys($namespaces);
			}
			else{			
				$namespaces = Hooks::getDefinedNamespaces();
				//NamespacesToBeSearchedDefault
				$namespaces = array_column($namespaces, 'value');
				$namespaces = array_filter($namespaces, function($val){
					return (integer) $val >= 0;
				});
				$namespaces = array_column($namespaces, 'value');
			}
			$params['namespaces'] = implode('|',$namespaces);
		}
		$params['namespace'] = $params['namespaces'];
		unset($params['namespaces']);
		$params = self::extractSearchStringFromFields($params);
		$srParams = [];
		

		$params['limit'] = 10;
		
		if(!isset($params['search'])){
			$params['search'] = '*';	
		}
		foreach ($params as $pKey => $pValue) {
			if( !in_array($pKey, ['action','list'])){
				$srParams['sr' . $pKey ] = $pValue;
			}
		}
		//allow empty search
		if( !isset( $srParams['srsearch' ]) || !$srParams['srsearch' ] ){
			$srParams['srsearch' ] = '*';
		}
		$params = array_filter($srParams, function( $val ){
			return !is_null($val);
		});
		$params['action'] = 'query';
		$params['list'] = 'search';
		
		$callApiParams = new \DerivativeRequest(
		    $this->getRequest(),
			    $params
		);
		$api = new \ApiMain( $callApiParams );
		$api->execute();


		
		$results = $api->getResult()->getResultData();
		return $this->getResultsAdditionalFields($results);
	}	
	public static function extractSearchStringFromFields( $params ) {
		$conf = \MediaWiki\MediaWikiServices::getInstance()->getMainConfig();

		$searchParams = Utils::getSearchParams();
		$searchParamsKeys = array_column($searchParams , 'field');
		foreach ($params as $pKey => $pValue) {
			//print_r([in_array($pKey, $searchParamsKeys), self::isSearchableField( $pKey )]);
			if( in_array($pKey, $searchParamsKeys) && isset($searchParams[$pKey]['search_callbak']) && function_exists($searchParams[$pKey]['search_callbak']) ){
					call_user_func_array($searchParams[$pKey]['search_callbak'], [&$params, $pKey]);
					//print_r($params);
				}
		}
		//print_r($params);
		foreach ($params as $pKey => $pValue) {
			//print_r([in_array($pKey, $searchParamsKeys), self::isSearchableField( $pKey )]);
			if( in_array($pKey, $searchParamsKeys) ){
				
				if(  Utils::isSearchableField( $pKey ) && $pValue){
					$params['search'] .= Utils::getFeatureSearchStr( $pKey, $pValue, $searchParams[$pKey]);
					unset($params[$pKey]);
				}
				else if( !$pValue ){
					unset($params[$pKey]);

				}
			}
		}
		if( $conf->get('StructuredSearchAddFilesContentToIncludingPages') ){
			$params['search'] .= ' not_included_file:1';
		}		
		//die( print_r([$params,$searchParamsKeys]));
		return $params;
	}
	
	protected function getAllowedParams() {
		$searchParams = Utils::getSearchParams();
		$newParams = $this->buildCommonApiParams();
		foreach ($searchParams as $key => $value) {
			$newParams[$key] = NULL;
		}
		return $newParams;
	}


	protected function getResultsAdditionalFields( $results) {
		$titles = array_column($results['query']['search'], 'title');
		//die(print_r($results['query']));
		$resultsData = self::getResultsAdditionalFieldsFromTitles( $titles, $results['query']['search']);
		\Hooks::run( 'StructuredSearchResultsView', [ &$resultsData ] );
		$results['query']['searchinfo']['totalhits'] = count($resultsData);
		return [
			'continue' => isset( $results['continue'] ) ? $results['continue'] : '',
			'searchinfo' => $results['query']['searchinfo'],
			'results' => $resultsData

		];
	}
	public static function getResultsAdditionalFieldsFromTitles( $titles, $fullResults ) {
		if(!count($titles)){
			return $titles;
		}
		$conf = \MediaWiki\MediaWikiServices::getInstance()->getMainConfig();
		$wgArticlePath = $conf->get('ArticlePath');
		$resultsTitlesForCheck = [];
		$resultsTitlesAliases = [];
		$namespaceIds = self::getNamespaces();
		foreach ($titles as $key => $val) {
			$titleClass = \Title::newFromText( $val );
			
			$namespace = $titleClass->getNamespace();
			$titleKey = ($namespace ? $namespace : '0' ) . ':' . preg_replace('/\s/', '_', $titleClass->getText());
			$resultsTitlesForCheck[$titleKey] = [
					'full_title'=> $titleClass->getFullText(), 
					'short_title'=> $titleClass->getText(), 
					'title_dash'=> $titleClass->getPrefixedDBkey(), 
					'title_dash_short'=> $titleClass->getDBkey(),
					'page_link'=> $titleClass->getLinkURL(), 
					'namespace' => $titleClass->getNsText(), 
					'namespaceId' => $titleClass->getNamespace(),
					'title_key' => $titleKey,
					'text_had_search_results_inside' => !!strpos($fullResults[$key]['snippet'], 'class="searchmatch"')
			];
			
			
			$resultsTitlesForCheck[$titleKey] = array_merge($resultsTitlesForCheck[$titleKey], $fullResults[$key]);
			$resultsTitlesAliases[$val] = &$resultsTitlesForCheck[$titleKey];
			if(isset($resultsTitlesAliases[$val]['timestamp'])){
				$date = strtotime($resultsTitlesAliases[$val]['timestamp']);
				$resultsTitlesAliases[$val]['year'] = date('Y', $date);
				$resultsTitlesAliases[$val]['month'] = date('m', $date);
				$resultsTitlesAliases[$val]['day'] = date('d', $date);
			}
			if(NS_FILE == $resultsTitlesForCheck[$titleKey]['namespaceId']){
				
				$resultsTitlesForCheck[$titleKey]['self_thumb'] = Hooks::fixImageToThumbs($resultsTitlesForCheck[$titleKey]['full_title']);
			}
		}
		if(!count($resultsTitlesForCheck)){
			return $titles;
		}
		
		
		

		if(count($resultsTitlesForCheck)){

			self::addCategories( $resultsTitlesForCheck );
			self::addCargoFields( $resultsTitlesForCheck, $resultsTitlesAliases );
			if(class_exists('PageImages') || class_exists('PageImages\PageImages')){
				self::addPageImage( $resultsTitlesForCheck );
			}
		}
		
		\Hooks::run( 'StructuredSearchResults', [ &$resultsTitlesForCheck ] );
		return $resultsTitlesForCheck;
	}
	public static function addPageImage( &$resultsTitlesForCheck ) {

		$dbr = wfGetDB( DB_REPLICA );
		$res = $dbr->select(
			array( 'imagelinks','page' ),
			array( 'il_from','il_to','CONCAT(page_namespace,":",page_title) as concatKey', ),
			array(
				'CONCAT(page_namespace,":",page_title) IN (' . $dbr->makeList( array_keys($resultsTitlesForCheck )) . ')'
			),
			__METHOD__,
			array(),
			array( 
				'page' => array( 'INNER JOIN', array( 'page_id=il_from' ) ),
			)
		);
		$allImages = [];
		while ( $row = $dbr->fetchObject( $res ) ) {
			$resultsTitlesForCheck[$row->concatKey]['page_image_ext'] = Hooks::fixImageToThumbs( 'file:' . $row->il_to );
		}
	}
	public static function addCargoFields( &$resultsTitlesForCheck, &$resultsTitlesAliases ) {
		$dbr = wfGetDB( DB_REPLICA );
		$dbrCargo = \CargoUtils::getDB();
		$allFieldsByTables = self::getFieldsByTable( );
		
		//no normal way to find 
		$allCargoTableExits = self::cargoTableExits( );
		$allCargoTableExitsNames = array_keys( $allCargoTableExits );
		
		foreach ($allFieldsByTables as $tableName => $fields) {
			if(!in_array($tableName, $allCargoTableExitsNames)){
				
				continue;
			}
			$allSubtablesOfFields = Utils::getSubtablesOfFields( $tableName );
			
		
			$fieldsDeclared = self::getFieldsNames($allCargoTableExits, $tableName);
			$fields = array_map(function($val) use ($fieldsDeclared){
				if($fieldsDeclared && !in_array($val, $fieldsDeclared, TRUE)){
					if($fieldsDeclared && in_array($val . '__full', $fieldsDeclared, TRUE)){
						$val = $val . '__full';
					}
					else if( $fieldsDeclared && in_array($val . '__value', $fieldsDeclared, TRUE)){
						$val = $val . '__value';
					}
				}
				return $val;
			}, $fields);
			$fields[] = '_pageName';
			$fields[] = '_ID';
			$conditions = [];
			$conditions[] = '_pageName IN (' . $dbr->makeList( array_column( $resultsTitlesForCheck,'full_title' )) . ')';
			$res = $dbrCargo->select( $tableName, $fields, $conditions);
			
			//print_r($conditions);
			while ( $row = $dbrCargo->fetchObject( $res ) ) {
				//print_r([$row,'d']);
				$addToArr = &$resultsTitlesAliases[$row->_pageName];
				foreach ($row as $key => $value) {
					//echo "$key $value<br/>";
					$keySplitted = explode('__', $key);
					$fullField = $tableName . ':' .  $keySplitted[0];
					if(isset( $keySplitted[1] ) && $keySplitted[1] == 'full'){
						$subTableName = $tableName . '__' . $keySplitted[0];
						if(in_array($subTableName, $allSubtablesOfFields)){
							$addToArr[$fullField] = self::getFieldFromSubtable( $subTableName, $row);
						}
					}
					if(!isset($addToArr[$fullField])){
						$addToArr[$fullField] = $value;
					}
				}
				//print_r([$row]);
				//unset( $row['_pageName']);
				//$addToArr = array_merge($addToArr, (array)$row);
			}
		}
			
	}
	public static function cargoTableExits( ) {
		$dbr = wfGetDB( DB_REPLICA );
		$res = $dbr->select(
			array( 'cargo_tables' ),
			array( 'main_table','table_schema' ),
			"1=1",
			__METHOD__
		);
		$tables = [];
		$excludeFields = [
			"_ID",
			// "_pageID",
			// "_pageTitle",
			"_pageName",
			"_pageNamespace",
		];
		while ( $row = $dbr->fetchObject( $res ) ) {
			$dbrCargo = \CargoUtils::getDB();
			$res2 = $dbrCargo->query( "DESCRIBE ". $dbrCargo->tablePrefix() . $row->main_table );
			$r = [];
			foreach( $res2 as $row2 ) {
				if(!in_array($row2->Field , $excludeFields)){
		        	$r[] = $row2->Field;
				}
			}
			$tables[$row->main_table] = $r;//unserialize($r);
		}


		return $tables;
	}
	public static function addCategories( &$resultsTitlesForCheck ) {
		$dbr = wfGetDB( DB_REPLICA );
		$res = $dbr->select(
			array( 'categorylinks','page','category' ),
			array( 'cl_from','cl_to', 'page_id','page_title','page_namespace', 'cat_id' ),
			array(
				'CONCAT(page_namespace,":",page_title) IN (' . $dbr->makeList( array_keys($resultsTitlesForCheck )) . ')',
				'cat_pages > 0'
			),
			__METHOD__,
			array(),
			array( 
				'page' => array( 'INNER JOIN', array( 'page_id=cl_from' ) ),
				'category' => array( 'INNER JOIN', array( 'cat_title=cl_to' ) ),
			)
		);
		$allCategories = [];
		while ( $row = $dbr->fetchObject( $res ) ) {
			$allCategories[] = (array) $row;
		}
		$catTitles = array_column( $allCategories, 'cl_to');
		$categoriesToExclude = [];
		if(count($catTitles)){
			$res = $dbr->select(
				array( 'page','page_props' ),
				array( 'DISTINCT pp_page, page_title' ),
				array(
					//'pp_page IN (' . $dbr->makeList( $catTitles) . ')',
					'pp_propname' => 'hiddencat',
					'page_title IN (' . $dbr->makeList( $catTitles) . ')',
				),
				__METHOD__,
				[],
				[
					'page_props' => array( 'INNER JOIN', array( 'page_id=pp_page' ) ),

				]
			);
			while ( $row = $dbr->fetchObject( $res ) ) {
				//print_r($row);
				$categoriesToExclude[] = $row->page_title;
			}
		}
		$categoriesToExclude = array_unique($categoriesToExclude);
		foreach ($allCategories as $row) {
			$key = $row['page_namespace'] .  ':' . $row['page_title'];
			
			if( in_array($row['cl_to'], $categoriesToExclude)){
				continue;
			}
			else{
				$resultsTitlesForCheck[$key]['category'][] = [
					'name' => preg_replace('/_/',' ',$row['cl_to']),
					'key' => $row['cl_to'],
					'link' => "category:" . $row['cl_to'],
					'id' => $row['cat_id'],
				] ;
			}
		}

	}
	public static function getFieldFromSubtable( $subtableName, $row ) {
		$results = [];
		$dbrCargo = \CargoUtils::getDB();
		$res = $dbrCargo->select($subtableName, ['*'],[
			'_rowID' => $row->_ID
		]);
		while ( $row = $dbrCargo->fetchObject( $res ) ) {
			$results[] = $row->_value;
		}
		return $results;
	}
	
	protected function getParamDescription() {
		$searchParams = Utils::getSearchParams();
		$newParams = [];
		foreach ($searchParams as $key => $value) {
			$newParams[$key] = $value['label'];
		}
	}

	protected function getDescription() {
		return 'Get fennec advanced search settings';
	}

	protected function getExamples() {
		return array(
			'action=structuredsearchsearch'
		);
	}
	public static function getFieldsNames($allCargoTableExits, $tableName){
		
		return $allCargoTableExits[$tableName] ;
		// $res = $dbr->query('Describe ');
		// $row = $dbr->fetchRow( $res );
		// $fields = $row[0] ? unserialize($row[0]) : [];
		// $fieldsNames = [];
		// foreach ($fields as $fName => &$field) {
		// 	if( isset($field['isList']) && $field['isList']){
		// 		$fieldsNames[] = $fName .'__full';
		// 	}
		// 	else{
		// 		$fieldsNames[] = $fName;
		// 	}
		// }
		// return $fieldsNames;

	}
	public static function getFieldsByTable(){
		$allFieldsByTemplates = [];
		$searchParams = Utils::getSearchParams();
		foreach ($searchParams as $searchParam ) {
			if( Utils::isCargoField( $searchParam['field'] ) ){
				$splitted = explode(':', $searchParam['field']);
				$allFieldsByTemplates[$splitted[0]][] = $splitted[1];

			}
		}
		return $allFieldsByTemplates;
	}
	public function getSearchProfileParams(){
		return [];
	}
	public function getVersion() {
		return __CLASS__ . ': $Id$';
	}


}