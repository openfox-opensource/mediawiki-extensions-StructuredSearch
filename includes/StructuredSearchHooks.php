<?php

namespace MediaWiki\Extension\StructuredSearch;

use \Mediawiki\MediaWikiServices;
use CirrusSearch\Search\CirrusSearchIndexFieldFactory;
use CirrusSearch\SearchConfig;
#add SlotRecord
use MediaWiki\Revision\SlotRecord;
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
		// Parse parameters
		if ( !empty( $params ) ) {
			
			foreach ( $params as $param ) {
				$param = trim( $param );
	
				// Handle inline CSS dynamically
				if ( str_starts_with( $param, 'filter=' ) ) {
					$value = substr( $param, strlen( 'filter=' ) );
					if ( $value === 'hidden' ) {
						
						$pageProps['structured-search-filter'] = htmlspecialchars( $value );
					}
				} elseif ( str_starts_with( $param, 'input=' ) ) {
					$value = substr( $param, strlen( 'input=' ) );
					if ( $value === 'hidden' ) {
						$pageProps['structured-search-input'] = htmlspecialchars( $value );
					}
				} elseif ( str_starts_with( $param, 'resultsSumMessage=' ) ) {
						$value = substr( $param, strlen( 'resultsSumMessage=' ) );
						if ( $value === 'hidden' ) {
							$pageProps['structured-search-resultsSumMessage'] = htmlspecialchars( $value );
						}
					} elseif ( str_starts_with( $param, 'labels=' ) ) {
						$value = substr( $param, strlen( 'labels=' ) );
						if ( $value === 'hidden' ) {
							$pageProps['structured-search-labels'] = htmlspecialchars( $value );
						}
						
				}  elseif ( str_starts_with( $param, 'class=' ) ) {
					$value = substr( $param, strlen( 'class=' ) );
					$pageProps['structured-search-class'] = htmlspecialchars( $value );
						
				}
				elseif ( str_starts_with( $param, 'placeholder=' ) ) {
					$value = substr( $param, strlen( 'placeholder=' ) );
					$pageProps['structured-search-placeholder'] = htmlspecialchars( $value );
						
				}
				elseif ( str_starts_with( $param, 'title=' ) ) {
					$value = substr( $param, strlen( 'title=' ) );
					$pageProps['structured-search-title'] = htmlspecialchars( $value );
						
				}
				elseif ( str_starts_with( $param, 'page-filter=' ) ) {
					$value = substr( $param, strlen( 'page-filter=' ) );
					if ( $value === 'hidden' ) {
						$pageProps['structured-search-page-filter'] = htmlspecialchars( $value );
					}
				} elseif ( str_starts_with( $param, 'category-filter=' ) ) {
					$value = substr( $param, strlen( 'category-filter=' ) );
					if ( $value === 'hidden' ) {
						$pageProps['structured-search-category-filter'] = htmlspecialchars( $value );
					}
				}
	
				elseif ( str_starts_with( $param, 'category=' ) ) {
					$value = substr( $param, strlen( 'category=' ) );
					$pageProps['structured-search-category'] = htmlspecialchars( $value );
				} elseif ( str_starts_with( $param, 'pageType=' ) ) {
					$value = substr( $param, strlen( 'pageType=' ) );
					$pageProps['structured-search-pageType'] = htmlspecialchars( $value );
				}
				elseif ( str_starts_with( $param, 'namespaces=' ) ) {
					$value = substr( $param, strlen( 'namespaces=' ) );
					$pageProps['structured-search-namespaces'] = (int) $value;;
				}
				elseif ( str_starts_with( $param, 'limit=' ) ) {
					$value = substr( $param, strlen( 'limit=' ) );
					if ( is_numeric( $value ) ) {
						$pageProps['structured-search-limit'] = (int) $value; // Ensure it's a valid integer
					} else {
						wfDebugLog('StructuredSearch', "Invalid limit value: $value");
					}
				}
				
					elseif ( str_starts_with( $param, 'display=' ) ) {
						$value = substr( $param, strlen( 'display=' ) );
						$pageProps['structured-search-display'] = htmlspecialchars( $value );
					}
					elseif ( str_starts_with( $param, 'table=' ) ) {
						$value = substr( $param, strlen( 'table=' ) );
						$pageProps['structured-search-table'] = htmlspecialchars( $value );
					}
					
			}
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
					<div id="results"></div>
				</div>
			</div>
				</div>
			';
		
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
				$newPropsArray[substr($key, strlen('structured-search-'))] = $value;
			}
			$structuredSearchProps = $newPropsArray;
		}
		
		return $structuredSearchProps ? $structuredSearchProps : [];
	}
	public static function onSkinAfterContent( &$data,  $skin ) { 
		
			//get the structured search props, filter by keys
			$scriptPath = MediaWikiServices::getInstance()->getMainConfig()->get('ScriptPath');
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
	
		$props = self::getStructuredSearchProps( $title, $out->getUser() );
		
		if ( !empty( $props ) ) {
			
			// Pass the properties to JavaScript
			$out->addJsConfigVars( 'structuredSearchProps', $props );
			SpecialStructuredSearch::addSearchParams( $out );
			$out->addModuleStyles( [ 'ext.StructuredSearch.styles' ] );
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
		return array_map( function( $category ){
			return $category['cat_id'] . ':' . $category['title'];
		}, $visibleCategories );
	}
	public static function addPageImageInSearch( $page,&$fields ) {
		if ( class_exists( 'PageImages' ) || class_exists( 'PageImages\PageImages' ) ) {
		
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
			if( !$image && class_exists( 'PageImages\PageImages' ) ){
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
				
				//echo $title->getText() .   __LINE__.  "  _________  $image --------\n";
			}
			$imageAsUrl = $image ? self::fixImageToThumbs( $image ): null;
			if( $image && (!$imageAsUrl || $imageAsUrl == $image)){
				$imageAsUrl = self::fixImageToThumbs( 'file:' . $image );
			}
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
					$pageContent = $imagePage->getPage()->getRevisionRecord()->getContent( SlotRecord::MAIN )->getText();
					$fileContent = "";
					try {
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
		$conf = MediaWikiServices::getInstance()->getMainConfig();
		$wgScriptPath = $conf->get( 'ScriptPath' );
		$wgStructuredSearchThumbSize = $conf->get( 'StructuredSearchThumbSize' );
		$dimensions = explode( 'X', $wgStructuredSearchThumbSize );
		// if('cli' == php_sapi_name()){
		// 	print_r([
		// 		$wgScriptPath,
		// 		$wgStructuredSearchThumbSize,
		// 		$dimensions,
		// 		$file,
		// 	]);
		// }
		$fileClass = MediaWikiServices::getInstance()->getRepoGroup()->findFile( \Title::newFromText( $file ) );
		$thumb = $fileClass ? $fileClass->transform( [ 'width' => $dimensions[0], 'height' => $dimensions[1] ] ) : null;
		$thumbUrl = null;
		if ( $thumb ) {
			$thumbUrl = $thumb->getUrl();
		}
		return $thumbUrl ? $thumbUrl : $file;
	}
	public static function testImages($pageNames){
		echo get_class( MediaWikiServices::getInstance()->getRepoGroup() ) . "\n";
		$stubFields = [];
		foreach( $pageNames as $pageName ){

			$wikiPage = \WikiPage::factory( \Title::newFromText( $pageName ) );
			echo "test image " . $pageName . "\n";
			echo print_r(self::addPageImageInSearch(  $wikiPage, $stubFields  ),1) . "\n";
			echo "finn test image " . $pageName . "\n";
		}

	}
}
