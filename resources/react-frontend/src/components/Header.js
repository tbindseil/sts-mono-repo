import React from 'react';
import logo from '../images/logo_no_outline.svg';
import {Navbar} from 'react-bootstrap';

export const Header = () => {

  const navbarStyle = {
    //border: '10px solid #005D8c',
	borderWidth: '10px',
	borderColor: '#005D8c',
	borderstyle: 'solid',
	borderRadius: '0px',
    marginBottom: '0px',
    width: '100%',
	fontSize: '20px',
  };
  

  return (

    <Navbar style={navbarStyle}>
      <Navbar.Collapse>
        <a href="/" className="navbar-left">
          <img src={logo} alt="logo"/>
        </a>
        <a href="/profile" className="navbar-right">Profile</a>
        <a href="/auth" className="navbar-right">Auth | </a>
		<a href="/contacts" className="navbar-right">Contacts | </a>
		<a href="/request-a-tutor" className="navbar-right">Request A Tutor | </a>
		<a href="/get-involved" className="navbar-right">Get Involved | </a>
        <a href="/about-us" className="navbar-right">About Us | </a>
		<a href="/home" className="navbar-right">Home | </a>
      </Navbar.Collapse>
    </Navbar>

  );
};
