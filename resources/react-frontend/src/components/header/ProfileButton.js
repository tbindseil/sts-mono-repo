import React, {useEffect, useState} from 'react';

import {checkAuthenticated} from "../auth/CheckAuthenticated";

export const BigScreenProfileButton = () => {

    const [user, setUser] = useState(undefined);
    useEffect(() => {
        checkAuthenticated(() => void(0), setUser);
    }, [
        setUser
    ]);

    if (user) {

        return (
            <div className="DropDown RightAlign">
                <a className="NavBarItem DropBtn button" href="/profile">Profile  <i className="arrow down"/>
                    <div className="DropDownContent ProfileDropDownContent">
                        <a className="NavBarDropDownItem" href="/profile">Profile</a>
                        <a className="NavBarDropDownItem" href="/my-calendar">My Calendar</a>
                        <a className="NavBarDropDownItem" href="/change-password">Change Password</a>
                        <a className="NavBarDropDownItem" href="/logout">Logout</a>
                        <a className="NavBarDropDownItem" href="/delete-account">Delete Account</a>
                    </div>
                </a>
            </div>
        );

    } else {

        return (
            <>
                <a className="NavBarItem" href="/login">Log In</a>
            </>
        );

    }

}

export const SmallScreenProfileButton = () => {
    const profileArrowDropdownWidth = '20px';

    const [extraProfileDisplay, setExtraProfileDisplay] = useState("none")
    const profileOnClick = () => {
        if (extraProfileDisplay === "none") {
            setExtraProfileDisplay("block");
        } else if (extraProfileDisplay === "block") {
            setExtraProfileDisplay("none");
        }
    }

    const [user, setUser] = useState(undefined);
    useEffect(() => {
        checkAuthenticated(() => void(0), setUser);
    }, [
        setUser
    ]);

    if (user) {

        return (
            <>
                <section style={{display: 'flex'}}>
                    <a className="HamburgerItem" style={{width: `calc(100% - ${profileArrowDropdownWidth})`}} href="/profile">Profile</a>
                    <div style={{width: profileArrowDropdownWidth, height: '100%'}}>
                        <i onClick={profileOnClick} className="arrow down"/>
                    </div>
                </section>
                <a style={{display: extraProfileDisplay}} className="HamburgerItem" href="/my-calendar">My Calendar</a>
                <a style={{display: extraProfileDisplay}} className="HamburgerItem" href="/change-password">Change Password</a>
                <a style={{display: extraProfileDisplay}} className="HamburgerItem" href="/logout">Logout</a>
                <a style={{display: extraProfileDisplay}} className="HamburgerItem" href="/delete-account">Delete Account</a>
            </>
        );

    } else {

        return (
            <>
                <a className="HamburgerItem" href="/anonymous-user">Sign Up</a>
                <a className="HamburgerItem" href="/login">Log In</a>
            </>
        );

    }
}
