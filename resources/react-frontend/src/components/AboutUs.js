import React, {useState, useEffect }  from 'react';
import {Header} from './header/Header';
import stock_photo from '../images/books.jpg';
import course from '../images/course.PNG';
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
  maxWidth: '35%',
  height: '35%',
  marginTop:'75px',
  marginRight: '100px',
};
const imgStyle2 = {
  width: '75%',
  height: '75%',
  position: 'center',
  margin: 'auto',
  marginTop: '25px',
  display: 'block',
};
const imgStyle3 = {
  width: '95%',
  height: '95%',
  position: 'center',
  margin: 'auto',
  marginTop: '25px',
  display: 'block',
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

const sideText3= {
  textAlign: 'justify',
  fontFamily: 'Arial',
  paddingRight: '150px',
  paddingLeft:'150px',
  paddingTop: '10px',
}

const pageBorder = {
  borderLeft: '10vw solid #b4c7e7',
  borderRight: '10vw solid #b4c7e7',
  borderTop:'0px solid #005D8c',
  borderBottom:'0px solid #005D8c',
  paddingTop: '5px',
  paddingBottom:'100px',
  marginTop: '0px',
};

const pageBorder2 = {
  borderLeft: '5vw solid #b4c7e7',
  borderRight: '5vw solid #b4c7e7',
  borderTop:'0px solid #005D8c',
  borderBottom:'0px solid #005D8c',
  paddingTop: '5px',
  paddingBottom:'100px',
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
        
        			<h2 className= "pageHeader">
          				About Students Teaching Students 
       				</h2>

					<hr style ={underLine}/>

					<section style = {sideBy}>
				
						<div>

							<p style = {sideText}>

								<h4 class = "pageHeader">
									Vision
								</h4>

           						    Students Teaching Students is a non-profit tutoring organization
           						    that provides free tutoring for any student seeking additional help with their schoolwork.
		 							<br/>
		  							<br/>
									Free academic tutoring is at the forefront of our organization, but the backbone is what really sets us apart. 
									We seek out high-performing high school students from various locations and subject matters to become tutors.
									<br/>
									<br/>
									Students are motivated and familiar with the lesson plans of a specific district. 
									With training and structure from Students Teaching Students, they can become great tutors.
									<br/>
									<br/>
									With a large pool of student tutors, we are able to effectively connect them with students 
									looking for additional help in various grades, subjects, or school locations. 
									This is how we plan to achieve our goal of providing tutoring to all those who seek it. At the same time, 
									we will provide opportunities for high achieving students to give back to their school and community.
							</p>
						</div>

						<img style={imgStyle} src={stock_photo} alt="stock"/>
					</section>

					<h2 class = "pageHeader">
						Tutoring Offered
					</h2>

					<hr style ={underLine}/>

					<section>
				
						<div>

							<p style = {sideText3}>


								**We are actively working through our network of Chicago and Chicago Suburb based schools to form partnerships
								with the various districts. As those partnerships are established, 
								this section will be updated with the grade levels, subjects, and locations tutoring is offered.

							</p>
						</div>
						<img style={imgStyle2} src={course} alt="stock"/>
					</section>
  			 	</header>
    	    </MediaQuery>
	 
     		<MediaQuery maxWidth={765}>

    			<header style ={pageBorder2}>

     			   	<h2 className= "pageHeader">
         			 About Students Teaching Students 
       			  	</h2>

					<hr style ={underLine2}/>
	
					<div>

						<p style = {sideText2}>

							<h4 class = "pageHeader">
								Vision
							</h4>
       						    Students Teaching Students is a non-profit tutoring organization
           						that provides free tutoring for any student seeking additional help with their schoolwork.
		 						<br/>
		  						<br/>
								Free academic tutoring is at the forefront of our organization, but the backbone is what really sets us apart. 
								We seek out high-performing high school students from various locations and subject matters to become tutors.
								<br/>
								<br/>
								Students are motivated and familiar with the lesson plans of a specific district. 
								With training and structure from Students Teaching Students, they can become great tutors.								<br/>
								<br/>
								With a large pool of student tutors, we are able to effectively connect them with students 
								looking for additional help in various grades, subjects, or school locations. 
								This is how we plan to achieve our goal of providing tutoring to all those who seek it. At the same time, 
								we will provide opportunities for high achieving students to give back to their school and community.
						</p>	
					</div>

					<h2 class = "pageHeader">
						Tutoring Offered
					</h2>

					<hr style ={underLine2}/>

					<section>
				
						<div>

							<p style = {sideText2} >


								**We are actively working through our network of Chicago and Chicago Suburb based schools to form partnerships
								with the various districts. As those partnerships are established, 
								this section will be updated with the grade levels, subjects, and locations tutoring is offered.

							</p>
						</div>
						<img style={imgStyle3} src={course} alt="stock"/>
					</section>

  			 	</header>

    	    </MediaQuery>
    	    <Bottom/>

   	</div>
);

