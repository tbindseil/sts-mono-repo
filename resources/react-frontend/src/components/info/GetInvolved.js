import React from 'react';
import {Header} from '../header/Header';
import MediaQuery from 'react-responsive';
import {Bottom} from '../Bottom'; // TODO move to header

export const GetInvolved = () => (

    <div>

        <Header/>

        <MediaQuery minWidth={765}>

            <header className="PageBorder">

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

                <p className="FormStyle">
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

            <header className="PageBorder2">

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

                <p className="FormStyle">
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
