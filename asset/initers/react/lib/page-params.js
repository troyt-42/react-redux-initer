var {dispatch} = require('redux')

var newObj = (obj) => {
    var newObj = {}
    for (var i in obj) {
        newObj[i] = obj[i]
    }
    return obj
}

var TYPES = {
    set_page_param: 'todo-app-set-routing'
}

var triggers = {
    setPageParam(dispatch, props) {
        var query = props.location.query
        var params = props.params

        dispatch({
            type: TYPES.set_page_param,
            query,
            params
        })
    }
}

var reducer = (state = {query: {}, params: {}}, action) => {
    switch (action.type) {
        case TYPES.set_page_param:
            return {
                query: newObj(action.query),
                params: newObj(action.params)
            }
        default:
            return state
    }
}

/**
 * @deprecated
 * @type {{triggers: {setPageParam: (function(*, *))}, TYPES: {set_page_param: string}, reducer: (function())}}
 */
module.exports = {
    triggers,
    TYPES,
    reducer
}