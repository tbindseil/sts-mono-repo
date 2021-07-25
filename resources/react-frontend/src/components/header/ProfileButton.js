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
                        <a className="NavBarDropDownItem" href="/account">Account</a>
                        <a className="NavBarDropDownItem" href="/my-calendar">My Calendar</a>
                        <a className="NavBarDropDownItem" href="/calendar">Calendar</a>
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
                <a style={{display: extraProfileDisplay}} className="HamburgerItem" href="/account">Account</a>
                <a style={{display: extraProfileDisplay}} className="HamburgerItem" href="/my-calendar">My Calendar</a>
                <a style={{display: extraProfileDisplay}} className="HamburgerItem" href="/calendar">Calendar</a>
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
