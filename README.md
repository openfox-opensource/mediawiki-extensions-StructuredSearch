# FennecAdvancedSearch extension for MediaWiki  

## Goals  
This extension have three goals

1. Customizing search results
2. Customizing search UI
3. Add filters to search by custom fields ( for now, mainly by cargo, but it's generic)  

## dependies
This extension depend on CirrusSearch extension.  
Default page design depends on font awesome. You should include it by yourself or override design by css.  

## installation  
```git clone URL_OF REPO ./FennecAdvancedSearch.```  
```wfLoadExtension( 'FennecAdvancedSearch' );```  
If you want to connect this page to default search add: ```$wgSearchForwardUrl = "$wgServer/special:FennecAdvancedSearch?advanced_search=$1";```


## Settings  

### $wgFennecAdvancedSearchParams  
This is main config of search  

Add details about fields to:
1. Search by (show as inputs in search form)  
2. Add to results  

The structure of the array 
No key needed, the field would be unieqe identifier
```
[
    'field' => 'namespace',
    'label' => "Text showed on form as input's label",
	'widget' => [
	    'type' => 'checkboxes',
	    'position' => 'sidebar',    
	    'options' => [
	        {
	            label:"text of label",
	            value:"value"
	        }
	    ],
	    'autocomplete_callback' => callable_string,
	    'search_callbak' => callable_string,
]
```  

##### Detailed main config values

```field``` must be unique. If contains ':', automaticlly treated as cargo field in structure of TABLENAME:FIELDNAME  
```label``` shown on search UI as label of search input. Can contain HTML.
```widget``` is array defines the search widget.  
```widget.type``` Possible values are: text|select|autocomplete|radios|checkboxes|range.  
```widget.position``` Where the widget would be rendered: 
```topbar``` - on main box, below the main search input.
```sidebar``` - on sidebar.  
```hide``` - dont show widget.  
```widget.options``` -  for select, autocomplete, radios or checkboes you should give array of strings or objects.

```widget.options[key].value``` - value of option.
```widget.options[key].label``` - label of option (shown in UI).
```widget.options[key].show``` - Where to show the option. Could be 'main', 'advanced' or 'disabled'.
```widget.options[key].defaultChecked``` -  If to check this option by default (for checkboxes field).

On cargo field, if ```widget.options``` ommited all table's field values would be the options.  

##### Detailed main config values - advanced

```autocomplete_callback``` - If you want a autocomplete field with custom autocomplete by API call (php function), register it with this option. The function gets as arguments $term, $fieldname and returns data in the same strcture of ```widget.options```.  
For example see:  
```MediaWiki\Extension\FennecAdvancedSearch\Utils::categoryAutocomplete```


```search_callbak``` -  The search is by string sended to elasticsearch server. If you want to proccess by yourself this param and how it would send to search api, use this function.  
The function gets two variables: &$params, $fieldName  
Add values to $params['search'] (string)
Example - this function is checking what the value of "duration_type" (could be days, hours or minutes) and modify search in accordance.   
```
function convert_duration_type_to_cargo_fields(&$params, $pKey){
    if( in_array('time_table:duration_type', array_keys($params)) && $params['time_table:duration'] ){
        switch ($params['time_table:duration_type']) {
            case 'days':
                $params['search'] .= \MediaWiki\Extension\FennecAdvancedSearch\Utils::getFeatureSearchStr('time_table:duration_day',$params['time_table:duration']);
                break;
            case 'hours':
                $params['search'] .= \MediaWiki\Extension\FennecAdvancedSearch\Utils::getFeatureSearchStr('time_table:duration_hour',$params['time_table:duration']);
                break;

            default:
                $params['search'] .= \MediaWiki\Extension\FennecAdvancedSearch\Utils::getFeatureSearchStr('time_table:duration',$params['time_table:duration']);
                break;
        }
        unset($params['time_table:duration_type']);
        unset($params['time_table:duration']);
    }
}
```

### templates  

```$wgFennecAdvancedSearchResultsTemplates```  

Templates for results  
Array in the structure of  
```
[
'default' => 'mustache_string',
// ('template_' . NS_FILE)
'template_100' => 'mustache_string'
]
```

This is the way to conrol the results appearance.
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
* page_image_ext (if PageImages extension installed)

Any custom field added in ```$wgFennecAdvancedSearchParams``` would appear here.  

### Predefined fields  

```$wgFennecAdvancedSearchDefaultParams```  
The extension provide out of the box predefined fields - for now there are 'namespaces' and 'category'.  
This options controls which of this fields would be shown. Default value is both 'namespaces' and 'category'.  
If this configuration defined need, you need to include all predefined fields you want.  

### Predefined fields - category field configuration 

```$wgFennecAdvancedSearchCategoryInclude```  
Include only this categories in categories autocomplete.  

```$wgFennecAdvancedSearchCategoryExclude```  
Use all categories in categories autocomplete but exclude those categories.  

### Predefined fields - namespace field configuration 


```$wgFennecAdvancedSearchNSReplace```  
This option replace completely default NS option. You have to build array like this. (see ```widget.options``` defination):   
```
array(
    'label' => 'main',//ns readable name,
    'value' => 0,// NS number,
    'show' => 'main;',
    'defaultChecked' => 0,
)
```  

```$wgFennecAdvancedSearchNSOverride```  
if this var defined, we will take all default NS and overriding 'show', 'defaultChecked', 'label' and 'weight' options.  
```
array(
    'ns' => 0,// NS number, to let the extesion know what you are overriding
    'show' => 'advanced,
    'defaultChecked' => 0
)
```  

```$wgFennecAdvancedSearchNSDefaultPosition```  
What is the default position of NS option? Default is main. (see ```widget.options[key].show```)  
Would apply to any default NS, before using ```FennecAdvancedSearchNSOverride```.  

```$wgFennecAdvancedSearchNSIncludeTalkPagesType```  
Same as ```$wgFennecAdvancedSearchNSDefaultPosition```, but for talk pages. Default value is "advanced".  

```$wgFennecAdvancedSearchUseMWDefaultSearchNS```
If true and ```$wgFennecAdvancedSearchNSReplace``` ommited, use [default MW list of NS for search](https://www.mediawiki.org/wiki/Manual:$wgNamespacesToBeSearchedDefault) as base.  

```$wgFennecAdvancedSearchThumbSize```
Files pages result getting special field which calls 'self_thumb'. This configuration defined the dimensions of this thumb. Default is 150X150.   


## Hooks  
```
function FennecAdvancedSearchParams( &$FennecAdvancedSearchParams ){ ... }
```
Use it to modify $wgFennecAdvancedSearchParams or create complicated settings.

```
function 'FennecAdvancedSearchResults',( &$resultsTitlesForCheck ){ ... }
```
Use it to modify the results fields after search.

### FAQ

#### My configuration update not affected the search?  
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

If you want just to add field to results, use ```FennecAdvancedSearchResults``` hook.  

If you want to add field for indexing, you need some coding.  

Steps:  

1. Add your field to elastic indexing defination - use SearchIndexFields hook (see MediaWiki\Extension\FennecAdvancedSearch\hooks::onSearchIndexFields for inspiration).  
2. Add your field data to elastic indexing - use SearchDataForIndex hook (see MediaWiki\Extension\FennecAdvancedSearch\hooks::onSearchDataForIndex for inspiration).  
3. Add UI defintion by ```FennecAdvancedSearchParams``` or add straight to ```$wgFennecAdvancedSearchParams```.  
4. In this defination, add the search to elasticsearch string by using ```search_callbak``` option for field.  
5. Add your field to results by ```FennecAdvancedSearchResults``` hook.  
