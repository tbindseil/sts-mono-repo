import React, {useState} from 'react';

import burger from '../../images/burger.png';

export const Bottom = (props) => {
    return (
        <div className="Footer FooterItem">
            <p>Students Teaching Students</p>
        </div>
    );
};

export const InDepthBottom = (props) => {
    return (
        <div className="Footer InDepthFooter FooterItem">
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

export const InDepthBottomHamburger = (props) => {
    const [hamburgerDisplay, setHamburgerDisplay] = useState("none")
    const hamburgerOnClick = () => {
        if (hamburgerDisplay === "none") {
            setHamburgerDisplay("block");
        } else if (hamburgerDisplay === "block") {
            setHamburgerDisplay("none");
        }
    }

    return (
        <div className="Footer InDepthFooter FooterItem">
            <div className="InDepthFooterTitle">
                <p>Students Teaching Students</p>
            </div>
            <div>

                <div className="HamburgerDropDown">
                    <img className="Hamburger" src={burger} onClick={hamburgerOnClick} alt="dropdown"/>

                    <div style={{display: hamburgerDisplay}} className="HamburgerDropDownContent HamburgerDropDownContentBottomRight">
                        <a className="HamburgerItem" href="/logout">Logout</a>
                        <a className="HamburgerItem" href="/change-password">Change Password</a>
                        <a className="HamburgerItem" href="/delete-account">Delete Account</a>
                    </div>
                </div>
            </div>
        </div>
    );
}
