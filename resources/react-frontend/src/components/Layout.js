import React from 'react';
import {Header} from './Header';
import stock_photo from '../images/annie-spratt-loRO40167Xg-unsplash.jpg';

const horizontalBreakStyle = {
  backgroundColor: "#b4c7e7",
  margin: '0px',
  height: "10px"
};

const imgStyle = {
  border: '10px solid #005D8c',
  maxWidth: '100%',
  height: 'auto'
};



const borderedStyle = {
  border: '10px solid #005D8c',
};

export const Layout = ({text, title, link}) => (

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
		<p>
			{link}
			</p>
		
      </header>
    </div>
);
