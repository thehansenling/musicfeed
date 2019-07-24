import React from 'react';
import StandardHeader from './standard_header.js'

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
		return (
			<div>
				<section className = "hero" style = {{position:'absolute', left:'10%', top:'20%'}}>
				<div className=  "hero-content" >
					<h2>Register</h2>

				  <label style={{color:'black', width:'140px'}} >Enter Email:</label>	
				  <input ref = {this.emailRef} type="text" name="email"/><br/>
				  <label style={{color:'black', width:'140px'}} >Enter Username:</label>
				  <input ref = {this.usernameRef} type="text" name="username"/><br/>
				  <label style={{color:'black', width:'140px'}} >Enter Password:</label>
				  <input type = 'password' ref = {this.passwordRef} name="password" /><br/>
				  <label style={{color:'black', width:'140px'}}>Confirm Password:</label>
				  <input type = 'password' ref = {this.confirmRef} name="password_confirm"/>
				  <p>
				  <div>
				  	By Clicking Register, you agree to the <a style = {{fontWeight:'bold'}} href = "/termsofservice"> Terms of Service </a> and <a style = {{fontWeight:'bold'}} href = "/privacypolicy"> Policy Privacy </a>
				  </div>
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