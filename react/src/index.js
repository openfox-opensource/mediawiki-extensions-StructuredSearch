import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import TopBar from './TopBar';
import Results from './Results';
import * as serviceWorker from './serviceWorker';

// Create roots for each component
const sideBarRoot = createRoot(document.getElementById('side-bar'));
const topBarRoot = createRoot(document.getElementById('top-bar'));
const resultsRoot = createRoot(document.getElementById('results'));

// Render components using the new API
sideBarRoot.render(<App />);
topBarRoot.render(<TopBar />);
resultsRoot.render(<Results />);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
