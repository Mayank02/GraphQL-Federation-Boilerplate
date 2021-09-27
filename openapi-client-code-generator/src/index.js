import React from 'react';
import ReactDOM from 'react-dom';
import localforage from 'localforage';
import App from './App';
import './index.css';
ReactDOM.render((<React.StrictMode><App cache={localforage} /></React.StrictMode>), document.getElementById('root'));