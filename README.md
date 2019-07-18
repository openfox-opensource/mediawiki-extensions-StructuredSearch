# FennecAdvancedSearch extension for MediaWiki  

## Settings  

```$wgFennecAdvancedSearchParams```  
Main config.  
Array of details about fields to search/show as inputs in search form/add to results  
The structure of the array .
No key needed, the field would be unieqe identifier
```
[
    'label' => "Text showed on form as input's label",
    //field must be unieqe. if contains ':', automaticlly treated as cargo filed in structure of TABLENAME:FIELDNAME
    'field' => 'namespace',
	'widget' => [
	    //text|select|autocomplete|radios|checkboxes|range
	    'type' => 'checkboxes',
	    sidebar|topbar
	    'position' => 'sidebar',
	    //for select, autocomplete, rdios or checkboes
	    // array of strings or object as described
	    //if ommited and this is cargo field, all table values would be options automaticcaly
	    'options' => [
	        {
	            label:"text of label",
	            value:"value"
	        }
	    ],
	    //if you want autocomplete by API call, register it with this option.
	    //the function gets as arguments $term, $fieldname
	    and returns data in the same strcture og options
	    'autocomplete_callback' => callable_string,
	    //if you want to proccess by yourself this param and how it would send to search api, use this function.
	    //the function gets two variables: &$params, $fieldName
	    'search_callbak' => callable_string,
]
```  
```$wgFennecAdvancedSearchResultsTemplates```  
Templates for results  
Array in the structure  
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
## Hooks  
```
function FennecAdvancedSearchParams( &FennecAdvancedSearchParams ){ ... }
```
Use it to modify $wgFennecAdvancedSearchParams or create complicated settings.

```How to show all namespaces?```
There's a hidden "more" button that displays all available namespaces. If you want all users to see it you can add the following line to your wiki CSS (i.e. to MediaWiki.Common.css). Alternatively you can add this only to some of the user groups using the user group specific css (i.e. MediaWiki:group-sysop.css):
```
.main-and-advanced-wrp button {display: block;}
```
