import React from 'react';
import MediaQuery from 'react-responsive';

import {Header} from '../header/Header';
import {Bottom} from '../header/Bottom';
import {Title} from '../layout/Title';

export const RequestTutor = () => (

    <div>

        <Header/>

        <MediaQuery minWidth={765}>

            <RequestTutorBody
                pageBorderClass={"PageBorder"}
                underlineClass={"Underline"}
                textClass={"mainText"}
                iframeWidth={"700"}
                iframeTitle={"getInvolvedBigScreenIFrame"}/>

        </MediaQuery>

        <MediaQuery maxWidth={765}>

            <RequestTutorBody
                pageBorderClass={"PageBorder2"}
                underlineClass={"Underline2"}
                textClass={"mainText2"}
                iframeWidth={"100%"}
                iframeTitle={"getInvolvedSmallScreenIFrame"}/>

        </MediaQuery>

        <Bottom/>

    </div>

);

function RequestTutorBody(props) {
    return (
        <>
            <header className={props.pageBorderClass}>

                <Title
                    titleText={"Request A Tutor"}
                    underlineClass={props.underlineClass}/>

                <p className={props.textClass}>
                    Students Teaching Students is a nonprofit tutoring organization that pairs students in their own area for free tutoring services.
                </p>
                <p className={props.textClass}>
                    If you are looking for help with test preperation, homework, or general subject matter, request a tutor for your subjects of interest and state you availability in the form below.
                </p>

                <hr className={props.underlineClass}/>

                <p className="FormStyle">
                    <iframe
                        src="https://docs.google.com/forms/d/e/1FAIpQLSf4uPCMvxLew5migtPBZwiavpJRrS24SdE9XbYlScTLzEpdeQ/viewform?embedded=true"
                        width={props.iframeWidth}
                        height={"520"}
                        frameborder="0"
                        marginheight="0"
                        marginwidth="0"
                        title={props.iframeTitle}>
                        Loading…
                    </iframe>
                </p>

            </header>
        </>
    );
}
