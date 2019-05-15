import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom';
import HomePage from './components/homepage/HomePage';
import LoginPage from './components/loginpage/LoginPage';
import * as serviceWorker from './serviceWorker';

const Routes = (
    <Router>
        <div>
            <Switch>
                <Route exact path='/' component={HomePage}/>
                <Route path='/login' component={LoginPage}/>
            </Switch>
        </div>
    </Router>
);

ReactDOM.render(Routes, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();