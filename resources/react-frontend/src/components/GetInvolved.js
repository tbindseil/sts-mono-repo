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


const pageBorder = {
  borderLeft: '150px solid #b4c7e7',
   borderRight: '150px solid #b4c7e7',
   borderTop:'0px solid #005D8c',
   borderBottom:'0px solid #005D8c',
   paddingTop: '5px',
  paddingBottom:'50px',
  marginTop: '0px',

};

export const GetInvolved = () => (

       <div>

      <Header/>

       <header style ={pageBorder}>
        <h2 class= "pageHeader">
          Get Involved
        </h2>
		<hr style ={underLine}/>
	
        <p class= "mainText">
           We are always looking for new tutors to join our team. If you are passionate about helping others and believe you can share your knowledge with other students fill out the survey below to get involved. 
		  </p>
		   
		<p class = "mainText">
		   In addition to tutors, we are looking for high performing students to fill the role of lead tutor. This position gives you real world experience developing skills like project management, recruiting, scheduling and others. The same survey below will allow you to mark your interest in becoming a lead tutor.
        </p>
		
		<hr style ={underLine}/>
		<p class= "formStyle">
			<iframe src="https://docs.google.com/forms/d/e/1FAIpQLSetv8vY2dH-ur938u0qKqJchiEnqry9ivWc0tDHmnED5epPYA/viewform?embedded=true" width="700" height="520" frameborder="0" marginheight="0" marginwidth="0">Loading…</iframe>
			</p>
	
      </header>
    </div>
);
	
