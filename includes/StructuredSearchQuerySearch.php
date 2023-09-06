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

class QuerySearch extends \ApiQuerySearch {
    public function buildSearchEngine($params) {
        $engine = parent::buildSearchEngine($params);
        $engine->setFeatureData('extra-fields-to-extract', [
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
        ]);
        //die(print_r($params, true));
        return $engine;
    }
}