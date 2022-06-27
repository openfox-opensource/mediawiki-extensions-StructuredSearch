<?php

namespace MediaWiki\Extension\StructuredSearch;

class Utils {
	public static function categoryAutocomplete( $term ) {
		$conf = \MediaWiki\MediaWikiServices::getInstance()->getMainConfig();
		$categoryInclude = $conf->get( 'StructuredSearchCategoryInclude' );
		return $categoryInclude ? self::preccessDefaultCategories( $categoryInclude, $term ) : self::getCategoriesFromDb( $term );
	}

	public static function cargoAllRows( $fieldName ) {
		$dbrCargo = \CargoUtils::getDB();
		$splitted = preg_split( '/:/', $fieldName );
		$tableName = $splitted[0];
		$columnName = $splitted[1];
		$subTable = self::replaceCargoFieldToElasticField( $fieldName );
		$tables = self::getSubtablesOfFields( $tableName );
		if ( $tables && in_array( $subTable, $tables ) ) {

			// read subtitle
			$res = $dbrCargo->select( $subTable, [
				'DISTINCT(_value) as val'
			] );

		} else {
			try {
				$res = $dbrCargo->select( $tableName, [
					'DISTINCT(' . $columnName . ') as val'
				] );

			} catch ( \Throwable $th ) {

				// TODO indicate this table not exits
				return [];
			}

		}

		$results = [];
		while ( $row = $dbrCargo->fetchObject( $res ) ) {
			$results[$row->val] = $row->val;
		}

		return $results;
	}

	public static function cargoAutocomplete( $term, $fieldName ) {
		$results = self::cargoAllRows( $fieldName );
		$results = array_filter( $results, function ( $val ) use ( $term ){
			return strpos( $val, $term ) === 0;
		} );
		return $results;
	}

	public static function preccessDefaultCategories( $cats, $term = false ) {
		$newCats = [];
		foreach ( $cats as $cat ) {
				$catTitle = \Title::newFromText( $cat );
				if ( $catTitle ) {
					$readableTitle = $catTitle->getText();
					if ( !$term || 0 === strpos( $term, $readableTitle ) ) {
						$newCats[$catTitle->getDbKey()] = $readableTitle;
					}
				}
		}
		return $newCats;
	}

	// static public function onBeforePageDisplay(\OutputPage $out, \Skin $skin ){
	// $title = $out->getTitle();
	// //StructuredSearchApiSearch::getResultsAdditionalFieldsFromTitles([$title]);
	// // $b = new InCargoFeature();
	// // print_r($b->_getKeywords());
	// }

	public static function getCategoriesFromDb( $term ) {
		$dbr = wfGetDB( DB_REPLICA );
		$conf = \MediaWiki\MediaWikiServices::getInstance()->getMainConfig();
		$categoryExclude = $conf->get( 'StructuredSearchCategoryExclude' );
		foreach ( $categoryExclude as &$cat ) {
			$catTitle = \Title::newFromText( $cat );
			if ( $catTitle ) {
				$cat = $catTitle->getDbKey();
			}
		}
		// die( print_r(get_class($dbr)  ));
		// die('page_title IN (' . $dbr->makeList( $results[1] ) . ')');
		$res = $dbr->select(
			[ 'category' ],
			[ 'cat_title', 'cat_id' ],
			[
				"cat_title LIKE " . $dbr->addQuotes( $term . '%' ) ,
				'cat_pages > 0',
			],
			__METHOD__
		);
		$categoriesToReturn = [];
		while ( $row = $dbr->fetchObject( $res ) ) {
			if ( in_array( $row->cat_title, $categoryExclude ) ) {
				continue;
			}
			$categoriesToReturn[$row->cat_title ] = preg_replace( "/_/", " ", $row->cat_title );

		}
		return $categoriesToReturn;
	}

	public static function getSearchParamsFiltered() {
		$params = self::getSearchParams();
		foreach ( $params as &$param ) {
			if ( isset( $param['widget']['autocomplete_callback'] ) ) {
				unset( $param['widget']['autocomplete_callback'] );
			}
		}
				// die(print_r($params));
		return $params;
	}

	public static function getSubtablesOfFields( $tableName ) {
		$conf = \MediaWiki\MediaWikiServices::getInstance()->getMainConfig();
		$dbr = wfGetDB( DB_REPLICA );
		$dbrCargo = \CargoUtils::getDB();
		$res = $dbr->select( 'cargo_tables', [ 'field_tables' ],
			[ 'main_table' => $tableName ] );
		$row = $dbr->fetchRow( $res );
		if ( !$row || !count( $row ) ) {
			return [];
		}
		$tables = unserialize( $row[0] );
		$allDefinedTables = $dbrCargo->query( 'show tables' );
		$tablesFromShow = [];
		$cargoPrefix = $conf->get( 'DBprefix' ) . 'cargo__';
		while ( $table = $dbr->fetchObject( $allDefinedTables ) ) {
			$tableAsArr = (array)$table;
			$tablesFromShow[] = preg_replace( '/' . $cargoPrefix . '/', '', array_pop( $tableAsArr ) );
		}
		return array_intersect( $tables, $tablesFromShow );
// return $tables;
	}

	public static function getSearchParams() {
		$conf = \MediaWiki\MediaWikiServices::getInstance()->getMainConfig();
		$params = $conf->get( 'StructuredSearchParams' );
		$newKeyedArray = [];
		foreach ( $params as $param ) {
			if ( !isset( $param['field'] ) || !$param['field'] ) {
				continue;
			}

			$newKeyedArray[$param['field']] = $param;
		}
		// run this before all hooks to let others modify predefined fields
		Hooks::onStructuredSearchParams( $newKeyedArray );
		\Hooks::run( 'StructuredSearchParams', [ &$newKeyedArray ] );
		// sanity
		foreach ( $newKeyedArray as $key => $param ) {
			if ( !isset( $param['field'] ) || !$param['field'] ) {
				unset( $newKeyedArray[$key] );
			}

		}
		Hooks::addOptionsToCargoTable( $newKeyedArray );
		// die(print_r($params,1));
		return self::fixSearchParams( $newKeyedArray );
	}

	public static function fixSearchParams( $newKeyedArray ) {
		foreach ( $newKeyedArray as &$param ) {
			if ( isset( $param['widget']['options'] ) ) {
				foreach ( $param['widget']['options'] as &$option ) {
					if ( is_string( $option ) ) {
						$option = [
							'value' => $option,
							'label' => $option,
						];
					}
				}
				// ensure options is no keyed array
				$param['widget']['options'] = array_values( $param['widget']['options'] );
			}
		}
		return $newKeyedArray;
	}

	public static function getSearchBinds( $params ) {
		$binds = [];
		foreach ( $params as $param ) {
			if ( isset( $param['bind_to'] ) ) {
				$bind = [
					'fields' => [ $param['field'] ]
				];
				if ( 'before' == $param['bind_to']['my_label_is'] ) {
					array_push( $bind['fields'], $param['bind_to']['field'] );
				} else {
					array_unshift( $bind['fields'], $param['bind_to']['field'] );
				}
				$binds[] = $bind;
			}
		}
		return $binds;
	}

	public static function getFeatureSearchStr( $fieldName, $fieldValue, $fieldDef ) {
		// use it not for indexing - send third param FALSE
		$fieldValue = self::getFieldValueForIndex( $fieldValue, $fieldDef, false );

		$fieldValue = is_array( $fieldValue ) ? implode( "|", $fieldValue ) : $fieldValue;
		$fieldValue = '"' . addcslashes( $fieldValue, '"' ) . '"';
		return ' ' . self::getFeatureKey( $fieldName ) . ':' . $fieldValue;
	}

	public static function replaceCargoFieldToElasticField( $field ) {
		return preg_replace( '/:/', '__', $field );
	}

	public static function replaceElasticFieldToCargoField( $field ) {
		return preg_replace( '/__/', ':', $field );
	}

	public static function isSearchableField( $key ) {
		return 'category' == $key || self::isCargoField( $key );
	}

	public static function isCargoField( $key ) {
		return strpos( $key, ':' );
	}

	public static function isAuthorsField( $key ) {
		return class_exists( "MediaWiki\\Extension\\StructuredSearch\\AuthorIsFeature" ) && in_array( $key, AuthorIsFeature::$fieldsNames );
	}

	public static function convertStrToTimestamp( $str ) {
		if ( preg_match( '%\d{4}/\d{1,2}/\d{1,2}%', $str ) ) {
			$str = implode( '-', array_reverse( explode( '/', $str ) ) );
		}
		return strtotime( $str );
	}

	public static function getFieldValueForIndex( $val, $paramDef, $forIndex = true ) {
		$type = isset( $paramDef['widget']['type'] ) ? $paramDef['widget']['type'] : 'default';
		$val = is_array( $val ) ? $val : explode( '|', $val );
		if ( $forIndex && isset( $paramDef['to_indexing_function'] ) && $paramDef['to_indexing_function'] ) {
			$cb = $paramDef['to_indexing_function'];
		} else {
			switch ( $type ) {
				case 'date':
				case 'dateRange':
					$cb = function ( $p ){
						return self::convertStrToTimestamp( $p );
					};
					break;
				default:
					$cb = function ( $p ){
						return $p;
					};
					break;
			}
		}
		$val = array_map( $cb, $val );

		return $val;
	}

	public static function isNumericField( $param ) {
		$isRange = isset( $param['widget']['type'] ) && 'range' == $param['widget']['type'];
		$isNumber = isset( $param['field_type'] ) && 'number' == $param['field_type'];
		return $isRange || $isNumber;
	}

	public static function getFeatureKey( $key ) {
		return 'in' . ( self::isCargoField( $key ) ? '_' : '' ) . self::replaceCargoFieldToElasticField( $key );
	}
}
