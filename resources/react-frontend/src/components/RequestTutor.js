import React from 'react';
import {Header} from './Header';
import stock_photo from '../images/stock_photo.jpg';
import MediaQuery from 'react-responsive';
import  Media from 'react-media'
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
 marginLeft:'150px',
 marginRight:'150px',
};

const underLine2 = { 
 border: '1px solid grey', //header underLine
 marginLeft:'10px',
 marginRight:'10px',
};

const imgStyle = {
  border: '10px solid #005D8c',
  maxWidth: '100%',
  height: 'auto',
  margin:'0px'
};

const pageBorder = {
  borderLeft: '150px solid #b4c7e7',
   borderRight: '150px solid #b4c7e7',
   borderTop:'0px solid #005D8c',
   borderBottom:'0px solid #005D8c',
   paddingTop: '5px',
  paddingBottom:'50px',
  marginTop: '0px',
};

const pageBorder2 = {
  borderLeft: '10px solid #b4c7e7',
   borderRight: '10px solid #b4c7e7',
   borderTop:'0px solid #005D8c',
   borderBottom:'0px solid #005D8c',
   paddingTop: '5px',
  paddingBottom:'100px',
  marginTop: '0px',
};


export const RequestTutor = () => (

<div>

  <Header/>
    <MediaQuery minWidth={765}> 

      <header style ={pageBorder}>

        <h2 class= "pageHeader">
          Request A Tutor
        </h2>

		    <hr style ={underLine}/>
	
        <p class= "mainText">
          Students Teaching Students is a nonprofit tutoring organization that pairs students in ther own area for free tutoring services. 
        </p>
	      <p class= "mainText">
	        If you are looking for help with test preperation, homework, or general subject matter, request a tutor for your subjects of interest and state you availability in the form below. 
		    </p>

		    <hr style ={underLine}/>

		    <p class= "formStyle">
         <iframe src="https://docs.google.com/forms/d/e/1FAIpQLSf4uPCMvxLew5migtPBZwiavpJRrS24SdE9XbYlScTLzEpdeQ/viewform?embedded=true" width="700" height="520" frameborder="0" marginheight="0" marginwidth="0">Loading…</iframe>
		    </p>
	
      </header>

	  </MediaQuery>
	   
	  <MediaQuery maxWidth={765}> 

     <header style ={pageBorder2}>

        <h2 class= "pageHeader">
         Request A Tutor
        </h2>

		    <hr style ={underLine2}/>
	
        <p class= "mainText2">
           Students Teaching Students is a nonprofit tutoring organization that pairs students in ther own area for free tutoring services. 
        </p>
		    <p class="mainText2">
		      If you are looking for help with test preperation, homework, or general subject matter, request a tutor for your subjects of interest and state you availability in the form below. 
	     	</p>

		    <hr style ={underLine2}/>

		    <p class= "formStyle">
          <iframe src="https://docs.google.com/forms/d/e/1FAIpQLSf4uPCMvxLew5migtPBZwiavpJRrS24SdE9XbYlScTLzEpdeQ/viewform?embedded=true" width="100%" height="520" frameborder="0" marginheight="0" marginwidth="0">Loading…</iframe>
		  	</p>
	
      </header>
		
		</MediaQuery>
    <Bottom/>

  </div>

);
	
