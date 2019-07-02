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
        	'weight' =>0,
	        'widget' => [
	            'type' => 'autocomplete',
	            'position' => 'sidebar',
	            'autocomplete_callback' => "\\MediaWiki\\Extension\\FennecAdvancedSearch\\Utils::categoryAutocomplete",
	        ],
	    ];
	}
	static public function tryGetNSReplace( ){
		global $wgContLang;
		$conf = \MediaWiki\MediaWikiServices::getInstance()->getMainConfig();
		$manualNamespaces = $conf->get('FennecAdvancedSearchNSReplace');

		// $fullNsData = [];
		// if($manualNamespaces && count($manualNamespaces)){
		// 	$namespaceIds = $wgContLang->getNamespaceIds();
		// 	$manualNamespacesIds = array_keys($manualNamespace);//array_column($manualNamespaces, 'id')
		// 	//print_r($namespaceIds);
		// 	foreach ($namespaceIds as $name => $nsId) {
		// 		//echo $nsId . '<br/>';
		// 		if(in_array($nsId, $manualNamespacesIds)){
		// 			$fullNsData[] = [
		// 				'label' => $name,
		// 				'value' => $nsId,
		// 				'show' => $manualNamespaces[ $nsId ],
		// 			];
		// 		}
		// 	}

		// }
		return $manualNamespaces && count($manualNamespaces) ? $manualNamespaces : NULL;
	}
	static public function getDefinedNamespaces( ){
		$included = self::tryGetNSReplace();
		return $included && count($included) ? $included : array_values( self::getNamspacesDefaultWithOverrides() );
	}
	static public function namespacesExtract( &$params ){
		
		$params['namespace'] = [
			'label' => '',//wfMessage('fennecadvancedsearch-namespace-label')->text(),
        	'field' => 'namespace',
	        'widget' => [
	            'type' => 'checkboxes',
	            'position' => 'topbar',
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
		$includeTalkPagesType = $conf->get('FennecAdvancedSearchNSIncludeTalkPagesType');
		$showDefault = $conf->get('FennecAdvancedSearchNSDefaultPosition');
		$returnedNamespaces = [];
		foreach ($namespaces as $nsName => $namespaceId) {
			
			$show = $showDefault;
			if( ( ( (integer) $namespaceId % 2) ) || ! is_numeric($namespaceId) ){
				$show = $includeTalkPagesType;
			}
			else if( $namespaceId < 0 ){
				$show = 'advanced';
			}
			$returnedNamespaces[$namespaceId] = [
				'label' => $nsName ? preg_replace('/_/',' ', $nsName) : wfMessage('fennecadvancedsearch-main-namesapce')->text(),
				'value' => $namespaceId,
				'show' => $show,
			];
		}
		$NSOverride = $conf->get('FennecAdvancedSearchNSOverride');
		$weightCount = 1;
		foreach ($NSOverride as $NSData) {
			$NSKey = $NSData['ns'];
			foreach( ['show', 'defaultChecked', 'label'] as $key){
				if( isset( $NSData[ $key ] ) ){
					$returnedNamespaces[ $NSKey ][ $key ] = $NSData[ $key ];
				}
			}
			if(!isset($returnedNamespaces[ $NSKey ]['weight'])){
				$returnedNamespaces[ $NSKey ]['weight'] = $weightCount;
				$weightCount++;
			}
		}
		foreach ($returnedNamespaces as &$ns) {
			if(!isset($ns['weight'])){
				$ns['weight'] = $weightCount;
			}
		}
		usort($returnedNamespaces, function( $itemA, $itemB){
			return $itemA['weight'] < $itemB['weight'] ? -1 : ( $itemA['weight'] === $itemB['weight'] ?0 :1);
		});
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

					$fields[$keyForCirrus] = Utils::isNumericField($param) ? $builder->newLongField($keyForCirrus) : $builder->newStringField($keyForCirrus);
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
				//print_r($vals);
		
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
			'label' => '',// wfMessage('fennecadvancedsearch-search-label')->text(),
        	'field' => 'search',
	        'widget' => [
	            'type' => 'autocomplete',
	            'position' => 'topbar',
	            'placeholder' => wfMessage( "fennecadvancedsearch-search-placeholder" ),
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
		self::addOptionsToCargoTable( $params );
		
	}
	static public function addOptionsToCargoTable( &$params ){
		foreach ($params as &$param ) {
			if( in_array($param['widget']['type'] , ['checkboxes','radios','select']) && !isset($param['widget']['options']) && Utils::isCargoField( $param['field'] ) ){
				$options = array_values(Utils::cargoAllRows($param['field']));
				foreach ($options as &$option) {
					$option = [
						'label' => $option,
						'value' => $option,
					];
				}
				if( 'select' === $param['widget']['type'] ){
					array_unshift($options, [
						'label' => wfMessage('fennecadvancedsearch-choose'),
						'value' => '',
					]);
				}
				$param['widget']['options'] = $options;
			}
		}
	}
	static public function onFennecAdvancedSearchResults( &$results ){
		$params = Utils::getSearchParams();
		$imagesKeys = [];
		foreach ($params as $param) {
			if( isset( $param['type']) && 'image' == $param['type']){
				$imagesKeys[] = $param['field'];
			}
		}
		
		foreach ($results as &$result) {
			foreach ($imagesKeys as $imageKey) {
				if(isset($result[$imageKey])){
					$result[$imageKey] = Hooks::fixImageToThumbs( $result[$imageKey]);
				}
			}
		}
		//die();
		//die(print_r($imagesKeys));
	}
	static public function fixImageToThumbs( $file ){
		//die($file);
		global $wgScriptPath;
		$fileClass = wfFindFile(\Title::newFromText($file));
		$thumb = $fileClass ? $fileClass->transform( [ 'width' => 120, 'height' => 120 ] ) : NULL;
		$thumbUrl = NULL;
		if ( $thumb ) {
			$thumbUrl = $thumb->getUrl( );
		}
		return $thumbUrl ? $thumbUrl : $file;
	}

}