import React, {useEffect, useState} from 'react';

import {checkAuthenticated} from "../auth/CheckAuthenticated";

// TODO define small screen profile dropdown
export const ProfileButton = () => {

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
            <a className="NavBarItem" href="/anonymous-user">Sign Up</a>
        );

    }

}
