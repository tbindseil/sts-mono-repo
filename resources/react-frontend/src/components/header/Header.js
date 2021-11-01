import React, {useState} from 'react';

import MediaQuery from 'react-responsive'

import {BigScreenProfileButton, SmallScreenProfileButton} from './ProfileButton';
import logo from '../../images/logo-square(1).png';
import burger from '../../images/burger.png';

export function Header() {

    // TODO close menu when click is made elsewhere
    const [hamburgerDisplay, setHamburgerDisplay] = useState("none")
    const hamburgerOnClick = () => {
        if (hamburgerDisplay === "none") {
            setHamburgerDisplay("block");
        } else if (hamburgerDisplay === "block") {
            setHamburgerDisplay("none");
        }
    }


    // TODO profile button is rendered after user deletes account
    // it goes away with a refresh
    return (
        <ul id="NavBar" className="NavBar HeaderItem">

            <a className="NavLogo"  marginLeft="0px" href="/home"> <img width="100px" height="52px"src={logo} alt="logo"/></a>

            <MediaQuery maxWidth={765}>

                <div className="HamburgerDropDown">
                    <img className="Hamburger" src={burger} onClick={hamburgerOnClick} alt="dropdown"/>

                    <div style={{display: hamburgerDisplay}} className="HamburgerDropDownContent">

                        <a className="HamburgerItem" href="/">Home</a>
                        <a className="HamburgerItem" href="/about-us">About STS</a>
                        <a className="HamburgerItem" href="/process">Our Process</a>
                        <a className="HamburgerItem" href="/contacts">Contact Us</a>

                        <SmallScreenProfileButton/>
                    </div>
                </div>

            </MediaQuery>


            <MediaQuery minWidth={765}>

                <BigScreenProfileButton/>
                <a className="NavBarItem" href="/contacts">Contact Us</a>

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
