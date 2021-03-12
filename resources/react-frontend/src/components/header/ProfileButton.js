import React from 'react';

// TODO fork based off login status
export const ProfileButton = () => {

    // TJTAG-latest continue here
    // so i guess my work stack so far is:
    //      rework extra stuff for profile
    //          rework form stuff
    return (

        <div className="dropdownTJ">
            <button className="dropBtn">Dropdown</button>
            <div className="dropdown-content">
                <a href="/profile">Profile</a>
                <a href="/my-calendar">My Calendar</a>
                <a href="/change-password">Change Password</a>
                <a href="/logout">Logout</a>
                <a href="/delete-account">Delete Account</a>
            </div>
        </div>

    );
}
