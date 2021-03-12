import React, {useState} from 'react';
import MediaQuery from 'react-responsive'
import { Navbar, NavDropdown } from 'react-bootstrap';

import logo from '../../images/logo-square(1).png';
import burger from '../../images/burger.png';

import {ProfileButton} from './ProfileButton';

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

    const [show, setShow] = useState(false);
    const showAboutUsDropdown = () => {
        setShow(true);
    }
    const hideAboutUsDropdown = () => {
        setShow(false);
    }

    return (

        <Navbar sticky="bottom"  style={navbarStyle}>

            <a className="navLogo"  marginLeft="0px" href="/home"> <img width="100px" height="52px"src={logo} alt="logo"/></a>

            <MediaQuery maxWidth={765}>

                <NavDropdown title={<img style={imgStyle} src={burger} alt="dropdown"/>} id="collasible-nav-dropdown">

                    <a className="dropDown" href="/" >Home  </a>
                    <NavDropdown.Divider />

                    <a className="dropDown" href="/about-us" >About STS </a>
                    <NavDropdown.Divider />

                    <a className="dropDown" href="/process" >Our Process </a>
                    <NavDropdown.Divider />

                    <a className="dropDown" href="/get-involved">Become A Tutor </a>
                    <NavDropdown.Divider />

                    <a className="dropDown" href="/request-a-tutor" >Request A Tutor  </a>
                    <NavDropdown.Divider />

                    <a className="dropDown" href="/contacts">Contact Us   </a>
                    <NavDropdown.Divider />

                    <a className="dropDown" href="/profile">Profile   </a>

                </NavDropdown>

            </MediaQuery>

            <Navbar.Collapse>

                <ProfileButton/>

                <a className="navBar" href="/contacts">Contact Us  </a>

                <a className="navBar" href="/request-a-tutor" >Request A Tutor  </a>

                <a className="navBar" href="/get-involved">Become A Tutor </a>

                <a className="navBar" href="/about-us" onMouseEnter={showAboutUsDropdown} onMouseLeave={hideAboutUsDropdown}>

                    <NavDropdown
                        id="collasible-nav-dropdown"
                        drop="down"
                        key="down"
                        show={show}
                        title={<a className="navBarA" href="/about-us">About Us <i className="arrow down"></i></a>}>
                        <a className="navBar2" href="/about-us" >About STS </a>
                        <a className="navBar2" href="/process" >Our Process  </a>
                    </NavDropdown>

                </a>

                <a className="navBar" href="/" >Home  </a>

            </Navbar.Collapse>

        </Navbar>

    );
};
