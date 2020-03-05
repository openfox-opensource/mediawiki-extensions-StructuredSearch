<?php

namespace MediaWiki\Extension\StructuredSearch; 


class SpecialStructuredSearch extends \SpecialPage {

    

    function __construct() {
        parent::__construct( 'StructuredSearch' );
    }

    /**
     * Main execution function
     * @param $par array Parameters passed to the page
     */
    function execute( $par ) {
        $out = $this->getOutput();
        $this->setHeaders();
        $out->setPageTitle(wfMessage('structuredsearch'));
        $out->addModules( ['ext.StructuredSearch'] );
        $path_from_root = preg_replace('%' . $_SERVER["DOCUMENT_ROOT"] . '%', '', __DIR__);
        $path_to_static = 'react/dist';
        //$path_to_static = 'react/build/static/js';

        $all_files = scandir(__DIR__ .'/../' . $path_to_static);
        $scripts = '';
        foreach ($all_files as $file) {
        	if('js' == pathinfo($file, PATHINFO_EXTENSION)){
                $path_for_file = $path_from_root . '/../' . $path_to_static . '/'. $file;
        		//$file_content = file_get_contents(__DIR__ .'/../' . $path_to_static . '/' . $file);
        		$scripts .= "<script src='$path_for_file'></script>";
        	}
        }
        $out->addHTML( file_get_contents(__DIR__ . '/../templates/search-page.html') . $scripts);   
    }
    function getGroupName() {
        return 'pages';
    }
}