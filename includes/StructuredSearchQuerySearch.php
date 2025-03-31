<?php
/**
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 *
 * @file
 */

namespace MediaWiki\Extension\StructuredSearch;
use \MediaWiki\MediaWikiServices;
class QuerySearch extends \ApiQuerySearch {
    public function __construct(
        $query,
        $moduleName
        
    ) { 
        $services =  MediaWikiServices::getInstance();
        $searchEngineConfig = $services->getService('SearchEngineConfig');
        $searchEngineFactory = $services->getService('SearchEngineFactory');
        $titleMatcher = $services->getService('TitleMatcher');
        parent::__construct(
            $query,
            $moduleName,
            $searchEngineConfig,
            $searchEngineFactory,
            $titleMatcher
        );
        // Services needed in SearchApi trait
        $this->searchEngineConfig = $searchEngineConfig;
        $this->searchEngineFactory = $searchEngineFactory;
    }
    public function buildSearchEngine(?array $params = null) {
        $engine = parent::buildSearchEngine($params);
        $allParams = Utils::getSearchParamsFiltered();
        $allKeys = array_keys($allParams);
        $allCargoFields = array_filter($allKeys, function($key){
            return Utils::isCargoField($key);
        });
        $allCargoFieldsConvertedToElastic = array_map(function($key){
            return Utils::replaceCargoFieldToElasticField($key);
        }, $allCargoFields);
        $simpleKeysToAdd = [];
        foreach($allParams as $key => $value){
            if($value['add_to_results'] ?? false){
                $simpleKeysToAdd[] = $key; 
            }
        }
        $keysToAdd = array_merge([
            'full_title',
            'short_title',
            'title_dash',
            'title_dash_short',
            'page_link',
            'namespace',
            'page_image_ext',
            'namespaceId',
            'title_key',
            'visible_categories'
        ] , $allCargoFieldsConvertedToElastic, $simpleKeysToAdd);
        
        $engine->setFeatureData('extra-fields-to-extract',  $keysToAdd );
        
        return $engine;
    }
}