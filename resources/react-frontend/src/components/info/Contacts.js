import React from 'react';
import {Header} from '../header/Header';
import stock_photo from '../../images/skyline.jpg';
import MediaQuery from 'react-responsive';
import {Bottom} from '../Bottom';

export const Contacts = () => (

    <div className="TopLevelContainer">

        <Header/>

        <MediaQuery minWidth={765}>
            <ContactUsBody
                pageBorderClass={"PageBorder"}
                mainTextClass={"mainText"}
                underlineClass={"UnderLine"}/>
        </MediaQuery>

        <MediaQuery maxWidth={765}>
            <ContactUsBody
                pageBorderClass={"PageBorder2"}
                mainTextClass={"mainText2"}
                underlineClass={"UnderLine2"}/>
        </MediaQuery>

        <Bottom/>

    </div>

);

// only differenc is PageBorder <=> PageBorder2 , mainText <=> mainText2 , Underline <=> UnderLine2
function ContactUsBody(props) {
    return (
        <>
            <img className="FullScreenImg" src={stock_photo} alt="stock"/>

            <header className={props.pageBorderClass}>

                <h2 className="titleMain">
                    Contact Us
                </h2>

                <hr className={props.underlineClass}/>

                <p className={props.mainTextClass}>
                    Feel free to reach out to us with any questions, concerns, or suggestions for our organization. We are always working to improve, and would love to hear from you!
                </p>

                <hr className={props.underlineClass}/>

                <p className="FormStyle">
                    Email: <a href="mailto:bjkearbey@studentsts.org"> bjkearbey@studentsts.org</a>
                </p>

            </header>
        </>
    );
}
