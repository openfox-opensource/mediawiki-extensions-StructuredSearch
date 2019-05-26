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

class FennecAdvancedSearchApiSearch extends \ApiBase {
	use \SearchApi;
	public function __construct( $query, $moduleName ) {
		parent::__construct( $query, $moduleName );

	}

	public function execute() {
		global $wgContLang;
		$this->namespaceIds = $wgContLang->getNamespaceIds();
		if('127.0.0.1' == $_SERVER["REMOTE_ADDR"]){
			header("Access-Control-Allow-Origin: *");
		}
		$result = $this->getResult();
		
		$result->addValue( NULL, 'FennecAdvancedSearchSearch', $this->getSearchParams() );
	}

	public function getSearchParams() {
		$params = $this->extractRequestParams();
		$params['action'] = 'opensearch';
		if(!isset($params['namespace']) || !$params['namespace']){
			$namespaces = self::getDefinedNamespaces();
			$params['namespace'] = implode('|',$namespaces);
		}
		//die(print_r($params,1));
		$callApiParams = new \DerivativeRequest(
		    $this->getRequest(),
			    $params
		);
		$api = new \ApiMain( $callApiParams );
		$api->execute();


		
		$results = $api->getResult()->getResultData();
		//$results = $this->filterResults($results);
		return $this->getResultsAdditionalFields($results);
	}	
	protected function getAllowedParams() {
		$searchParams = FennecAdvancedSearchApiParams::getSearchParams();
		$newParams = $this->buildCommonApiParams();
		foreach ($searchParams as $key => $value) {
			$newParams[$key] = NULL;
		}
		return $newParams;
	}


	protected function getResultsAdditionalFields( $results) {
		//die(print_r($namespaceIds));
		$conf = \MediaWiki\MediaWikiServices::getInstance()->getMainConfig();
		$wgArticlePath = $conf->get('ArticlePath');
		$resultsTitlesForCheck = [];
		$resultsTitlesAliases = [];
		foreach ($results[1] as $key => $val) {
			$valSplitted = explode(':', $val);
			if( count($valSplitted) > 1 ){
				$namespace = array_shift($valSplitted);
				$namespace = preg_replace('/\s/','_',$namespace);
				array_unshift($valSplitted, $this->namespaceIds[$namespace]);
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
					'namespace' => $namespace,
					'namespaceId' => $this->namespaceIds[$namespace],
					'title_key' => $titleKey,
			];
			$resultsTitlesAliases[$val] = &$resultsTitlesForCheck[$titleKey]; 
		}

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
		//print_r('page_title IN (' . $dbr->makeList( $resultsTitlesForCheck ) . ')');
		while ( $row = $dbr->fetchObject( $res ) ) {
			//print_r($row);
			$resultsTitlesForCheck[$row->page_title]['image'] =$row->pp_value ;
		}
		$dbrCargo = \CargoUtils::getDB();
		$allFieldsByTables = self::getFieldsByTable( );
		//no normal way to find 
		foreach ($allFieldsByTables as $tableName => $fields) {
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
			//die($tableName. print_r($fields).print_r($fieldsDeclared) . '_pageName IN (' . $dbr->makeList( array_column( $resultsTitlesForCheck,'title' )) . ')' );
			$fields[] = '_pageName';
			$res = $dbrCargo->select( $tableName, $fields, [
				'_pageName IN (' . $dbr->makeList( array_column( $resultsTitlesForCheck,'title' )) . ')' 
			]);
			while ( $row = $dbrCargo->fetchObject( $res ) ) {
				$addToArr = &$resultsTitlesAliases[$row->_pageName];
				foreach ($row as $key => $value) {
					//echo "$key $value<br/>";
					$keySplitted = explode('__', $key);
					$addToArr[$keySplitted[0]] = $value;
				}
				//print_r([$row]);
				//unset( $row['_pageName']);
				//$addToArr = array_merge($addToArr, (array)$row);
			}
		}
		//die(print_r($resultsTitlesForCheck));
		return $resultsTitlesForCheck;
	}
	protected function getParamDescription() {
		$searchParams = FennecAdvancedSearchApiParams::getSearchParams();
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
		$searchParams = FennecAdvancedSearchApiParams::getSearchParams();
		foreach ($searchParams as $searchParam ) {
			if( FALSE !== strpos($searchParam['field'],':') ){
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