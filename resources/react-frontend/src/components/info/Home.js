import React from 'react';
import {Header} from '../header/Header';
import stock_photo from '../../images/stock_photo.jpg';
import MediaQuery from 'react-responsive'
import {Bottom} from '../Bottom';

const modo = {
  textAlign: 'center',
  fontFamily: 'Arial',
  fontVariant: 'small-caps',
  fontWeight: 'bold',
  color: '#005D8c',
}

const style = {
    height: '100%'
}

export const Home = () => (

    <div className="TopLevelContainer">

        <Header/>

        <img className="FullScreenImg" src={stock_photo} alt="stock"/>

        <MediaQuery minWidth={765}>

            <header className="PageBorder">

                <h1 className= "titleMain">
                    Students Teaching Students
                </h1>

                <hr className="UnderLine"/>

                <p style= {modo}>
                    Enhancing education through student to student tutoring
                </p>

            </header>
        </MediaQuery>

        <MediaQuery maxWidth={765}>

            <header className={"PageBorder2"}>

                <h1 className= "titleMain">
                    Students Teaching Students
                </h1>

                <hr className="UnderLine2"/>

                <p style= {modo}>
                    Enhancing education through student to student tutoring
                </p>

            </header>
        </MediaQuery>

        <Bottom/>

    </div>
);
