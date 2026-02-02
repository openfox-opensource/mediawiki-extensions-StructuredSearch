<?php

namespace MediaWiki\Extension\StructuredSearch;

require_once '/var/www/html/w/maintenance/Maintenance.php';
//create maintance script to test the structured search
use MediaWiki\MediaWikiServices;
use MediaWiki\Title\Title;

class StructuredSearchTest extends \Maintenance {

    public function __construct() { 
        parent::__construct();
        $this->addOption( 'title', 'Title of the page to test', false, true );
    }

    public function execute() {
        $title = $this->getOption( 'title', 'Main Page' );
        $titleObj = \Title::newFromText( $title );
        $page = \MediaWiki\MediaWikiServices::getInstance()->getWikiPageFactory()->newFromTitle( $titleObj );
        //print_r([$title,Hooks::addPageImageInSearch( $page )]   );
        print_r([$this->run($titleObj)]   );
        
    }
    public function run($titleObj) {
        

		$pageId = $titleObj->getArticleId();
        $pageIds = [ $pageId ];

		try {
			$pagesUpdated = 0;
			$pagesUpdatedList = [];
			$errors = [];
			$errorCount = 0;

			// Check if CirrusSearch extension is available
			if ( class_exists( '\CirrusSearch\Updater' ) ) {
                echo "Processing with CirrusSearch...\n";
				$searchConfig = \CirrusSearch\SearchConfig::newFromGlobals();
				$connection = \CirrusSearch\Connection::getPool( $searchConfig );
				$indexBaseName = $searchConfig->get( 'CirrusSearchIndexBaseName' );

				// Build documents for all pages at once
				$services = MediaWikiServices::getInstance();
				$docSizeLimiter = new \CirrusSearch\BuildDocument\DocumentSizeLimiter(
					$searchConfig->getProfileService()->loadProfile( \CirrusSearch\Profile\SearchProfileService::DOCUMENT_SIZE_LIMITER )
				);

				$builder = new \CirrusSearch\BuildDocument\BuildDocument(
					$connection,
					$services->getConnectionProvider()->getReplicaDatabase(),
					$services->getRevisionStore(),
					$services->getBacklinkCacheFactory(),
					$docSizeLimiter,
					$services->getTitleFormatter(),
					$services->getWikiPageFactory(),
					$services->getTitleFactory()
				);

				// Convert page IDs to Page objects
				$pages = [];
				foreach ( $pageIds as $pageId ) {
					   $title = Title::newFromID( $pageId );

					if ( $title && $title->exists() ) {
                        echo "Processing page ID: $pageId {$title->getFullText()}\n";
						$pages[] = $services->getWikiPageFactory()->newFromTitle( $title );
					}
				}

				// Build documents
				$allDocuments = array_fill_keys( $connection->getAllIndexSuffixes(), [] );
				foreach ( $builder->initialize( $pages, \CirrusSearch\BuildDocument\BuildDocument::INDEX_EVERYTHING ) as $document ) {
					$suffix = $connection->getIndexSuffixForNamespace( $document->get( 'namespace' ) );
					$allDocuments[$suffix][] = $document;
				}

				// Send documents directly using DataSender
				$sender = new \CirrusSearch\DataSender( $connection, $searchConfig );
				
				foreach ( $allDocuments as $indexSuffix => $documents ) {
					if ( empty( $documents ) ) {
                        echo "No documents for index suffix: $indexSuffix\n";
						continue;
					}
                    else {
                        echo "Sending " . count( $documents ) . " documents to index suffix: $indexSuffix\n";
                    }
					try {
						$status = $sender->sendData( $indexSuffix, $documents );
						if ( $status->isOK() ) {
                            echo "Successfully sent documents to index suffix: $indexSuffix\n";
                            // Count updated pages
							$pagesUpdated += count( $documents );
							foreach ( $pages as $page ) {
                                echo "Marked page ID " . $page->getId() . " as updated\n" . print_r($documents,true) . "\n";
								$pagesUpdatedList[] = $page->getId();
							}
						} else {
							$errorMessage = "Failed to send data to index $indexSuffix: " . $status->getMessage();
							$errors[] = $errorMessage;
							$errorCount++;
							////$this->logger->error( $errorMessage );
						}
					} catch ( Exception $e ) {
						$errorMessage = "Exception sending data to index $indexSuffix: " . $e->getMessage();
						$errors[] = $errorMessage;
						$errorCount++;
						//$this->logger->error( $errorMessage );
					}
				}

				// //$this->logger->info( "Directly indexed $pagesUpdated pages using DataSender" );

				// Force refresh all CirrusSearch indices to make changes visible
				try {
					//$this->logger->info( "Refreshing CirrusSearch indices..." );
					$client = $connection->getClient();
					foreach ( $connection->getAllIndexSuffixes() as $suffix ) {
						$indexName = $connection->getIndexName( $indexBaseName, $suffix );
						$index = $client->getIndex( $indexName );
						if ( $index->exists() ) {
							   $index->refresh();
							   //$this->logger->info( "Refreshed index: $indexName" );
						}
					}
				} catch ( Exception $refreshError ) {
					//$this->logger->warning( "Failed to refresh indices: " . $refreshError->getMessage() );
				}

				// Verify that pages were actually indexed
				//$this->logger->info( "Verifying indexed pages after update..." );
				$actuallyIndexedAfter = [];//$this->getPagesActuallyIndexed();
				$newlyIndexed = array_intersect( $pagesUpdatedList, $actuallyIndexedAfter );
				//$this->logger->info( "Pages verified as indexed: " . implode( ', ', $newlyIndexed ) );

				$result = [
				'success' => 1,
				'documents_processed' => count( $allDocuments ),
				'message' => "Processed " . count( $allDocuments ) . " document groups, updated $pagesUpdated pages, $errorCount errors. Verified " . count( $newlyIndexed ) . " pages are now indexed.",
				'pages_updated' => $pagesUpdated,
				'pages_updated_list' => $pagesUpdatedList,
				'pages_verified_indexed' => $newlyIndexed,
				'error_count' => $errorCount,
				'total_processed' => count( $pageIds ),
				'errors' => $errors
				];
			} else {
				// Fallback: Use MediaWiki's built-in search update
				$revisionLookup = MediaWikiServices::getInstance()->getRevisionLookup();
				foreach ( $pageIds as $pageId ) {
					try {
                        $title = Title::newFromID( $pageId );
                        
						if ( $title && $title->exists() ) {
							$revision = $revisionLookup->getRevisionByTitle( $title );
							$content = $revision ? $revision->getContent( \MediaWiki\Revision\SlotRecord::MAIN ) : null;
							$searchUpdate = new \SearchUpdate( $pageId, $title, $content );
							$searchUpdate->doUpdate();
							$pagesUpdated++;
						} else {
							$errors[] = "Page ID $pageId does not exist or title is invalid";
							$errorCount++;
						}
					} catch ( Exception $e ) {
						$errorMessage = "Failed to update page ID $pageId: " . $e->getMessage();
						$errors[] = $errorMessage;
						$errorCount++;
						//$this->logger->error( $errorMessage );
					}
				}

				$result = [
				'success' => 1,
				'message' => "Updated $pagesUpdated pages using built-in search, $errorCount errors",
				'pages_updated' => $pagesUpdated,
				'error_count' => $errorCount,
				'total_processed' => count( $pageIds ),
				'errors' => $errors
				];
			}

		} catch ( Exception $e ) {
			//$this->logger->error( "Error processing CirrusSearch batch: " . $e->getMessage() );
			$result = [
			'success' => 0,
			'message' => "Failed to process batch: " . $e->getMessage(),
			'error_count' => count( $pageIds ),
			'errors' => [ $e->getMessage() ]
			];
		}
    }
}

$maintClass = StructuredSearchTest::class;
require_once RUN_MAINTENANCE_IF_MAIN;