import request from 'superagent-bluebird-promise'
import nocache from 'superagent-no-cache'

let defaultHeader = {
    Accept: 'application/json'
}

var urlUtils = require('./url-util')

function getParamStr(data, url) {
    var q = [], qstr = ''
    for (var key in data) {
        q.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
    }
    if (q.length) {
        qstr = (url.indexOf('?') == -1 ? '?' : '&') + q.join('&')
    }
    return qstr
}

function agent(method, url, data = {}, header = {}) {
    url = urlUtils.api(url)
    return request(method, url)
        .set(Object.assign(header, defaultHeader))
        .use(nocache)
        .send(data)
        .then(response => JSON.parse(response.text), error => {
            // if (error.status == 403) {
            //     window.top.location.href = '/pages/login/logout.jsp'
            // }
        })
        // .then(json => {
        //     if (json.status.toLowerCase() == 'needlogin') {
        //         window.top.location.href = json.data
        //     }
        // })
        // // 整体提测时放开，根据后端约定统一跳转登录页
}

agent.rawGet = function(url, data) {
    url = urlUtils.rawApi(url)

    return request('GET', url + getParamStr(data, url))
        .then(response => response.text)
}

agent.get = function (url, data, header = {}) {
    return agent('get', url + getParamStr(data, url), {}, header)
}

agent.post = function (url, data, header) {
    url = url.replace(/vendorId=V(\d+)/ig, 'vendorId=V1001213')
    return agent('post', url, data, header)
} 
agent.ajax = function (method, url, data = {}, header = {}) {
    url = urlUtils.api(url)
    if (method == 'get') {
        var q = [], qstr = ''
        for (var key in data) {
            q.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
        }
        if (q.length) {
            qstr = (url.indexOf('?') == -1 ? '?' : '&') + q.join('&')
        }
        url += qstr, data={}
    }
    return request(method, url)
        .set(Object.assign(header, defaultHeader))
        .use(nocache)
        .send(data)
        .then(response => {
                try {
                    return JSON.parse(response.text)
                }
                catch (e) {
                    return {status: '_err', error: e,_content:response}
                }
            }
            , error => {
                return {status: '_netErr', error: error}
            }
        )
        // .then(json => {
        //     if (json.status.toLowerCase() == 'needlogin') {
        //         window.top.location.href = json.data
        //     }
        // })
        // // 整体提测时放开，根据后端约定统一跳转登录页
}

export default agent

