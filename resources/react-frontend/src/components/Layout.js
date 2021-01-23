import React from 'react';
import {Header} from './Header';
import stock_photo from '../images/annie-spratt-loRO40167Xg-unsplash.jpg';

const horizontalBreakStyle = {
  backgroundColor: "grey",
  margin: '0px',
  height: "20px"
};

const imgStyle = {
  border: '10px solid blue',
  maxWidth: '100%',
  height: 'auto'
};

const borderedStyle = {
  border: '10px solid blue'
};

export const Layout = ({text, title}) => (

    <div>

      <Header/>

      <hr style={horizontalBreakStyle}/>

      <img style={imgStyle} src={stock_photo} alt="stock"/>

      <hr style={horizontalBreakStyle}/>

      <header style={borderedStyle}>
        <h4>
          {title}
        </h4>
        <p>
          {text}
        </p>
      </header>
    </div>
);
