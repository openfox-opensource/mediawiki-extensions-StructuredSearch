<?php

namespace MediaWiki\Extension\StructuredSearch;

require_once '/var/www/html/w/maintenance/Maintenance.php';
//create maintance script to test the structured search

class StructuredSearchTest extends \Maintenance {

    public function __construct() {
        parent::__construct();
        $this->addOption( 'title', 'Title of the page to test', false, true );
    }

    public function execute() {
        $title = $this->getOption( 'title', 'Main Page' );
        $titleObj = \Title::newFromText( $title );
        $page = \MediaWiki\MediaWikiServices::getInstance()->getWikiPageFactory()->newFromTitle( $titleObj );
        print_r([$title,Hooks::addPageImageInSearch( $page )]   );
        
    }
}

$maintClass = StructuredSearchTest::class;
require_once RUN_MAINTENANCE_IF_MAIN;