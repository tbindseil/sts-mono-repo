import React, {useState, useEffect }  from 'react';
import {Header} from './header/Header';
import stock_photo from '../images/Flo.PNG';
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
  maxWidth: '75%',
  height: '75%',
  position: 'center',
  margin: 'auto',
  marginTop: '25px',
  display: 'block',
};
const imgStyle3 = {
  maxWidth: '95%',
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
  paddingBottom:'100px',
  marginTop: '0px',
};

const sideBy = { 
  display: '-webkit-flex',
  display: 'flex',
};
  
export const Process = () => (

	<div>

		<Header/>
	  
	  		<MediaQuery minWidth={765}>
    
    			<header style ={pageBorder}>
        
        			<h2 class= "pageHeader">
          				Our Process
       				</h2>

					<hr style ={underLine}/>

					<section style = {sideBy}>
				
						<div>

							<p style = {sideText}>

								<h4 class = "pageHeader">
									Establish District Partnerships
								</h4>

           						    The process starts by presenting our model to school facility leadership or parent teacher associations (PTO/PTA). 
           						    Our model does not work without the support of both parties. We realize the concern from many schools to take on
           						    any responsibility, but this organization is meant to assist school staff, not to burden them.
		 							<br/>
		  							<br/>
									We work within any school's guidelines to ensure that all regulating codes are met.
									This could mean that all tutoring is required to be done outside of  the school with parent supervision or permission. 
									Whatever it takes, we are flexible to adjust our model to specific district requirements.
								<h4 class = "pageHeader">
									Recruit Tutors
								</h4>

									Our goal here is to develop a diverse tutoring pool to accommodate the needs for tutoring at schools in each specific district.
									School or PTO/PTA acceptable means of communication will be used to reach out to students.
									<br/>
									<br/>
									Sourcing the tutoring pool is a critical part of the success our organization promises to a given school district. 
									We will solicit recommendations from teachers and parents, as well as allow motivated students to apply on their own. 
									We will work with teachers in order to determine the necessary qualifications for a student to be a tutor upon applying. 
									It is likely that an interview will need to take place.
								<h4 class = "pageHeader">
									Evaluate Tutors
								</h4>
								Interested tutoring students will complete a <a href="/get-involved">Tutoring Proficiency Survey</a> so a Group Tutoring Profile can be established. 
								A Group Tutoring Profile will consist of the subjects, grades, and hours our organization is capable of tutoring in the specific district.	\
								<h4 class = "pageHeader">
									Broadcast Tutors
								</h4>	
								Now, the fun part… We are able to communicate the amazing resource of high-performing student tutors to all of the grade levels in your district. 
								Again, this will be done with any and all School and PTO/PTA acceptable means of communication.
								<h4 class = "pageHeader">
									Connect Students with Tutors
								</h4>	
								Students looking for help with homework, test prep, or general subject matter will complete the <a href="/request-a-tutor">Tutoring Request Form </a> 
								to identify their subjects of interest and their schedule availability.
								<h4 class = "pageHeader">
									Tutoring Sessions and Continuous improvement
								</h4>	
								Student tutors are prepared with lesson plan training to ensure that their tutoring lessons are effective and productive.
								<br/>
								<br/>
								Throughout the tutoring experience, Student Tutors will gain invaluable skills from creating unique lesson plans, 
								tracking hours and quality of sessions, and receiving performance feedback from how their given lessons are going. 

							</p>
						</div>

						<img style={imgStyle} src={stock_photo} alt="stock"/>
					</section>
  			 	</header>
    	    </MediaQuery>
	 
     		<MediaQuery maxWidth={765}>

    			<header style ={pageBorder2}>

     			   	<h2 class= "pageHeader">
         			 Our Process
       			  	</h2>

					<hr style ={underLine2}/>
					
					<img style={imgStyle2} src={stock_photo} alt="stock"/>

					
						<div>

							<p style = {sideText2}>

								<h4 class = "pageHeader">
									Establish District Partnerships
								</h4>

           						    The process starts by presenting our model to school facility leadership or parent teacher associations (PTO/PTA). 
           						    Our model does not work without the support of both parties. We realize the concern from many schools to take on
           						    any responsibility, but this organization is meant to assist school staff, not to burden them.
		 							<br/>
		  							<br/>
									We work within any school's guidelines to ensure that all regulating codes are met.
									This could mean that all tutoring is required to be done outside of  the school with parent supervision or permission. 
									Whatever it takes, we are flexible to adjust our model to specific district requirements.
								<h4 class = "pageHeader">
									Recruit Tutors
								</h4>

									Our goal here is to develop a diverse tutoring pool to accommodate the needs for tutoring at schools in each specific district.
									School or PTO/PTA acceptable means of communication will be used to reach out to students.
									<br/>
									<br/>
									Sourcing the tutoring pool is a critical part of the success our organization promises to a given school district. 
									We will solicit recommendations from teachers and parents, as well as allow motivated students to apply on their own. 
									We will work with teachers in order to determine the necessary qualifications for a student to be a tutor upon applying. 
									It is likely that an interview will need to take place.
								<h4 class = "pageHeader">
									Evaluate Tutors
								</h4>
								Interested tutoring students will complete a <a href="/get-involved">Tutoring Proficiency Survey</a> so a Group Tutoring Profile can be established. 
								A Group Tutoring Profile will consist of the subjects, grades, and hours our organization is capable of tutoring in the specific district.	\
								<h4 class = "pageHeader">
									Broadcast Tutors
								</h4>	
								Now, the fun part… We are able to communicate the amazing resource of high-performing student tutors to all of the grade levels in your district. 
								Again, this will be done with any and all School and PTO/PTA acceptable means of communication.
								<h4 class = "pageHeader">
									Connect Students with Tutors
								</h4>	
								Students looking for help with homework, test prep, or general subject matter will complete the <a href="/request-a-tutor">Tutoring Request Form </a> 
								to identify their subjects of interest and their schedule availability.
								<h4 class = "pageHeader">
									Tutoring Sessions and Continuous improvement
								</h4>	
								Student tutors are prepared with lesson plan training to ensure that their tutoring lessons are effective and productive.
								<br/>
								<br/>
								Throughout the tutoring experience, Student Tutors will gain invaluable skills from creating unique lesson plans, 
								tracking hours and quality of sessions, and receiving performance feedback from how their given lessons are going. 

							</p>
						</div>

  			 	</header>

    	    </MediaQuery>
    	    <Bottom/>

   	</div>
);

