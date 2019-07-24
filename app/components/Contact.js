import React from 'react';

export default class Contact extends React.Component {

	constructor(props)
	{
		super(props);
	}

	componentDidMount()
	{
		this.props.mixpanel.track("Contact Page")
	}

	render ()
	{
		return (<div style = {{top: '150px', left:'5%', position:'relative'}}> 
			<div>
				<h1 style = {{fontWeight:'bold'}}> Contact </h1>
				<h2> Hansen Ling </h2>
				<h3>hansen@unheard.fm</h3>
				<h2> Matthew Xu </h2>
				<h3>matthew@unheard.fm</h3>				
			</div>
			<div>
				<h1 style = {{fontWeight:'bold'}}><a href = "https://forms.gle/Mdivrrg8XUGT9NnRA"> Feedback Form</a></h1>
			</div>
		</div>);
	}
}