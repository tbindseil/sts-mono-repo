import React from 'react';
import {BaseScreen} from '../base-components/BaseScreen';
import stock_photo from '../../images/stock_photo.jpg';

export function HomeScreen(props) {
    return (
        <BaseScreen titleText={"Students Teaching Students"}>
            <>
                <img className="FullScreenImg" src={stock_photo} alt="stock"/>

                <p className="Modo">
                    Enhancing education through student to student tutoring
                </p>

                {
                // <div className = "SignUpButton">
                    // <a href="/register"> Sign Up </a>
                // </div>
                }
            </>
        </BaseScreen>
    );
}
