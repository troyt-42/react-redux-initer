require('babel-polyfill')

/*
    由于新的 boots 模式在全局绑定上需要 store, 跟最初的 initer 不兼容, 所以需要创建这个 v2 的版本
 */
var initer = {
    /**
     * @param
     *  opts.routes   路由信息
     *  opts.rootReducers
     *  opts.initialState
     */
    init (opts) {
        opts = opts || {routes: {
                path: '/'
            }}

        var ReactDom = require('react-dom')
        var React = require('react')

        var {Provider} = require('react-redux')

        var {Router, hashHistory, browserHistory} = require('react-router')
        var {syncHistoryWithStore} = require('react-router-redux')

        const history = syncHistoryWithStore(browserHistory, this._store)

        ReactDom.render(
            <Provider store={this._store}>
                <Router history={history} routes={opts.routes}>
                </Router>
            </Provider>,
            document.getElementById('root')
        )
    },

    _store: null,

    configureStore (rootReducer = {}, initialState) {
        var thunk = require('redux-thunk').default
        var {createStore, compose, applyMiddleware, combineReducers} = require('redux')
        var {routerReducer, routerMiddleware} = require('react-router-redux')
        var {hashHistory} = require('react-router')

        const middleware = [
          thunk,
          routerMiddleware(hashHistory)
        ]

        const finalCreateStore = compose(
            applyMiddleware(...middleware)
        )(createStore)

        rootReducer.routing = routerReducer

        const store = this._store = finalCreateStore(combineReducers(rootReducer), initialState)
        store.rootReducer = rootReducer;
        store.asyncReducers = {}      

        this.boots = require('./lib/boots')(store)

        return store
    },

    setRootReducer (rootReducer = {}, initialState) {
        var store = this._store

        Object.assign(store.rootReducer, rootReducer)
        var _state = store.getState()
        Object.assign(_state, initialState)
        this.boots.replaceReducer()
    },

    injectReducer (reducerName, reducer) {
        return this.boots.injectReducer(reducerName, reducer)
    },

    dummyRoutes(reducerName, reducer, Page) {
        const appRoutes = {
            path: '/',
            indexRoute: {onEnter: (nextState, replace) => replace('/test')},
            childRoutes: [
                {
                    path: 'test',
                    getComponent: (location, callback) => {
                        require.ensure([], () => {
                            initer.injectReducer(reducerName, reducer)
                            callback(null, Page)
                        })
                    }
                }
            ]
        }
        return appRoutes
    }
}

if (!initer._store) initer.configureStore()

module.exports = initer;