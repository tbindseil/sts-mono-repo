import React from 'react';

export function Title(props) {
    return (
        <>
            <h2 className="PageHeader">
                {props.titleText}
            </h2>

            <hr className={props.underlineClass}/>
        </>
    );
}
