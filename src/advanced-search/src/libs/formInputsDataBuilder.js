import React from "react";

class formInputsDataBuilder{
	static proccess( inputsData ){
		let allInputsProcessedData = [];
		for( let inputDataName of Object.keys(inputsData)){
			let inputData = inputsData[ inputDataName ];
			switch( inputData.widget.type){
				case 'text':
					allInputsProcessedData.push(formInputsDataBuilder[inputData.widget.type + 'Build']( inputData ));
					break;
			}
		}
		return allInputsProcessedData;
	} 
	
}
export default formInputsDataBuilder;