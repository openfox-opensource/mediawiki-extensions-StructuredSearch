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
		if(!isset($params['namespace']) || !$params['namespace']){
			$namespaces = Hooks::getDefinedNamespaces();
		//print_r([$namespaces, $params]);
			$params['namespace'] = implode('|', array_column($namespaces, 'value'));
		}
		$params = self::extractSearchStringFromFields($params);
		$srParams = [];
		

		foreach ($params as $pKey => $pValue) {
			if( !in_array($pKey, ['action','list'])){
				$srParams['sr' . $pKey ] = $pValue;
			}
		}
		$params = $srParams;
		$params['action'] = 'query';
		$params['list'] = 'search';
		
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
		$searchParamsKeys = array_column( Utils::getSearchParams(), 'field');
		//print_r($searchParamsKeys);
		foreach ($params as $pKey => $pValue) {
			//print_r([in_array($pKey, $searchParamsKeys), self::isSearchableField( $pKey )]);
			if( in_array($pKey, $searchParamsKeys) && Utils::isSearchableField( $pKey ) && $pValue){
				$queryValue = is_array($pValue) ? implode("|", $pValue) : $pValue;
				$queryValue = '"' . $queryValue .  '"';
				$params['search'] .= ' ' . Utils::getFeatureKey( $pKey) . ':' . $queryValue;
				unset($params[$pKey]);
			}
			else if( !$pValue ){
				unset($params[$pKey]);

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
		//die(print_r($titles));
		return self::getResultsAdditionalFieldsFromTitles( $titles);
	}
	public static function getResultsAdditionalFieldsFromTitles( $titles ) {
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
				$namespace = preg_replace('/\s/','_',$namespace);
				array_unshift($valSplitted, $namespaceIds[$namespace]);
			} 
			else{
				//for main
				array_unshift($valSplitted,NS_MAIN);
			}
			$titleKey = preg_replace('/\s/','_', implode(':', $valSplitted));
			$resultsTitlesForCheck[$titleKey] = [
					'title'=>$val, 
					'title_dash'=> preg_replace('/\s/','_',$val), 
					'page_link'=> preg_replace('/\$1/',preg_replace('/\s/','_',$val),$wgArticlePath), 
					'namespace' => isset($namespace) ? $namespace : '', 
					'namespaceId' => $namespaceIds[$namespace],
					'title_key' => $titleKey,
			];
			
			$resultsTitlesAliases[$val] = &$resultsTitlesForCheck[$titleKey]; 
		}
		//die(print_r($resultsTitlesAliases));

		// $results_with_data = array_map(function( $val ){
		// 	return [$val=>[
		// 		'title' => $val
		// 	]];
		// }, $results[1]);
		$dbr = wfGetDB( DB_REPLICA );
		//die('page_title IN (' . $dbr->makeList( $results[1] ) . ')');
		$res = $dbr->select(
			array( 'page_props', 'page' ),
			array( 'pp_value', 'CONCAT(page_namespace,":",page_title) as page_title' ),
			array(
				'CONCAT(page_namespace,":",page_title) IN (' . $dbr->makeList( array_keys($resultsTitlesForCheck )) . ')',
				'pp_propname="page_image"',
			),
			__METHOD__,
			array(),
			array( 
				'page' => array( 'INNER JOIN', array( 'page_id=pp_page' ) )
			)
		);
		//die(print_r('page_title IN (' . $dbr->makeList( array_keys($resultsTitlesForCheck )) . ')'));
		while ( $row = $dbr->fetchObject( $res ) ) {
			//print_r($row);
			$resultsTitlesForCheck[$row->page_title]['image'] =$row->pp_value ;
		}
		//die(print_r($resultsTitlesForCheck));
		$dbrCargo = \CargoUtils::getDB();
		$allFieldsByTables = self::getFieldsByTable( );
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
				print_r([$row,'d']);
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