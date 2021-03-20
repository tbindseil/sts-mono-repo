import React from 'react';
import {Header} from '../header/Header';
import MediaQuery from 'react-responsive';
import {Bottom} from '../Bottom';

export const RequestTutor = () => (

    <div>

        <Header/>

        <MediaQuery minWidth={765}>

            <header className="PageBorder">

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

                <p className="FormStyle">
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

            <header className="PageBorder2">

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

                <p className="FormStyle">
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
