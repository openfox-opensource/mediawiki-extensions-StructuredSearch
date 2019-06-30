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

namespace MediaWiki\Extension\FennecAdvancedSearch;
use MediaWiki\MediaWikiServices;

class ApiSearch extends \ApiBase {
	use \SearchApi;
	public function __construct( $query, $moduleName ) {
		parent::__construct( $query, $moduleName );

	}

	public function execute() {
		
		if('127.0.0.1' == $_SERVER["REMOTE_ADDR"]){
		header("Access-Control-Allow-Origin: *");
		}
		$result = $this->getResult();
		
		$result->addValue( NULL, 'FennecAdvancedSearchSearch', $this->getSearchParams() );
	}
	public static function getNamespaces(){
		global $wgContLang;
		return $wgContLang->getNamespaceIds();
	}
	public function getSearchParams() {
			
		$params = $this->extractRequestParams();
		if(!isset($params['namespace']) || !strlen($params['namespace'])){
			$namespaces = Hooks::getDefinedNamespaces();
			$namespaces = array_column($namespaces, 'value');
			$namespaces = array_filter($namespaces, function($val){
				return (integer) $val >= 0;
			});
			$params['namespace'] = implode('|', array_column($namespaces, 'value'));
		}
		$params['namespace'] = $params['namespace'];
		$params = self::extractSearchStringFromFields($params);
		$srParams = [];
		

		$params['limit'] = 100;
		foreach ($params as $pKey => $pValue) {
			if( !in_array($pKey, ['action','list'])){
				$srParams['sr' . $pKey ] = $pValue;
			}
		}
		$params = array_filter($srParams, function( $val ){
			return !is_null($val);
		});
		$params['action'] = 'query';
		$params['list'] = 'search';
		//die(print_r($params));
		
		//die(http_build_query($params));
		$callApiParams = new \DerivativeRequest(
		    $this->getRequest(),
			    $params
		);
		$api = new \ApiMain( $callApiParams );
		$api->execute();


		
		$results = $api->getResult()->getResultData();
		//die(print_r($results));
		//$results = $this->filterResults($results);
		return $this->getResultsAdditionalFields($results);
	}	
	public static function extractSearchStringFromFields( $params ) {
		
		$searchParams = Utils::getSearchParams();
		$searchParamsKeys = array_column($searchParams , 'field');
		foreach ($params as $pKey => $pValue) {
			//print_r([in_array($pKey, $searchParamsKeys), self::isSearchableField( $pKey )]);
			if( in_array($pKey, $searchParamsKeys) && isset($searchParams[$pKey]['search_callbak']) && function_exists($searchParams[$pKey]['search_callbak']) ){
					call_user_func_array($searchParams[$pKey]['search_callbak'], [&$params, $pKey]);
					//print_r($params);
				}
		}
		//print_r($searchParamsKeys);
		foreach ($params as $pKey => $pValue) {
			//print_r([in_array($pKey, $searchParamsKeys), self::isSearchableField( $pKey )]);
			if( in_array($pKey, $searchParamsKeys) ){
				
				if(  Utils::isSearchableField( $pKey ) && $pValue){
					$params['search'] .= Utils::getFeatureSearchStr( $pKey, $pValue);
					unset($params[$pKey]);
				}
				else if( !$pValue ){
					unset($params[$pKey]);

				}
			}
		}
		//die();
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
		return [
			'continue' => $results['continue'],
			'searchinfo' => $results['query']['searchinfo'],
			'results' => self::getResultsAdditionalFieldsFromTitles( $titles, $results['query']['search'])
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
		//die(print_r($namespaceIds));
		foreach ($titles as $key => $val) {
			$dashed_val = preg_replace('/\s/','_',$val);
			if( $dashed_val === $val && strpos('_', $val)){
				$val = preg_replace('/_/',' ',$val);
			}
			$valSplitted = explode(':', $val);
			if( count($valSplitted) > 1 ){
				$namespace = array_shift($valSplitted);
				$title = implode(':',$valSplitted);
				$namespace = preg_replace('/\s/','_',$namespace);
				array_unshift($valSplitted, $namespaceIds[$namespace]);
			} 
			else{
				//for main
				$title  = implode(':',$valSplitted);
				array_unshift($valSplitted,NS_MAIN);
			}
			$titleKey = preg_replace('/\s/','_', implode(':', $valSplitted));
			$resultsTitlesForCheck[$titleKey] = [
					'full_title'=>$val, 
					'short_title'=> $title, 
					'title_dash'=> preg_replace('/\s/','_',$val), 
					'page_link'=> preg_replace('/\$1/',preg_replace('/\s/','_',$val),$wgArticlePath), 
					'namespace' => isset($namespace) ? $namespace : '', 
					'namespaceId' => $namespaceIds[$namespace],
					'title_key' => $titleKey,
			];
			$resultsTitlesForCheck[$titleKey] = array_merge($resultsTitlesForCheck[$titleKey], $fullResults[$key]);
			$resultsTitlesAliases[$val] = &$resultsTitlesForCheck[$titleKey]; 
		}
		if(!count($resultsTitlesForCheck)){
			return $titles;
		}
		//die(print_r($resultsTitlesAliases));

		// $results_with_data = array_map(function( $val ){
		// 	return [$val=>[
		// 		'title' => $val
		// 	]];
		// }, $results[1]);
		$dbr = wfGetDB( DB_REPLICA );
		//die('page_title IN (' . $dbr->makeList( $results[1] ) . ')');
		// $res = $dbr->select(
		// 	array( 'page_props', 'page' ),
		// 	array( 'pp_value', 'CONCAT(page_namespace,":",page_title) as page_title' ),
		// 	array(
		// 		'CONCAT(page_namespace,":",page_title) IN (' . $dbr->makeList( array_keys($resultsTitlesForCheck )) . ')',
		// 		'pp_propname="page_image"',
		// 	),
		// 	__METHOD__,
		// 	array(),
		// 	array( 
		// 		'page' => array( 'INNER JOIN', array( 'page_id=pp_page' ) )
		// 	)
		// );
		$res = $dbr->select(
			array( 'categorylinks','page','category' ),
			array( 'cl_from','cl_to', 'page_id','page_title','page_namespace', 'cat_id' ),
			array(
				'page_id IN (' . $dbr->makeList( array_column($resultsTitlesForCheck, 'pageid' )) . ')',
			),
			__METHOD__,
			array(),
			array( 
				'page' => array( 'INNER JOIN', array( 'page_id=cl_from' ) ),
				'category' => array( 'INNER JOIN', array( 'cat_title=cl_to' ) ),
			)
		);
		//die(print_r('page_title IN (' . $dbr->makeList( array_keys($resultsTitlesForCheck )) . ')'));
		while ( $row = $dbr->fetchObject( $res ) ) {
			$key = $row->page_namespace .  ':' . $row->page_title;
			$resultsTitlesForCheck[$key]['category'][] = [
				'name' => preg_replace('/_/',' ',$row->cl_to),
				'key' => $row->cl_to,
				'id' => $row->cat_id,
			] ;
		}
		$dbrCargo = \CargoUtils::getDB();
		$allFieldsByTables = self::getFieldsByTable( );
		//die(print_r($allFieldsByTables));
		//no normal way to find 
		foreach ($allFieldsByTables as $tableName => $fields) {
			$allSubtablesOfFields = Utils::getSubtablesOfFields( $tableName );
			//die(print_r($allSubtablesOfFields));
			$fieldsDeclared = self::getFieldsNames($dbrCargo, $tableName);
			//die(in_array('jhkjhj', [0], TRUE));
			$fields = array_map(function($val) use ($fieldsDeclared){
				if(!in_array($val, $fieldsDeclared, TRUE)){
					if(in_array($val . '__full', $fieldsDeclared, TRUE)){
						$val = $val . '__full';
					}
					else if(in_array($val . '__value', $fieldsDeclared, TRUE)){
						$val = $val . '__value';
					}
				}
				return $val;
			}, $fields);
			$fields[] = '_pageName';
			$fields[] = '_ID';
			$conditions = [];
			$conditions[] = '_pageName IN (' . $dbr->makeList( array_column( $resultsTitlesForCheck,'title' )) . ')';
			$res = $dbrCargo->select( $tableName, $fields, $conditions);
			//print_r($conditions);
			while ( $row = $dbrCargo->fetchObject( $res ) ) {
				//print_r([$row,'d']);
				$addToArr = &$resultsTitlesAliases[$row->_pageName];
				foreach ($row as $key => $value) {
					//echo "$key $value<br/>";
					$keySplitted = explode('__', $key);
					if(isset( $keySplitted[1] ) && $keySplitted[1] == 'full'){
						$subTableName = $tableName . '__' . $keySplitted[0];
						if(in_array($subTableName, $allSubtablesOfFields)){
							$addToArr[$keySplitted[0]] = self::getFieldFromSubtable( $subTableName, $row);
						}
					}
					if(!isset($addToArr[$keySplitted[0]])){
						$addToArr[$keySplitted[0]] = $value;
					}
				}
				//print_r([$row]);
				//unset( $row['_pageName']);
				//$addToArr = array_merge($addToArr, (array)$row);
			}
		}
		//die($tableName . '  >>  ' . print_r($conditions));
		//die(print_r([$resultsTitlesForCheck,"ss"]));
		return $resultsTitlesForCheck;
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
			'action=fennecadvancedsearchsearch'
		);
	}
	public static function getFieldsNames($dbrCargo, $tableName){
		$res = $dbrCargo->select($tableName, '*',[],__METHOD__,'limit 1');
		while ( $row = $dbrCargo->fetchRow( $res ) ) {
			return array_keys($row);
		}

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