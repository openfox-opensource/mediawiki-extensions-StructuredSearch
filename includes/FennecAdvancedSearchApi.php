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

class ApiQueryFennecAdvancedSearch extends \ApiBase {
		public function __construct( $query, $moduleName ) {
		parent::__construct( $query, $moduleName );
	}

	public function execute() {
		header("Access-Control-Allow-Origin: *");
		
		$params = $this->extractRequestParams();
		$result = $this->getResult();
		
		$result->addValue( NULL, 'FennecAdvancedSearch', self::getSearchParams() );
	}

	public static function getSearchParams() {
		$conf = \MediaWiki\MediaWikiServices::getInstance()->getMainConfig();
		$params = $conf->get('FennecAdvancedSearchParams');
		\Hooks::run( 'FennecAdvancedSearchParams', [ &$params ] );
		return $params;
	}	
	protected function getAllowedParams() {
		return array(
		);
	}

	protected function getParamDescription() {
		return array(
		);
	}

	protected function getDescription() {
		return 'Get fennece advanced search settings';
	}

	protected function getExamples() {
		return array(
			'action=fennecadvancedsearch'
		);
	}

	public function getVersion() {
		return __CLASS__ . ': $Id$';
	}


}