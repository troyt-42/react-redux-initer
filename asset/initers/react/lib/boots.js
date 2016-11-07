var {combineReducers} = require('redux')
var {connect} = require('react-redux')
var {bindActionCreators: bindDispatch} = require('redux')
var React = require('react')

module.exports = function (store) {
    var seq = 1;
    var generateUniqueKey = (index) => {
        return (seq++).toString(36) + Math.floor(Math.random() * 1000000).toString(36) + '_' + index
    }

    var reducerCache = {}
    var emptyReducer = (x = {}) => x

    var isArray = (target) => {
        return Object.prototype.toString.call(target) == '[object Array]'
    }

    // @todo 暂时不用这个扩展
    // const convertToDefaultSetMethod = (name) => {
    //     return '_set' + name.substr(0, 1).toUpperCase() + name.substr(1)
    // }

    var boots = {
        initActions(compKey, createActionConfig, propsMap) {
            var parsedTypes = {}, actions = {}, TYPES = {}
            var actionConfig = {}

            var getCompState = () => store.getState()[compKey]

            /**
             * As we pass in the action config creators, we can pass the actions/compKey to the creators
             * so that we can refer to the other actions in the current setup if need (in redux thunk mode)
             */
            if (!isArray(createActionConfig)) {
                createActionConfig = [createActionConfig]
            }

            createActionConfig.map(create => {
                var subActionConfig = create(actions, getCompState, compKey, TYPES)
                for (var actionName in subActionConfig) {
                    actionConfig[actionName] = subActionConfig[actionName]

                    boots.checkPropsName(propsMap, actionName)
                }
            })


            for (let actionName in actionConfig) {
                if (actionConfig.hasOwnProperty(actionName)) {
                    parsedTypes[actionName] = compKey + '::' + actionName
                    TYPES[actionName] = () => parsedTypes[actionName]

                    /**
                     * An ActionCreator must be:
                     *
                     * a function
                     */
                    let actionCreator = actionConfig[actionName]
                    actions[actionName] = function () {
                        let ret = actionCreator.apply(null, arguments)

                        if (typeof ret == 'function') {
                            store.dispatch(ret)
                            return
                        }

                        if (ret) {
                            if (typeof ret.then == 'function' && typeof ret.catch == 'function') {
                                return ret
                            }
                            if (typeof ret.type == 'undefined') {
                                ret.type = parsedTypes[actionName]
                            }
                            store.dispatch(ret)
                        }
                    }
                }
            }
            return {TYPES, actions}
        },

        /**
         * This method will generate a reducer for you, and try to inject it to the page store if isLocal = true
         *
         * @param compKey {String} The compKey for injecting to the page store
         * @param createSubReducers {Array|Function} (TYPES)=>{Object} It will return a list of subReducers, which will be used to generate your reducer
         * @param TYPES {{$action: Function}} Return a set of TYPES functions, by which you will call to get the action type name
         * @param isLocal {Boolean} When set to true, we will not inject the generated reducer to the page store. Instead, you will need to make the decision of how to use it.
         * @returns {{reducer, subReducers: *}}
         */
        createReducer: function (compKey, createSubReducers, TYPES, actions, isLocal, propsMap) {
            var subReducers = {}

            if (!isArray(createSubReducers)) {
                createSubReducers = [createSubReducers]
            }

            var hasReducer = false
            createSubReducers.map(create => {
                var subSubReducers = create(TYPES)
                var initData = {}

                if (subSubReducers._init) {
                    initData = subSubReducers._init
                    delete subSubReducers._init
                }


                for (let reducerName in subSubReducers) {

                    if (subSubReducers[reducerName] && typeof subSubReducers[reducerName] == 'object') {
                        let conditions = subSubReducers[reducerName]

                        subSubReducers[reducerName] = (state, action) => {
                            return boots.conds(state, action, conditions)
                        }
                    }

                    if (typeof initData[reducerName] != 'undefined') {
                        let rawReducer = subSubReducers[reducerName]
                        subReducers[reducerName] = (state, action) => {
                            if (typeof state == 'undefined') state = initData[reducerName]
                            return rawReducer(state, action)
                        }
                    } else if (typeof subSubReducers[reducerName] == 'function') {
                        subReducers[reducerName] = subSubReducers[reducerName]
                    } else {
                        throw Error('Reducer ' + reducerName + ' 不合法, 请传入 function 或 boots.conds 的配置对象')
                    }

                    boots.checkPropsName(propsMap, reducerName)
                    if (!hasReducer) hasReducer = true
                }
            })

            if (hasReducer) {
                var reducer = combineReducers(subReducers)
            } else {
                console.log('[WARNING] ' + compKey + ' 没有创建任何的reducer')
                reducer = (state = {}) => state
            }

            if (!isLocal) {
                boots.injectReducer(compKey, reducer)
            }
            return {reducer, subReducers}
        },

        createSelectors(compKey, createSelectors, propsMap) {
            var selectors = {}

            if (!isArray(createSelectors)) {
                createSelectors = [createSelectors]
            }

            createSelectors.map(create => {
                if (!create) return

                var subSelectors = create(compKey)

                for (let selectorName in subSelectors) {
                    selectors[selectorName] = (state) => {
                        var shouldMockCompState = !state[compKey]
                        shouldMockCompState && (state[compKey] = {})
                        var result = subSelectors[selectorName](state)
                        shouldMockCompState && (delete state[compKey])
                        return result
                    }
                    boots.checkPropsName(propsMap, selectorName)
                }
            })

            var processSelectors = (state, selectorNames) => {
                var selectorResult = {}
                if (selectorNames) {
                    selectorNames.map((selectorName) =>
                        selectorResult[selectorName] = selectors[selectorName](state)
                    )
                } else {
                    for (var selectorName in selectors) {
                        selectorResult[selectorName] = selectors[selectorName](state)
                    }
                }
                return selectorResult
            }

            return {selectors, processSelectors}
        },

        checkPropsName(propsMap, key) {
            1;
            if (propsMap[key]) {
                throw Error('同一模块下 action, reducer, selector 都不能使用相同的名称. 检查到重名: ' + key
                    + ' (建议: action, selector 使用 动词+名词的方式, reducer 使用名词或 [is | will | did | should] 开头的名称)')
            }
            propsMap[key] = 1
        },

        replaceReducer () {
            store.replaceReducer(combineReducers({
                ...store.rootReducer,
                ...store.asyncReducers
            }))
        },

        injectReducer (reducerName, reducer) {
            store.asyncReducers[reducerName] = reducerCache[reducerName] = reducer
            boots.replaceReducer()
        },

        /*
         =========================================
         Use reducer name to pause/resume a reducer for the app

         This is for avoiding we injecting too many reducers on the page store.
         If we don't pause them, all reducers will still work for every incoming actions,
         which is in fact a non-scalable factor, as a SPA could have a lot of reducers injected to the store
         */
        resumeReducer(reducerName) {
            var reducer = reducerCache[reducerName]
            if (reducer) {
                store.asyncReducers[reducerName] = reducer
                boots.replaceReducer()
            }
        },
        stopReducer (reducerName) {
            delete store.getState()[reducerName]
            delete store.asyncReducers[reducerName]
            boots.replaceReducer()
        },
        pauseReducer (reducerName) {
            store.asyncReducers[reducerName] = emptyReducer
            boots.replaceReducer()
        },

        /**
         * Reset the target reducer
         * @param reducerName {String} The name of the reducer
         */
        resetReducer (reducerName) {
            delete store.getState()[reducerName]
            store.dispatch({type: ''})
        },

        reducerNames () {
            var keys = []
            for (var key in store.asyncReducers) {
                keys.push(key)
            }
            return keys
        },
        subscribe(handler) {
            return store.subscribe(function () {
                handler(boots.getState)
            })
        },
        getState() {
            return store.getState()
        },
        getCompState(compKey) {
            return store.getState()[compKey] || {}
        },
        setState (reducerName, stateData) {
            boots.resetReducer(reducerName)
            store.getState()[reducerName] = stateData
            store.dispatch({type: ''})
        },

        conds(state, action, conditions) {
            var type = action.type

            if (conditions.length) {
                for (var i = conditions.length; i-- > 0;) {
                    var condition = conditions[i]

                    var TYPES = condition.TYPES;
                    if (!TYPES) {
                        alert('如果 sub reducer 是以配置的形式传入, 请设置 TYPES')
                    }
                    for (var actionName in condition) {
                        if (actionName == 'TYPES' || actionName == 'default') continue
                        if (type == TYPES[actionName]()) {
                            return condition[actionName](state, action)
                        }
                    }

                    if (condition.default) {
                        var ret = conditions.default(state, action)
                    }
                    if (typeof ret != 'undefined') return ret
                }
            } else {
                condition = conditions

                var TYPES = condition.TYPES;
                if (!TYPES) {
                    alert('如果 sub reducer 是以配置的形式传入, 请设置 TYPES')
                }
                for (var actionName in condition) {
                    if (actionName == 'TYPES' || actionName == 'default') continue
                    if (type == TYPES[actionName]()) {
                        return condition[actionName](state, action)
                    }
                }

                if (condition.default) {
                    var ret = conditions.default(state, action)
                }
                if (typeof ret != 'undefined') return ret
            }

            if (typeof ret == 'undefined') return state
        },
        sync(props, propName, setterName) {
            return {
                value: props[propName],
                setter: props[setterName]
            }
        },
        createModule(compKey, UIComp, logicCreators, mappingCreator) {
            compKey = compKey + ''
            const logic = bootsIniter(
                compKey,
                logicCreators.actionCreators, logicCreators.reducerCreators, logicCreators.selectorCreators
            )
            var mapState, mapActions
            if (mappingCreator) {
                mappingCreator = mappingCreator(logic.compKey, logic.actions)
                mapState = mappingCreator.mapState
                mapActions = mappingCreator.mapActions
            }
            if (!mapState) mapState = () => boots.getCompState(logic.compKey)
            if (!mapActions) mapActions = () => logic.actions

            // 目前，因为国际化全局connect i18nVersion， 会改写boots.connet，ref to asset/node_modules/initer.js#166
            const Comp = this.connect(mapState, mapActions)(boots.wrapComp(UIComp))

            Comp.compKey = logic.compKey
            Comp.actions = logic.actions
            Comp.TYPES = logic.TYPES

            return Comp
        },
        wrapComp (UIComponent) {
            return React.createClass({

                componentWillMount() {
                    var {_resume} = this.props
                    _resume && _resume()
                },

                componentWillUnmount() {
                    var {_pause, _reset} = this.props
                    _reset && _reset()
                    _pause && _pause()
                },

                render() {
                    return <UIComponent {...this.props} />
                }
            })
        },
        uniqueKey: generateUniqueKey,
        smartKey: (rawKey) => rawKey.substr(0, 1) == '?' ? generateUniqueKey(rawKey.substr(1)) : rawKey
    }

    var actionsCache = {}

    /**
     *
     * @param comp {String} If comp requires no random key to be separated from the other states, just give it an '/' at the beginning
     * @param createActionConfig
     * @param createSubReducers
     * @param isLocal
     * @returns {{resume: (function(this:null)), destroy: (function(this:null)), compKey: string}}
     */
    var bootsIniter = (comp, createActionConfig, createSubReducers, createSelectors, isLocal) => {

        var useRandomCompKey = comp.substr(0, 1) == '?'
        var compKey = useRandomCompKey ? generateUniqueKey(comp.substr(1)) : comp

        var propsMap = {}

        var TYPES, actions, actionsReturn

        if (useRandomCompKey) {
            actionsReturn = boots.initActions(compKey, createActionConfig, propsMap)
        } else {
            actionsReturn = actionsCache[compKey] ? actionsCache[compKey] : boots.initActions(compKey, createActionConfig, propsMap)
            actionsCache[compKey] = actionsReturn
        }

        var {TYPES, actions} = actionsReturn

        var {reducer, subReducers} = boots.createReducer(compKey, createSubReducers, TYPES, actions, isLocal, propsMap)

        var {selectors, processSelectors} = boots.createSelectors(compKey, createSelectors, propsMap)
        var processSels = processSelectors

        actions._reset = () => boots.resetReducer(compKey)
        actions._resume = () => boots.resumeReducer(compKey)
        actions._pause = () => boots.pauseReducer(compKey)
        actions._stop = () => boots.stopReducer(compKey)

        /**
         * return {{TYPES, actions, reducer, subReducers, selectors, resume, pause, stop, reset, compKey}}
         */
        return {
            // action related
            TYPES,
            actions,

            // reducer related
            reducer,
            subReducers,

            // selector related
            selectors,
            processSelectors,
            processSels,

            // reducer operations
            resume: boots.resumeReducer.bind(null, compKey),
            pause: boots.pauseReducer.bind(null, compKey),
            stop: boots.stopReducer.bind(null, compKey),
            reset: boots.resetReducer.bind(null, compKey),

            // the actual comp key in the global store
            compKey
        }

    }

    [
        'injectReducer', 'pauseReducer', 'resumeReducer', 'resetReducer', 'replaceReducer',
        'pauseByPrefix', 'resumeByPrefix', 'keepByPrefix', 'resetByPrefix',
        'pauseBy', 'resumeBy', 'keepBy', 'resetBy',
        'reducerNames', 'getState', 'getCompState', 'setState', 'subscribe',
        'sync', 'conds', 'wrapComp', 'createModule',
        'uniqueKey', 'smartKey'
    ].map((key) => bootsIniter[key] = boots[key])


    // 效率问题, 不再尝试提供这个方案
    //
    // bootsIniter.createSmartComp = (baseCompKey, UIComp, logicCreators, mappingCreator) => {
    //     const SmartUIComp = React.createClass({
    //         componentWillMount() {
    //             const logic = bootsIniter(
    //                 (this.props.random ? '?' : '') + (this.props.idx ? this.props.idx : '') + baseCompKey,
    //                 logicCreators.actionCreators, logicCreators.reducerCreators, logicCreators.selectorCreators
    //             )
    //             var mapState, mapActions
    //             if (mappingCreator) {
    //                 mapState = mappingCreator.mapStateCreator && mappingCreator.mapStateCreator(logic.compKey)
    //                 mapActions = mappingCreator.mapActionsCreator && mappingCreator.mapActionsCreator(logic.compKey, logic.actions)
    //             }
    //             if (!mapState) mapState = () => boots.getCompState(logic.compKey)
    //             if (!mapActions) mapActions = () => logic.actions
    //
    //             this.logic = logic
    //             this.Comp = connect(mapState, mapActions)(UIComp)
    //
    //             logic.resume()
    //         },
    //
    //         componentWillUnmount() {
    //             this.logic.stop()
    //         },
    //
    //         render() {
    //             return <this.Comp {...this.props} />
    //         }
    //     })
    //
    //     return SmartUIComp
    // }

    bootsIniter.connect = connect

    bootsIniter.bindDispatch = bindDispatch

    return bootsIniter
}