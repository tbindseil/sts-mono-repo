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

export const GetInvolved = () => (

  <div>

    <Header/>

      <MediaQuery minWidth={765}>

        <header style ={pageBorder}>

          <h2 class= "pageHeader">
            Become A Tutor
          </h2>

		      <hr style ={underLine}/>
	
          <p class= "mainText">
            We are always looking for additional high-performing high school students from various locations and subject matters to become tutors.
		      </p>
		    	<p class = "mainText">
		      If you are interested in giving back to your community through tutoring, please fill out the survey below so we can better match you with students looking for additional help. 
          </p>
		
		      <hr style ={underLine}/>

		      <p class= "formStyle">
			     <iframe src="https://docs.google.com/forms/d/e/1FAIpQLSetv8vY2dH-ur938u0qKqJchiEnqry9ivWc0tDHmnED5epPYA/viewform?embedded=true" width="700" height="520" frameborder="0" marginheight="0" marginwidth="0">Loading…</iframe>
			    </p>
	
        </header>

	    </MediaQuery>
	  
	    <MediaQuery maxWidth={765}>

	     <header style ={pageBorder2}>

          <h2 class= "pageHeader">
            Get Involved
          </h2>

		      <hr style ={underLine2}/>
	
          <p class= "mainText2">
           We are always looking for additional high-performing high school students from various locations and subject matters to become tutors.
		      </p>
		      <p class = "mainText2">
		        If you are interested in giving back to your community through tutoring, please fill out the survey below so we can better match you with students looking for additional help. 
          </p>
		
		      <hr style ={underLine2}/>

		      <p class= "formStyle">
	   		    <iframe src="https://docs.google.com/forms/d/e/1FAIpQLSetv8vY2dH-ur938u0qKqJchiEnqry9ivWc0tDHmnED5epPYA/viewform?embedded=true" width="100%" height="520" frameborder="0" marginheight="0" marginwidth="0">Loading…</iframe>
			    </p>
	
        </header>

	    </MediaQuery>
      <Bottom/>

   </div>
);
	
