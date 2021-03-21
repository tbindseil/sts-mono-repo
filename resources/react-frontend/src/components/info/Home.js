import React from 'react';
import MediaQuery from 'react-responsive'

import stock_photo from '../../images/stock_photo.jpg';

import {Header} from '../header/Header';
import {Bottom} from '../header/Bottom';
import {Title} from '../layout/Title';

export const Home = () => (

    <div className="TopLevelContainer">

        <Header/>

        <img className="FullScreenImg" src={stock_photo} alt="stock"/>

        <MediaQuery minWidth={765}>

            <HomeBody
                pageBorderClass={"PageBorder"}
                underlineClass={"HomeUnderline"}/>

        </MediaQuery>

        <MediaQuery maxWidth={765}>

            <HomeBody
                pageBorderClass={"PageBorder2"}
                underlineClass={"Underline2"}/>

        </MediaQuery>

        <Bottom/>

    </div>
);

function HomeBody(props) {
    return (
        <>
            <header className={props.pageBorderClass}>

                <Title
                    titleText={"Students Teaching Students"}
                    underlineClass={props.underlineClass}/>

                <p className="Modo">
                    Enhancing education through student to student tutoring
                </p>

            </header>
        </>
    );
}
