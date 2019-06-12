<?php

namespace MediaWiki\Extension\FennecAdvancedSearch; 

use CirrusSearch\Search\ShortTextIndexField;
use CirrusSearch\Search\CirrusSearchIndexFieldFactory;
use CirrusSearch\SearchConfig;
use SearchEngine;
use ParserOutput;
use WikiPage;
use ContentHandler;

class FennecAdvancedSearchHooks{
	static public function categoryExtract( &$params ){
		$params['category'] = [
			'label' => wfMessage('fennecadvancedsearch-category-label')->text(),
        	'field' => 'category',
	        'widget' => [
	            'type' => 'autocomplete',
	            'position' => 'sidebar',
	            'autocomplete_callback' => "\\MediaWiki\\Extension\\FennecAdvancedSearch\\FennecAdvancedSearchHooks::categoryAutocomplete",
	        ],
	    ];
	}
	static public function tryGetIncluded( ){
		global $wgContLang;
		$conf = \MediaWiki\MediaWikiServices::getInstance()->getMainConfig();
		$includeNamespaces = $conf->get('FennecAdvancedSearchNSInclude');

		$fullNsData = [];
		if($includeNamespaces && count($includeNamespaces)){
			$namespaceIds = $wgContLang->getNamespaceIds();
			//print_r($namespaceIds);
			foreach ($namespaceIds as $name => $nsId) {
				//echo $nsId . '<br/>';
				if(in_array($nsId, $includeNamespaces)){
					$fullNsData[] = [
						'label' => $name,
						'value' => $nsId,
					];
				}
			}

		}
		return $fullNsData;
	}
	static public function getDefinedNamespaces( ){
		$included = self::tryGetIncluded();
		return count($included) ? $included : self::getNamspacesFromApi();
	}
	static public function namespacesExtract( &$params ){
		
		$params['namespace'] = [
			'label' => wfMessage('fennecadvancedsearch-namespace-label')->text(),
        	'field' => 'namespace',
	        'widget' => [
	            'type' => 'checkboxes',
	            'position' => 'sidebar',
	            'options' => self::getDefinedNamespaces(),
	        ],
	    ];
		
		//die("resa" . print_r([100]));
		
	}
	static public function getNamspacesFromApi( ){
		global $wgRequest;
		$callApiParams = new \DerivativeRequest(
		    $wgRequest,
			    [
				'action'     => 'query',
				'meta'      => 'siteinfo',
				'siprop' => 'namespaces',
				//'token'      => $user->getEditToken(),
			]
		);
		$api = new \ApiMain( $callApiParams );
		$api->execute();
		
		$result = $api->getResult()->getResultData();
		return self::namespacesProccess($result['query']['namespaces']);
	}
	static public function namespacesProccess( $namespaces ){
		$conf = \MediaWiki\MediaWikiServices::getInstance()->getMainConfig();
		$includeTalkPages = $conf->get('FennecAdvancedSearchNSIncludeTalkPages');
		$NSExclude = $conf->get('FennecAdvancedSearchNSExclude');
		$returnedNamespaces = [];
		foreach ($namespaces as $key => $namespace) {

			//filter excluded
			if( in_array($key, $NSExclude)){
				continue;
			} 
			//filter even - no talks, expet if includeTalkPages true (default false)
			if	( ( !$includeTalkPages && ( (integer) $key % 2) ) || ! is_numeric($key) ){
				continue;
			}
			$returnedNamespaces[] = [
				'label' => $key ? $namespace['name'] : wfMessage('fennecadvancedsearch-main-namesapce')->text(),
				'value' => $key
			];
		}
		return $returnedNamespaces;
	}
/**
	 * Search index fields hook handler
	 * Adds our stuff to CirrusSearch/Elasticsearch schema
	 *
	 * @param array $fields
	 * @param SearchEngine $engine
	 */
	public static function onSearchIndexFields( array &$fields, SearchEngine $engine ) {
		
		if ( $engine instanceof \CirrusSearch ) {
			/**
			 * @var \CirrusSearch $engine
			 */
			$params = FennecAdvancedSearchApiParams::getSearchParams();
			foreach ($params as $param) {
				if(strpos($param['field'], ':')){
					$keyForCirrus = preg_replace('/:/', '__', $param['field']);
					$fields[$keyForCirrus] = new ShortTextIndexField( $keyForCirrus, $keyForCirrus,$engine->getConfig());
				}
			}
			//$fields['tryToText'] = CoordinatesIndexField::build( 'coordinates', $engine->getConfig(), $engine );
		} 
	}

	/**
	 * SearchDataForIndex hook handler
	 *
	 * @param array[] $fields
	 * @param ContentHandler $contentHandler
	 * @param WikiPage $page
	 * @param ParserOutput $parserOutput
	 * @param SearchEngine $searchEngine
	 */
	public static function onSearchDataForIndex(
		array &$fields,
		ContentHandler $contentHandler,
		WikiPage $page,
		ParserOutput $parserOutput,
		SearchEngine $searchEngine
	) {
		
		$params = FennecAdvancedSearchApiParams::getSearchParams();
		$vals = FennecAdvancedSearchApiSearch::getResultsAdditionalFieldsFromTitles( [$page->getTitle()->getPrefixedText()]);
		$vals = array_pop( $vals );
				print_r($vals);
		
		foreach ($params as $param) {
			if(strpos($param['field'], ':')){
				$keyForCirrus = preg_replace('/:/', '__', $param['field']);
				$fieldName = explode(':',$param['field']);
				$fields[ $keyForCirrus ] = isset($vals[ $fieldName[1] ]) ? $vals[ $fieldName[1] ] : '';
			}
		}
		//print_r($fields);

	}
	public static function onCirrusSearchMappingConfig( array &$config, MappingConfigBuilder $builder ) { 
		
	}
	/**
	 * Add cargo search config
	 * @param SearchConfig $config
	 * @param array $features
	 */
	public static function onCirrusSearchAddQueryFeatures( SearchConfig $config, array &$features ) {
		$features[] = new InCargoFeature();
	}
	static public function onFennecAdvancedSearchParams( &$params ){
		$params['search'] = [
			'label' => wfMessage('fennecadvancedsearch-search-label')->text(),
        	'field' => 'search',
	        'widget' => [
	            'type' => 'text',
	            'position' => 'topbar',
	        ],
		];

		$conf = \MediaWiki\MediaWikiServices::getInstance()->getMainConfig();
		$defaultParams = $conf->get('FennecAdvancedSearchDefaultParams');
		if( !count( $defaultParams ) ){
			$defaultParams = ['namespaces', 'category'];
		}
		foreach ($defaultParams as $defaultParam) {
			switch( $defaultParam ){
				case 'namespaces':
				case 'category':
					$methodName = $defaultParam . "Extract";
					self::$methodName( $params );
				default:
					break;
			}
		}
		
	}
	static public function categoryAutocomplete( $term ){
		$conf = \MediaWiki\MediaWikiServices::getInstance()->getMainConfig();
		$categoryInclude = $conf->get('FennecAdvancedSearchCategoryInclude');
		return  $categoryInclude ? self::preccessDefaultCategories( $categoryInclude ) : self::getCategiresFromDb($term);

		
	}
	static public function preccessDefaultCategories( $cats ){
		$newCats = [];
		foreach ($cats as $cat) {
				$catTitle = \Title::newFromText($cat);
				if($catTitle){
					$newCats[$catTitle->getDbKey()] = $catTitle->getText();
				}
			}
		return $newCats;	
	}
	static public function onBeforePageDisplay(\OutputPage $out, \Skin $skin ){
		$title = $out->getTitle();
		//FennecAdvancedSearchApiSearch::getResultsAdditionalFieldsFromTitles([$title]);
		// $b = new InCargoFeature();
		// print_r($b->_getKeywords());
	}
	static public function getCategiresFromDb( $term ){
		$dbr = wfGetDB( DB_REPLICA );
		$conf = \MediaWiki\MediaWikiServices::getInstance()->getMainConfig();
		$categoryExclude = $conf->get('FennecAdvancedSearchCategoryExclude');
		foreach ($categoryExclude as &$cat) {
			$catTitle = \Title::newFromText($cat);
			if($catTitle){
				$cat = $catTitle->getDbKey();
			}
		}
		//die( print_r(get_class($dbr)  ));
		//die('page_title IN (' . $dbr->makeList( $results[1] ) . ')');
		$res = $dbr->select(
			array( 'category' ),
			array( 'cat_title', 'cat_id' ),
			array(
				"cat_title LIKE " . $dbr->addQuotes('%' . $term) ,
			),
			__METHOD__
		);
		$categoriesToReturn = [];
		while ( $row = $dbr->fetchObject( $res ) ) {
			if(in_array($row->cat_title, $categoryExclude)){
				continue;
			}
			$categoriesToReturn[$row->cat_title ] = preg_replace("/_/", " ", $row->cat_title );
			
		}
		return $categoriesToReturn;
	}

}