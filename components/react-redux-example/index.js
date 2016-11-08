module.exports = {
    path: 'react-redux-example',
    getComponent: (location, callback) => {
        require.ensure([], () => {
            callback(null, require('./App'))
        })
    },
}
