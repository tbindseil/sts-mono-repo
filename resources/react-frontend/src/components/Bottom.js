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

export const Bottom = ({screenTitle}) => {

	const navbarStyle = {
		borderRadius: '0px',
   		marginBottom: '0px',
   		backgroundColor: '#005D8c',
  	};
  

  
return (

	<Navbar fixed = "bottom"  style = {navbarStyle}>
		
		<h4 class = "bottomTitle">
			Students Teaching Students 
		</h4>


    </Navbar>

);
};

