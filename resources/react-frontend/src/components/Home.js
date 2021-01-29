import React from 'react';
import {Header} from './Header';
import stock_photo from '../images/stock_photo.jpg';


const breakStyle = {              //light blue line 
  backgroundColor: "#b4c7e7",
  height: "20px",
  margin: '0px',
  marginTop: '-10px'
};

const breakStyle2 = { 
 border: '5px solid #005D8c', //Dark Blue line 
};

const underLine = { 
 border: '1px solid grey', //header underLine
 marginLeft:'150px',
 marginRight:'150px',
};

const imgStyle = {
  maxWidth: '100%',
  height: 'auto',
  margin:'0px'
};


const pageBorder = {
  borderLeft: '150px solid #b4c7e7',
   borderRight: '150px solid #b4c7e7',
   borderTop:'0px solid #005D8c',
   borderBottom:'0px solid #005D8c',
   paddingTop: '50px',
  paddingBottom:'100px',
  marginTop: '0px',

};

const modo = {
  textAlign: 'center',
  fontFamily: 'Arial',
}

export const Home = () => (

    <div>

      <Header/>



      <img style={imgStyle} src={stock_photo} alt="stock"/>

	 
    <header style ={pageBorder}>
        <h1 class= "titleMain">
          Students Teaching Students
        </h1>
		<hr style ={underLine}/>
        <p style= {modo}>	
		Enhancing education through student to student tutoring 
        </p>
		
   </header>
    </div>
);

