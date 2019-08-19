import React from 'react';
import StandardHeader from './standard_header.js'
import {isMobile} from 'react-device-detect';

export default class RegisterPage extends React.Component
{
	constructor(props)
	{
		super(props)
		this.emailRef = React.createRef();
		this.usernameRef = React.createRef();
		this.passwordRef = React.createRef();
		this.confirmRef = React.createRef();
		this.registration_message = "";
	}
	
	componentDidMount()
	{
		this.props.mixpanel.track("Registration Page")
	}

	submitRegistration(e)
	{
		this.props.mixpanel.track("Registration Submitted")
		var that = this;
	    fetch("/register", {
	        method: "POST",
	        headers: {
	        	Accept: 'application/json',
	        	'Authorization': 'Basic',
	        	'Content-Type': 'application/json',
	        },
	        body: JSON.stringify({username: this.usernameRef.current.value, 
	        	   password: this.passwordRef.current.value,
	        	   password_confirm: this.confirmRef.current.value,
	        	   email: this.emailRef.current.value}),
	    }).then(function(response) { return response.json();})
	    .then(function (data) {    	
	  		that.registration_message = data.message
	  		if (data.message == "Registration Successful")
	  		{
	  			window.location.href = "/"
	  		}
	  		else
	  		{
	  			that.forceUpdate();
	  		}
	 	})			
	    
	}

	render()
	{
		var top_padding = '100px'
		var register_size = '3em'
		var input_size = '1.6em'
		var button_size = '1.6em'
		var label_width = '240px'

		if (isMobile)
		{
			top_padding = '20%'
			register_size = '4em'
			input_size = '2.8em'
			button_size = '2.8em'
			label_width = '400px'
		}

		return (
			<div style = {{display:'flex', paddingTop:top_padding}}>
				<div style = {{margin:'0px auto', padding:'40px'}}>
					<div style = {{fontSize:register_size}}>Register</div>

				  <label style={{color:'black', width:label_width, fontSize:input_size}} >Enter Email:</label>	
				  <input ref = {this.emailRef} type="text" name="email"/><br/>
				  <label style={{color:'black', width:label_width, fontSize:input_size}} >Enter Username:</label>
				  <input ref = {this.usernameRef} type="text" name="username"/><br/>
				  <label style={{color:'black', width:label_width, fontSize:input_size}} >Enter Password:</label>
				  <input type = 'password' ref = {this.passwordRef} name="password" /><br/>
				  <label style={{color:'black', width:label_width, fontSize:input_size}}>Confirm Password:</label>
				  <input type = 'password' ref = {this.confirmRef} name="password_confirm"/>
				  <p>
				  <div style = {{fontSize:input_size}}>
				  	By Clicking Register, you agree to the <a style = {{fontWeight:'bold'}} href = "/termsofservice"> Terms of Service </a> and <a style = {{fontWeight:'bold'}} href = "/privacypolicy"> Policy Privacy </a>
				  </div>
				  <button style = {{fontSize:button_size}} href = "/" type="submit" id="submitButton" className="btn btn-lg btn-primary" onClick={this.submitRegistration.bind(this)}>Register</button>
				  </p>
					<p style = {{fontSize:input_size}}>
						{this.registration_message}
					</p>
				</div>

			</div>
		);
	}
}