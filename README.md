# FennecAdvancedSearch extension for MediaWiki

## Settings

```FennecAdvancedSearchParams```

Main config.

Array of details about fields to search/show as inputs in search form/add to results

The structure of the array

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
	    'options' => [
	        {
	            label:"text of label",
	            value:"value"
	        }
	    ],
	    //if you want autocomplete by API call, register it with this option.
	    //the function gets as arguments $term, $fieldname
	    and returns data in the same strcture og options
	    'autocomplete_callback' => callable_string
]
```

```FennecAdvancedSearchResultsTemplates```

Templates for results

Array in the structure

```
[
'default' => 'mustache_string',
// ('template_' . NS_FILE)
'template_100' => 'mustache_string'
]
```
```FennecAdvancedSearchDefaultParams```
Array. show or hide predefined fields - for now this is 'namespaces' and 'category'. 

If defined need to include all predefined fields you want.

```FennecAdvancedSearchCategoryInclude```

Include only this categories in categories autocomplete

```FennecAdvancedSearchCategoryExclude```

Use all categories in categories autocomplete but exclude those categories

```FennecAdvancedSearchNSReplace```

This option replace completely default NS option. you hove to build array like this

```
array(
    'label' => 'main',//ns readable name,
    'value' => 0,// NS number,
    'show' => 'main;',// main|advanced|disabled
    'defaultChecked' => 0,//0|1
)
```

```FennecAdvancedSearchNSOverride```

if this var defined, we will take all default NS and override "show" and "defaultChecked" options

```FennecAdvancedSearchNSIncludeTalkPagesType```

"show" value for talk page by default. Default value is "advanced"

## Hooks

```
function FennecAdvancedSearchParams( &FennecAdvancedSearchParams ){ ... }
```
Use it to modify FennecAdvancedSearchParams or create complicated settings.
