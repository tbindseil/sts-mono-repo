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
  border: '10px solid #005D8c',
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

export const RequestTutor = () => (

       <div>

      <Header/>

       <header style ={pageBorder}>
        <h2 class= "pageHeader">
         Request A Tutor
        </h2>
		<hr style ={underLine}/>
	
        <p class= "mainText">
           Students Teaching Students is a nonprofit tutoring organization that matches students with other students in there area for free tutoring service. 
        </p>
		<p class="mainText">
		If you are looking for test prep, homework help, or just to better understand a subject, visit the link below to request a tutor that fits all of your subject and schedule needs.
		</p>
		<hr style ={underLine}/>
		<p class= "formStyle">
    <iframe src="https://docs.google.com/forms/d/e/1FAIpQLSf4uPCMvxLew5migtPBZwiavpJRrS24SdE9XbYlScTLzEpdeQ/viewform?embedded=true" width="700" height="520" frameborder="0" marginheight="0" marginwidth="0">Loading…</iframe>
			</p>
	
      </header>
    </div>
);
	