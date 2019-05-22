import React, { Component } from "react";
import FormMain from './FormMain'
import Select from 'react-select';

class FormInput extends Component {
	constructor(props) {
		super(props);
		console.log("props",props);
		this.state = { inputData : props.inputData };
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
	valueChanged( key, value){
		FormMain.setValue( key, value );
	}
	checkboxChanges( fieldName, value, event){
		if(event.target.checked){
			FormMain.addValue( fieldName, value.value );
		}
		else{
			FormMain.removeValue( fieldName, value.value )
		}
		//console.log(fieldName, value, event.target.checked,"fieldName, value, event");
	}
	selectChanged( fieldName, value){
		this.setState({selected : value});
		this.valueChanged( fieldName, value.value);
	}
	inputChanges( fieldName, event){
		this.valueChanged( fieldName, event.target.value);
	}
	radioChanges( fieldName, value, event){
		this.valueChanged( fieldName, value.value);
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
				case 'radios':
					console.log(inputData,'inputData');
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