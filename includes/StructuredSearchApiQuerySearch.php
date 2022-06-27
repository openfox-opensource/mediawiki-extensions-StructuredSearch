<?php

namespace MediaWiki\Extension\StructuredSearch;

class StructuredSearchApiQuerySearch extends \ApiQuerySearch {
	public function __construct( \ApiQuery $query, $moduleName ) {
		parent::__construct( $query,  $moduleName, 'sr' );
	}

	public function getAllowedParams() {
		$params = parent::getAllowedParams();
		$params[\CirrusSearch\CirrusSearch::EXTRA_FIELDS_TO_EXTRACT] = [
			\ApiBase::PARAM_TYPE => 'string',
			\ApiBase::PARAM_ISMULTI => true,
		];
		return $params;
	}

	public function getSearchProfileParams() {
		return [
			'qiprofile' => [
				'profile-type' => \SearchEngine::FT_QUERY_INDEP_PROFILE_TYPE,
				'help-message' => 'apihelp-query+search-param-qiprofile',
			],
			\CirrusSearch\CirrusSearch::EXTRA_FIELDS_TO_EXTRACT => [
				'profile-type' => \CirrusSearch\CirrusSearch::EXTRA_FIELDS_TO_EXTRACT,
 ],
		];
	}
}
