import React from 'react';
import {Navbar, Nav} from 'react-bootstrap';

export const Header = ({screenTitle}) => {

  const navbarStyle = {
    border: '5px solid blue'
  };

  return (
    <div className="row justify-content-center">

      <Navbar style={navbarStyle}>
        <Navbar.Collapse>
          <Nav className="ml-auto">
            <Nav.Link href="/">Home</Nav.Link> |
            <Nav.Link href="/about-us"> About Us</Nav.Link> |
            <Nav.Link href="/get-involved"> Get Involved</Nav.Link> |
            <Nav.Link href="/request-a-tutor"> Request A Tutor</Nav.Link> |
            <Nav.Link href="/contacts"> Contacts</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>

    </div>
  );
};
