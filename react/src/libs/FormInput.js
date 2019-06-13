import React, { Component } from "react";
import FormMain from './FormMain'
import ajaxCall from './ajaxCall'
import translate from './translations'
import Select from 'react-select';
import Autocomplete from 'react-autocomplete';

class FormInput extends Component {
	constructor(props) {
		super(props);
		//console.log("props",props);
		let initOptions = props.inputData.widget.options|| [];
		initOptions = this.extractOptions( initOptions );
		this.state = { 
			inputData : props.inputData,
			filteredOptions : initOptions,
			options : initOptions,
			typed:'' 
		};


		
	}
	componentDidMount() {
		for(let key of ['fennecadvancedsearch-to-label','fennecadvancedsearch-from-label']){
			translate(key).then( val => {
				let stateToChange = {};
				stateToChange[key] = val;
				this.setState(stateToChange);

			});
		}
		for(let option of this.state.options){
			//console.log("oprion", option);
			if(option.defaultChecked){
				console.log('in', this.state.inputData.field)
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
	autocompleteChanged(  event , typed){
		this.setState({
			typed:typed
		});
		if(this.state.options.length){
			this.setState({
				filteredOptions : this.state.options.filter( item => !typed || item.label.indexOf(typed) > -1)
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
						filteredOptions : valuesAsArray
					});
				}
			});
		}

	}
	searchAutocomplete( typed ){
		let values = FormMain.getAllValuesProcessed(),
			namespaces = values['namespace'];
		ajaxCall.get(`action=opensearch&formatversion=2&search=${typed}&namespace=${namespaces}&limit=10&suggest=true`).then(data => {
			let allData = data.data,
				titles = data.data[1],
				links = data.data[3],
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
			console.log(data, "namespaces");
		});
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
		this.valueChanged( fieldName, value.value);
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
			return <div className={wrpClass}>{label}:{html}</div>;
		}
	}
	showAdvanced (){
		this.setState({showAdvanced : !this.state.showAdvanced});
	}
	checkboxesBuild (inputData){
		let checkboxesMain = [],
			checkboxesAdvanced = [],
			wrpClass = 'main-and-advanced-wrp' + 
				( this.state.showAdvanced ? ' opened' : '');
		for( let option of inputData.widget.options){
			let checkbox = <span key={ inputData.field +'-' + option.value} className='checkbox-wrp'>
				<input type='checkbox' value="{option.value}" defaultChecked={option.defaultChecked} onChange={this.checkboxChanges.bind(this, inputData.field, option)} />
				<span className='checkbox-label'>{option.label}</span>
				</span>;
			if('advanced' === option.show){
				checkboxesAdvanced.push(checkbox);
			}
			else if('disable' !== option.show){
				checkboxesMain.push(checkbox);
			}

		}
		return <div className={wrpClass}>
					<div className="main">{checkboxesMain}</div>
					<button onClick={this.showAdvanced.bind(this)} >More </button>
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
		if(!this.state.selected){
			this.setState({
				selected : options[0].value
			});
		}
		return <Select
			className={'select select-' + inputData.field}
			value={this.state.selected}
	        onChange={this.selectChanged.bind(this, inputData.field)}
	        options={options}
	      />
	}
	rangeBuild (inputData){
		let fennecadvancedsearch_from_label = this.state['fennecadvancedsearch-from-label'],
			fennecadvancedsearch_to_label = this.state['fennecadvancedsearch-to-label'];
		return   <span>
					<span>{fennecadvancedsearch_from_label}</span>
					<input 
						type="text" 
						className="range-input range-input-from"
						name={inputData.field} 
						onChange={this.rangeChanges.bind(this, inputData.field,0)} />
					<span>{fennecadvancedsearch_to_label}</span>
					<input 
						type="text" 
						className="range-input range-input-to"
						name={inputData.field} 
						onChange={this.rangeChanges.bind(this, inputData.field,1)} />
					</span>;
	}
	textBuild (inputData){
			return   <input 
					type="text" 
					name={inputData.field} 
					onChange={this.inputChanges.bind(this, inputData.field)} />;
	}
	autocompleteBuild (inputData){
			//console.log(inputData, 'inputData');
			return   <Autocomplete
						  getItemValue={(item) => item.label}
						  menuStyle={ {position:'absolute'}}
						  items={this.state.filteredOptions}
						  renderItem={ this.autocompleteRender.bind(this) }
						  value={this.state.typed}
						  onChange={ this.autocompleteChanged.bind(this)}
						  onSelect={this.autocompleteSelected.bind(this, inputData.field)}
						/>
	}
	autocompleteRender (item, isHighlighted){
		let innerHtml = this.isSearchAutomplete() ? <a href={item.href}>{item.ns} --- {item.label}</a> : item.label
		return <div style={{ background: isHighlighted ? 'lightgray' : 'white' }}>
				     {innerHtml}
				</div>;
	}
	getLabel (inputData){
		return <label htmlFor={inputData.field} >{inputData.label} </label>;
	}
	render() {
		let inputHtml = this.getInputHtml();
		
	return (
	  <div className="form-input">
	    {inputHtml}
	</div>
	);
	}
}

export default FormInput;