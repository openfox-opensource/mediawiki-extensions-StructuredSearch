<?php

namespace MediaWiki\Extension\StructuredSearch;

use MediaWiki\MediaWikiServices;
use MediaWiki\HookContainer\HookRunner;

class StructuredSearchWikitextContentHandler extends \WikitextContentHandler{
    public function getDataForSearchIndex(
		\WikiPage $page,
		\ParserOutput $parserOutput,
		\SearchEngine $engine
	) {
        $fields = parent::getDataForSearchIndex( $page, $parserOutput, $engine );
        $hookContainer =  MediaWikiServices::getInstance()->getHookContainer() ;
		$hookContainer->run( 'StructuredSearchSearchDataForIndexAfterWikiText', [ &$fields, $page, $parserOutput, $engine ] );
		return $fields;
    }

}