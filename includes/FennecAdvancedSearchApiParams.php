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

class ApiParams extends \ApiBase {
		public function __construct( $query, $moduleName ) {
		parent::__construct( $query, $moduleName );

	}

	public function execute() {
		if('127.0.0.1' == $_SERVER["REMOTE_ADDR"]){
			header("Access-Control-Allow-Origin: *");
		}
		// else{
		// 	die($_SERVER["REMOTE_ADDR"]);
		// }
		$params = $this->extractRequestParams();
		$result = $this->getResult();
		
		$result->addValue( NULL, 'params', Utils::getSearchParams() );
		$result->addValue( NULL, 'templates', self::getResultsTemplates() );
		$result->addValue( NULL, 'translations', self::getTranslates() );
	}

	
	public static function getResultsTemplates() {
		$conf = \MediaWiki\MediaWikiServices::getInstance()->getMainConfig();
		$templates = $conf->get('FennecAdvancedSearchResultsTemplates');
		return $templates;
	}	
	public static function getTranslates() {
		$translateStrs = [
			"fennecadvancedsearch-from-label",
			"fennecadvancedsearch-to-label",
			"fennecadvancedsearch-more-label",
			"fennecadvancedsearch-less-label",
			"fennecadvancedsearch-search-label",
			"fennecadvancedsearch-no-results",
			"fennecadvancedsearch-on-results-error",
			"fennecadvancedsearch-show-more",
			"fennecadvancedsearch-clear",
		];
		$translations = [];
		foreach ($translateStrs as $tStr) {
			$translations[$tStr] = wfMessage($tStr)->text();
		}
		return $translations;
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