import React from 'react';
import {Header} from '../header/Header';
import stock_photo from '../../images/skyline.jpg';
import MediaQuery from 'react-responsive';
import {Bottom} from '../Bottom';

export const Contacts= () => (

    <div className="TopLevelContainer">

        <Header/>

        <MediaQuery minWidth={765}>

            <img className="FullScreenImg" src={stock_photo} alt="stock"/>

            <header className="PageBorder">

                <h2 className="titleMain">
                    Contact Us
                </h2>

                <hr className="UnderLine"/>

                <p className= "mainText">
                    Feel free to reach out to us with any questions, concerns, or suggestions for our organization. We are always working to improve, and would love to hear from you!
                </p>

                <hr className="UnderLine"/>

                <p className="FormStyle">
                    Email: <a href="mailto:bjkearbey@studentsts.org"> bjkearbey@studentsts.org</a>
                </p>

            </header>
        </MediaQuery>

        <MediaQuery maxWidth={765}>

            <img className="FullScreenImg" src={stock_photo} alt="stock"/>

            <header className="PageBorder2">

                <h2 className="titleMain">
                    Contact Us
                </h2>

                <hr className="UnderLine2"/>

                <p className= "mainText2">
                    Feel free to reach out to us with any questions, concerns, or suggestions for our organization. We are always working to improve, and would love to hear from you!
                </p>

                <hr className="UnderLine2"/>

                <p className="FormStyle">
                    Email: <a href="mailto:bjkearbey@studentsts.org"> bjkearbey@studentsts.org</a>
                </p>

            </header>
        </MediaQuery>

        <Bottom/>

    </div>

);
