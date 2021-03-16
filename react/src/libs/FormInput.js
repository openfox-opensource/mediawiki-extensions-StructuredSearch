import React, { Component } from "react";
import FormMain from './FormMain'
import ajaxCall from './ajaxCall'
import utils from './utils'
import translate from './translations'
import fieldsDetector from './fieldsDetector'
import EventEmitter from './EventEmitter'
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import Autocomplete from 'react-autocomplete';
//import Moment from 'moment';
import ReactTooltip from 'react-tooltip'
import {format, parse} from 'date-fns'
import "react-datepicker/dist/react-datepicker.css";
const baseDateFormat = 'dd/MM/yyyy';
//Moment.locale('he-IL');
class FormInput extends Component {
	constructor(props) {
		super(props);
		//console.log("props",props);
		let initOptions = props.inputData.widget.options|| [],
			initValue = FormMain.getValue(props.inputData.field);
		initOptions = this.extractOptions( initOptions );
		this.state = { 
			inputData : props.inputData,
			filteredOptions : initOptions,
			options : initOptions,
			typed: initValue && initValue.length ? initValue[0].value : '' 
		};
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
	}
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
		FormMain.setValue( key, value );
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
	autocompleteChanged(  event , typed){
		this.setState({
			typed:typed
		});
		if(this.state.options.length){
			let filteredOptions = this.state.options.filter( item => !typed || item.label.indexOf(typed) > -1);
			this.setState({
				filteredOptions : this.filterAlreadyChosenOptions( filteredOptions )
			});
		}
		else if( this.isSearchAutomplete() ){
			this.searchAutocomplete(typed);
		}
		else{
			ajaxCall.get(`action=structuredsearchautocomplete&field=${this.state.inputData.field}&search=${typed}`).then(data => {
				if(data.data.values){
					let valuesAsArray = [],
						vals = data.data.values;
					for(let valKey of Object.keys(vals) ){
						valuesAsArray.push({
							label:vals[valKey],
							value:valKey
						});
					}
					this.setState({
						filteredOptions : this.filterAlreadyChosenOptions( valuesAsArray )
					});
				}
			});
		}

	}
	searchAutocomplete( typed ){
		let values = FormMain.getAllValuesProcessed(),
			namespaces = values['namespace'];
		FormMain.setValue( this.state.inputData.field, typed );
		ajaxCall.get(`action=opensearch&formatversion=2&search=${typed}&namespace=${namespaces}&limit=10&suggest=true`).then(data => {
			let allData = data.data,
				titles = allData[1],
				links = allData[3],
				filteredOptions = [];
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
		if( this.isSearchAutomplete() ){
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
		EventEmitter.emit('autocompleteMenuOpen',isOpen);
	}
	isSearchAutomplete( ){
		return fieldsDetector.isSearch(this.state.inputData);
	}
	selectChanged( fieldName, value){
		
		this.setState({selected : value});
		
		if('<select>' === value.value ){
			if(this.state.inputData.widget['is_not_multiple']){
				FormMain.clearField( fieldName );
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
	dateRangeChanges(  fieldName, key, dateSelected){
		let formatStr = baseDateFormat,
			dateFormatted = format(dateSelected, formatStr);
			//dateFormatted = Moment(dateSelected).format(format);
		console.log(dateSelected,dateFormatted,"dateFormatted");
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
					html = this[inputData.widget.type + 'Build']( this.state.inputData );
					break;
				case 'range':
					if('date' == inputData.type){
						html = this['dateRangeBuild']( this.state.inputData );
					}
					else{
						html = this[inputData.widget.type + 'Build']( this.state.inputData );
					}
					//console.log(inputData,'inputData');
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
		return inputData.widget.placeholder ? inputData.widget.placeholder : utils.stripHtml( inputData.label);
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
					<input id={uniqe} type='checkbox' value={option.value} checked={checked} onChange={this.checkboxChanges.bind(this, inputData.field, option)} />
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
					<div className="main">{checkboxesMain}</div>
					{moreButton}
					<ReactTooltip id='global' aria-haspopup='true' role='example'>
						 {this.state['structuredsearch-show-more']}
					</ReactTooltip>
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
			className={'select select-' + inputData.field}
			value={this.state.selected}
	        onChange={this.selectChanged.bind(this, inputData.field)}
	        options={options}
	      />
	}
	dateRangeBuild (inputData){
		let structuredsearch_from_label = this.state['structuredsearch-from-label'],
			structuredsearch_to_label = this.state['structuredsearch-to-label'],
			defaultValue1, defaultValue2,
			currentValue = FormMain.getValue( inputData.field );
		console.log("currentValue dateRangeBuild",currentValue);
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
			//console.log("currentValue splitted",splitted[1],defaultValue2,splitted[0],defaultValue1);
		}
		return   <span>
					<span>{structuredsearch_from_label}</span>
					<DatePicker 
						className="range-input range-input-from"
						name={inputData.field} 
						selectsStart={true}
						selected={defaultValue1}
						dateFormat={baseDateFormat}
						onChange={this.dateRangeChanges.bind(this, inputData.field,0)} />
					<span>{structuredsearch_to_label}</span>
					<DatePicker 
						className="range-input range-input-to"
						selected={defaultValue2}
						selectsEnd={true}
						name={inputData.field} 
						dateFormat={baseDateFormat}
						onChange={this.dateRangeChanges.bind(this, inputData.field,1)} />
					</span>;
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
						className="range-input range-input-from"
						name={inputData.field} 
						defaultValue={defaultValue1}
						onChange={this.rangeChanges.bind(this, inputData.field,0)} />
					<span>{structuredsearch_to_label}</span>
					<input 
						type="number" 
						className="range-input range-input-to"
						defaultValue={defaultValue2}
						name={inputData.field} 
						onChange={this.rangeChanges.bind(this, inputData.field,1)} />
					</span>;
	}
	textBuild (inputData){
			let value = FormMain.getValue(inputData.field),
				placeholder = this.getPlaceholder( inputData );
			//console.log("value",value);
			return   <input 
					type="text" 
					placeholder={placeholder}
					value={value ? value.value : ''}
					name={inputData.field} 
					onChange={this.inputChanges.bind(this, inputData.field)} />;
	}
	autocompleteBuild (inputData){
			let submitButton = this.isSearchAutomplete() ? <button type='button' onClick={this.submitClicked.bind(this)} dangerouslySetInnerHTML={{__html:this.state['structuredsearch-search-label']}}></button> : '',///
				placeholder = this.getPlaceholder( inputData );
			return   <div className="autocomplete-wrp"><Autocomplete
						  getItemValue={(item) => item.label}
						  menuStyle={ {position:'absolute',top:'45px',right:0,left:'auto',zIndex:5,'background': '#FFF'}}
						  items={this.state.filteredOptions}
						  renderItem={ this.autocompleteRender.bind(this) }
						  value={this.state.typed}
						  autoHighlight={false}
						  inputProps={ {placeholder:placeholder,type:'search', onKeyDown : this.autocompleteInputKeyDown.bind(this)}}
						  onMenuVisibilityChange={ this.onAutocompleteMenuVisibilityChange.bind(this)}
						  onChange={ this.autocompleteChanged.bind(this)}
						  onSelect={this.autocompleteSelected.bind(this, inputData.field)}
						/>
					{submitButton}
					</div>;
					///
	}
	autocompleteRender (item, isHighlighted){

		///let nsWrapper = this.isSearchAutomplete() && item.ns ? <span className="ns-wrapper">{item.ns}</span> : '',*/
		let	innerHtml = item.label;//this.isSearchAutomplete() ? <a href={item.href}>{nsWrapper}<span className="label-wrapper">{item.label}</span></a> : item.label;
		return <div className={ 'autocomplete-item ' + (isHighlighted ? 'highlighted' : 'regular') } key={item.label}>
				     {innerHtml}
				</div>;
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
		
	return (
	  <div className={"form-input form-input-wrp-" + this.state.inputData.field.replace(/:/g,'-')}>
	    {inputHtml}
	</div>
	);
	}
}

export default FormInput;
