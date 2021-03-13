import React from 'react';

import './Header.css';
import logo from '../../images/logo-square(1).png';

export function PlainHeader() {
    return (
        <ul className="NavBar">
            <a className="navLogo"  marginLeft="0px" href="/home"> <img width="100px" height="52px"src={logo} alt="logo"/></a>

            <a className="NavBarItem" href="/contacts">Contact Us</a>

            <a className="NavBarItem" href="/request-a-tutor">Request A Tutor</a>

            <a className="NavBarItem" href="/get-involved">Become A Tutor</a>

            <div className="DropDown RightAlign">
                <button className="NavBarItem DropBtn">About Us  <i className="arrow down"/>
                    <div className="DropDownContent">
                        <a href="/about-us">About STS</a>
                        <a href="/process">Our Process</a>
                    </div>
                </button>
            </div>

            <a className="NavBarItem" href="/">Home</a>
        </ul>
    );
}
