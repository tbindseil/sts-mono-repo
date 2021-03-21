import React from 'react';
import MediaQuery from 'react-responsive';

import {Header} from '../header/Header';
import {Bottom} from '../header/Bottom';
import {Title} from '../layout/Title';

export const GetInvolved = () => (

    <div>

        <Header/>

        <MediaQuery minWidth={765}>

            <GetInvolvedBody
                pageBorderClass={"PageBorder"}
                underlineClass={"Underline"}
                textClass={"mainText"}
                iframeWidth={"700"}
                iframeTitle="getInvolvedBigScreenIFrame"/>

        </MediaQuery>

        <MediaQuery maxWidth={765}>

            <GetInvolvedBody
                pageBorderClass={"PageBorder2"}
                underlineClass={"Underline2"}
                textClass={"mainText2"}
                iframeWidth={"100%"}
                iframeTitle="getInvolvedSmallScreenIFrame"/>

        </MediaQuery>

        <Bottom/>

   </div>
);

function GetInvolvedBody(props) {
    return (
        <>
            <header className={props.pageBorderClass}>

                <Title
                    titleText={"Get Involved"}
                    underlineClass={props.underlineClass}/>

                <p className={props.textClass}>
                    We are always looking for additional high-performing high school students from various locations and subject matters to become tutors.
                </p>
                <p className={props.textClass}>
                    If you are interested in giving back to your community through tutoring, please fill out the survey below so we can better match you with students looking for additional help.
                </p>

                <hr className={props.underlineClass}/>

                <p className="FormStyle">
                    <iframe
                        src="https://docs.google.com/forms/d/e/1FAIpQLSetv8vY2dH-ur938u0qKqJchiEnqry9ivWc0tDHmnED5epPYA/viewform?embedded=true"
                        width={props.iframeWidth}
                        height="520"
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
