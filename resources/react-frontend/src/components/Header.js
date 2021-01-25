import React from 'react';
import logo from '../images/logo_no_outline.svg';
import {Navbar} from 'react-bootstrap';

export const Header = ({screenTitle}) => {

  const navbarStyle = {
    border: '10px solid #005D8c',
    marginBottom: '0px',
    width: '100%'
  };

  return (

    <Navbar style={navbarStyle}>
      <Navbar.Collapse>
        <a href="/" className="navbar-left">
          <img src={logo} alt="logo"/>
        </a>
        <a href="/about-us" className="navbar-right">About Us</a>
        <a href="/get-involved" className="navbar-right">Get Involved | </a>
        <a href="/request-a-tutor" className="navbar-right">Request A Tutor | </a>
        <a href="/contacts" className="navbar-right">Contacts | </a>
      </Navbar.Collapse>
    </Navbar>

  );
};
