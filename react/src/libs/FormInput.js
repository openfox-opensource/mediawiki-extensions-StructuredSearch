import React, { Component } from "react";
import FormMain from './FormMain'
import ajaxCall from './ajaxCall'
import utils from './utils'
import translate from './translations'
import fieldsDetector from './fieldsDetector'
import EventEmitter from './EventEmitter'
import Select from 'react-select';
import DatePicker from 'react-datepicker';
// Removed react-autocomplete import - using react-select instead
//import Moment from 'moment';
import { Tooltip } from 'react-tooltip'
import {format, parse} from 'date-fns'
//import "react-datepicker/dist/react-datepicker.css";
const baseDateFormat = 'dd/MM/yyyy';
//Moment.locale('he-IL');

	

class FormInput extends Component {
	constructor(props) {
		super(props);
		  const structuredSearchProps = window.mw?.config.get('structuredSearchProps') || {};
		  
		let initOptions = props.inputData.widget.options|| [],
			initValue = FormMain.getValue(props.inputData.field);
		initOptions = this.extractOptions( initOptions );
		this.state = { 
			inputData : props.inputData,
			filteredOptions : initOptions,
			options : initOptions,
			typed: initValue && initValue.length ? initValue[0].value : '' ,
			 placeholder: structuredSearchProps.placeholder || "",
			hoverLocked: false
		};
		// Track keyboard navigation for autocomplete
		this._keyboardNavigated = false;
		this._enterShouldSubmitForm = false;
		// Synchronous flags for hover-lock (for immediate effect before state updates)
		this._hoverLocked = false;
		// Ref for menu state (synchronous tracking)
		this._menuOpenRef = { current: false };
		// Preserve typed value when closing menu
		this._preserveTypedValue = null;
		if( "select" === props.inputData.widget.type ){
			let selected = props.inputData.widget.default || initOptions[0];
			if('string' === typeof selected){
				selected = [{
					value:selected,
					label:selected
				}];
			}
			this.state.selected = selected;
		}

	}

	componentDidMount() {
		for(let key of [
			'structuredsearch-to-label',
			'structuredsearch-from-label',
			'structuredsearch-search-label',
			'structuredsearch-more-label',
			'structuredsearch-less-label',
			'structuredsearch-show-more'
			]){
			translate(key).then( val => {
				let stateToChange = {};
				stateToChange[key] = val;
				this.setState(stateToChange);

			});
		}
		for(let option of this.state.options){
			//console.log("oprion", option);
			if(option.defaultChecked){
				//console.log('in', this.state.inputData.field)
				FormMain.addValue( this.state.inputData.field, option );
			}
		}
		
		// Listen for FormMain value changes to sync typed state
		// This handles the case when advanced_search param sets the value after component mount
		EventEmitter.on("FormDataChanged", () => {
			this.syncTypedFromFormMain();
		});
		
		// Also sync immediately in case value was set before listener was added
		setTimeout(() => {
			this.syncTypedFromFormMain();
		}, 100);
	}
	
	componentDidUpdate(prevProps, prevState) {
		// Track when filteredOptions changes (menu opens/closes)
		// This is more reliable than relying on react-select's onMenuOpen/onMenuClose callbacks
		const menuWasOpen = prevState.filteredOptions.length > 0;
		const menuIsOpen = this.state.filteredOptions.length > 0;
		
		if (!menuWasOpen && menuIsOpen) {
			// Menu just opened - apply hover-lock
			this.onAutocompleteMenuVisibilityChange(true);
		} else if (menuWasOpen && !menuIsOpen) {
			// Menu just closed - remove hover-lock
			this.onAutocompleteMenuVisibilityChange(false);
		}
		
		// Sync typed state from FormMain if it changed externally (e.g., from URL params)
		if (this.isSearchAutocomplete()) {
			const currentFormMainValue = FormMain.getValue(this.state.inputData.field);
			let currentTyped = '';
			if (currentFormMainValue) {
				if (typeof currentFormMainValue === 'string') {
					currentTyped = currentFormMainValue;
				} else if (Array.isArray(currentFormMainValue) && currentFormMainValue.length > 0) {
					currentTyped = currentFormMainValue[0].value || currentFormMainValue[0] || '';
				} else if (currentFormMainValue && currentFormMainValue.value) {
					currentTyped = currentFormMainValue.value;
				}
			}
			// Only update if different to avoid infinite loops
			if (this.state.typed !== currentTyped) {
				this.setState({ typed: currentTyped });
			}
		}
	}
	// componentDidMount() {
	// 	const structuredSearchProps = window.mw?.config.get('structuredSearchProps') || {};
	
	// 	for (let key of [
	// 		'structuredsearch-to-label',
	// 		'structuredsearch-from-label',
	// 		'structuredsearch-search-label',
	// 		'structuredsearch-more-label',
	// 		'structuredsearch-less-label',
	// 		'structuredsearch-show-more'
	// 	]) {
	// 		translate(key).then(val => {
	// 			this.setState({ [key]: val });
	// 		});
	// 	}
	
	// 	// Apply filters dynamically, handling single or multiple values
	// 	const applyFilter = (fieldName, values) => {
	// 		if (Array.isArray(values)) {
	// 			values.forEach(value => this.checkboxChanges(fieldName, value, { target: { checked: true } }));
	// 		} else {
	// 			this.checkboxChanges(fieldName, values, { target: { checked: true } });
	// 		}
	// 	};
	
	// 	if (structuredSearchProps.namespaces) {
	// 		console.log("Namespaces filter found:", structuredSearchProps.namespaces);
	// 		applyFilter("namespaces", structuredSearchProps.namespaces);
	// 	}
	
	// 	if (structuredSearchProps.category) {
	// 		console.log("Category filter found:", structuredSearchProps.category);
	// 		applyFilter("category", structuredSearchProps.category);
	// 	}
	
	// 	if (structuredSearchProps.pageType) {
	// 		console.log("Page type filter found:", structuredSearchProps.pageType);
	// 		applyFilter("in_kit", structuredSearchProps.pageType);
	// 	}
	
	// 	// Add default checked values from options
	// 	this.state.options.forEach(option => {
	// 		if (option.defaultChecked) {
	// 			FormMain.addValue(this.state.inputData.field, option);
	// 		}
	// 	});
	// }
	
	extractOptions( options){
		options = utils.fixObjectToArray( options );
		let optionsStructured = [];
		for(let option of options){
			if( 'string' === typeof option){
				optionsStructured.push({
					value: option, 
					label: option
				});
			}
			else{
				optionsStructured.push(option);
			}
		}
		return optionsStructured;
	}
	valueChanged( key, value ){
		if(!value){
			FormMain.removeValueByKey( key );
		}
		else{
			FormMain.setValue( key, value );
		}			
	}
	
	checkboxChanges( fieldName, value, event){
		if(event.target.checked){
			FormMain.addValue( fieldName, value );
		}
		else{
			FormMain.removeValue( fieldName, value )
		}
		//console.log(fieldName, value, event.target.checked,"fieldName, value, event");
	}
	filterAlreadyChosenOptions( options ){
		let alreadyChosenOptions = FormMain.getValue(this.state.inputData.field);
		//nothing to filter
		if( !alreadyChosenOptions ){
			return options;
		}
		alreadyChosenOptions = alreadyChosenOptions.map( item => item.value);
		options = options.filter( item => !alreadyChosenOptions.includes( item.value ));
		return options;
	}
	// Old autocompleteChanged method removed - replaced with new implementation below
	searchAutocomplete( typed ){
		let values = FormMain.getAllValuesProcessed(),
			namespaces = values['namespace'];
		FormMain.setValue( this.state.inputData.field, typed );
		ajaxCall.get(`action=opensearch&formatversion=2&search=${typed}&namespace=${namespaces}&limit=10&suggest=true`).then(data => {
			let allData = data,
				titles = allData[1],
				links = allData[3],
				filteredOptions = [];
			if(titles){

				for(let i = 0; i < titles.length; i++){
					let ns, label, 
						labelSplitted = titles[i].split(':');
					if( labelSplitted.length > 1 ){
						ns = labelSplitted.shift();
					}
					label = labelSplitted.join(':')
			
					filteredOptions.push({
						label : label,
						ns : ns,
						value : links[i],
						href : links[i],
					});
				}
			}
			
			this.setState({
				filteredOptions : filteredOptions
			});
			EventEmitter.emit('autocompleteMenuResults', filteredOptions);
			//console.log(data, "namespaces");
		});
	}
	submitClicked(){
		FormMain.submitData();
	}
	autocompleteInputKeyDown( event){
		if( 13 === event.keyCode){
			setTimeout( ()=>{
				let searchInput = document.querySelector('.field-wrp-name-search input'),
					inputVal = searchInput.value,
					inputValLength = inputVal.length;
				searchInput.setSelectionRange(inputValLength, inputValLength);
			},10);
		}
	}
	autocompleteSelected( fieldName, itemLabel, autocompleteItem){
		// Handle null selection (when user clears the field)
		if (!autocompleteItem) {
			return;
		}
		
		// If Enter was pressed without keyboard navigation, don't navigate - let form submit
		if (this._enterShouldSubmitForm) {
			this._enterShouldSubmitForm = false;
			return;
		}
		
		if( this.isSearchAutocomplete() ){
			FormMain.fireGlobalEvent( {title:autocompleteItem.value}, "StructuredSearchPageClicked" );
			window.location.href = autocompleteItem.value;
		}
		else{
			FormMain.addValue( fieldName, autocompleteItem );
			this.setState({
				typed:''
			});
		}
	}
	onAutocompleteMenuVisibilityChange( isOpen ){
		// Prevent duplicate calls (idempotent)
		if (this._menuOpenRef.current === isOpen && this._hoverLocked === isOpen) {
			return;
		}
		
		EventEmitter.emit('autocompleteMenuOpen',isOpen);
		
		// Update synchronous ref for menu state
		this._menuOpenRef.current = isOpen;
		
		// Hover-lock mechanism: prevent hover effects until user moves mouse
		if (isOpen) {
			// Menu is opening - add no-hover class and set up mousemove listener
			document.body.classList.add('no-hover');
			// Set synchronous flag immediately (before state update)
			this._hoverLocked = true;
			this.setState({ hoverLocked: true });
			
			// Create re-enable hover function
			const reEnableHover = () => {
				document.body.classList.remove('no-hover');
				// Update both synchronous flag and state
				this._hoverLocked = false;
				this.setState({ hoverLocked: false });
			};
			
			// Clean up any existing listener first
			if (this._hoverLockCleanup) {
				window.removeEventListener('mousemove', this._hoverLockCleanup);
			}
			
			// Store reference for potential cleanup
			this._hoverLockCleanup = reEnableHover;
			
			// Listen for first mousemove to re-enable hover
			// { once: true } automatically removes listener after first call
			window.addEventListener('mousemove', reEnableHover, { once: true });
		} else {
			// Menu is closing - cleanup hover-lock
			document.body.classList.remove('no-hover');
			this._hoverLocked = false;
			this.setState({ hoverLocked: false });
			
			// Clean up mousemove listener if it exists
			if (this._hoverLockCleanup) {
				window.removeEventListener('mousemove', this._hoverLockCleanup);
				this._hoverLockCleanup = null;
			}
			
			// Reset keyboard navigation tracking when menu closes
			this._keyboardNavigated = false;
		}
	}
	
	autocompleteKeyDown( event ){
		// Track arrow key navigation - if user navigates with keyboard, allow Enter to select
		if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || 
		    event.keyCode === 40 || event.keyCode === 38) {
			this._keyboardNavigated = true;
			this._enterShouldSubmitForm = false;
			// Let react-select handle arrow keys normally
			return;
		}
		
		// Handle Enter key
		if (event.key === 'Enter' || event.keyCode === 13) {
			// Use synchronous ref to check menu state (not async state)
			if (this._menuOpenRef.current && !this._keyboardNavigated) {
				// Mark that this Enter should not trigger navigation (set BEFORE react-select processes)
				this._enterShouldSubmitForm = true;
				// Preserve the current typed value before closing menu
				this._preserveTypedValue = this.state.typed;
				// Close the menu to prevent react-select from selecting
				this.setState({ filteredOptions: [] });
				// Don't prevent default - let event bubble to form for submission
				// The onChange handler will check _enterShouldSubmitForm and ignore the selection
				return;
			}
			// If user navigated with keyboard, allow react-select to handle Enter normally
			this._enterShouldSubmitForm = false;
		}
	}
	isSearchAutocomplete( ){
		return fieldsDetector.isSearch(this.state.inputData);
	}
	syncTypedFromFormMain() {
		if (this.isSearchAutocomplete()) {
			const formMainValue = FormMain.getValue(this.state.inputData.field);
			let newTyped = '';
			if (formMainValue) {
				// Handle both string and array formats
				if (typeof formMainValue === 'string') {
					newTyped = formMainValue;
				} else if (Array.isArray(formMainValue) && formMainValue.length > 0) {
					newTyped = formMainValue[0].value || formMainValue[0] || '';
				} else if (formMainValue && formMainValue.value) {
					newTyped = formMainValue.value;
				}
			}
			// Only update if different to avoid infinite loops
			if (this.state.typed !== newTyped) {
				this.setState({ typed: newTyped });
			}
		}
	}
	selectChanged( fieldName, value){
		this.setState({selected : value});
		
		if('<select>' === value.value ){
			if(!this.state.inputData.widget['is_not_multiple']){
				if(FormMain.clearField( fieldName )){
					FormMain.fireChangeEvent();
				}
				
			}
		}
		else if(this.state.inputData.widget['is_not_multiple']){
			FormMain.setValue(fieldName, [value]);

		}
		//filter case of empty string but not the number zero
		else if('' + value.value){
			FormMain.addValue(fieldName, value);
		}
		//this.valueChanged( fieldName, value.value);
	}
	datepickerChanges(  fieldName, dateSelected){
		let formatStr = baseDateFormat,
			dateFormatted = format(dateSelected, formatStr);
		FormMain.setValue(fieldName, dateFormatted);
	}
	dateRangeChanges(  fieldName, key, dateSelected){
		if(!dateSelected){
			FormMain.removeValueByKey( fieldName, key );
			return;
		}
		let formatStr = baseDateFormat,
			dateFormatted = format(dateSelected, formatStr);
			//dateFormatted = Moment(dateSelected).format(format);
		//console.log(dateSelected,dateFormatted,"dateFormatted");
		FormMain.ChangeValueByKey( fieldName, key, dateFormatted );
	}
	rangeChanges(  fieldName, key, event){
		FormMain.ChangeValueByKey( fieldName, key, event.target.value );
	}
	inputChanges( fieldName, event){
		this.valueChanged( fieldName, event.target.value);
	}
	radioChanges( fieldName, value, event){
		this.valueChanged( fieldName, value);
	}
	getInputHtml(){
		if(!this.state.inputData || !Object.keys( this.state.inputData ).length){
			return '';
		}
		else{
			let inputData = this.state.inputData,
				label = this.getLabel( inputData ),
				wrpClass = 'field-wrp field-wrp-type-' + inputData.widget.type + ' field-wrp-name-' + inputData.field,
				html = '';
			switch( inputData.widget.type){
				case 'text':
				case 'select':
				case 'checkboxes':
				case 'autocomplete':
				case 'radios':
				case 'date':
				case 'range':
				case 'dateRange':
					html = this[inputData.widget.type + 'Build']( this.state.inputData );
					break;
				default:
					break;
			}
			return <div className={wrpClass}><span className="">{label}</span>{html}</div>;
		}
	}
	showAdvanced (){
		this.setState({showAdvanced : !this.state.showAdvanced});
	}
	getPlaceholder( inputData ){
		return this.state.placeholder || inputData.widget.placeholder || utils.stripHtml(inputData.label);
		//return inputData.widget.placeholder ? inputData.widget.placeholder : utils.stripHtml( inputData.label);
	}
	checkboxesBuild (inputData){
		let checkboxesMain = [],
			checkboxesAdvanced = [],
			wrpClass = 'main-and-advanced-wrp' + 
				( this.state.showAdvanced ? ' opened' : '');
		
		for( let option of utils.fixObjectToArray(inputData.widget.options)){
			let faClass = 'far ',
				selectedClass = '',
				checked = 0;
			if( FormMain.includes(inputData.field, option.value) ){
				selectedClass =' selected';
				faClass += 'fa-check-square';
				checked = 1;
			}
			else{
				faClass += 'fa-square';
			}
			let uniqe = (inputData.field + '-' + option.value).replace(/\s|:/g,'-'),
				checkbox = <span key={ inputData.field +'-' + option.value} className={'checkbox-wrp' + selectedClass }>
					<input id={uniqe} aria-label={inputData.field} type='checkbox' value={option.value} checked={checked} onChange={this.checkboxChanges.bind(this, inputData.field, option)} />
					<label htmlFor={ uniqe } >
						<i className={faClass}></i>
						<span className='checkbox-label' dangerouslySetInnerHTML={{__html: option.label}}></span>
					</label>
					</span>;
			if('advanced' === option.show){
				checkboxesAdvanced.push(checkbox);
			}
			else if('disable' !== option.show){
				checkboxesMain.push(checkbox);
			}

		}
		let moreText = this.state.showAdvanced ? this.state['structuredsearch-less-label'] : this.state['structuredsearch-more-label'],
			moreButton = checkboxesAdvanced.length ? <button data-tip data-for="global" type={'button'} onClick={this.showAdvanced.bind(this)}  dangerouslySetInnerHTML={{__html:moreText}}></button> : '';
		return <div className={wrpClass}>
					<div className="main-checkbox-area">{checkboxesMain}</div>
					{moreButton}
					<Tooltip id='global' aria-haspopup='true' role='example'>
						 {this.state['structuredsearch-show-more']}
					</Tooltip>
					<div className="advanced">{checkboxesAdvanced}</div>
				</div>;
	}
	radiosBuild (inputData){
		let radios = [];
		for( let option of inputData.widget.options){
			radios.push(<span key={ inputData.field +'-' + option.value} className='checkbox-wrp'>
				<input name={inputData.field} type='radio' value="{option.value}" onChange={this.radioChanges.bind(this, inputData.field, option)} />
				<span className='radio-label'>{option.label}</span>
				</span>)
		}
		return radios;
	}
	selectBuild (inputData){
		let options = this.extractOptions( inputData.widget.options);
		return <Select
			inputId={inputData.field.replace(/:/g,'-')}
			instanceId={ 'inst- ' + inputData.field.replace(/:/g,'-')}
			aria-label={inputData.field}
			name={inputData.field.replace(/:/g,'-')}
			className={'select select-' + inputData.field}
			value={this.state.selected}
	        onChange={this.selectChanged.bind(this, inputData.field)}
	        options={options}
	      />
	}
	dateBuild (inputData){
		let value = FormMain.getValue(inputData.field),
			placeholder = this.getPlaceholder( inputData ),
			isYearPicker = inputData.type_settings && 'year' === inputData.type_settings.date_type,
			bareValue = ( utils.isArray(value) ? value[0] : value ),
			valueDate = value ? parse( (bareValue.value ? bareValue.value : bareValue), baseDateFormat, new Date()) : null;
		valueDate = !valueDate || isNaN( valueDate.getTime() ) ? null : valueDate;
		return  <DatePicker 
					placeholder={placeholder}
					selected={valueDate}
					showYearPicker={isYearPicker}
					dateFormat={isYearPicker ? 'yyyy' :baseDateFormat}
					name={inputData.field} 
					onChange={this.datepickerChanges.bind(this, inputData.field)} />;
		
	}
	dateRangeBuild (inputData){
		let structuredsearch_from_label = this.state['structuredsearch-from-label'],
			structuredsearch_to_label = this.state['structuredsearch-to-label'],
			defaultValue1, defaultValue2,
			currentValue = FormMain.getValue( inputData.field ),
			value1 = {
				className : "date-range-input range-input-from",
				name : inputData.field+ '-1',
				selectsStart : true,
				dateFormat: baseDateFormat,
				onChange : this.dateRangeChanges.bind(this, inputData.field,0)

			},
			value2 = {
				className : "date-range-input range-input-from",
				name : inputData.field + '-2',
				selectsStart : true,
				dateFormat: baseDateFormat,
				onChange : this.dateRangeChanges.bind(this, inputData.field,1)
	
			}
		if(currentValue){
				
				// if( utils.isArray( currentValue ) ){
					// 	currentValue = currentValue[0];
					// }
					// if(currentValue && currentValue.value){
						// 	currentValue = currentValue.value;
						// }
				let splitted = currentValue && !utils.isArray( currentValue ) ? currentValue.split('|') : ( currentValue ? currentValue : [] );
				defaultValue1 = splitted[0] ? parse(splitted[0],baseDateFormat, new Date()) : null;
				defaultValue2 = splitted[1] ? parse(splitted[1], baseDateFormat, new Date()) : null;
				value1.selected = defaultValue1;
				value2.selected = defaultValue2;
			
		}
		return   <>
					<div>
						<label>
							{structuredsearch_from_label}
							<DatePicker {...value1}  />
							</label>
						</div>
						<div><label>{structuredsearch_to_label}
							<DatePicker {...value2}  />
						</label>
						</div>
						</>;
	}
	rangeBuild (inputData){
		let structuredsearch_from_label = this.state['structuredsearch-from-label'],
			structuredsearch_to_label = this.state['structuredsearch-to-label'],
			defaultValue1, defaultValue2,
			currentValue = FormMain.getValue( inputData.field );
		if(currentValue){
			// if( utils.isArray( currentValue ) ){
			// 	currentValue = currentValue[0];
			// }
			if(currentValue && currentValue.value){
				currentValue = currentValue.value;
			}
			let splitted = currentValue && !utils.isArray( currentValue ) ? currentValue.split('|') : ( currentValue ? currentValue : [] );
			defaultValue1 = splitted[0]
			defaultValue2 = splitted[1]
		}
		return   <span>
					<span>{structuredsearch_from_label}</span>
					<input 
						type="number" 
						aria-label={inputData.field}
						className="range-input range-input-from"
						name={inputData.field} 
						defaultValue={defaultValue1}
						onChange={this.rangeChanges.bind(this, inputData.field,0)} />
					<span>{structuredsearch_to_label}</span>
					<input 
						type="number" 
						aria-label={inputData.field + ' (to)'}
						className="range-input range-input-to"
						defaultValue={defaultValue2}
						name={inputData.field + '_to'} 
						onChange={this.rangeChanges.bind(this, inputData.field,1)} />
					</span>;
	}
	textBuild (inputData){
			let value = FormMain.getValue(inputData.field),
				placeholder = this.getPlaceholder( inputData );
			//console.log("value",value);
			return   <input 
					type="text" 
					aria-label={placeholder||inputData.field}
					placeholder={placeholder}
					value={value ? value.value : ''}
					name={inputData.field} 
					onChange={this.inputChanges.bind(this, inputData.field)} />;
	}
	autocompleteBuild (inputData){
			let submitButton = this.isSearchAutocomplete() ? <button type='button' onClick={this.submitClicked.bind(this)} dangerouslySetInnerHTML={{__html:this.state['structuredsearch-search-label']}}></button> : '',///
				placeholder = this.getPlaceholder( inputData );
			
			// Convert filteredOptions to react-select format
			const selectOptions = this.state.filteredOptions.map(item => ({
				value: item.value || item.label,
				label: item.label,
				ns: item.ns,
				href: item.href
			}));
			
			// Find current value for react-select
			let currentValue = this.state.typed ? selectOptions.find(option => option.label === this.state.typed) : null;
			return   <div className="autocomplete-wrp">
				<Select
					aria-label={placeholder||inputData.field}
					className="autocomplete-select"
					classNamePrefix="autocomplete"
					options={selectOptions}
					value={currentValue}
					inputValue={this.state.typed}
					onChange={(selectedOption) => this.autocompleteSelected(inputData.field, selectedOption?.label, selectedOption)}
					onInputChange={(inputValue) => this.autocompleteChanged(inputValue)}
					onMenuOpen={() => this.onAutocompleteMenuVisibilityChange(true)}
					onMenuClose={() => this.onAutocompleteMenuVisibilityChange(false)}
					onKeyDown={this.autocompleteKeyDown.bind(this)}
					placeholder={placeholder}
					isSearchable={true}
					isClearable={true}
					noOptionsMessage={() => "No options found"}
					menuIsOpen={this.state.filteredOptions.length > 0}
					styles={{
						menu: (provided) => {
							// Check both synchronous flag (for immediate effect) and state (for re-renders)
							const isHoverLocked = this._hoverLocked || this.state.hoverLocked;
							
							return {
								...provided,
								position: 'absolute',
								top: '45px',
								right: 0,
								left: 'auto',
								zIndex: 5,
								background: '#FFF',
								pointerEvents: isHoverLocked ? 'none' : 'auto'
							};
						},
						option: (provided, state) => {
							// Check both synchronous flag (for immediate effect) and state (for re-renders)
							const isHoverLocked = this._hoverLocked || this.state.hoverLocked;
							
							return {
								...provided,
								backgroundColor: (state.isFocused && !isHoverLocked)
								  ? "#deebff"          
								  : "transparent",     
								color: "inherit",
							};
						},
					}}
				/>
				{submitButton}
			</div>;
	}
	autocompleteChanged(inputValue) {
		// If we're preserving a value (Enter was pressed to submit form), restore it
		if (this._preserveTypedValue !== null && inputValue === '') {
			// Restore the preserved value
			const preserved = this._preserveTypedValue;
			this._preserveTypedValue = null;
			// Use setTimeout to restore after react-select processes the change
			setTimeout(() => {
				this.setState({ typed: preserved });
			}, 0);
			return;
		}
		
		// Clear preserve flag if input changed normally
		this._preserveTypedValue = null;
		
		// Always update typed state so the input reflects what the user types/deletes
		// This ensures the input can be cleared properly
		this.setState({ typed: inputValue || '' });
		
		// Always update FormMain when input changes to keep it in sync
		// This ensures FormMain reflects the current input value, even when clearing
		if (this.isSearchAutocomplete()) {
			if (inputValue && inputValue.trim()) {
				FormMain.setValue(this.state.inputData.field, inputValue);
			} else {
				// Clear the value in FormMain when input is empty
				FormMain.setValue(this.state.inputData.field, '');
			}
		}
		
		// Only trigger autocomplete search for longer strings (to avoid firing for too short strings)
		// This is separate from state/FormMain updates which always happen
		if (inputValue && inputValue.length > 2) {
			this.searchAutocomplete(inputValue);
		} else {
			this.setState({ filteredOptions: [] });
		}
	}
	getLabel (inputData){
		return inputData.label ? <label htmlFor={inputData.field} dangerouslySetInnerHTML={{__html: inputData.label }} ></label> : '';
	}
	stripHTML( str ){
		let el = document.createElement('div');
		el.innerHTML = str;
		return el.innerText;;
	}
	render() {
		let inputHtml = this.getInputHtml();
	let idInput = this.state.inputData.field.replace(/:/g,'-');
	return (
	  <div className={"form-input form-input-wrp-" + idInput}>
		{inputHtml}
	</div>
	);
	}
}

export default FormInput;
