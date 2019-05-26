<?php

namespace MediaWiki\Extension\FennecAdvancedSearch; 

class FennecAdvancedSearchHooks{
	static public function categoryExtract( &$params ){
		$params['category'] = [
			'label' => wfMessage('fennecadvancedsearch-category-label'),
        	'field' => 'category',
	        'widget' => [
	            'type' => 'autocomplete',
	            'position' => 'sidebar',
	            'autocomplete_callback' => "\\MediaWiki\\Extension\\FennecAdvancedSearch\\FennecAdvancedSearchHooks::categoryAutocomplete",
	        ],
	    ];
	}
	static public function namespacesExtract( &$params ){
		global $wgContLang;
		$conf = \MediaWiki\MediaWikiServices::getInstance()->getMainConfig();
		$includeNamespaces = $conf->get('FennecAdvancedSearchNSInclude');
		//print_r($includeNamespaces);
		//die();
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
		$params['namespace'] = [
			'label' => wfMessage('fennecadvancedsearch-namespace-label'),
        	'field' => 'namespace',
	        'widget' => [
	            'type' => 'checkboxes',
	            'position' => 'sidebar',
	            'options' => count( $fullNsData ) ? $fullNsData : self::getAllNamspaces(),
	        ],
	    ];
		
		//die("resa" . print_r([100]));
		
	}
	static public function getAllNamspaces( ){
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
			if	( !$includeTalkPages && is_numeric($key) && ( (integer) $key % 2) ){
				continue;
			}
			$returnedNamespaces[] = [
				'label' => $key ? $namespace['name'] : wfMessage('fennecadvancedsearch-main-namesapce'),
				'value' => $key
			];
		}
		return $returnedNamespaces;
	}
	static public function onFennecAdvancedSearchParams( &$params ){
		$params['search'] = [
			'label' => wfMessage('fennecadvancedsearch-search-label'),
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