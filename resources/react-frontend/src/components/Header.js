import React from 'react';
import PropTypes from 'prop-types';
import {Navbar, Nav} from 'react-bootstrap';

export const Header = ({screenTitle}) => {

  const sectionStyle = {
    border: '5px solid blue'
  };

  return (
    <div className="row justify-content-center">

      <Navbar style={sectionStyle}>
        <Navbar.Collapse>
          <Nav>
            <Nav.Link href="/">Home</Nav.Link>
            <Nav.Link href="/about-us">About Us</Nav.Link>
            <Nav.Link href="/get-involved">Get Involved</Nav.Link>
            <Nav.Link href="/request-a-tutor">Request A Tutor</Nav.Link>
            <Nav.Link href="/contacts">Contacts</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>

    </div>
  );
};

Header.propTypes = {
  name: PropTypes.string.isRequired,
  price: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};
