import React from 'react';

export const Bottom = (props) => {
    return (
        <div className="Footer">
            <p>Students Teaching Students</p>
        </div>
    );
};

export const InDepthBottom = (props) => {
    return (
        <div className="Footer InDepthFooter">
            <div>
                { // spacer
                }
            </div>
            <div className="InDepthFooterTitle">
                <p>Students Teaching Students</p>
            </div>
            <div>
                <ul>
                    <li className="InDepthFooterOption">
                        <a className="InDepthFooterLink" href="/logout">Logout</a>
                    </li>
                    <p className="InDepthFooterOption"> | </p>
                    <li className="InDepthFooterOption">
                        <a className="InDepthFooterLink" href="/change-password">Change Password</a>
                    </li>
                    <p className="InDepthFooterOption"> | </p>
                    <li className="InDepthFooterOption">
                        <a className="InDepthFooterLink" href="/delete-account">Delete Account</a>
                    </li>
                </ul>
            </div>
        </div>
    );
}
// probably want flex wrap on the extra account options
// so, that is a flexbox on the left and the normal "stu.." is a flex box on the right
/*
                        <li className="HelperLink">
                            <a href="/confirm">Confirm</a>
                        </li>
                        <p className="HelperSeparator">|</p>
    */
