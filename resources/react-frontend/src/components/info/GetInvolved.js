import React from 'react';
import {Header} from '../header/Header';
import MediaQuery from 'react-responsive';
import {Bottom} from '../Bottom'; // TODO move to header

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

export const GetInvolved = () => (

    <div>

        <Header/>

        <MediaQuery minWidth={765}>

            <header style ={pageBorder}>

                <h2 className="PageHeader">
                    Become A Tutor
                </h2>

                <hr className="UnderLine"/>

                <p className= "mainText">
                    We are always looking for additional high-performing high school students from various locations and subject matters to become tutors.
                </p>
                <p class = "mainText">
                    If you are interested in giving back to your community through tutoring, please fill out the survey below so we can better match you with students looking for additional help.
                </p>

                <hr className="UnderLine"/>

                <p className= "formStyle">
                    <iframe
                        src="https://docs.google.com/forms/d/e/1FAIpQLSetv8vY2dH-ur938u0qKqJchiEnqry9ivWc0tDHmnED5epPYA/viewform?embedded=true"
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
                    Get Involved
                </h2>

                <hr className="UnderLine2"/>

                <p className= "mainText2">
                    We are always looking for additional high-performing high school students from various locations and subject matters to become tutors.
                </p>
                <p class = "mainText2">
                    If you are interested in giving back to your community through tutoring, please fill out the survey below so we can better match you with students looking for additional help.
                </p>

                <hr className="UnderLine2"/>

                <p className= "formStyle">
                    <iframe
                        src="https://docs.google.com/forms/d/e/1FAIpQLSetv8vY2dH-ur938u0qKqJchiEnqry9ivWc0tDHmnED5epPYA/viewform?embedded=true"
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
