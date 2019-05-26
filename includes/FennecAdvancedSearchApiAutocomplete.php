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

class FennecAdvancedSearchApiAutocomplete extends \ApiBase {
		public function __construct( $query, $moduleName ) {
		parent::__construct( $query, $moduleName );

	}

	public function execute() {
		if('127.0.0.1' == $_SERVER["REMOTE_ADDR"]){
			header("Access-Control-Allow-Origin: *");
		}
		$params = $this->extractRequestParams();
		$result = $this->getResult();
		
		$result->addValue( NULL, 'values', $this->getAutocompleteSearch() );
		
	}

	public function getAutocompleteSearch() {
		$search = [];
		
		$searchParams = FennecAdvancedSearchApiParams::getSearchParams();
		$params = $this->extractRequestParams();
		$searchField = $params['field'];
		if(isset( $searchParams[ $searchField ] ) && isset( $searchParams[ $searchField ]['widget']['autocomplete_callback'] ) ){
			//die("Ffff" . $searchParams[ $searchField ]['widget']['autocomplete_callback']);
			$search = call_user_func( $searchParams[ $searchField ]['widget']['autocomplete_callback'],$params['search']);
		}
		else{
			die(print_r($searchParams));
		}
		return $search;
	}
	protected function getAllowedParams() {
		return array(
			'search' => null,
			'field' => null,
		);
	}

	protected function getParamDescription() {
		return array(
			'search' => 'search term',
			'field' => 'Field key as defined in FennecAdvancedSearchParams',
		);
	}

	protected function getDescription() {
		return 'Get autocomplete results for term and field name';
	}

	protected function getExamples() {
		return array(
			'action=fennecadvancedsearchautocomplete&field=category&search=a',
		);
	}


}