<?php

namespace MediaWiki\Extension\StructuredSearch;

use CirrusSearch\Query\SimpleKeywordFeature;
use CirrusSearch\Search\SearchContext;

/**
 *
 */
class DateRangeFeature extends SimpleKeywordFeature {

	public function __construct() {
	}

	public static $keywords = [ 'created' ];

	/**
	 * @return string[]
	 */
	protected function getKeywords() {
		$config = \MediaWiki\MediaWikiServices::getInstance()->getMainConfig();
		return self::$keywords;
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
		$values = explode( '|', $value );
		if ( $key === 'created' ) {
			$key = 'create_timestamp';
		}
		$rangeArgs = [
			'gte' => $this->fixValue( $values[0] ),
			'lte' => $this->fixValue( $values[1] ),
		];
		// die(print_r($rangeArgs));
		$filter = new \Elastica\Query\BoolQuery();
		$range = new \Elastica\Query\Range( $key, $rangeArgs );
		$filter->addMust( $range );
		return [ $filter, false ];
	}

	private function matchRange( string $tableDef, array $rangeArgs ) {
		return $filter;
	}

	private function fixValue( string $date ) {
		$newDate = Utils::convertStrToTimestamp( $date );

		return date( 'Y-m-d', $newDate );
	}
}
