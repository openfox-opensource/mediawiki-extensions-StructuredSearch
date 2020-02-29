# FennecAdvancedSearch extension for MediaWiki  

## Goals  
This extension have three goals

1. Customizing search results
2. Customizing search UI
3. Add filters to search by custom fields ( for now, mainly by cargo, but it's generic)  

## Settings  

### $wgFennecAdvancedSearchParams  
This is main config of search  

Add detailsabout fields to:
1. search by (show as inputs in search form)  
2. add to results  

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
```widget``` is array defined the search widget.  
```widget.type``` Possible values are: text|select|autocomplete|radios|checkboxes|range.  
```widget.position``` Where the widget would be rendered: 
```topbar``` - on main box, below the main search input.
```sidebar``` - on sidebar.  
```hide``` - dont show widget.  
```widget.options``` -  for select, autocomplete, radios or checkboes you should give array of strings or objects with 'label', 'value' and 'defaultChecked' entries. If ommited and this is cargo field, all table values would be the options.  

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


```$wgFennecAdvancedSearchDefaultParams```  
Array. show or hide predefined fields - for now this is 'namespaces' and 'category'.   
If defined need to include all predefined fields you want.  

```$wgFennecAdvancedSearchCategoryInclude```  
Include only this categories in categories autocomplete  

```$wgFennecAdvancedSearchCategoryExclude```  
Use all categories in categories autocomplete but exclude those categories  

```$wgFennecAdvancedSearchNSReplace```  
This option replace completely default NS option. you hove to build array like this  
```
array(
    'label' => 'main',//ns readable name,
    'value' => 0,// NS number,
    'show' => 'main;',// main|advanced|disabled
    'defaultChecked' => 0,//0|1
)
```  

```$wgFennecAdvancedSearchNSOverride```  
if this var defined, we will take all default NS and override "show" and "defaultChecked" options  

```$wgFennecAdvancedSearchNSDefaultPosition```  
What is the default position of NS? Default is main.  
Would apply to any default NS, before using ```FennecAdvancedSearchNSOverride```

```$wgFennecAdvancedSearchNSIncludeTalkPagesType```  
"show" value for talk page by default. Default value is "advanced"  

```$wgFennecAdvancedSearchUseMWDefaultSearchNS```
```$wgFennecAdvancedSearchThumbSize```


## Hooks  
```
function FennecAdvancedSearchParams( &FennecAdvancedSearchParams ){ ... }
```
Use it to modify $wgFennecAdvancedSearchParams or create complicated settings.

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
