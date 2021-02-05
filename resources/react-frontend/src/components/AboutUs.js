import React, {useState, useEffect }  from 'react';
import {Header} from './Header';
import stock_photo from '../images/books_.jpg';
import MediaQuery from 'react-responsive';
import  Media from 'react-media'

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
  maxWidth: '35%',
  height: '35%',
  marginTop:'25px',
  marginRight: '100px',
};
const imgStyle2 = {
  maxWidth: '50%',
  height: '50%',
  margin: '25%',
  
};
const sideText= {
  textAlign: 'justify',
  fontFamily: 'Arial',
 paddingRight: '50px',
 paddingLeft:'100px',
 paddingTop: '10px',
}
const sideText2= {
  textAlign: 'justify',
  fontFamily: 'Arial',
 paddingRight: '20px',
 paddingLeft:'20px',
 paddingTop: '10px',
}

const pageBorder = {
  borderLeft: '150px solid #b4c7e7',
   borderRight: '150px solid #b4c7e7',
   borderTop:'0px solid #005D8c',
   borderBottom:'0px solid #005D8c',
   paddingTop: '5px',
  paddingBottom:'100px',
  marginTop: '0px',

};
const pageBorder2 = {
  borderLeft: '10px solid #b4c7e7',
   borderRight: '10px solid #b4c7e7',
   borderTop:'0px solid #005D8c',
   borderBottom:'0px solid #005D8c',
   paddingTop: '5px',
  paddingBottom:'200px',
  marginTop: '0px',

};

const sideBy = { 
	display: '-webkit-flex',
  display: 'flex',
};


  
export const AboutUs = () => (

 <div>
 

		 
      <Header/>
	  
	  <MediaQuery minWidth={765}>
    <header style ={pageBorder}>
        <h2 class= "pageHeader">
          About Us
        </h2>
		<hr style ={underLine}/>
		<section style = {sideBy}>
		
		<div>
		<p style = {sideText}>
		<h4 class = "pageHeader">
		Vision
		</h4>
            Our vision is to connect high-performing students that have the ability and desire to build their leadership and technical skills by tutoring. 
		 Students Teaching Students is a nonprofit that fencourages collaboration and learning between peers through tutoring. 
		  <br/>
		  <br/>
		  <h4 class = "pageHeader">
		Why
		</h4>
		We saw an opportunity for improvement in the way students are tutored, and founded Students Teaching Students. Unlike other tutoring organization, we contact the vast resources of students
		to share their knowledge with others. 
		<br/>
		<br/>
		Students are motivated, more acclimated to specific district’s lesson plans, and are always looking for unique leadership opportunities.
		<br/>
		<br/>
		<h4 class = "pageHeader">
		How
		</h4>
		We empower students with the tools and skills to effectively tutor other students. 
		</p>
		</div>
		<img style={imgStyle} src={stock_photo} alt="stock"/>
		
		</section>
   </header>
     </MediaQuery>
	 
      <MediaQuery maxWidth={765}>
    <header style ={pageBorder2}>
        <h2 class= "pageHeader">
          About Us
        </h2>
		<hr style ={underLine2}/>
	
		
		<div>
		<p style = {sideText2}>
		<h4 class = "pageHeader">
		Vision
		</h4>
         Our vision is to connect high-performing students that have the ability and desire to build their leadership and technical skills by tutoring. 
		 Students Teaching Students is a nonprofit that fencourages collaboration and learning between peers through tutoring. 
		  <br/>
		  <br/>
		  <h4 class = "pageHeader">
		Why
		</h4>
		We saw an opportunity for improvement in the way students are tutored, and founded Students Teaching Students. Unlike other tutoring organization, we contact the vast resources of students
		to share their knowledge with others. 
		<br/>
		<br/>
		Students are motivated, more acclimated to specific district’s lesson plans, and are always looking for unique leadership opportunities.
		<br/>
		<br/>
		<h4 class = "pageHeader">
		How
		</h4>
		We empower students with the tools and skills to effectively tutor other students. 
		</p>
		</div>
		
	
   </header>
     </MediaQuery>
    </div>
);

