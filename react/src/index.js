import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import TopBar from './TopBar';
import Results from './Results';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(<App />, document.getElementById('side-bar'));
ReactDOM.render(<TopBar />, document.getElementById('top-bar'));
ReactDOM.render(<Results />, document.getElementById('results'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
