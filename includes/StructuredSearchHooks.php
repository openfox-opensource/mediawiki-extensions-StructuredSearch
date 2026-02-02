<?php

namespace MediaWiki\Extension\StructuredSearch;

use \Mediawiki\MediaWikiServices;
use CirrusSearch\Search\CirrusSearchIndexFieldFactory;
use CirrusSearch\SearchConfig;
#add SlotRecord
use MediaWiki\Revision\SlotRecord;
use MediaWiki\Html\Html;
use SearchEngine;
use ParserOutput;
use WikiPage;
use ContentHandler;
use Parser;
class Hooks {
	  /**
     * Register parser functions.
     *
     * @param Parser $parser
     */
    public static function onParserFirstCallInit( \Parser $parser ) {
        // Register thestructuresearch parser function
        $parser->setFunctionHook( 'structuresearch', [ self::class, 'renderstructureSearch' ] );
        // Register the list-structuredsearch-params parser function
        $parser->setFunctionHook( 'list-structuredsearch-params', [ self::class, 'renderListStructuredSearchParams' ] );
    }

    /**
     * Parser function for {{#structuresearch:}}
     *
     * @param Parser $parser
     * @return array
      */
	
	public static function renderstructureSearch( \Parser $parser, ...$params ) {
		
		$pageProps = [];
		$pageProps['structured-search-limit'] = 100;
		$dynamicFields = [];
		// Known parameter keys that are not dynamic fields
		$knownKeys = [
			'filter', 'input', 'resultsSumMessage', 'labels', 'class', 
			'placeholder', 'title', 'page-filter', 'category-filter', 
			'category', 'pageType', 'namespaces', 'limit', 'display', 'table'
		];
		
		// Parse parameters
		if ( !empty( $params ) ) {
			$params = array_map( function( $param ){
				$splitted = explode( '=', $param );
				return [
					'key' => $splitted[0],
					'value' => isset( $splitted[1] ) ? $splitted[1] : '',
				];
			}, $params );
			foreach ( $params as $param ) {
				if ( in_array( $param['key'], $knownKeys ) ) {
					switch( $param['key'] ){
						case 'filter':
						case 'input':
						case 'resultsSumMessage':
						case 'labels':
						case 'class':
						case 'placeholder':
						case 'title':
						case 'page-filter':
						case 'category-filter':
						case 'category':
						case 'pageType':
						case 'namespaces':
						case 'limit':
						case 'display':
						case 'table':
							//escape html chars BUT allow " and ' not escaped
							$pageProps['structured-search-' . $param['key']] = htmlspecialchars( $param['value'], ENT_NOQUOTES | ENT_SUBSTITUTE, 'UTF-8' , false);
							//replace back &#34; to " and &#39; to '
							$pageProps['structured-search-' . $param['key']] = str_replace( [ '&#34;', '&#39;' ], [ '"', "'" ], $pageProps['structured-search-' . $param['key']] );
							break;
					}
				} else {
					// This is a potential dynamic field parameter
					// Store it - filtering against StructuredSearchParams will happen later
					if($param['value'] == 'false'){
						continue;
					}
					if($param['value'] == 'true'){
						$param['value'] = '';
					}
					if($param['key'] == 'namespaces_field'){
						$param['key'] = 'namespaces';
					}
					if ( empty( $param['value'] ) ) {
						$dynamicFields[$param['key']] = [];
					} else {
						// Parse comma-separated values
						$values = array_map( 'trim', explode( ',', $param['value'] ) );
						$values = array_filter( $values ); // Remove empty values
						if ( !empty( $values ) ) {

							$dynamicFields[$param['key']] = $values;
						} else {
							// Empty after filtering, store as empty array
							$dynamicFields[$param['key']] = [];
						}
					}
					
				}
			}		
		}
		// if(isset($_COOKIE['zikit_2025_kw_UserID']) && '910' == $_COOKIE['zikit_2025_kw_UserID']){
		// 	die("<pre>" . print_r([$params,$pageProps], true) . "</pre>");
		// }
		// Store dynamic fields as JSON in page properties
		if ( !empty( $dynamicFields ) ) {
			$pageProps['structured-search-dynamic-fields'] = json_encode( $dynamicFields );
		}
		// Save the props in the parser output
		$parserOutput = $parser->getOutput();
	
		if ( !empty( $pageProps ) ) {
			foreach ( $pageProps as $key => $value ) {
				$parserOutput->setPageProperty( $key, $value );
			}
		}
	
		// Global CSS for other elements
		
	
		// Build the dynamic HTML
		$scriptPath = MediaWikiServices::getInstance()->getMainConfig()->get('ScriptPath');

		$htmlContent = ' 
			<div class="parser-search-container">
		<div id="parser-search-title" ></div>
			<div class="parser-search">
			
				<div id="side-bar" ></div>
				<div class="top-and-results-wrp">
					<div class="checking-sticky"></div>
					<div id="top-bar" class="sticky-top"></div>
					<div id="results" class="min-h-96"></div>
				</div>
			</div>
				</div>
			';
		
		return [
			$htmlContent,
			'isHTML' => true
		];
	}

	/**
	 * Parser function for {{#list-structuredsearch-params:}}
	 * Lists all StructuredSearchParams in HTML format
	 *
	 * @param Parser $parser
	 * @return array
	 */
	public static function renderListStructuredSearchParams( \Parser $parser ) {
		$searchParams = Utils::getSearchParamsFiltered();
		$htmlRows = [];
		$searchParams = array_map(function( $param ){
			$label = isset( $param['label'] ) && !empty( $param['label'] ) ? $param['label'] : null;
			if($param['field'] == 'namespaces'){
				$param['field'] = 'namespaces_field';
			}
			if( !$label && isset( $param['widget']['label'] ) && !empty( $param['widget']['label'] ) ){
				$label = $param['widget']['label'];
			}
			if( !$label ){
				$labelExists = false;
				$label = $param['field'];
			}
			else{
				$labelExists = true;
			}
			return [
				'labelExists' => $labelExists,
				'field' => $param['field'],
				'label' => $label,
			];
		}, $searchParams);

		//sort by labelExists - true first
		usort($searchParams, function( $a, $b ){
			return $a['labelExists'] ? -1 : 1;
		});
		//die(print_r($searchParams));
		
		foreach($searchParams as $param){
			$htmlRows[] = Html::rawElement( 'tr', [],
				Html::element( 'td', [], $param['label'] ) .
				Html::element( 'td', [], $param['field'] )
			);
		}
		
		$htmlContent = Html::rawElement( 'table', [ 'class' => 'wikitable', 'style' => 'max-width: 100%;' ],
			Html::rawElement( 'thead', [],
				Html::rawElement( 'tr', [],
					Html::element( 'th', [], 'Readable name' ) .
					Html::element( 'th', [], 'Field name' )
				)
			) .
			Html::rawElement( 'tbody', [], implode( '', $htmlRows ) )
		);
		
		return [
			$htmlContent,
			'isHTML' => true
		];
	}

	public static function getStructuredSearchProps( $title, $user){
		if(!$title || $title->isSpecialPage() || $title->isExternal()){
			return;
		}
		$wikiPage = MediaWikiServices::getInstance()->getWikiPageFactory()->newFromTitle( $title );
	
		if ( !$wikiPage || !$wikiPage->exists() ) {
			wfDebugLog( 'StructuredSearch', 'WikiPage does not exist for title: ' . $title->getPrefixedText() );
			return; // Exit early if the page does not exist
		}

		// Get the ParserOutput for the current page
		$parserOutput = $wikiPage->getParserOutput( $wikiPage->makeParserOptions( $user ) );
	
		if ( !$parserOutput ) {
			wfDebugLog( 'StructuredSearch', 'Failed to retrieve ParserOutput for page: ' . $title->getPrefixedText() );
			return;
		}
	
		// Retrieve page properties
		$props = $parserOutput->getPageProperties();
	
		if ( !empty( $props ) ) {
			//get the structured search props, filter by keys
			$structuredSearchProps = array_filter( $props, function( $key ){
				return strpos( $key, 'structured-search-' ) === 0;
			}, ARRAY_FILTER_USE_KEY );
		}
		//remove the structured search prefix
		
		if($structuredSearchProps && count($structuredSearchProps)){
			$newPropsArray = [];
			foreach($structuredSearchProps as $key => $value){
				$newKey = substr($key, strlen('structured-search-'));
				// Decode dynamic fields JSON
				if ( $newKey === 'dynamic-fields' ) {
					$decoded = json_decode( $value, true );
					if ( $decoded ) {
						$newPropsArray[$newKey] = $decoded;
					}
				} else {
					$newPropsArray[$newKey] = $value;
				}
			}
			$structuredSearchProps = $newPropsArray;
		}
		
		return $structuredSearchProps ? $structuredSearchProps : [];
	}
	public static function onSkinAfterContent( &$data,  $skin ) { 
		
			//get the structured search props, filter by keys
			$scriptPath = MediaWikiServices::getInstance()->getMainConfig()->get('ScriptPath');
			//if action is edit, skip
			$action = $skin->getRequest()->getText('action');
			if($action === 'edit'){
				return;
			}
			$structuredSearchProps = self::getStructuredSearchProps( $skin->getTitle(), $skin->getUser() );
			if($structuredSearchProps && count($structuredSearchProps)){
				//get all files in __DIR__ . '/../react/dist'
				//add them to the as script and link tags
				$files = scandir( __DIR__ . '/../react/dist' );
				foreach($files as $file){
					//ignore map files
					if( strpos( $file, '.map' ) !== false ){
						continue;
					}
					if( strpos( $file, '.js' ) !== false ){
						$data .= '<script src="' . htmlspecialchars($scriptPath) . '/extensions/StructuredSearch/react/dist/' . $file . '"></script>';
					}
					if( strpos( $file, '.css' ) !== false ){
						$data .= '<link rel="stylesheet" href="' . htmlspecialchars($scriptPath) . '/extensions/StructuredSearch/react/dist/' . $file . '">';
					}
				}
			}
	 }

	public static function onBeforePageDisplay( \OutputPage $out, \Skin $skin ) {
		// Get the current page's title
		
		$title = $out->getTitle();
	
		// Check if the title is valid and not a special or external page
		if ( !$title || $title->isSpecialPage() || $title->isExternal() ) {
			wfDebugLog( 'StructuredSearch', 'Skipping invalid or special page: ' . $title->getPrefixedText() );
			return; // Exit early for invalid or special pages
		}
		$action = $skin->getRequest()->getText('action');
		if($action === 'edit'){
				return;
			}
		
		$props = self::getStructuredSearchProps( $title, $out->getUser() );
		
		if ( !empty( $props ) ) {
			if(isset($props['dynamic-fields'])){
				$predefinedParams = Utils::getSearchParams();
				foreach($props['dynamic-fields'] as $key => &$value){
					if( isset( $predefinedParams[$key] ) ){
						$values = $value ?? [];
						$value = $predefinedParams[$key];
						//widget is always not in sidebar, as there is no space for it
						$value['widget']['position'] = 'topbar';
						if(!empty( $values )){
							$value['widget']['options'] = $values;
						}
						//if widget type is checkbox modify type to select
						if(isset($value['widget']['type']) && $value['widget']['type'] == 'checkboxes'){
							$value['widget']['type'] = 'select';
							
							//add empty option
							//also remove html from each option's label
							if(isset($value['widget']['options']) && is_array($value['widget']['options'])){
								foreach($value['widget']['options'] as &$option){
									$option['label'] = strip_tags($option['label']);
								}
							}
						}
						if(isset($value['widget']['type']) && $value['widget']['type'] == 'select'){
							$value['widget']['options'] = array_merge([['label' => wfMessage( 'structuredsearch-choose' )->text(), 'value' => '']], $value['widget']['options']);

							$value['widget']['is_not_multiple'] = true;
						}

					}
				}
			}
	//			die("<pre>" . print_r($props, true) . "</pre>");
			
			// Pass the properties to JavaScript
			$out->addJsConfigVars( 'structuredSearchProps', $props );
			SpecialStructuredSearch::addSearchParams( $out );
			$out->addModuleStyles( [ 'ext.StructuredSearch.styles', 'ext.StructuredSearch.parser-styles' ] );
		} else {
			wfDebugLog( 'StructuredSearch', 'No structuredSearchProps found for this page.' );
		}
		
	}
	
	
	
	
	
	public static function categoryExtract( &$params ) {
		$params['category'] = [
			'label' => wfMessage( 'structuredsearch-category-label' )->text(),
			'field' => 'category',
			'weight' => 0,
			'widget' => [
				'type' => 'autocomplete',
				'position' => 'sidebar',
				'autocomplete_callback' => "\\MediaWiki\\Extension\\StructuredSearch\\Utils::categoryAutocomplete",
			],
		];
	}
	public static function tryGetNSReplace() {
		global $wgContLang;
		$conf = MediaWikiServices::getInstance()->getMainConfig();
		$manualNamespaces = $conf->get( 'StructuredSearchNSReplace' );

		foreach ( $manualNamespaces as &$manualNamespace ) {
			if ( !isset( $manualNamespace['value'] ) ) {
				$manualNamespace['value'] = $manualNamespace['ns'];
			}
		}
		return $manualNamespaces && count( $manualNamespaces ) ? $manualNamespaces : null;
	}
	public static function getDefinedNamespaces() {
		$included = self::tryGetNSReplace();
		return $included && count( $included ) ? $included : array_values( self::getNamespacesDefaultWithOverrides() );
	}
	public static function namespacesExtract( &$params ) {
		$conf = MediaWikiServices::getInstance()->getMainConfig();
		$topOrSide = $conf->get( 'StructuredSearchNSTopOrSide' );
		$params['namespaces'] = [
			'label' => wfMessage( 'structuredsearch-namespace-label' )->text(),
			'field' => 'namespaces',
			'withoutLabels' => 1,
			'widget' => [
				'type' => 'checkboxes',
				'position' => $topOrSide,
				'options' => self::getDefinedNamespaces(),
			],
		];
	}
	public static function getNamespacesDefaultWithOverrides() {
		$contLang = MediaWikiServices::getInstance()->getContentLanguage();
		$conf = MediaWikiServices::getInstance()->getMainConfig();
		$namespaceIds = $conf->get( 'ContentNamespaces' );
		$wgExtraNamespaces = $conf->get( 'ExtraNamespaces' );
		$localizedNamespaces = $contLang->getNamespaces();
		$namespaceIdsNames = [];
		foreach ( $namespaceIds as $namespaceId ) {
			if ( 0 === $namespaceId ) {
				$namespaceStr = trim( wfMessage( 'blanknamespace' )->plain(), '()' );
			} else {
				$namespaceStr = isset( $wgExtraNamespaces[ $namespaceId ] ) ? $wgExtraNamespaces[ $namespaceId ] : (isset($localizedNamespaces[ $namespaceId ]) ? $localizedNamespaces[ $namespaceId ]: '');
			}
			if ( $namespaceStr ) {
				$namespaceIdsNames[$namespaceStr] = $namespaceId;
			}
		}

		// function( $ns ) use ($localizedNamespaces, $wgExtraNamespaces){

		// }, $namespaceIds);
		// $namespaceIdsNames = array_filter($namespaceIdsNames);
		return self::namespacesProcess( $namespaceIdsNames );
	}
	public static function namespacesProcess( $namespaces ) {
		$conf = MediaWikiServices::getInstance()->getMainConfig();
		$includeTalkPagesType = $conf->get( 'StructuredSearchNSIncludeTalkPagesType' );
		$showDefault = $conf->get( 'StructuredSearchNSDefaultPosition' );
		$returnedNamespaces = [];
		foreach ( $namespaces as $nsName => $namespaceId ) {

			$show = $showDefault;
			if ( ( ( (int)$namespaceId % 2 ) ) || !is_numeric( $namespaceId ) ) {
				$show = $includeTalkPagesType;
			} elseif ( $namespaceId < 0 ) {
				$show = 'advanced';
			}
			$returnedNamespaces[$namespaceId] = [
				'label' => $nsName ? preg_replace( '/_/', ' ', $nsName ) : wfMessage( 'structuredsearch-main-namesapce' )->text(),
				'value' => $namespaceId,
				'show' => $show,
			];
		}
		$NSOverride = $conf->get( 'StructuredSearchNSOverride' );
		$weightCount = 1;
		foreach ( $NSOverride as $NSData ) {
			$NSKey = $NSData['ns'];
			$returnedNamespaces[ $NSKey ]['value'] = $NSData['ns'];
			
			foreach ( [ 'show', 'defaultChecked', 'label','weight' ] as $key ) {
				if ( isset( $NSData[ $key ] ) ) {
					$returnedNamespaces[ $NSKey ][ $key ] = $NSData[ $key ];
				}
			}
			if ( !isset( $returnedNamespaces[ $NSKey ]['weight'] ) ) {
				$returnedNamespaces[ $NSKey ]['weight'] = $weightCount;
				$weightCount++;
			}
		}
		foreach ( $returnedNamespaces as &$ns ) {
			if ( !isset( $ns['weight'] ) ) {
				$ns['weight'] = $weightCount;
			}
		}
		usort( $returnedNamespaces, function ( $itemA, $itemB ){
			return $itemA['weight'] < $itemB['weight'] ? -1 : ( $itemA['weight'] === $itemB['weight'] ? 0 : 1 );
		} );
		// die(print_r($returnedNamespaces));
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
		if ( $engine instanceof \CirrusSearch\CirrusSearch ) {
			/**
			 * @var \CirrusSearch $engine
			 */
			//if cli
			
			$conf = MediaWikiServices::getInstance()->getMainConfig();
			$params = Utils::getSearchParams();
			$builder = new CirrusSearchIndexFieldFactory( $engine->getConfig() );
			foreach ( $params as $param ) {
				if ( Utils::isCargoField( $param['field'] ) ) {
					$keyForCirrus = Utils::replaceCargoFieldToElasticField( $param['field'] );

					$fields[$keyForCirrus] = Utils::isNumericField( $param ) ? $builder->newLongField( $keyForCirrus ) : $builder->newKeywordField( $keyForCirrus );
				}
			}
			if ( $conf->get( 'StructuredSearchAddFilesContentToIncludingPages' ) ) {
				$fields['is_included_file'] = $builder->newLongField( 'is_included_file' );
			}
			foreach([
				'full_title',
				'short_title',
				'title_dash',
				'title_dash_short',
				'page_link',
				'title_key',
				'page_image_ext',
				'visible_categories'
			] as $fieldKey){
				//echo $fieldKey . "\n";
				$fields[$fieldKey] = $builder->newKeywordField( $fieldKey );
			}
			
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
		$conf = MediaWikiServices::getInstance()->getMainConfig();
		//global $myheritageIsDev, $wgArticlePath;
		
		$params = Utils::getSearchParams();
		
		$vals = ApiSearch::getResultsAdditionalFieldsFromTitles( [ $page->getTitle()->getPrefixedText() ], [ [] ] );
		
		$vals = array_pop( $vals );
		foreach ( $params as $param ) {
			if ( Utils::isCargoField( $param['field'] ) ) {
				$keyForCirrus = Utils::replaceCargoFieldToElasticField( $param['field'] );
				$fieldName = $param['field'];
				$fields[ $keyForCirrus ] = isset( $vals[ $fieldName ] ) ? Utils::getFieldValueForIndex( $vals[$fieldName ], $param ) : '';
			}
		}
		$titleClass = $page->getTitle();
		
		$namespaceId = $titleClass->getNamespace();
		$fields['full_title'] = $titleClass->getFullText();
		$fields['short_title'] = $titleClass->getText();
		$fields['title_dash'] = $titleClass->getPrefixedDBkey();
		$fields['title_dash_short'] = $titleClass->getDBkey();
		$fields['page_link'] = $titleClass->getLinkURL();
		$fields['namespaceId'] = $titleClass->getNamespace();
		$fields['title_key'] = ($namespaceId ? $namespaceId : '0' ) . ':' . $fields['title_dash'];
		$fields['page_image_ext'] = self::addPageImageInSearch( $page,$fields );
		$fields['visible_categories'] = self::getVisibleCategories( $page );
		//print_r( [$myheritageIsDev, $wgArticlePath,$fields['page_link']] );
		
		//wfDebugLog( 'mh-log', print_r(array_keys($fields),1). " ====>>>>>======" . $fields['display_title'] . " ==========");
		
		
	}
	public static function getVisibleCategories( $page ) {
		$dbr = wfGetDB( DB_REPLICA );
		$res = $dbr->select(
			[ 'categorylinks','page', 'category' ],
			[ 'cl_to', 'page_id',  'cat_id' ],
			[  
				'cl_from=' . $page->getId(),
				'cl_type="page"',
				'page_namespace=' . NS_CATEGORY,
			],
			__METHOD__,
			[],
			[
				'page' => [ 'INNER JOIN', [ 'page_title=cl_to' ] ],
				'category' => [ 'INNER JOIN', [ 'cat_title=cl_to' ] ],
			]
		);
		$visibleCategories = [];
		while ( $row = $res->fetchObject( ) ) {
			$visibleCategories[] = [
				'page_id' => $row->page_id,
				'title' => $row->cl_to,
				'cat_id' => $row->cat_id,
			];
		}
		//check if category is hidden using page_props
		
		$hiddenCategories = [];
		if(count($visibleCategories)){
			$res = $dbr->select(
				[ 'page_props' ],
				[ 'pp_page' ],
				[
					'pp_page IN (' . $dbr->makeList( array_column( $visibleCategories, 'page_id' ) ) . ')',
					'pp_propname="hiddencat"',
				],
				__METHOD__,
				[]
			);
			while ( $row = $res->fetchObject( ) ) {
				$hiddenCategories[] = $row->pp_page;
			}
		}
		
		$visibleCategories = array_filter( $visibleCategories, function( $category ) use ( $hiddenCategories ){
			return !in_array( $category['page_id'], $hiddenCategories );
		} );
		//return array of cat_id:cat_title
		$catsAsStrings = array_map( function( $category ){
			return $category['cat_id'] . ':' . $category['title'];
		}, $visibleCategories );
		if(count( $catsAsStrings )){
			$catsAsStrings = array_values( array_unique( $catsAsStrings ) );
		}
		return $catsAsStrings;
	}
	public static function addPageImageInSearch( $page ) {
		if ( class_exists( 'PageImages' ) || class_exists( 'PageImages\PageImages' ) ) {
			$dbr = wfGetDB( DB_REPLICA );
			$image = $dbr->selectField( 'page_props',
				'pp_value',
				[
					'pp_page' => $page->getId(),
					'pp_propname' => [ \PageImages\PageImages::PROP_NAME, \PageImages\PageImages::PROP_NAME_FREE ]
				],
				__METHOD__,
				[ 'ORDER BY' => 'pp_propname' ]
			);
			
			if(!$image){
				$title = $page->getTitle();
				$dbr = wfGetDB( DB_REPLICA );
				$res = $dbr->select(
					[ 'imagelinks','page' ],
					[ 'il_from','il_to','CONCAT(page_namespace,":",page_title) as concatKey', ],
					[
						'CONCAT(page_namespace,":",page_title) = ' . $dbr->addQuotes( $title->getNamespace() . ':' . $title->getText() )
					],
					__METHOD__,
					[],
					[ 'page' => [ 'INNER JOIN', [ 'page_id=il_from' ] ],
					]
				);
				$image = null;
				while ( $row = $res->fetchObject( ) ) {
					$image = $row->il_to;
					//echo $title->getText() . __LINE__.  "  _________  $image --------\n";
					break;
				}
			}
			
			// Validate and normalize the image filename
			if( $image ){
				$images = explode( ',', $image );
				$all_legit_files = TRUE;
				foreach( $images as $image ){
						//check if there is file extension (.jpeg/png/jpg/webp, any other legit extension - for ALL parts of the image name)
					$extension = pathinfo($image, PATHINFO_EXTENSION);
					if( !$extension || !in_array( $extension, [ 'jpeg', 'png', 'jpg', 'webp', 'gif', 'svg', 'ico', 'bmp', 'tiff', 'tif', 'webp'])){
						$all_legit_files = FALSE;
					}

					$checkImage = \Title::newFromText( $image, NS_FILE );
					if( !$checkImage || !$checkImage->exists() ){
						$all_legit_files = FALSE;
					}
				}
				if( $all_legit_files ){
					$image = $images[0];
				}
			}
			
			$imageAsUrl = $image ? self::fixImageToThumbs( $image ): null;
			//$imageAsUrlIsUrl = filter_var($imageAsUrl, FILTER_VALIDATE_URL);
			// if( $image && !$imageAsUrlIsUrl && (!$imageAsUrl || $imageAsUrl == $image)){
			// 	$imageAsUrl = self::fixImageToThumbs( 'file:' . $image );
			// }
			//echo $title->getText() .   __LINE__.  "  _________  $imageAsUrl --------\n";
			return $imageAsUrl ? $imageAsUrl : null;
		}
		else{
			return null;
		}
	}
	public static function onStructuredSearchSearchDataForIndexAfterWikiText(
		array &$fields,
		WikiPage $page,
		ParserOutput $parserOutput,
		SearchEngine $searchEngine
	) {
		$conf = MediaWikiServices::getInstance()->getMainConfig();
		$addIncludedFilesField = $conf->get( 'StructuredSearchAddFilesContentToIncludingPages' );
		// if( $addIncludedFilesField ){
		// $fields['is_included_files'] = 0;
		// }

		if ( NS_FILE != $page->getTitle()->getNameSpace() ) {
			$images = self::getPageFiles( $page );
			$filesContent = "";
			foreach ( $images as $image ) {
				$imagePage = \ImagePage::newFromID( $image );

				if ( $imagePage ) {
					$revision = $imagePage->getPage()->getRevisionRecord();
					if ( !$revision ) {
						continue;
					}
					$pageContent = $revision->getContent( SlotRecord::MAIN )->getText();
					$fileContent = "";
					try {
						$revision = $imagePage->getPage()->getRevisionRecord();
						$pageContent = $revision->getContent( SlotRecord::MAIN )->getText();
						$fileContent = "";
						$file = $imagePage->getFile();
						$mimeType = $file->getMimeType();
						if( $mimeType ){
							$fileHandler = $file->getHandler( $mimeType );
							if ( $fileHandler ) {
								$fileContent = $fileHandler->getEntireText( $file );
							}
						}
						else{
							print_r([
								"can't get mime type for file " . $imagePage->getTitle()->getPrefixedText(),

							]);
						}
						
					} catch ( \Throwable $th ) {
						error_log( "Error on StructuredSearch::onSearchDataForIndex " . $th->getMessage() );
					}
					$allContent = implode( "\n", array_filter( [ $pageContent,$fileContent ] ) );

					if ( $allContent ) {
						$filesContent = $allContent;
					}
				}
			}

			if ( $filesContent ) {
				$fields[ 'text' ] .= "\n" . $filesContent;
				$fields[ 'source_text' ] .= "\n" . $filesContent;

			}

		} else {
			$allImagesIncluded = self::getImagesIncluded( [ $page->getDBkey() ] );

			if ( count( $allImagesIncluded ) ) {

				if ( $addIncludedFilesField ) {
					$fields['is_included_file'] = 1;
				}

			}

		}
		
		// die();
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
		$features[] = new NotIncludedFileFeature();
	}
	public static function onStructuredSearchParams( &$params ) {
		$params['search'] = [
			'label' => '',// wfMessage('structuredsearch-search-label')->text(),
			'field' => 'search',
			'withoutLabels' => 1,
			'widget' => [
				'type' => 'autocomplete',
				'position' => 'topbar',
				'placeholder' => wfMessage( "structuredsearch-search-placeholder" )->text(),
			],
		];

		$conf = MediaWikiServices::getInstance()->getMainConfig();
		$defaultParams = $conf->get( 'StructuredSearchDefaultParams' );
		if ( !count( $defaultParams ) ) {
			$defaultParams = [ 'namespaces', 'category' ];
		}
		foreach ( $defaultParams as $keyParam => $defaultParam ) {
			// support both keyed array (without settings overriding)
			if ( is_string( $defaultParam ) ) {
				$pName = $defaultParam;
				$pAdditionalSettings = null;
			}
			// and associative param, with settings overriding
 			else {
				$pName = $keyParam;
				$pAdditionalSettings = $defaultParam;
			}
			switch ( $pName ) {
				case 'namespaces':
				case 'category':
					$methodName = $pName . "Extract";
					self::$methodName( $params );
					if ( $pAdditionalSettings ) {
						$params[$pName] = array_merge( $params[$pName], $pAdditionalSettings );
					}
				default:
					break;
			}
		}
	}
	
	public static function addOptionsToCargoTable( &$params ) {
		foreach ( $params as $key => &$param ) {
			if ( isset( $param['widget']['type'] ) && in_array( $param['widget']['type'], [ 'checkboxes','radios','select' ] ) && !isset( $param['widget']['options'] ) && Utils::isCargoField( $param['field'] ) ) {
				$options = array_values( Utils::cargoAllRows( $param['field'] ) );
				$options = array_filter( $options );
				foreach ( $options as &$option ) {
					$option = [
						'label' => $option,
						'value' => $option,
					];
				}
				if ( !count( $options ) ) {
					unset( $params[$key] );
					continue;
				}
				if ( 'select' === $param['widget']['type'] ) {
					array_unshift( $options, [
						'label' => wfMessage( 'structuredsearch-choose' )->text(),
						'value' => '<select>',
					] );
					if(isset($_GET['dssddasdasadsasdsddsasadsadasd'])){
						die(print_r([wfMessage( 'structuredsearch-choose' )->text()]));
					}
				}
				$param['widget']['options'] = $options;
			}
		}
	}
	public static function onStructuredSearchResults( &$results ) {
		$params = Utils::getSearchParams();
		$imagesKeys = [];
		foreach ( $params as $param ) {
			if ( isset( $param['type'] ) && 'image' == $param['type'] ) {
				$imagesKeys[] = $param['field'];
			}
		}

		foreach ( $results as &$result ) {
			foreach ( $imagesKeys as $imageKey ) {
				if ( isset( $result[$imageKey] ) ) {
					$result[$imageKey] = self::fixImageToThumbs( $result[$imageKey] );
				}
			}
		}
	}

	public static function getImagesIncluded( $imagesIds ) {
		$dbr = wfGetDB( DB_REPLICA );
		$res = $dbr->select(
				[ 'imagelinks' ],
			[ 'DISTINCT il_to  as il_to' ],
			[ 'il_to IN (' . $dbr->makeList( $imagesIds ) . ')' ],
		);
		$allImagesIncluded = [];
		while ( $row = $res->fetchObject() ) {
			$allImagesIncluded[] = $row->il_to;
		}
		return $allImagesIncluded;
	}
	public static function getPageFiles( $page ) {
		$dbr = wfGetDB( DB_REPLICA );
		$res = $dbr->select(
			[ 'imagelinks', 'page' ],
			[ 'il_to', 'page_id' ],
			[
				'il_from=' . $page->getId()
			],
			__METHOD__,
			[],
			[
				'page' => [ 'INNER JOIN', [ 'page_title=il_to', "page_namespace=" . NS_FILE ] ],
			]
		);

		$allImages = [];
		while ( $row = $res->fetchObject( ) ) {
			$allImages[] = $row->page_id;
		}
		return $allImages;
	}
	public static function overrideWikitextContentHandler() {
		global $wgContentHandlers;
		$conf = MediaWikiServices::getInstance()->getMainConfig();
		if ( $conf->get( 'StructuredSearchAddFilesContentToIncludingPages' ) ) {

			$wgContentHandlers[CONTENT_MODEL_WIKITEXT]['class'] = StructuredSearchWikitextContentHandler::class;

			// if(isset($_GET['ddd'])){
			// }

		}
	}

	public static function fixImageToThumbs( $file ) {
		
		//sanity - if no "file:" prefix, add it
		if( is_string($file) ){
			$titleToCheck = \Title::newFromText( $file );
			if(!$titleToCheck || $titleToCheck->getNamespace() != NS_FILE){
				$file = 'file:' . $file;
			}
		}
		if(is_array($file) ){
			$file = $file[0];
		}
		//if $file is url, return it
		if(strpos($file, 'http') === 0){
			return $file;
		}
		$conf = MediaWikiServices::getInstance()->getMainConfig();
		$wgScriptPath = $conf->get( 'ScriptPath' );
		$wgStructuredSearchThumbSize = $conf->get( 'StructuredSearchThumbSize' );
		$dimensions = explode( 'X', $wgStructuredSearchThumbSize );
		// if('cli' == php_sapi_name()){
		// 	print_r([
				
		// 	]);
		// }
		if(!is_string($file) && "cli" == php_sapi_name()){
			print_r([
				"file is not string",
				gettype($file),
				
			]);
		}
		
		$title = \Title::newFromText( $file );
		if ( !$title ) {
			return $file;
		}
		
		$fileClass = MediaWikiServices::getInstance()->getRepoGroup()->findFile( $title );
		if ( !$fileClass ) {
			return $file;
		}
		
		// Check if this is a ForeignAPI file and handle it specially
		if ( $fileClass instanceof \ForeignAPIFile ) {
			$repo = $fileClass->getRepo();
			if ( $repo instanceof \ForeignAPIRepo ) {
				$width = isset( $dimensions[0] ) ? (int)$dimensions[0] : -1;
				$height = isset( $dimensions[1] ) ? (int)$dimensions[1] : -1;
				
				// Get thumbnail URL directly from the ForeignAPI repo
				$thumbUrl = $repo->getThumbUrlFromCache(
					$fileClass->getName(),
					$width,
					$height,
					''
				);
				
				if ( $thumbUrl ) {
					return $thumbUrl;
				}
			}
		}
		
		// For regular files, use the transform method
		$thumb = $fileClass->transform( [ 'width' => $dimensions[0], 'height' => $dimensions[1] ] );
		$thumbUrl = null;
		if ( $thumb && !$thumb->isError() ) {
			$thumbUrl = $thumb->getUrl();
		}
		if('cli' == php_sapi_name() && !$thumbUrl){
			$exception = new \Exception();
			$trace = $exception->getTraceAsString();
			print_r([
					$wgScriptPath,
					$file,
					$thumbUrl,
					$wgStructuredSearchThumbSize,
					$dimensions,
					$file, 
					($thumb?get_class($thumb): 'no thumb'),
					($fileClass?get_class($fileClass): 'no fileClass'),
					$trace
			]);
	}

		return $thumbUrl ? $thumbUrl : $file;
	}
	public static function testImages($pageNames){
		echo get_class( MediaWikiServices::getInstance()->getRepoGroup() ) . "\n";
		$stubFields = [];
		foreach( $pageNames as $pageName ){

			$wikiPage = MediaWikiServices::getInstance()->getWikiPageFactory()->newFromTitle( \Title::newFromText( $pageName ) );
			echo "test image " . $pageName . "\n";
			echo print_r(self::addPageImageInSearch(  $wikiPage, $stubFields  ),1) . "\n";
			echo "finn test image " . $pageName . "\n";
		}

	}
}
