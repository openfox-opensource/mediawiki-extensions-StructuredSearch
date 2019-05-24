<?php

namespace MediaWiki\Extension\FennecAdvancedSearch; 

class FennecAdvancedSearchHooks{
	static public function extractNamespaces( $namespaces ){
		$returnedNamespaces = [];
		foreach ($namespaces as $key => $namespace) {
			//just even - no talks
			if( is_numeric($key) && !( (integer)$key % 2) ){
				$returnedNamespaces[] = [
					'label' => $key ? $namespace['name'] : 'ראשי',
					'value' => $key
				];
			}
		}
		return $returnedNamespaces;
	}
	static public function onFennecAdvancedSearchParams( &$params ){
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
		//die("resa" . print_r([100]));
		$params['search'] = [
			'label' => 'חיפוש',
        	'field' => 'search',
	        'widget' => [
	            'type' => 'text',
	            'position' => 'topbar',
	        ],
		];
		$params['namespace'] = [
			'label' => 'סוג דף',
        	'field' => 'namespace',
	        'widget' => [
	            'type' => 'autocomplete',
	            'position' => 'sidebar',
	            'options' => self::extractNamespaces($result['query']['namespaces']),
	        ],
	    ];
	}
}