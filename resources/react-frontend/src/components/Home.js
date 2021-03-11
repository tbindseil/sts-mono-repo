import React from 'react';
import {Header} from './header/Header';
import stock_photo from '../images/stock_photo.jpg';
import MediaQuery from 'react-responsive'
import {Bottom} from './Bottom';


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
 marginLeft:'50px',
 marginRight:'50px',
};

const underLine2 = { 
 border: '1px solid grey', //header underLine
 marginLeft:'10px',
 marginRight:'10px',
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
  paddingBottom:'200px',
  marginTop: '0px',
};

const pageBorder2 = {
  borderLeft: '10px solid #b4c7e7',
   borderRight: '10px solid #b4c7e7',
   borderTop:'0px solid #005D8c',
   borderBottom:'0px solid #005D8c',
   paddingTop: '50px',
  paddingBottom:'200px',
  marginTop: '0px',
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

          <h1 class= "titleMain">
            Students Teaching Students
          </h1>

		      <hr style ={underLine2}/>

          <p style= {modo}>	
		        Enhancing education through student to student tutoring 
          </p>

        </header>
    
      </MediaQuery>

     <MediaQuery minWidth={765}>

       <header style ={pageBorder}>

          <h1 class= "titleMain">
            Students Teaching Students
          </h1>

		      <hr style ={underLine}/>

          <p style= {modo}>	
		        Enhancing education through student to student tutoring 
          </p>
		
        </header>

     </MediaQuery>

  </div>
);

