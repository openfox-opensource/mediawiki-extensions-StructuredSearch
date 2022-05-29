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

namespace MediaWiki\Extension\StructuredSearch;

class ApiParams extends \ApiBase {
		public function __construct( $query, $moduleName ) {
		parent::__construct( $query, $moduleName );
	 }

	public function execute() {
		global $fennecLocal;
		if ( $fennecLocal ) {
			header( "Access-Control-Allow-Origin: *" );
		}

		// else{
		// die($_SERVER["REMOTE_ADDR"]);
		// }
		$params = $this->extractRequestParams();
		$result = $this->getResult();
		$searchParams = Utils::getSearchParams();
		$result->addValue( null, 'params',  $searchParams );
		$result->addValue( null, 'binds',  Utils::getSearchBinds( $searchParams ) );
		$result->addValue( null, 'templates', self::getResultsTemplates() );
		$result->addValue( null, 'translations', self::getTranslates() );
	}

	public static function getResultsTemplates() {
		$conf = \MediaWiki\MediaWikiServices::getInstance()->getMainConfig();
		$templates = $conf->get( 'StructuredSearchResultsTemplates' );
		return $templates;
	}
	public static function getTranslates() {
		$translateStrs = file_get_contents( __DIR__ . '/../i18n/he.json' );
		$translateStrs = json_decode( $translateStrs, true );
		unset( $translateStrs['@metadata'] );
		$translateStrs = array_keys( $translateStrs );

		$translations = [];
		foreach ( $translateStrs as $tStr ) {
			$translations[$tStr] = wfMessage( $tStr )->text();
		}
		return $translations;
	}
	protected function getAllowedParams() {
		return [
		];
	}

	protected function getParamDescription() {
		return [
		];
	}

	protected function getDescription() {
		return 'Get fennec advanced search settings';
	}

	protected function getExamples() {
		return [
			'action=structuredsearchparams'
		];
	}

	public function getVersion() {
		return __CLASS__ . ': $Id$';
	}

}
