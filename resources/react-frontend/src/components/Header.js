import React from 'react';
import logo from '../images/logo_no_outline.svg';
import {Navbar} from 'react-bootstrap';

export const Header = ({screenTitle}) => {

  const navbarStyle = {
    //border: '10px solid #005D8c',
	borderTopWidth: '0px',
	borderRightWidth: '0px',
	borderLeftWidth: '0px',
	borderBottomWidth: '10px',
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
        <a href="/" >
          <img src={logo} alt="logo"/>
        </a>
		<a class= "navBar" href="/contacts">Contacts</a>
		<a class= "navBar" href="/request-a-tutor" >Request A Tutor  </a>
		<a class= "navBar" href="/get-involved">Get Involved  </a>
        <a class= "navBar" href="/about-us" >About Us  </a>
		<a class= "navBar" href="/home" >Home  </a>
		
      </Navbar.Collapse>
    </Navbar>

  );
};
