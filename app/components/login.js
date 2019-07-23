import React from 'react';
import StandardHeader from './standard_header.js'

export default class LoginPage extends React.Component
{
	constructor(props)
	{
		super(props)
		this.usernameRef = React.createRef();
		this.passwordRef = React.createRef();
		this.login_message = "";
		this.props.mixpanel.track("Login Page")
	}

	componentDidMount()
	{
		this.props.mixpanel.track("Login Page")
	}

	submitLogin()
	{
		this.props.mixpanel.track("Log In Submitted")
		var that = this;
	    fetch("/login", {
	        method: "POST",
	        headers: {
	        	Accept: 'application/json',
	        	'Authorization': 'Basic',
	        	'Content-Type': 'application/json',
	        },
	        body: JSON.stringify({username: this.usernameRef.current.value, 
	        	   password: this.passwordRef.current.value}),
	    }).then(function(response) { return response.json();})
	    .then(function (data) {    	
	    	that.login_message = data.login_message
	    	if (data.login_message == "Login Successful")
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
		return(
			<div>
				<section className = "hero" style = {{position:'absolute', left:'10%', top:'20%'}}>
					<div className =  "hero-content" >
						<h2>Login</h2>
						  <label style={{color:'black'}}>Username:</label>
						  <input ref = {this.usernameRef} type="text" name="username"/><br/>
						  <label style={{color:'black'}}>Password:</label>
						  <input ref = {this.passwordRef} type = 'password' name="password"/>
							<p>
							  <button onClick= {this.submitLogin.bind(this)} type="submit" id="submitButton" className="btn btn-lg btn-primary" >Login</button>
							  <a href = "/register" id="submitButton" className="btn btn-lg btn-primary" >Register</a>
							</p>
							<p>
								{this.login_message}
							</p>
					</div>
				</section>

			</div>
		);
	}
}