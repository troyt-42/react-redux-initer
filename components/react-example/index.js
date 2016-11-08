module.exports = {
    path: 'react-example',
    getComponent: (location, callback) => {
        require.ensure([], () => {
            callback(null, require('./App'))
        })
    },
}
