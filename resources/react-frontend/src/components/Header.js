import React from 'react';
import logo from '../images/logo-square.png';
import {
	Navbar,
	Nav,
	NavDropdown, 
	Container,
	} from 'react-bootstrap';

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

  };
  

  return (

 <Navbar style = {navbarStyle}>
	
	
	<NavDropdown title= <a class = "navLogo"  marginLeft= "20px" marginBottom= "0px"  href="/home"> <img width ="100px" height = "100px"src={logo} alt="logo"/></a> id="collasible-nav-dropdown">
	<a class ="navBar" href="/" >Home  </a>
	 <NavDropdown.Divider />
	 <br/>
	 <br/>
	 <br/>
	 <br/>
	 <br/>
	<a class ="navBar" href="/about-us" >About Us  </a>
	 <NavDropdown.Divider />
		<a class ="navBar" href="/get-involved">Get Involved  </a>		
	 <NavDropdown.Divider />
	 <a class ="navBar" href="/request-a-tutor" >Request A Tutor  </a>
		 <NavDropdown.Divider />
	<a class ="navBar" href="/contacts">Contacts</a>
    </NavDropdown>
	
      <Navbar.Collapse>


		<a class ="navBar" href="/contacts">Contacts</a>
		
		<a class ="navBar" href="/request-a-tutor" >Request A Tutor  </a>
				
		<a class ="navBar" href="/get-involved">Get Involved  </a>		
	
        <a class ="navBar" href="/about-us" >About Us  </a>
		
		  <a class ="navBar" href="/" >Home  </a>
				
      </Navbar.Collapse>
	  

    </Navbar>
  );
};

