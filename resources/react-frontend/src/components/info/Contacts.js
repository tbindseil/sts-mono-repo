import React from 'react';
import {Header} from '../header/Header';
import stock_photo from '../../images/skyline.jpg';
import MediaQuery from 'react-responsive';
import {Bottom} from '../Bottom';

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
  maxWidth: '100%',
  height: 'auto',
  margin:'0px'
};

const pageBorder = {
  borderLeft: '10vw solid #b4c7e7',
  borderRight: '10vw solid #b4c7e7',
  borderTop:'0px solid #005D8c',
  borderBottom:'0px solid #005D8c',
  paddingTop: '5px',
  paddingBottom:'50px',
  marginTop: '0px',
  height: '75vh'
};

const pageBorder2 = {
  borderLeft: '5vw solid #b4c7e7',
  borderRight: '5vw solid #b4c7e7',
  borderTop:'0px solid #005D8c',
  borderBottom:'0px solid #005D8c',
  paddingTop: '5px',
  paddingBottom:'100px',
  marginTop: '0px',
  height: '75vh'
};

export const Contacts= () => (

  <div>

    <Header/>

      <MediaQuery minWidth={765}>

       <img style={imgStyle} src={stock_photo} alt="stock"/>

       <header style ={pageBorder}>

          <h2 className= "pageHeader">
            Contact Us
          </h2>

	       	<hr style ={underLine}/>
	
          <p className= "mainText">
		        Feel free to reach out to us with any questions, concerns, or suggestions for our organization. We are always working to improve, and would love to hear from you!
		      </p>

		      <hr style ={underLine}/>

	       	<p className= "formStyle">
		        Email: <a href="mailto:bjkearbey@studentsts.org"> bjkearbey@studentsts.org</a>			
		      </p>
	
        </header>

	    </MediaQuery>
	  
	    <MediaQuery maxWidth={765}>

	      <img style={imgStyle} src={stock_photo} alt="stock"/>

         <header style ={pageBorder2}>

            <h2 className= "pageHeader">
              Contact Us
            </h2>

	         	<hr style ={underLine2}/>
	
            <p className= "mainText2">
	           	Feel free to reach out to us with any questions, concerns, or suggestions for our organization. We are always working to improve, and would love to hear from you!
		        </p>

		        <hr style ={underLine2}/>

	         	<p className= "formStyle">
		          Email: <a href="mailto:bjkearbey@studentsts.org"> bjkearbey@studentsts.org</a>			
		        </p>
	
          </header>

	      </MediaQuery>
        <Bottom/>
  </div>
  
);
	
