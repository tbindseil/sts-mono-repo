import React from 'react';
import {Header} from './Header';
import stock_photo from '../images/stock_photo.jpg';

const horizontalBreakStyle = {
  backgroundColor: "#b4c7e7",
  margin:'-5px',
  height: "20px"
};

const imgStyle = {
  border: '10px solid #005D8c',
  maxWidth: '100%',
  height: 'auto',
  marginBottom: '0px'
};



const borderedStyle = {
  border: '10px solid #005D8c',
  height: 'auto',
  margin: '0px auto',
  paddingBottom:'200px'
};

export const Layout = ({text, title, link}) => (

    <div>

      <Header/>

      <hr style={horizontalBreakStyle}/>

      <img style={imgStyle} src={stock_photo} alt="stock"/>

      <hr style={horizontalBreakStyle}/>

      <header style={borderedStyle}>
        <h2 style={{color: "#005D8c", fontWeight: 'bold'}}>
          {title}
        </h2>
        <p>
          {text}
        </p>
		<p>
			{link}
			</p>
		
      </header>
    </div>
);
