import React from 'react';
import {Header} from '../header/Header';
import stock_photo from '../../images/stock_photo.jpg';
import MediaQuery from 'react-responsive'
import {Bottom} from '../header/Bottom';

export const Home = () => (

    <div className="TopLevelContainer">

        <Header/>

        <img className="FullScreenImg" src={stock_photo} alt="stock"/>

        <MediaQuery minWidth={765}>

            <HomeBody
                pageBorderClass={"PageBorder"}
                underlineClass={"Underline"}/>

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

                <h1 id="HomeTitle" className="titleMain">
                    Students Teaching Students
                </h1>

                <hr id="HomeUnderline" className={props.underlineClass}/>

                <p className="Modo">
                    Enhancing education through student to student tutoring
                </p>

            </header>
        </>
    );
}
