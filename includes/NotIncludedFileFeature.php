<?php

namespace MediaWiki\Extension\StructuredSearch;

use Config;
use CirrusSearch\Search\SearchContext;
use Title;
use CirrusSearch\Query\SimpleKeywordFeature;
use CirrusSearch\Query\QueryHelper;
/**

 */
class NotIncludedFileFeature extends SimpleKeywordFeature {
	/**
	 * @var int
	 */
	private $maxConditions;

	/**
	 * @param Config $config
	 */
	public function __construct(  ) {
	}
	

	/**
	 * @return string[]
	 */
	protected function getKeywords() {
		return [ 'not_included_file' ];
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
		$filter = new \Elastica\Query\BoolQuery();
		
		$filter->addMustNot( ["match" => ['is_included_file' => 1 ]]);
		
		return [ $filter, false ];
	}

	
}
