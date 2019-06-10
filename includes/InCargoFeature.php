<?php

namespace MediaWiki\Extension\FennecAdvancedSearch;

use Config;
use CirrusSearch\Search\SearchContext;
use Title;

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
	public function __construct( Config $config ) {
		$this->maxConditions = $config->get( 'CirrusSearchMaxIncategoryOptions' );
	}

	/**
	 * @return string[]
	 */
	protected function getKeywords() {
		$params = $config->get( 'FennecAdvancedSearchParams' );
		$keywords = [];
		foreach ($params as $param) {
			$fieldName = $param['field'];
			if($fieldName, strpos(':') ){
				$keywords[] = preg_replace('/:/', '---', $fieldName);
			}
		}
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
		$cargoParts = explode( ':', $value );
		$tableDef = $cargoParts[0];
		//list( $tableName, $fieldName)
		$values = explode( '|',$cargoParts[1]);
		//die(print_r($categories));
		$filter = $this->matchCargoQuery($tableDef, $values );
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
	 * @param string[] $categories categories to match
	 * @return \Elastica\Query\BoolQuery|null A null return value means all values are filtered
	 *  and an empty result set should be returned.
	 */
	private function matchCargoQuery(string $tableDef, array $values ) {
		$filter = new \Elastica\Query\BoolQuery();
		
		
		foreach ( $value as $values ) {
			$filter->addShould( QueryHelper::matchPage( $tableDef . '.lowercase_keyword', $value ) );
		}

		return $filter;
	}
}
