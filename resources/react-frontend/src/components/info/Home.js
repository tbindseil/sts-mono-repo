import React from 'react';
import {Header} from '../header/Header';
import stock_photo from '../../images/stock_photo.jpg';
import MediaQuery from 'react-responsive'
import {Bottom} from '../Bottom';


const imgStyle = {
  maxWidth: '100%',
  height: 'auto',
  margin:'0px'
};

const pageBorder = {
  borderLeft: '10vw solid #b4c7e7',
   borderRight: '10vw solid #b4c7e7',
   borderTop:'0px solid #005D8c',
   borderBottom:'0px solid #005D8c',
   paddingTop: '50px',
  paddingBottom:'0px',
  marginTop: '0px',
  height: '75vh'
};

const pageBorder2 = {
  borderLeft: '5vw solid #b4c7e7',
   borderRight: '5vw solid #b4c7e7',
   borderTop:'0px solid #005D8c',
   borderBottom:'0px solid #005D8c',
   paddingTop: '50px',
  paddingBottom:'100px',
  marginTop: '0px',
  height: '75vh'
};

const modo = {
  textAlign: 'center',
  fontFamily: 'Arial',
  fontVariant: 'small-caps',
  fontWeight: 'bold',
  color: '#005D8c',
}

export const Home = () => (

    <div>

        <Header/>

        <img style={imgStyle} src={stock_photo} alt="stock"/>

        <MediaQuery maxWidth={765}>

            <header style ={pageBorder2}>

                <h1 className= "titleMain">
                    Students Teaching Students
                </h1>

                <hr className="UnderLine2"/>

                <p style= {modo}>
                    Enhancing education through student to student tutoring
                </p>

            </header>
        </MediaQuery>

        <MediaQuery minWidth={765}>

            <header style ={pageBorder}>

                <h1 className= "titleMain">
                    Students Teaching Students
                </h1>

                <hr className="UnderLine"/>

                <p style= {modo}>
                    Enhancing education through student to student tutoring
                </p>

            </header>
        </MediaQuery>

        <Bottom/>

    </div>
);
