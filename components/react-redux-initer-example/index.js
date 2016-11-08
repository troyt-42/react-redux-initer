module.exports = {
    path: 'react-redux-initer-example',
    getComponent: (location, callback) => {
        require.ensure([], () => {
            callback(null, require('./App'))
        })
    },
}
