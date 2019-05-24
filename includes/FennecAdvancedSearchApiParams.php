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

class FennecAdvancedSearchApiParams extends \ApiBase {
		public function __construct( $query, $moduleName ) {
		parent::__construct( $query, $moduleName );

	}

	public function execute() {
		if('127.0.0.1' == $_SERVER["REMOTE_ADDR"]){
			header("Access-Control-Allow-Origin: *");
		}
		$params = $this->extractRequestParams();
		$result = $this->getResult();
		
		$result->addValue( NULL, 'params', self::getSearchParams() );
		$result->addValue( NULL, 'templates', self::getResultsTemplates() );
	}

	public static function getSearchParams() {
		$conf = \MediaWiki\MediaWikiServices::getInstance()->getMainConfig();
		$params = $conf->get('FennecAdvancedSearchParams');
		\Hooks::run( 'FennecAdvancedSearchParams', [ &$params ] );
		//die(print_r($params,1));
		return $params;
	}
	public static function getResultsTemplates() {
		$conf = \MediaWiki\MediaWikiServices::getInstance()->getMainConfig();
		$templates = $conf->get('FennecAdvancedSearchResultsTemplates');
		return $templates;
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
		return 'Get fennec advanced search settings';
	}

	protected function getExamples() {
		return array(
			'action=fennecadvancedsearchparams'
		);
	}

	public function getVersion() {
		return __CLASS__ . ': $Id$';
	}


}