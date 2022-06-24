<?php

namespace MediaWiki\Extension\StructuredSearch;

use Config;
use CirrusSearch\Search\SearchContext;
use CirrusSearch\Query\SimpleKeywordFeature;
use CirrusSearch\Query\FilterQueryFeature;


class AuthorIsFeature extends SimpleKeywordFeature {
    public function __construct() {
	}

	/**
	 * @return string[]
	 */
	protected function getKeywords() {
		return [
            'creator',
            'authors',
            'last_editor',
        ];
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
		$names = explode( ' ', $value);
        $filter = new \Elastica\Query\BoolQuery();

		foreach ( $names as $name ) {
            $match = new \Elastica\Query\Match();
			$match->setFieldQuery( 'author', $name );
			$filter->addShould( $match );
		}


		return [ $filter, false ];
	}
}
