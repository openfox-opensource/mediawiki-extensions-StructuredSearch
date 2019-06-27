import React, { Component } from "react";
import FormMain from './FormMain'
import ajaxCall from './ajaxCall'
import utils from './utils'
import translate from './translations'
import Select from 'react-select';
import Autocomplete from 'react-autocomplete';
import ReactTooltip from 'react-tooltip'

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
			if('string' == typeof selected){
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
			'fennecadvancedsearch-to-label',
			'fennecadvancedsearch-from-label',
			'fennecadvancedsearch-search-label',
			'fennecadvancedsearch-more-label',
			'fennecadvancedsearch-less-label',
			'fennecadvancedsearch-show-more'
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
		let optionsStructured = [];
		for(let option of options){
			if( 'string' == typeof option){
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
			ajaxCall.get(`action=fennecadvancedsearchautocomplete&field=${this.state.inputData.field}&search=${typed}`).then(data => {
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
			//console.log(data, "namespaces");
		});
	}
	submitClicked(){
		FormMain.submitData();
	}
	autocompleteSelected( fieldName, itemLabel, autocompleteItem){
		if( this.isSearchAutomplete() ){
			window.location.href = autocompleteItem.value;
		}
		else{
			FormMain.addValue( fieldName, autocompleteItem );
			this.setState({
				typed:''
			});
		}
	}
	isSearchAutomplete( ){
		return 'search' === this.state.inputData.field;
	}
	selectChanged( fieldName, value){
		this.setState({selected : value});
		FormMain.addValue(fieldName, value);
		//this.valueChanged( fieldName, value.value);
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
				case 'range':
					//console.log(inputData,'inputData');
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
		return inputData.widget.placeholder ? inputData.widget.placeholder : utils.stripHtml( inputData.label);
	}
	checkboxesBuild (inputData){
		let checkboxesMain = [],
			checkboxesAdvanced = [],
			wrpClass = 'main-and-advanced-wrp' + 
				( this.state.showAdvanced ? ' opened' : '');
		for( let option of inputData.widget.options){
			let faClass = 'far ',
				selectedClass = '',
				defaultChecked = option.defaultChecked;
			if( FormMain.includes(inputData.field, option.value) ){
				selectedClass =' selected';
				faClass += 'fa-check-square';
				defaultChecked = 1;
			}
			else{
				faClass += 'fa-square';
			}
			let uniqe = (inputData.field + '-' + option.value).replace(/\s|:/g,'-'),
				checkbox = <span key={ inputData.field +'-' + option.value} className={'checkbox-wrp' + selectedClass }>
					<input id={uniqe} type='checkbox' value={option.value} defaultChecked={defaultChecked} onChange={this.checkboxChanges.bind(this, inputData.field, option)} />
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
		let moreText = this.state.showAdvanced ? this.state['fennecadvancedsearch-less-label'] : this.state['fennecadvancedsearch-more-label'],
			moreButton = checkboxesAdvanced.length ? <button data-tip data-for="global" type={'button'} onClick={this.showAdvanced.bind(this)} >{moreText}</button> : '';
		return <div className={wrpClass}>
					<div className="main">{checkboxesMain}</div>
					{moreButton}
					<ReactTooltip id='global' aria-haspopup='true' role='example'>
						 {this.state['fennecadvancedsearch-show-more']}
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
	rangeBuild (inputData){
		let fennecadvancedsearch_from_label = this.state['fennecadvancedsearch-from-label'],
			fennecadvancedsearch_to_label = this.state['fennecadvancedsearch-to-label'],
			defaultValue1, defaultValue2,
			currentValue = FormMain.getValue( inputData.field );
		if(currentValue){
			if( utils.isArray( currentValue ) ){
				currentValue = currentValue[0];
			}
			if(currentValue.value){
				currentValue = currentValue.value;
			}
			let splitted = currentValue.split('|');
			defaultValue1 = splitted[0]
			defaultValue2 = splitted[1]
		}
		return   <span>
					<span>{fennecadvancedsearch_from_label}</span>
					<input 
						type="number" 
						className="range-input range-input-from"
						name={inputData.field} 
						defaultValue={defaultValue1}
						onChange={this.rangeChanges.bind(this, inputData.field,0)} />
					<span>{fennecadvancedsearch_to_label}</span>
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
			let submitButton = this.isSearchAutomplete() ? <button type='button' onClick={this.submitClicked.bind(this)} dangerouslySetInnerHTML={{__html:this.state['fennecadvancedsearch-search-label']}}></button> : '',
				placeholder = this.getPlaceholder( inputData );
			return   <div className="autocomplete-wrp"><Autocomplete
						  getItemValue={(item) => item.label}
						  menuStyle={ {position:'absolute',top:'45px',right:0,left:'auto',zIndex:5,'background': '#FFF'}}
						  items={this.state.filteredOptions}
						  renderItem={ this.autocompleteRender.bind(this) }
						  value={this.state.typed}
						  inputProps={ {placeholder:placeholder}}
						  onChange={ this.autocompleteChanged.bind(this)}
						  onSelect={this.autocompleteSelected.bind(this, inputData.field)}
						/>
					{submitButton}
					</div>
	}
	autocompleteRender (item, isHighlighted){

		let nsWrapper = this.isSearchAutomplete() && item.ns ? <span className="ns-wrapper">{item.ns}</span> : '',
			innerHtml = this.isSearchAutomplete() ? <a href={item.href}>{nsWrapper}<span className="label-wrapper">{item.label}</span></a> : item.label;
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
