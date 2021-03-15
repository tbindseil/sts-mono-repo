import React from 'react';

// TODO fork based off login status
// TODO define small screen profile dropdown
export const ProfileButton = () => {

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
}
