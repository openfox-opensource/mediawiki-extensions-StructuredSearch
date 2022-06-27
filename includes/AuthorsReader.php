<?php

namespace MediaWiki\Extension\StructuredSearch;

class AuthorsReader {
	private $showBots = false;
	private $conditions = [];
	private $namespaces = [];
	private $creator = null;
	private $lastEditor = null;
	private $fullList = [];

	public function __construct( $showBots = true, $conditions = false ) {
		
		$this->showBots = $showBots;
		$this->conditions = $conditions ? $conditions : [];
		if( $this->isFilterBySearchNamespaces()){
			$dbr = wfGetDB( DB_REPLICA );
			$namespaces = array_column(Hooks::getDefinedNamespaces(),"value");
			$this->conditions[] = 'page_namespace IN (' . $dbr->makeList( $namespaces ) . ')' ;
		}
		$this->loadAuthorsFromDb();
		$this->processResults();
	}

	public function processResults() {
		$this->creator = $this->fullList[0]['user_name'];
		if ( !$this->showBots ) {
			$this->authors = $this->filterBots( $this->fullList );
			$this->authors = array_column( $this->authors, 'user_name' );
			// if creator is bot, remove it.
			if ( !in_array( $this->creator, $this->authors ) ) {
				$this->creator = null;
			}
		} else {
			$this->authors = array_column( $this->fullList, 'user_name' );
		}
		$this->lastEditor = $this->authors[count( $this->authors ) - 1 ];
	}

	public function getAuthors() {
		return $this->authors;
	}

	public function getCreator() {
		return $this->creator;
	}

	public function getLastEditor() {
		return $this->lastEditor;
	}

	public function loadAuthorsFromDb() {
		$services = \MediaWiki\MediaWikiServices::getInstance();
		$revisionStore = $services->getRevisionStore();
		$dbr = wfGetDB( DB_REPLICA );
		$revQuery = $revisionStore->getQueryInfo( [ 'user' ] );
		if( $this->isFilterBySearchNamespaces() ){
			$revQuery['tables'][] = 'page';
			$revQuery['joins']['page'] = [
				'JOIN',
				'rev_page = page_id'
			];
		}
		$res = $dbr->select(
			$revQuery['tables'],
			[ 'user_name, user_id' ],
			count($this->conditions) ? $this->conditions : ['1=1'],
			__METHOD__,
			[ 'ORDER BY' => 'rev_id ASC' ],
			$revQuery['joins']
		);
		$rows = [];
		foreach ( $res as $row ) {
			if ( $row && $row->user_name ) {
				$rows[] = (array)$row;
			}
		}
		// print_r([count($rows), $this->conditions]);
		$this->fullList = $rows;
	}

	public function filterBots( $authors ) {
		$botsAuthors = $this->getBotsFromAuthors( array_column( $authors, 'user_id' ) );
		$allAuthorsNotBots = array_filter( $authors, function ( $row ) use ( $botsAuthors ) {
			return isset( $row['user_id'] ) 
					&& $row['user_id'] 
					&& !in_array( $row['user_id'], $botsAuthors ) 
					&& $row['user_name'] != wfMessage('autocreatecategorypages-editor')->text();
		} );
		return $allAuthorsNotBots;
	}

	public function isFilterBySearchNamespaces( ) {
		$conf = \MediaWiki\MediaWikiServices::getInstance()->getMainConfig();
		return $conf->get("StructuredSearchFilterAuthorsBySearchNamespaces");
	}
	public function getBotsFromAuthors( array $authorsIds ) {
		$authorsIds = array_filter( $authorsIds );
		if ( !count( $authorsIds ) ) {
			return [];
		}
		$dbr = wfGetDB( DB_REPLICA );
		$res = $dbr->select(
			[ 'user_groups' ],
			[ 'ug_user' ],
			[
				'ug_user IN (' . $dbr->makeList( $authorsIds ) . ')',
				'ug_group' => 'bot'
			],
			__METHOD__,
		);
		// get all rows from $results
		$rows = [];
		foreach ( $res as $row ) {
			$rows[] = $row->ug_user;
		}
		return $rows;
	}
}
