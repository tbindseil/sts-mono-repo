import React, {useState} from 'react';

import MediaQuery from 'react-responsive'

import './Header.css';
import {ProfileButton} from './ProfileButton';
import logo from '../../images/logo-square(1).png';
import burger from '../../images/burger.png';

export function Header() {

    const [hamburgerDisplay, setHamburgerDisplay] = useState("none")
    const hamburgerOnClick = () => {
        if (hamburgerDisplay === "none") {
            setHamburgerDisplay("block");
        } else if (hamburgerDisplay === "block") {
            setHamburgerDisplay("none");
        }
    }

    return (
        <ul className="NavBar">

            <a className="navLogo"  marginLeft="0px" href="/home"> <img width="100px" height="52px"src={logo} alt="logo"/></a>

            <MediaQuery maxWidth={765}>

                <div className="HamburgerDropDown">
                    <img className="Hamburger" src={burger} onClick={hamburgerOnClick} alt="dropdown"/>

                    <div style={{display: hamburgerDisplay}} className="HamburgerDropDownContent">

                        <a className="HamburgerItem" href="/">Home</a>
                        <a className="HamburgerItem" href="/about-us">About STS</a>
                        <a className="HamburgerItem" href="/process">Our Process</a>
                        <a className="HamburgerItem" href="/get-involved">Become A Tutor</a>
                        <a className="HamburgerItem" href="/request-a-tutor">Request A Tutor</a>
                        <a className="HamburgerItem" href="/contacts">Contact Us</a>
                        <a className="HamburgerItem" href="/profile">Profile</a>

                    </div>
                </div>

            </MediaQuery>


            <MediaQuery minWidth={765}>

                <ProfileButton/>
                <a className="NavBarItem" href="/contacts">Contact Us</a>
                <a className="NavBarItem" href="/request-a-tutor">Request A Tutor</a>
                <a className="NavBarItem" href="/get-involved">Become A Tutor</a>

                <div className="DropDown RightAlign">
                    <a className="NavBarItem DropBtn button" href="/about-us">About Us  <i className="arrow down"/>
                        <div className="DropDownContent">
                            <a className="NavBarDropDownItem" href="/about-us">About STS</a>
                            <a className="NavBarDropDownItem" href="/process">Our Process</a>
                        </div>
                    </a>
                </div>

                <a className="NavBarItem" href="/">Home</a>

            </MediaQuery>

        </ul>
    );
}
