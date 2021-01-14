import React from 'react';
import {Header} from './Header';

export const Layout = ({text}) => (

    <div className="Layout">

      <Header/>

      <header className="App-header">
        <p>
          {text}
        </p>
      </header>
    </div>
);
