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

		if ( !isset( $params['search'] ) ) {
			$params['search'] = '*';
		}
		$params['prop'] = implode( '|', [
			"size",
			"wordcount",
			"timestamp",
			"snippet",
			"titlesnippet",
			"redirecttitle",
			"redirectsnippet",
			"sectiontitle",
			"sectionsnippet",
			"isfilematch",
			"categorysnippet",
			"extensiondata",
		] );
		$params[\CirrusSearch\CirrusSearch::EXTRA_FIELDS_TO_EXTRACT] = 'authors|creator|last_editor';
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
			return $val !== null;
		} );
		$params['action'] = 'query';
		$params['list'] = 'ssearch';
		$callApiParams = new \DerivativeRequest(
			$this->getRequest(),
				$params
		);
		$api = new \ApiMain( $callApiParams );
		$api->execute();

		$results = $api->getResult()->getResultData();
		$results['query']['ssearch'] = $this->addExtraFields( $results['query']['ssearch'] );
		// die( "<pre>". print_r( [$results,$params],1 ) );
		return $this->getResultsAdditionalFields( $results );
	}

	public static function addExtraFields( $results ) {
		foreach ( $results as &$result ) {
			if ( isset( $result['extensiondata']['extra_fields'] ) ) {
				// print_r(($result['extensiondata']['extra_fields']));
				foreach ( $result['extensiondata']['extra_fields'] as $extraKey => $extraField ) {
					if ( strpos( $extraKey, '_' ) === 0 ) {
						continue;
					}
					if ( is_array( $extraField ) ) {
						foreach ( $extraField as $innerKey => $innerValue ) {
							if ( strpos( $innerKey, '_' ) !== 0 ) {
								$result[$extraKey][] = $innerValue;
							}
						}
					} else {
						$result[$extraKey] = $extraField;
					}
					// if( isset($extraField[0])){
					// 	//(print_r($extraField));
					// 	$result[$extraKey] = $extraField[0];//TODO
					// }
				}
				unset( $result['extensiondata'] );
			}
		}
// die("ddddd");
		return $results;
	}

	public static function extractSearchStringFromFields( $params ) {
		$conf = \MediaWiki\MediaWikiServices::getInstance()->getMainConfig();

		$searchParams = Utils::getSearchParams();
		$searchParamsKeys = array_column( $searchParams, 'field' );
		foreach ( $params as $pKey => $pValue ) {
			if ( in_array( $pKey, $searchParamsKeys ) && isset( $searchParams[$pKey]['search_callback'] ) && function_exists( $searchParams[$pKey]['search_callback'] ) ) {
					call_user_func_array( $searchParams[$pKey]['search_callback'], [ &$params, $pKey ] );
			}
		}

		foreach ( $params as $pKey => $pValue ) {
			if ( in_array( $pKey, $searchParamsKeys ) ) {

				if ( Utils::isSearchableField( $pKey ) && $pValue ) {
					$params['search'] .= Utils::getFeatureSearchStr( $pKey, $pValue, $searchParams[$pKey] );
					unset( $params[$pKey] );
				} elseif ( Utils::isSimpleField( $pKey ) && $pValue ) {
					$params['search'] .= " " . $pKey . ':"' . $pValue . '"';
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
		return $newParams;
	}

	protected function getResultsAdditionalFields( $results ) {
		$titles = array_column( $results['query']['ssearch'], 'title' );
		$resultsData = self::getResultsAdditionalFieldsFromTitles( $titles, $results['query']['ssearch'] );
		\Hooks::run( 'StructuredSearchResultsView', [ &$resultsData ] );
		$results['query']['searchinfo']['totalhits'] = count( $resultsData );
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
		$conf = \MediaWiki\MediaWikiServices::getInstance()->getMainConfig();
		$wgArticlePath = $conf->get( 'ArticlePath' );
		$resultsTitlesForCheck = [];
		$resultsTitlesAliases = [];
		$namespaceIds = self::getNamespaces();
		foreach ( $titles as $key => $val ) {
			$titleClass = \Title::newFromText( $val );

			$namespace = $titleClass->getNamespace();
			$titleKey = ( $namespace ? $namespace : '0' ) . ':' . preg_replace( '/\s/', '_', $titleClass->getText() );
			$resultsTitlesForCheck[$titleKey] = [
					'full_title' => $titleClass->getFullText(),
					'short_title' => $titleClass->getText(),
					'title_dash' => $titleClass->getPrefixedDBkey(),
					'title_dash_short' => $titleClass->getDBkey(),
					'page_link' => $titleClass->getLinkURL(),
					'namespace' => $titleClass->getNsText(),
					'namespaceId' => $titleClass->getNamespace(),
					'title_key' => $titleKey,
					'text_has_search_results_inside' => (bool)strpos( $fullResults[$key]['snippet'], 'class="searchmatch"' ) ? "1" : ""
			];

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

		if ( count( $resultsTitlesForCheck ) ) {

			self::addCategories( $resultsTitlesForCheck );
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
		while ( $row = $dbr->fetchObject( $res ) ) {
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

			while ( $row = $dbrCargo->fetchObject( $res ) ) {
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
		while ( $row = $dbr->fetchObject( $res ) ) {
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
		while ( $row = $dbr->fetchObject( $res ) ) {
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
			while ( $row = $dbr->fetchObject( $res ) ) {
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
		while ( $row = $dbrCargo->fetchObject( $res ) ) {
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
