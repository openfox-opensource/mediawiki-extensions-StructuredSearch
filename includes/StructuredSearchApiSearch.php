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

class ApiSearch extends \ApiBase {
	use \SearchApi;
	public function __construct( $query, $moduleName ) {
		parent::__construct( $query, $moduleName );
		//we are using \SearchApi just to get default params
		//it's require searchEngineFactory and searchEngine to beset, let's mock it
		$this->searchEngineFactory = \MediaWiki\MediaWikiServices::getInstance()->getService( 'SearchEngineFactory' );
		$this->searchEngineConfig = \MediaWiki\MediaWikiServices::getInstance()->getService( 'SearchEngineConfig' );
	}

	public function execute() {
		global $fennecLocal;
		if ( $fennecLocal || '127.0.0.1' == $_SERVER["REMOTE_ADDR"] ) {
			header( "Access-Control-Allow-Origin: *" );
		}
		$result = $this->getResult();

		$result->addValue( null, 'StructuredSearchSearch', $this->getSearchParams() );
	}
	public static function getNamespaces() {
		$contLang = \Mediawiki\MediaWikiServices::getInstance()->getContentLanguage();
		return $contLang->getNamespaceIds();
	}
	public function getSearchParams() {
		$params = $this->extractRequestParams();
		if ( !isset( $params['namespaces'] ) || !strlen( $params['namespaces'] ) ) {
			$conf = \MediaWiki\MediaWikiServices::getInstance()->getMainConfig();
			$useDefaultNsForSearch = $conf->get( 'StructuredSearchUseMWDefaultSearchNS' );
			if ( $useDefaultNsForSearch ) {
				$namespaces = $conf->get( 'NamespacesToBeSearchedDefault' );
				$namespaces = array_filter( $namespaces );
				$namespaces = array_keys( $namespaces );
			} else {
				$namespaces = Hooks::getDefinedNamespaces();
				// NamespacesToBeSearchedDefault
				$namespaces = array_column( $namespaces, 'value' );
				$namespaces = array_filter( $namespaces, function ( $val ){
					return (int)$val >= 0;
				} );
				$namespaces = array_column( $namespaces, 'value' );
			}
			$params['namespaces'] = implode( '|', $namespaces );
		}
		$params['namespace'] = $params['namespaces'];
		unset( $params['namespaces'] );
		$params = self::extractSearchStringFromFields( $params );
		$srParams = [];
		$params['limit'] = 10;
		$params['prop'] = implode('|',[
			'extensiondata',
			"size",
			"wordcount",
			"snippet",
			"timestamp"
		]);
		if ( !isset( $params['search'] ) ) {
			$params['search'] = '*';
		}
		
		foreach ( $params as $pKey => $pValue ) {
			if ( !in_array( $pKey, [ 'action','list' ] ) ) {
				$srParams['sr' . $pKey ] = $pValue;
			}
		}
		// allow empty search
		if ( !isset( $srParams['srsearch' ] ) || !$srParams['srsearch' ] ) {
			$srParams['srsearch' ] = '*';
		}
		
		$params = array_filter( $srParams, function ( $val ){
			return !is_null( $val );
		} );
		$params['action'] = 'query';
		$params['list'] = 'search';
		if( $_GET['intitle'] ){
			$queryString = http_build_query( $params );
			die( $queryString );
		}
		$callApiParams = new \DerivativeRequest(
			$this->getRequest(),
				$params
		);
		$api = new \ApiMain( $callApiParams );
		$api->execute();

		$results = $api->getResult()->getResultData();
		$resultsFiltered = array_filter( $results['query']['search'], function ( $key ){
			//remove keys starting with _
			return strpos( $key, '_' ) !== 0;
		} , ARRAY_FILTER_USE_KEY);
		
		//if no results and search type is in_title and alternative search is enabled
		if(!count($resultsFiltered) 
			&& isset($params['srsearch_type']) && 'intitle' == $params['srsearch_type']
			&& isset($params['srintitle_alternatives']) && $params['srintitle_alternatives']
		){
			$params['srsearch'] = $params['srsource_search'];
			unset($params['srsource_search']);
			$callApiParams = new \DerivativeRequest(
				$this->getRequest(),
					$params
			);
			$api = new \ApiMain( $callApiParams );
			$api->execute();
	
			$results = $api->getResult()->getResultData();
		}
		return $this->getResultsAdditionalFields( $results );
	}
	public static function extractSearchStringFromFields( $params ) {
		$conf = \MediaWiki\MediaWikiServices::getInstance()->getMainConfig();
		if(isset($params['search_type']) && 'intitle' == $params['search_type']){
			$params['source_search'] = $params['search'];
			$params['search'] = 'intitle:' . $params['search'] . '*';
		}
		$searchParams = Utils::getSearchParams();
		$searchParamsKeys = array_column( $searchParams, 'field' );
		foreach ( $params as $pKey => $pValue ) {
			if ( in_array( $pKey, $searchParamsKeys ) 
				&& isset( $searchParams[$pKey]['search_callback'] ) 
				&& (
					( 
						is_string($searchParams[$pKey]['search_callback']) 
						&& function_exists( $searchParams[$pKey]['search_callback'] ) 
					) 
					|| is_callable( $searchParams[$pKey]['search_callback'] )
				)
			) {
					call_user_func_array( $searchParams[$pKey]['search_callback'], [ &$params, $pKey ] );
			}
		}
		foreach ( $params as $pKey => $pValue ) {
			if ( in_array( $pKey, $searchParamsKeys ) ) {

				if ( Utils::isSearchableField( $pKey ) && $pValue ) {
					$params['search'] .= Utils::getFeatureSearchStr( $pKey, $pValue, $searchParams[$pKey] );
					unset( $params[$pKey] );
				} elseif ( !$pValue ) {
					unset( $params[$pKey] );

				}
			}
		}

		if ( NS_FILE != (int)$params['namespace'] && $conf->get( 'StructuredSearchAddFilesContentToIncludingPages' ) ) {
			$params['search'] .= ' not_included_file:1';
		}

		return $params;
	}

	protected function getAllowedParams() {
		$searchParams = Utils::getSearchParams();
		$newParams = $this->buildCommonApiParams();
		foreach ( $searchParams as $key => $value ) {
			$newParams[$key] = null;
		}
		$newParams['search_type'] = [
			\ApiBase::PARAM_TYPE => 'string',
			\ApiBase::PARAM_REQUIRED => false,
		];
		$newParams['intitle_alternatives'] = [
			\ApiBase::PARAM_TYPE => 'boolean',
			\ApiBase::PARAM_REQUIRED => false,
		];
		return $newParams;
	}

	protected function getResultsAdditionalFields( $results ) {
		$titles = array_column( $results['query']['search'], 'title' );
		$results['query']['search'] = array_map( function($res){
			if(isset($res['extensiondata']['extra_fields'])){
				//replace all keys in $res['extensiondata']['extra_fields'] containing __ with :
				$res['extensiondata']['extra_fields'] = array_combine(
					array_map(function($key){
						return str_replace('__', ':', $key);
					}, array_keys($res['extensiondata']['extra_fields'])),
					array_values($res['extensiondata']['extra_fields'])
				);
				$res = array_merge($res, $res['extensiondata']['extra_fields']);
				unset($res['extensiondata']);
				$res['namespaceId']  = $res['namespace'];
				$res['namespace']  = $res['namespace_text'];

			}
			return $res;
		},$results['query']['search']);
		$resultsData = self::getResultsAdditionalFieldsFromTitles( $titles, $results['query']['search'] );
		\Hooks::run( 'StructuredSearchResultsView', [ &$resultsData ] );
		//$results['query']['searchinfo']['totalhits'] = count( $resultsData );
		return [
			'continue' => isset( $results['continue'] ) ? $results['continue'] : '',
			'searchinfo' => $results['query']['searchinfo'],
			'results' => $resultsData

		];
	}
	public static function getResultsAdditionalFieldsFromTitles( $titles, $fullResults ) {
		if ( !count( $titles ) ) {
			return $titles;
		}
		// $conf = \MediaWiki\MediaWikiServices::getInstance()->getMainConfig();
		// $wgArticlePath = $conf->get( 'ArticlePath' );
		$resultsTitlesForCheck = [];
		$resultsTitlesAliases = [];
		//$namespaceIds = self::getNamespaces();
		foreach ( $titles as $key => $val ) {
			$titleClass = \Title::newFromText( $val );

			$namespace = $titleClass->getNamespace();
			$titleKey = ( $namespace ? $namespace : '0' ) . ':' . preg_replace( '/\s/', '_', $titleClass->getText() );
			$resultsTitlesForCheck[$titleKey] = [
					// 
					'text_has_search_results_inside' => isset($fullResults[$key]['snippet']) && (bool)strpos( $fullResults[$key]['snippet'], 'class="searchmatch"' ) ? "1" : ""
			];
			$fieldsOutOfElasticSearch = !isset($fullResults[$key]['title_dash_short']);
			//old case,  new  fields are not in extensiondata
			if( $fieldsOutOfElasticSearch ){
				$resultsTitlesForCheck[$titleKey]['full_title'] = $titleClass->getFullText();
				$resultsTitlesForCheck[$titleKey]['short_title'] = $titleClass->getText();
				$resultsTitlesForCheck[$titleKey]['title_dash'] = $titleClass->getPrefixedDBkey();
				$resultsTitlesForCheck[$titleKey]['title_dash_short'] = $titleClass->getDBkey();
				$resultsTitlesForCheck[$titleKey]['page_link'] = $titleClass->getLinkURL();
				$resultsTitlesForCheck[$titleKey]['namespace'] = $titleClass->getNsText();
				$resultsTitlesForCheck[$titleKey]['namespaceId'] = $titleClass->getNamespace();
				$resultsTitlesForCheck[$titleKey]['title_key'] = $titleKey;
			}
			$resultsTitlesForCheck[$titleKey] = array_merge( $resultsTitlesForCheck[$titleKey], $fullResults[$key] );
			$resultsTitlesAliases[$val] = &$resultsTitlesForCheck[$titleKey];
			if ( isset( $resultsTitlesAliases[$val]['timestamp'] ) ) {
				$date = strtotime( $resultsTitlesAliases[$val]['timestamp'] );
				$resultsTitlesAliases[$val]['year'] = date( 'Y', $date );
				$resultsTitlesAliases[$val]['month'] = date( 'm', $date );
				$resultsTitlesAliases[$val]['day'] = date( 'd', $date );
			}
			if ( NS_FILE == $resultsTitlesForCheck[$titleKey]['namespaceId'] ) {

				$resultsTitlesForCheck[$titleKey]['self_thumb'] = Hooks::fixImageToThumbs( $resultsTitlesForCheck[$titleKey]['full_title'] );
			}
		}
		if ( !count( $resultsTitlesForCheck ) ) {
			return $titles;
		}
		//cats in ES are including hidden cats so we need to write solution for this
		//thats' a little bit hack but to check if visible_categories are set, we'll check if even one title has this field
		$visibleCategoriesExists = count(array_filter(array_column( $resultsTitlesForCheck, 'visible_categories' )));
		if($visibleCategoriesExists){
			//rename visible_categories to categories
			foreach ( $resultsTitlesForCheck as $key => &$val ) {
				//die(print_r($val['visible_categories'], true));
				if ( isset( $val['visible_categories'] ) ) {
					//filter from visible categories all values their keys starting with _ 
					//because they are not categories but some other fields

					$visibleCategories = array_filter( $val['visible_categories'], function ( $key ){
						return strpos( $key, '_' ) !== 0;
					}, ARRAY_FILTER_USE_KEY ); 
					$val['category'] = array_map( function ( $part ){
						$splitted = explode( ':', $part );
						return [
							'name' => preg_replace( '/_/', ' ', $splitted[1] ),
							'key' => $splitted[1],
							'link' => '/category:' . $splitted[1],
							'id' => $splitted[0],
						];
					},  $visibleCategories );
					unset( $val['visible_categories']  );
				}
			}
		}
		else{
			self::addCategories( $resultsTitlesForCheck );
		}
		
		if ( count( $resultsTitlesForCheck ) && $fieldsOutOfElasticSearch ) {

			self::addCargoFields( $resultsTitlesForCheck, $resultsTitlesAliases );
			if ( class_exists( 'PageImages' ) || class_exists( 'PageImages\PageImages' ) ) {
				self::addPageImage( $resultsTitlesForCheck );
			}
		}

		\Hooks::run( 'StructuredSearchResults', [ &$resultsTitlesForCheck ] );
		return $resultsTitlesForCheck;
	}
	public static function addPageImage( &$resultsTitlesForCheck ) {
		$dbr = wfGetDB( DB_REPLICA );
		$res = $dbr->select(
			[ 'imagelinks','page' ],
			[ 'il_from','il_to','CONCAT(page_namespace,":",page_title) as concatKey', ],
			[
				'CONCAT(page_namespace,":",page_title) IN (' . $dbr->makeList( array_keys( $resultsTitlesForCheck ) ) . ')'
			],
			__METHOD__,
			[],
			[ 'page' => [ 'INNER JOIN', [ 'page_id=il_from' ] ],
			]
		);
		$allImages = [];
		while ( $row = $res->fetchObject( ) ) {

			$resultsTitlesForCheck[$row->concatKey]['page_image_ext_source'] = $resultsTitlesForCheck[$row->concatKey]['page_image_ext']; 
			$resultsTitlesForCheck[$row->concatKey]['page_image_ext'] = Hooks::fixImageToThumbs( 'file:' . $row->il_to );
		}
	}
	
	public static function addCargoFields( &$resultsTitlesForCheck, &$resultsTitlesAliases ) {
		$dbr = wfGetDB( DB_REPLICA );
		$dbrCargo = \CargoUtils::getDB();
		$allFieldsByTables = self::getFieldsByTable();

		// no normal way to find
		$allCargoTableExits = self::cargoTableExits();
		$allCargoTableExitsNames = array_keys( $allCargoTableExits );

		foreach ( $allFieldsByTables as $tableName => $fields ) {
			if ( !in_array( $tableName, $allCargoTableExitsNames ) ) {

				continue;
			}
			$allSubtablesOfFields = Utils::getSubtablesOfFields( $tableName );

			$fieldsDeclared = self::getFieldsNames( $allCargoTableExits, $tableName );
			$fields = array_map( function ( $val ) use ( $fieldsDeclared ){
				if ( $fieldsDeclared && !in_array( $val, $fieldsDeclared, true ) ) {
					if ( $fieldsDeclared && in_array( $val . '__full', $fieldsDeclared, true ) ) {
						$val = $val . '__full';
					} elseif ( $fieldsDeclared && in_array( $val . '__value', $fieldsDeclared, true ) ) {
						$val = $val . '__value';
					}
				}
				return $val;
			}, $fields );
			$fields[] = '_pageName';
			$fields[] = '_ID';
			$conditions = [];
			$conditions[] = '_pageName IN (' . $dbr->makeList( array_column( $resultsTitlesForCheck, 'full_title' ) ) . ')';
			$res = $dbrCargo->select( $tableName, $fields, $conditions );

			while ( $row = $res->fetchObject( )) {
				$addToArr = &$resultsTitlesAliases[$row->_pageName];
				foreach ( $row as $key => $value ) {
					$keySplitted = explode( '__', $key );
					$fullField = $tableName . ':' . $keySplitted[0];
					if ( isset( $keySplitted[1] ) && $keySplitted[1] == 'full' ) {
						$subTableName = $tableName . '__' . $keySplitted[0];
						if ( in_array( $subTableName, $allSubtablesOfFields ) ) {
							$addToArr[$fullField] = self::getFieldFromSubtable( $subTableName, $row );
						}
					}
					if ( !isset( $addToArr[$fullField] ) ) {
						$addToArr[$fullField] = $value;
					}
				}

			}
		}
	}
	public static function cargoTableExits() {
		$dbr = wfGetDB( DB_REPLICA );
		$res = $dbr->select(
			[ 'cargo_tables' ],
			[ 'main_table','table_schema' ],
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
		while ( $row = $res->fetchObject( ) ) {
			$dbrCargo = \CargoUtils::getDB();
			$res2 = $dbrCargo->query( "DESCRIBE " . $dbrCargo->tablePrefix() . $row->main_table );
			$r = [];
			foreach ( $res2 as $row2 ) {
				if ( !in_array( $row2->Field, $excludeFields ) ) {
					$r[] = $row2->Field;
				}
			}
			$tables[$row->main_table] = $r;
		}

		return $tables;
	}
	public static function addCategories( &$resultsTitlesForCheck ) {
		$dbr = wfGetDB( DB_REPLICA );
		$res = $dbr->select(
			[ 'categorylinks','page','category' ],
			[ 'cl_from','cl_to', 'page_id','page_title','page_namespace', 'cat_id' ],
			[
				'CONCAT(page_namespace,":",page_title) IN (' . $dbr->makeList( array_keys( $resultsTitlesForCheck ) ) . ')',
				'cat_pages > 0'
			],
			__METHOD__,
			[],
			[ 'page' => [ 'INNER JOIN', [ 'page_id=cl_from' ] ],
				'category' => [ 'INNER JOIN', [ 'cat_title=cl_to' ] ],
			]
		);
		$allCategories = [];
		while ( $row = $res->fetchObject( ) ) {
			$allCategories[] = (array)$row;
		}
		$catTitles = array_column( $allCategories, 'cl_to' );
		$categoriesToExclude = [];
		if ( count( $catTitles ) ) {
			$res = $dbr->select(
				[ 'page','page_props' ],
				[ 'DISTINCT pp_page, page_title' ],
				[
					// 'pp_page IN (' . $dbr->makeList( $catTitles) . ')',
					'pp_propname' => 'hiddencat',
					'page_title IN (' . $dbr->makeList( $catTitles ) . ')',
				],
				__METHOD__,
				[],
				[
					'page_props' => [ 'INNER JOIN', [ 'page_id=pp_page' ] ],

				]
			);
			while ( $row = $res->fetchObject( ) ) {
				$categoriesToExclude[] = $row->page_title;
			}
		}
		$categoriesToExclude = array_unique( $categoriesToExclude );
		foreach ( $allCategories as $row ) {
			$key = $row['page_namespace'] . ':' . $row['page_title'];

			if ( in_array( $row['cl_to'], $categoriesToExclude ) ) {
				continue;
			} else {
				$resultsTitlesForCheck[$key]['category'][] = [
					'name' => preg_replace( '/_/', ' ', $row['cl_to'] ),
					'key' => $row['cl_to'],
					'link' => "category:" . $row['cl_to'],
					'id' => $row['cat_id'],
				];
			}
		}
	}
	public static function getFieldFromSubtable( $subtableName, $row ) {
		$results = [];
		$dbrCargo = \CargoUtils::getDB();
		$res = $dbrCargo->select( $subtableName, [ '*' ], [
			'_rowID' => $row->_ID
		] );
		while ( $row = $res->fetchObject( ) ){
			$results[] = $row->_value;
		}
		return $results;
	}

	protected function getParamDescription() {
		$searchParams = Utils::getSearchParams();
		$newParams = [];
		foreach ( $searchParams as $key => $value ) {
			$newParams[$key] = $value['label'];
		}
	}

	protected function getDescription() {
		return 'Get fennec advanced search settings';
	}

	protected function getExamples() {
		return [
			'action=structuredsearchsearch'
		];
	}
	public static function getFieldsNames( $allCargoTableExits, $tableName ) {
		return $allCargoTableExits[$tableName];
	}
	public static function getFieldsByTable() {
		$allFieldsByTemplates = [];
		$searchParams = Utils::getSearchParams();
		foreach ( $searchParams as $searchParam ) {
			if ( Utils::isCargoField( $searchParam['field'] ) ) {
				$splitted = explode( ':', $searchParam['field'] );
				$allFieldsByTemplates[$splitted[0]][] = $splitted[1];

			}
		}
		return $allFieldsByTemplates;
	}
	public function getSearchProfileParams() {
		return [];
	}
	public function getVersion() {
		return __CLASS__ . ': $Id$';
	}

}
