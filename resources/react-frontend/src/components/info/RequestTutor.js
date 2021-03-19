import React from 'react';
import {Header} from '../header/Header';
import MediaQuery from 'react-responsive';
import {Bottom} from '../Bottom';

const pageBorder = {
  clear: 'both', // don't let anything float left or right of this, for nav bar
  borderLeft: '10vw solid #b4c7e7',
   borderRight: '10vw solid #b4c7e7',
   borderTop:'0px solid #005D8c',
   borderBottom:'0px solid #005D8c',
   paddingTop: '5px',
  paddingBottom:'200px',
  marginTop: '0px',
};

const pageBorder2 = {
  clear: 'both', // don't let anything float left or right of this, for nav bar
  borderLeft: '5vw solid #b4c7e7',
   borderRight: '5vw solid #b4c7e7',
   borderTop:'0px solid #005D8c',
   borderBottom:'0px solid #005D8c',
   paddingTop: '5px',
  paddingBottom:'200px',
  marginTop: '0px',
};


export const RequestTutor = () => (

    <div>

        <Header/>

        <MediaQuery minWidth={765}>

            <header style ={pageBorder}>

                <h2 className="PageHeader">
                    Request A Tutor
                </h2>

                <hr className="UnderLine"/>

                <p className= "mainText">
                    Students Teaching Students is a nonprofit tutoring organization that pairs students in their own area for free tutoring services.
                </p>
                <p className= "mainText">
                    If you are looking for help with test preperation, homework, or general subject matter, request a tutor for your subjects of interest and state you availability in the form below.
                </p>

                <hr className="UnderLine"/>

                <p className= "formStyle">
                    <iframe
                        src="https://docs.google.com/forms/d/e/1FAIpQLSf4uPCMvxLew5migtPBZwiavpJRrS24SdE9XbYlScTLzEpdeQ/viewform?embedded=true"
                        width="700"
                        height="520"
                        frameborder="0"
                        marginheight="0"
                        marginwidth="0"
                        title="getInvolvedBigScreenIFrame">
                        Loading…
                    </iframe>
                </p>

            </header>
        </MediaQuery>

        <MediaQuery maxWidth={765}>

            <header style ={pageBorder2}>

                <h2 className="PageHeader">
                    Request A Tutor
                </h2>

                <hr className="UnderLine2"/>

                <p className= "mainText2">
                    Students Teaching Students is a nonprofit tutoring organization that pairs students in their own area for free tutoring services.
                </p>
                <p className="mainText2">
                    If you are looking for help with test preperation, homework, or general subject matter, request a tutor for your subjects of interest and state you availability in the form below.
                </p>

                <hr className="UnderLine2"/>

                <p className= "formStyle">
                    <iframe
                        src="https://docs.google.com/forms/d/e/1FAIpQLSf4uPCMvxLew5migtPBZwiavpJRrS24SdE9XbYlScTLzEpdeQ/viewform?embedded=true"
                        width="100%"
                        height="520"
                        frameborder="0"
                        marginheight="0"
                        marginwidth="0"
                        title="getInvolvedSmallScreenIFrame">
                        Loading…
                    </iframe>
                </p>

            </header>
        </MediaQuery>

        <Bottom/>

    </div>

);
