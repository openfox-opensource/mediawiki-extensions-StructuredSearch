# StructuredSearch extension for MediaWiki  

## Goals  
This extension have three goals

1. Customizing search results
2. Customizing search UI
3. Add filters to search by custom fields ( for now, mainly by cargo, but it's generic)  

## depending
This extension depend on CirrusSearch extension.  
Default page design depends on font awesome. You should include it by yourself or override design by css.  

## installation  
```git clone https://github.com/openfox-opensource/mediawiki-extensions-StructuredSearch.git ./StructuredSearch.```  
```wfLoadExtension( 'StructuredSearch' );```  
If you want to connect this page to default search add: ```$wgSearchForwardUrl = "$wgServer/special:StructuredSearch?advanced_search=$1";```


## Settings  

### $wgStructuredSearchParams  
This is main config of search  

Add details about fields to:
1. Search by (show as inputs in search form)  
2. Add to results  

The structure of the array.  
No key needed, the field would be unique identifier
```
'namespace'=>[
    'field' => 'namespace',
    'label' => "Text showed on form as input's label",
	'widget' => [
	    'type' => 'select',
	    'position' => 'sidebar',    
	    'options' => [
	            "label"=>"text of label",
	            "value"=>"value",
                "is_not_multiple" => true
	    ],
	    'to_indexing_function' => callable_string,
	    'autocomplete_callback' => callable_string,
	    'search_callback' => callable_string,
]
```  

##### Detailed main config values

```field``` must be unique. If contains ':', automatically treated as cargo field in structure of TABLENAME:FIELDNAME  
```label``` shown on search UI as label of search input. Can contain HTML.  
```widget``` is array defines the search widget.  
```widget.type``` Possible values are: text|select|autocomplete|radios|checkboxes|range.  
```widget.is_not_multiple``` Set to true to get one option in select.  
```widget.position``` Where the widget would be rendered:  
```topbar``` - on main box, below the main search input.
```sidebar``` - on sidebar.  
```hide``` - don't show widget.  
```widget.options``` -  for select, autocomplete, radios or checkboxes you should give array of strings or objects.

```widget.options[key].value``` - value of option.
```widget.options[key].label``` - label of option (shown in UI).
```widget.options[key].show``` - Where to show the option. Could be 'main', 'advanced' or 'disabled'.
```widget.options[key].defaultChecked``` -  If to check this option by default (for checkboxes field).

On cargo field, if ```widget.options``` ommiad all table's field values would be the options.  

##### Detailed main config values - advanced

```autocomplete_callback``` - If you want a autocomplete field with custom autocomplete by API call (php function), register it with this option. The function gets as arguments $term, $fieldName and returns data in the same structure of ```widget.options```.  
For example see:  
```MediaWiki\Extension\StructuredSearch\Utils::categoryAutocomplete```


```search_callback``` -  The search is by string sended to elasticsearch server. If you want to process by yourself this param and how it would send to search api, use this function.  
The function gets two variables: &$params, $fieldName  
Add values to $params['search'] (string)
Example - this function is checking what the value of "duration_type" (could be days, hours or minutes) and modify search in accordance.   
```to_indexing_function``` -  Convert the data before index in elastic search.  
**Use case**: if the data stored in template is  a date but you want to search by year, add custom function to convert full date to year, then add select of years in search page.  
```

'to_indexing_function' => '_convert_date_to_year',

function _convert_date_to_year( $p ){
    return date('Y',\MediaWiki\Extension\StructuredSearch\Utils::convertStrToTimestamp( $p ));
}
```

```
function convert_duration_type_to_cargo_fields(&$params, $pKey){
    if( in_array('time_table:duration_type', array_keys($params)) && $params['time_table:duration'] ){
        switch ($params['time_table:duration_type']) {
            case 'days':
                $params['search'] .= \MediaWiki\Extension\StructuredSearch\Utils::getFeatureSearchStr('time_table:duration_day',$params['time_table:duration']);
                break;
            case 'hours':
                $params['search'] .= \MediaWiki\Extension\StructuredSearch\Utils::getFeatureSearchStr('time_table:duration_hour',$params['time_table:duration']);
                break;

            default:
                $params['search'] .= \MediaWiki\Extension\StructuredSearch\Utils::getFeatureSearchStr('time_table:duration',$params['time_table:duration']);
                break;
        }
        unset($params['time_table:duration_type']);
        unset($params['time_table:duration']);
    }
}
```

### templates  

```$wgStructuredSearchResultsTemplates```  

Templates for results  
Array in the structure of  
```
[
'default' => 'mustache_string',
// ('template_' . NS_FILE)
'template_100' => 'mustache_string'
]
```

This is the way to control the results appearance.
Each template is mustache string.
Default fields you can use:
* full_title
* short_title
* title_dash
* page_link
* namespace
* namespaceId
* ns
* title
* pageid
* size
* wordcount
* snippet
* timestamp
* year
* month
* category - array of categories, each have name, key, link and id
* self_thumb - for images results (NS_FILE)
* page_image_ext (if [PageImages](https://www.mediawiki.org/wiki/Extension:PageImages) extension installed)

Any custom field added in ```$wgStructuredSearchParams``` would appear here.  

### Predefined fields  

```$wgStructuredSearchDefaultParams```  
The extension provide out of the box predefined fields - for now there are 'namespaces', 'authors' and 'category'.  
This options controls which of this fields would be shown. Default value is both 'namespaces' and 'category'.  
If this configuration defined, you need to include all predefined fields you want. 
When adding  'authors' option, you need to reindex or errors could happen.

### Predefined fields - category field configuration 

```$wgStructuredSearchCategoryInclude```  
Include only this categories in categories autocomplete.  

```$wgStructuredSearchCategoryExclude```  
Use all categories in categories autocomplete but exclude those categories.  

### Predefined fields - namespace field configuration 

```$wgStructuredSearchNSReplace```  
This option replace completely default NS option. You have to build array like this. (see ```widget.options``` definition):   
```
array(
    'label' => 'main',//ns readable name,
    'value' => 0,// NS number,
    'show' => 'main;',
    'defaultChecked' => 0,
)
```  

```$wgStructuredSearchNSOverride```  
if this var defined, we will take all default NS and overriding 'show', 'defaultChecked', 'label' and 'weight' options.  
```
array(
    'ns' => 0,// NS number, to let the extension know what you are overriding
    'show' => 'advanced',
    'defaultChecked' => 0
)
```  

```$wgStructuredSearchNSDefaultPosition```  
What is the default position of NS option? Default is main. (see ```widget.options[key].show```)  
Would apply to any default NS, before using ```StructuredSearchNSOverride```.  

```$wgStructuredSearchNSIncludeTalkPagesType```  
Same as ```$wgStructuredSearchNSDefaultPosition```, but for talk pages. Default value is "advanced".  

```$wgStructuredSearchUseMWDefaultSearchNS```
If true and ```$wgStructuredSearchNSReplace``` omitted, use [default MW list of NS for search](https://www.mediawiki.org/wiki/Manual:$wgNamespacesToBeSearchedDefault) as base.  

```$wgStructuredSearchThumbSize```
Files pages result getting special field which calls 'self_thumb'. This configuration defined the dimensions of this thumb. Default is 150X150.   

### Predefined fields - authors field configuration 
 
 `$wgStructuredSearchFilterAuthorsBySearchNamespaces`

 If set true, would get authors list just from page defined in namespaces of the search.  Default is true
 (TODO: Is there any reason to set it to false?)

 `$wgStructuredSearchShowAuthorsBots`
If set true, would show also  bots as part of author list. Default is false.

## Hooks  
```
function StructuredSearchParams( &$StructuredSearchParams ){ ... }
```
Use it to modify $wgStructuredSearchParams or create complicated settings.

```
function StructuredSearchResults( &$resultsTitlesForCheck ){ ... }
```
Use it to modify the results fields after search - both for indexing and viewing

```
function StructuredSearchResultsView( &$resultsTitlesForCheck ){ ... }
```
Use it to modify the results fields after search - for view only

### FAQ

#### My configuration update not affected the search.  
You should rebuild elasticsearch index.  

#### How to show field on results without add it to index or showing widget in UI?  
Set ```widget.position``` to 'hide'.  
```
 	[
    	'field' => 'people:first_name',
    	'widget' => ['position' => 'hide']
    ]
```  

#### How to show all namespaces?  
There's a hidden "more" button that displays all available namespaces. If you want all users to see it you can add the following line to your wiki CSS (i.e. to MediaWiki.Common.css). Alternatively you can add this only to some of the user groups using the user group specific css (i.e. MediaWiki:group-sysop.css):
```
.main-and-advanced-wrp button {display: block;}
```
#### How to create custom field?

If you want just to add field to results, use ```StructuredSearchResults``` hook.  

If you want to add field for indexing, you need some coding.  

Steps:  

1. Add your field to elastic indexing definition - use SearchIndexFields hook (see MediaWiki\Extension\StructuredSearch\hooks::onSearchIndexFields for inspiration).  
2. Add your field data to elastic indexing - use SearchDataForIndex hook (see MediaWiki\Extension\StructuredSearch\hooks::onSearchDataForIndex for inspiration).  
3. Add UI definition by ```StructuredSearchParams``` or add straight to ```$wgStructuredSearchParams```.  
4. In this definition, add the search to elasticsearch string by using ```search_callback``` option for field.  
5. Add your field to results by ```StructuredSearchResults``` hook.  
