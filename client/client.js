import React from 'react'
import { render } from 'react-dom'
import {Router, Route, IndexRoute, browserHistory} from 'react-router'
// import reactReduxIniterApp from '../components/react-redux-initer-example/App'
// import reactReduxApp from '../components/react-redux-example/App'
// import reactApp from '../components/react-example/App'
import configureStore from '../redux/store'
import { Provider } from 'react-redux'

let initialState = {
    todos: [{
        id: 0,
        completed: false,
        text: 'Initial todo for demo purposes'
    }]
}

let store = configureStore(initialState);

// const router=(
//     <Router history={browserHistory}>
//         <Route path="/" component={reactApp}>
//             <IndexRoute component={reactReduxApp}/>
//             <Route path="initer" compontent={reactReduxIniterApp}/>
//         </Route>
//     </Router>
// )

const childRoutes = [
    require('../components/react-example'), //non redux demo
    require('../components/react-redux-example'), //redux+react demo
    require('../components/react-redux-initer-example'),//redux+react+initer demo
]

const initer = require('initer/initer');

initer.initApp({
    // menuOptions,
    childRoutes
})