import React from 'react';

import './Header.css';
import logo from '../../images/logo-square(1).png';

export function PlainHeader() {
    return (
        <ul className="NavBar">
            <a className="navLogo"  marginLeft="0px" href="/home"> <img width="100px" height="52px"src={logo} alt="logo"/></a>

            <li className="NavBarItem">
                <a href="/contacts">Contact Us</a>
            </li>

            <li className="NavBarItem">
                <a href="/request-a-tutor">Request A Tutor</a>
            </li>

            <li className="NavBarItem">
                <a href="/get-involved">Become A Tutor</a>
            </li>

            <div className="DropDown RightAlign">
                <button className="NavBarItem DropBtn">About Us</button>
                <div className="DropDownContent">
                    <a href="/about-us">About STS</a>
                    <a href="/process">Our Process</a>
                </div>
            </div>

            <li className="NavBarItem">
                <a href="/">Home</a>
            </li>
        </ul>
    );
}
