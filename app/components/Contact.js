import React from 'react';

export default class Contact extends React.Component {

	constructor(props)
	{
		super(props);
	}

	render ()
	{
		return (<div style = {{top: '150px', left:'5%', position:'relative'}}> 
			<div>
				<h1><a href = "https://forms.gle/SfT8f3hiMRHRT7mu7"> Pre-Test Survey </a></h1>
			</div>
			<div>
				<h1><a href = "https://forms.gle/34DbWbs8GhvbDFHx7"> Feedback </a></h1>
			</div>
		</div>);
	}
}