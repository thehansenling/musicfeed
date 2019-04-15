import React from 'react';
import StandardHeader from './standard_header.js'

export default class RegisterPage extends React.Component
{
	constructor(props)
	{
		super(props)
		this.usernameRef = React.createRef();
		this.passwordRef = React.createRef();
		this.confirmRef = React.createRef();
		this.registration_message = "";
		
	}
	
	submitRegistration(e)
	{
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
	        	   password_confirm: this.confirmRef.current.value}),
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
		return (
			<div>
				<section className = "hero" style = {{position:'absolute', left:'10%', top:'20%'}}>
				<div className=  "hero-content" >
					<h2>Register</h2>

				  <label style={{color:'black'}} >Enter Username:</label>
				  <input ref = {this.usernameRef} type="text" name="username"/><br/>
				  <label style={{color:'black'}} >Enter Password:</label>
				  <input ref = {this.passwordRef} type="text" name="password" /><br/>
				    <label style={{color:'black'}}>Confirm Password:</label>
				  <input ref = {this.confirmRef} type="text" name="password_confirm"/>
				  <p>
				  <button href = "/" type="submit" id="submitButton" className="btn btn-lg btn-primary" onClick={this.submitRegistration.bind(this)}>Register</button>
				  </p>
					<p>
						{this.registration_message}
					</p>
				</div>
				</section>

			</div>
		);
	}
}