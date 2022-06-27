<?php

namespace MediaWiki\Extension\StructuredSearch;

class AuthorsReader {
	private $showBots = false;
	private $creator = null;
	private $lastEditor = null;
	private $fullList = [];

	public function __construct( $showBots = true, $conditions = false ) {
		$this->showBots = $showBots;
		$this->conditions = $conditions ? $conditions : [ '1=1' ];
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
		$res = $dbr->select(
			$revQuery['tables'],
			[ 'user_name, user_id' ],
			$this->conditions,
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
			return isset( $row['user_id'] ) && $row['user_id'] && !in_array( $row['user_id'], $botsAuthors );
		} );
		return $allAuthorsNotBots;
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
