<?php

namespace MediaWiki\Extension\FennecAdvancedSearch; 

use CirrusSearch\Search\ShortTextIndexField;
use CirrusSearch\Search\CirrusSearchIndexFieldFactory;
use CirrusSearch\SearchConfig;
use SearchEngine;
use ParserOutput;
use WikiPage;
use ContentHandler;

class Hooks{
	static public function categoryExtract( &$params ){
		$params['category'] = [
			'label' => wfMessage('fennecadvancedsearch-category-label')->text(),
        	'field' => 'category',
	        'widget' => [
	            'type' => 'autocomplete',
	            'position' => 'sidebar',
	            'autocomplete_callback' => "\\MediaWiki\\Extension\\FennecAdvancedSearch\\Hooks::categoryAutocomplete",
	        ],
	    ];
	}
	static public function tryGetNSReplace( ){
		global $wgContLang;
		$conf = \MediaWiki\MediaWikiServices::getInstance()->getMainConfig();
		$manualNamespaces = $conf->get('FennecAdvancedSearchNSReplace');

		$fullNsData = [];
		if($manualNamespaces && count($manualNamespaces)){
			$namespaceIds = $wgContLang->getNamespaceIds();
			$manualNamespacesIds = array_keys($manualNamespace);//array_column($manualNamespaces, 'id')
			//print_r($namespaceIds);
			foreach ($namespaceIds as $name => $nsId) {
				//echo $nsId . '<br/>';
				if(in_array($nsId, $manualNamespacesIds)){
					$fullNsData[] = [
						'label' => $name,
						'value' => $nsId,
						'show' => $manualNamespaces[ $nsId ],
					];
				}
			}

		}
		return $fullNsData;
	}
	static public function getDefinedNamespaces( ){
		$included = self::tryGetNSReplace();
		return count($included) ? $included : array_values( self::getNamspacesDefaultWithOverrides() );
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
	static public function getNamspacesDefaultWithOverrides( ){
		global $wgContLang;
		$namespaceIds = $wgContLang->getNamespaceIds();
		//die(print_r($namespaceIds));
		return self::namespacesProccess( $namespaceIds );
	}
	static public function namespacesProccess( $namespaces ){
		$conf = \MediaWiki\MediaWikiServices::getInstance()->getMainConfig();
		$includeTalkPages = $conf->get('FennecAdvancedSearchNSIncludeTalkPages');
		
		$returnedNamespaces = [];
		foreach ($namespaces as $nsName => $namespaceId) {
			

			$returnedNamespaces[$namespaceId] = [
				'label' => $nsName ? $nsName : wfMessage('fennecadvancedsearch-main-namesapce')->text(),
				'value' => $namespaceId,
				'show' => ( ( !$includeTalkPages && ( (integer) $namespaceId % 2) ) || ! is_numeric($namespaceId) || $namespaceId < 0 ) ? 'advanced': 'main'
			];
		}
		$NSOverride = $conf->get('FennecAdvancedSearchNSOverride');
		foreach ($NSOverride as $NSKey => $NSData) {
			$returnedNamespaces[ $NSKey ] = $NSData;
		}
		//die(print_r($returnedNamespaces));
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
			$params = Utils::getSearchParams();
			foreach ($params as $param) {
				if( Utils::isCargoField($param['field']) ){
					$keyForCirrus = Utils::replaceCargoFieldToElasticField( $param['field']);
					$builder = new CirrusSearchIndexFieldFactory($engine->getConfig());

					$fields[$keyForCirrus] = 'range' == $param['widget']['type'] ? $builder->newLongField($keyForCirrus) : $builder->newStringField($keyForCirrus);
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
		
		$params = Utils::getSearchParams();
		$vals = ApiSearch::getResultsAdditionalFieldsFromTitles( [$page->getTitle()->getPrefixedText()]);
		$vals = array_pop( $vals );
				print_r($vals);
		
		foreach ($params as $param) {
			if( Utils::isCargoField($param['field']) ){
				$keyForCirrus = Utils::replaceCargoFieldToElasticField( $param['field']);
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


	

}