import React, {useCallback, useEffect, useState} from 'react';

import {checkAuthenticated} from "../auth/CheckAuthenticated";

export const BigScreenProfileButton = () => {

    const [user, setUser] = useState(undefined);
    const [isAdmin, setIsAdmin] = useState(false);

    // TODO dry it out, this is copy pasted, and will run
    // twice when in profile screen
    const getAdminStatus = useCallback(() => {
        if (!user) {
            return;
        }

        const baseUrl = 'https://oercmchy3l.execute-api.us-west-2.amazonaws.com/prod/';
        const url = baseUrl + user.username;
        fetch(url)
            .then(res => res.json())
            .then(
                (result) => {
                    setIsAdmin(result.admin);
                },
                // Note: it's important to handle errors here
                // instead of a catch() block so that we don't swallow
                // exceptions from actual bugs in components.
                (error) => {
                    console.log("error getting profile for profile button");
                    console.log(error);
                }
            );
    }, [
        user
    ]);

    useEffect(() => {
        checkAuthenticated(() => void(0), setUser);
    }, [
        setUser,
    ]);

    useEffect(() => {
        getAdminStatus();
    }, [
        getAdminStatus
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
                        { 
                            isAdmin && <a className="NavBarDropDownItem" href="/make-class">Make Class</a>
                        }
                    </div>
                </a>
            </div>
        );

    } else {

        return (
            <>
                <a className="NavBarItem" href="/anonymous-user">Sign Up</a>
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
    const [isAdmin, setIsAdmin] = useState(false);

    // TODO dry it out, this is copy pasted, and will run
    // twice when in profile screen
    const getAdminStatus = useCallback(() => {
        if (!user) {
            return;
        }

        const baseUrl = 'https://oercmchy3l.execute-api.us-west-2.amazonaws.com/prod/';
        const url = baseUrl + user.username;
        fetch(url)
            .then(res => res.json())
            .then(
                (result) => {
                    setIsAdmin(result.admin);
                },
                // Note: it's important to handle errors here
                // instead of a catch() block so that we don't swallow
                // exceptions from actual bugs in components.
                (error) => {
                    console.log("error getting profile for profile button");
                    console.log(error);
                }
            );
    }, [
        user
    ]);

    useEffect(() => {
        checkAuthenticated(() => void(0), setUser);
    }, [
        setUser
    ]);

    useEffect(() => {
        getAdminStatus();
    }, [
        getAdminStatus
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
                {
                    isAdmin && <a style={{display: extraProfileDisplay}} className="HamburgerItem" href="/make-class">Make Class</a>
                }
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
