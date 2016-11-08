//import css @todo demo later for 307 meeting
// const menuOptions = {
//     url: '/api/mock-menuNav-myPurchase.json'
// }

const childRoutes = [
    // require('./react-example'), //non redux demo
    // require('./react-redux-example'), //redux+react demo
    require('./react-redux-initer-example'),//redux+react+initer demo
]

const initer = require('initer/initer');

initer.initApp({
    // menuOptions,
    childRoutes
})