<?php

namespace MediaWiki\Extension\FennecAdvancedSearch;

use Config;
use CirrusSearch\Search\SearchContext;
use Title;
use CirrusSearch\Query\SimpleKeywordFeature;
use CirrusSearch\Query\QueryHelper;
/**

 */
class InCargoFeature extends SimpleKeywordFeature {
	/**
	 * @var int
	 */
	private $maxConditions;

	/**
	 * @param Config $config
	 */
	public function __construct(  ) {
	}
	// public function _getKeywords() {
	// 	return $this->getKeywords();
	// }

	/**
	 * @return string[]
	 */
	protected function getKeywords() {
		$config = \MediaWiki\MediaWikiServices::getInstance()->getMainConfig();
		$params = Utils::getSearchParams();

		$keywords = [];
		foreach ($params as $param) {
			$fieldName = $param['field'];
			if( Utils::isCargoField($fieldName) ){
				$keywords[] = 'in_' . Utils::replaceCargoFieldToElasticField( $fieldName);
			}
		}
		//die(print_r($keywords));
		return $keywords;
	}

	/**
	 * @param SearchContext $context
	 * @param string $key The keyword
	 * @param string $value The value attached to the keyword with quotes stripped
	 * @param string $quotedValue The original value in the search string, including quotes if used
	 * @param bool $negated Is the search negated? Not used to generate the returned AbstractQuery,
	 *  that will be negated as necessary. Used for any other building/context necessary.
	 * @return array Two element array, first an AbstractQuery or null to apply to the
	 *  query. Second a boolean indicating if the quotedValue should be kept in the search
	 *  string.
	 */
	protected function doApply( SearchContext $context, $key, $value, $quotedValue, $negated ) {
		//die($key . $value);
		//$cargoParts = explode( '__', $key );
		$tableDef = preg_replace('/in_/', '', $key); //cargoParts[0];
		//list( $tableName, $fieldName)
		$values = explode( '|',$value);
		//die(print_r($categories));
		$params = Utils::getSearchParams();
		$paramKey = Utils::replaceElasticFieldToCargoField( $tableDef );
		$param = isset( $params[ $paramKey ]) ? $params[ $paramKey ]: null;
		$paramQueryType = $param && isset( $param['widget']['type'] ) ? $param['widget']['type'] : '';
		//die($paramQueryType . 'fff'. $paramKey. print_r($params));
		switch ( $paramQueryType ) {
			case 'range':
				$filter = $this->matchCargoRange($tableDef, $values );
				break;
			
			default:
				$filter = $this->matchCargoQuery($tableDef, $values );
				break;
		}
		
		if ( $filter === null ) {
			$context->setResultsPossible( false );
			$context->addWarning(
				'fennec-advanced-search-incargo-feature-no-valid-categories',
				$key
			);
		}
		
		return [ $filter, false ];
	}

	/**
	 * Builds an or between many categories that the page could be in.
	 *
	 * @param string $tableDef table defination to use as elastic field
	 * @param string[] $values cargo values to match
	 * @return \Elastica\Query\Match|null A null return value means all values are filtered
	 *  and an empty result set should be returned.
	 */
	private function matchCargoQuery(string $tableDef, array $values ) {
		$filter = new \Elastica\Query\BoolQuery();
		
		
		foreach ( $values as $value ) {
			//die($tableDef . '.lowercase_keyword >> ' . $value);
			$match = new \Elastica\Query\Match();
			$match->setFieldQuery( $tableDef , $value );
			//die(print_r($match));
			$filter->addShould( $match );
		}

		return $filter;
	}
	private function matchCargoRange(string $tableDef, array $rangeArgs ) {
		// $rangeArgs = array_map(function( $val ){
		// 	return (integer) $val;
		// },$rangeArgs);
		$rangeArgs = [
			'gte' =>(integer) $rangeArgs[0],
			'lte' => (integer)$rangeArgs[1],
		];
		// var_dump([$rangeArgs,$tableDef]);
		// die();
		$filter = new \Elastica\Query\BoolQuery();
		$range = new \Elastica\Query\Range($tableDef, $rangeArgs);
		$filter->addShould( $range );
		return $filter;
	}
}
