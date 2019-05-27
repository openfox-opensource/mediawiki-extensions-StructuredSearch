import React, { Component } from "react";
import FormMain from './FormMain'
import ajaxCall from './ajaxCall'
import Select from 'react-select';
import Autocomplete from 'react-autocomplete';

class FormInput extends Component {
	constructor(props) {
		super(props);
		//console.log("props",props);
		this.state = { 
			inputData : props.inputData,
			filteredOptions : props.inputData.widget.options|| [],
			options : props.inputData.widget.options || [],
			typed:'' };
	}
	componentDidMount() {
	  
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
		//console.log(event.target,typed,"valuesss")
		if(this.state.options.length){
			this.setState({
				typed:typed,
				filteredOptions : this.state.options.filter( item => !typed || item.label.indexOf(typed) > -1)
			});
		}
		else{
			ajaxCall.get(`action=fennecadvancedsearchautocomplete&field=${this.state.inputData.field}&search=${typed}`).then(data => {
				if(data.data.values){
					let valuesAsArray = [];
					for(let valKey of Object.keys(data.data.values) ){

						valuesAsArray.push({
							label:data.data.values[valKey],
							value:valKey
						});
					}
					this.setState({
						typed:typed,
						filteredOptions : valuesAsArray
					});
				}
			});
		}

	}
	autocompleteSelected( fieldName, itemLabel, autocompleteItem){
		FormMain.addValue( fieldName, autocompleteItem );
		//console.log(fieldName, itemLabel,autocompleteItem,"fieldName, value fffffffffffffffff")
	}
	selectChanged( fieldName, value){
		this.setState({selected : value});
		this.valueChanged( fieldName, value.value);
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
				html = '';

			switch( inputData.widget.type){
				case 'text':
				case 'select':
				case 'checkboxes':
				case 'autocomplete':
				case 'radios':
					//console.log(inputData,'inputData');
					html = this[inputData.widget.type + 'Build']( this.state.inputData );
					break;
			}
			return <div className='field-wrp'>{label}:{html}</div>;
		}
	}
	checkboxesBuild (inputData){
		let checkboxes = [];
		for( let option of inputData.widget.options){
			checkboxes.push(<span key={ inputData.field +'-' + option.value} className='checkbox-wrp'>
				<input type='checkbox' value="{option.value}" onChange={this.checkboxChanges.bind(this, inputData.field, option)} />
				<span className='checkbox-label'>{option.label}</span>
				</span>)
		}
		return checkboxes;
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
			this.state.selected = options[0].value;
		}
		return <Select
			className={'select select-' + inputData.field}
			value={this.state.selected}
	        onChange={this.selectChanged.bind(this, inputData.field)}
	        options={options}
	      />
	}
	textBuild (inputData){
			return   <input 
					type="text" 
					name={inputData.field} 
					onChange={this.inputChanges.bind(this, inputData.field)} />;
	}
	autocompleteBuild (inputData){
			//console.log(inputData, 'inputData');
			let value = '';
			return   <Autocomplete
						  getItemValue={(item) => item.label}
						  items={this.state.filteredOptions}
						  renderItem={(item, isHighlighted) =>
						    <div style={{ background: isHighlighted ? 'lightgray' : 'white' }}>
						      {item.label}
						    </div>
						  }
						  value={this.state.typed}
						  onChange={ this.autocompleteChanged.bind(this)}
						  onSelect={this.autocompleteSelected.bind(this, inputData.field)}
						/>
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