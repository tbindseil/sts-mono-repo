import React from 'react';
import logo from '../images/logo-square(1).png';
import burger from '../images/burger.png';
import MediaQuery from 'react-responsive'
import {
	Navbar,
	Nav,
	NavDropdown, 
	Container,
} from 'react-bootstrap';

export const Header = () => {

	const navbarStyle = {
		borderTopWidth: '0px',
		borderRightWidth: '0px',
		borderLeftWidth: '0px',
		borderBottomWidth: '10px',
		borderColor: '#005D8c',
		borderstyle: 'solid',
		borderRadius: '0px',
   		marginBottom: '0px',
   		position: 'sticky', 
   		top: '0',
   		backgroundColor: 'white',
  	};
  
  	const imgStyle = {
  		width: '25px',
  		height: '25px',
  		marginRight: '0px',
  		marginBottom: '2px',
  		marginTop: '35px',
  		marginLeft: '5px',
    };

return (

	<Navbar sticky = "bottom"  style = {navbarStyle}>

		<a class = "navLogo"  marginLeft= "0px" href="/home"> <img width ="100px" height = "52px"src={logo} alt="logo"/></a>
	
		<MediaQuery maxWidth={765}>
			 
			<NavDropdown title= <img style={imgStyle} src={burger} alt="dropdown"/>id="collasible-nav-dropdown">

				<a class ="dropDown" href="/" >Home  </a>
	 			<NavDropdown.Divider />

				<a class ="dropDown" href="/about-us" >About STS </a>
				<NavDropdown.Divider />

				<a class ="dropDown" href="/process" >Our Process </a>
				<NavDropdown.Divider />

				<a class ="dropDown" href="/get-involved">Become A Tutor </a>		
	 			<NavDropdown.Divider />

	 			<a class ="dropDown" href="/request-a-tutor" >Request A Tutor  </a>
				<NavDropdown.Divider />

				<a class ="dropDown" href="/contacts">Contact Us   </a>
				<NavDropdown.Divider />

                <a class= "navBar" href="/profile" className="navbar-right">Profile   </a>

  			</NavDropdown>
  			
		</MediaQuery>

      	<Navbar.Collapse>

			<a class ="navBar" href="/profile">Profile</a>

			<a class ="navBar" href="/contacts">Contact Us  </a>
		
			<a class ="navBar" href="/request-a-tutor" >Request A Tutor  </a>
				
			<a class ="navBar" href="/get-involved">Become A Tutor </a>	

			<a class ="navBar">

			<NavDropdown id="collasible-nav-dropdown" drop = "down" key = "down" title =  <a class = "navBarA" href="/about-us">About Us <i class="arrow down"></i></a>	>
			
      	    <a class ="navBar2" href="/about-us" >About STS </a>
      	    <a class ="navBar2" href="/process" >Our Process  </a>
      	    </NavDropdown>

			</a>

		    <a class ="navBar" href="/" >Home  </a>
				
     	</Navbar.Collapse>
	  
    </Navbar>

);
};

