<?php

namespace MediaWiki\Extension\StructuredSearch;

use MediaWiki\MediaWikiServices;

class StructuredSearchWikitextContentHandler extends \WikitextContentHandler {
	public function getDataForSearchIndex(
		\WikiPage $page,
		\ParserOutput $parserOutput,
		\SearchEngine $engin,
		?\MediaWiki\Revision\RevisionRecord $revision = null
	) {
		$fields = parent::getDataForSearchIndex( $page, $parserOutput, $engine );
		$hookContainer = MediaWikiServices::getInstance()->getHookContainer();
		$hookContainer->run( 'StructuredSearchSearchDataForIndexAfterWikiText', [ &$fields, $page, $parserOutput, $engine ] );
		return $fields;
	}

}
