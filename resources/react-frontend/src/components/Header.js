import React from 'react';
import logo from '../images/logo_no_outline.svg';
import {Navbar} from 'react-bootstrap';

export const Header = ({screenTitle}) => {

  const navbarStyle = {
    border: '10px solid blue',
    marginBottom: '0px',
    width: '100%'
  };

  return (

    <Navbar style={navbarStyle} classname="navbar navbar-default navbar-static-top">
      <Navbar.Collapse>
        <a href="/" class="navbar-left">
          <img src={logo} alt="logo"/>
        </a>
        <a href="/about-us" class="navbar-right">About Us</a>
        <a href="/get-involved" class="navbar-right">Get Involved | </a>
        <a href="/request-a-tutor" class="navbar-right">Request A Tutor | </a>
        <a href="/contacts" class="navbar-right">Contacts | </a>
      </Navbar.Collapse>
    </Navbar>

  );
};
