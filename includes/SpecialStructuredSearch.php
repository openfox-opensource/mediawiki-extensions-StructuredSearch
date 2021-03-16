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
        global $wgScriptPath;
        $this->setHeaders();
        $out->setPageTitle(wfMessage('structuredsearch'));
        $out->addModules( ['ext.StructuredSearch'] );
        //redirect old IE to simplae search
        $out->addHeadItem( "ie-polyfill", '<script type="text/javascript">
            if( /MSIE \d|Trident.*rv:/.test(navigator.userAgent) ){
                var newLocationString = location.search.match(/advanced_search=([^&]*)/);

                console.log(newLocationString,"newLocationString", location.search);
                if( newLocationString.length > 1){
                    newLocationString = "?search=" + newLocationString[1];
                    newLocationString = location.protocol + "//" + location.hostname + "' . $wgScriptPath . '/index.php" + newLocationString;
                    location.href = newLocationString;
                }
            }
        </script>' );

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
        	else if('css' == pathinfo($file, PATHINFO_EXTENSION)){
                $path_for_file = $path_from_root . '/../' . $path_to_static . '/'. $file;
        		//$file_content = file_get_contents(__DIR__ .'/../' . $path_to_static . '/' . $file);
        		$scripts .= "<link rel='stylesheet' href='$path_for_file'></link>";
        	}
        }
        $out->addHTML( file_get_contents(__DIR__ . '/../templates/search-page.html') . $scripts);   
    }
    function getGroupName() {
        return 'pages';
    }
}