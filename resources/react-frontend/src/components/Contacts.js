import React from 'react';
import {Header} from './Header';
import stock_photo from '../images/skyline.jpg';


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
//const sideBy = { ******************************Use this to have side by side elements, wrap in a like section 
	//display: '-webkit-flex',
  //display: 'flex',
//};

const pageBorder = {
  borderLeft: '150px solid #b4c7e7',
   borderRight: '150px solid #b4c7e7',
   borderTop:'0px solid #005D8c',
   borderBottom:'0px solid #005D8c',
   paddingTop: '5px',
  paddingBottom:'50px',
  marginTop: '0px',

};

export const Contacts= () => (

       <div>

      <Header/>


      <img style={imgStyle} src={stock_photo} alt="stock"/>

       <header style ={pageBorder}>
        <h2 class= "pageHeader">
          Contacts
        </h2>
		<hr style ={underLine}/>
	
        <p class= "mainText">
		Feel free to reach out to us with any questions, concerns, or suggestions for our organization. We are always working to improve, and would love to hear from you!
		</p>
		<hr style ={underLine}/>
		<p class= "formStyle">
		Email: <a href="mailto:bjkearbey@studentsts.org"> bjkearbey@studentsts.org</a>			
		</p>
	
      </header>
    </div>
);
	