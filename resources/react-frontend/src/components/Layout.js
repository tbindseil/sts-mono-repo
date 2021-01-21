import React from 'react';
import {Header} from './Header';
// import stock_photo from '../images/annie-spratt-loRO40167Xg-unsplash.svg';

      /*<div class="container-fluid">
        <img src={stock_photo} alt="stock"/>
      </div>*/

const horizontalBreakStyle = {
  backgroundColor: "grey",
  height: "20px"
};

export const Layout = ({text, title}) => (

    <div className="Layout">

      <Header/>

      <hr style={horizontalBreakStyle}/>

      <header className="App-header">
        <h4>
          {title}
        </h4>
        <p>
          {text}
        </p>
      </header>
    </div>
);
