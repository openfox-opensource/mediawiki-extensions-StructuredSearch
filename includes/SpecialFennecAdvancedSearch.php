<?php

namespace MediaWiki\Extension\FennecAdvancedSearch; 


class SpecialFennecAdvancedSearch extends \SpecialPage {

    

    function __construct() {
        parent::__construct( 'FennecAdvancedSearch' );
    }

    /**
     * Main execution function
     * @param $par array Parameters passed to the page
     */
    function execute( $par ) {
        $out = $this->getOutput();
        $this->setHeaders();
        $out->setPageTitle(wfMessage('fennecadvancedsearch'));
        $out->addModules( ['ext.FennecAdvancedSearch'] );
        $path_from_root = preg_replace('%' . $_SERVER["DOCUMENT_ROOT"] . '%', '', __DIR__);
        $path_to_static = 'react/dist';
        $all_files = scandir(__DIR__ .'/../' . $path_to_static);
        $scripts = '';
        foreach ($all_files as $file) {
        	if('js' == pathinfo($file, PATHINFO_EXTENSION)){
        		$file_content = file_get_contents(__DIR__ .'/../' . $path_to_static . '/' . $file);
        		$scripts .= "<script >$file_content</script>";
        	}
        }
        $out->addHTML( file_get_contents(__DIR__ . '/../templates/search-page.html') . $scripts);   
    }
    function getGroupName() {
        return 'pages';
    }
}