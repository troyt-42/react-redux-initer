// import ajaxAgent from 'utils/ajax-agent'
import {bindActionCreators} from 'redux'
// import {logoutUrl} from './contextUrls'
// import {PAGE_TYPES} from 'consts'

const initer = require('./initers/react/app-redux-v2')
// const commonReducer = require('./AppBuilder/commonReducer').default
// const contextReducer = require('./AppBuilder/contextReducer')
// const menuReducer = require('./Component/NavMenu/reducer')
const boots = Object.assign({}, initer.boots)

initer.boots.connect = (mapStateToProps, mapDispatchToProps, mergeProps, options) => {
    return boots.connect(
        state => {
            const originToProps = typeof mapStateToProps === 'function' ? mapStateToProps(state) : {}
            return {
                // i18nVersion: state.i18nVersion,
                ...originToProps
            }
        },
        mapDispatchToProps, mergeProps, options
    )
}

// initer.initApp = ({indexLocation, menuOptions, childRoutes, pageType}) => {
//     const hasContext = !(pageType === PAGE_TYPES.NO_CONTEXT)
//     const App = require('./AppBuilder/App')(pageType)
//     const AppForPlainPages = require('./AppBuilder/AppForPlainPages')()
//
//     if (pageType === PAGE_TYPES.PLAIN) {
//         // @todo: 可能也需要context，比如记录用户语言的选择
//         initer.setRootReducer({}, null)
//         initer.init({
//             routes: {
//                 path: '/',
//                 component: AppForPlainPages, // 对应Layout
//                 indexRoute: {onEnter: (nextState, replace) => replace(indexLocation)},
//                 childRoutes: childRoutes
//             }
//         })
//         require('utils/i18n')
//     }
//     else if (pageType === PAGE_TYPES.NO_CONTEXT) {
//         fetchMenu(menuOptions).then(menuJson => {
//             if (menuJson.status === 'ok') {
//                 bootstrapApp({menuJson})
//                 if (!menuJson.data) {
//                     alert('获取菜单失败，无数据')
//                 }
//             }
//             else {
//                 console.log('fetch menu failed')
//             }
//         })
//     }
//
//     // normal, with menu and context
//     else {
//         const contextPromise = fetchContext()
//         const menuPromise = fetchMenu(menuOptions)
//
//         Promise.join(contextPromise, menuPromise,
//             (contextJson, menuJson) => {
//                 if (contextJson && contextJson.status === 'ok'
//                     && menuJson && menuJson.status === 'ok'
//                 ) {
//                     initContext(contextJson)
//                     bootstrapApp({contextJson, menuJson})
//                     if (!menuJson.data) {
//                         alert('获取菜单失败，无数据')
//                     }
//                 }
//                 else {
//                     alert('app initialize failed')
//                 }
//                 return {
//                     contextJson,
//                     menuJson
//                 }
//             }
//         ).then(({contextJson, menuJson}) => {
//
//         }, error => {
//             // window.top.location.href = logoutUrl
//             throw error
//         })
//
//     }
//
//
//     function initContext(json) {
//         if (json.status == 'ok' && json.data) {             //如果拉取服务器的数据成功
//             window.defaults = {'adUserName': json.data.user.username}  //将从服务器返回来的用户名称返回到客户端
//         }
//         else {
//             alert('initContext failed')
//             // window.location.reload()              //如果返回数据不成功，则从重新刷新页面
//         }
//     }
//
//     function bootstrapApp({contextJson, menuJson}) {
//         const menu = resolveMenu(menuJson.data)
//         const navList = menu && menu.navList || []
//         let userData = contextJson && contextJson.data && contextJson.data.user || { language: 'zhs' }
//         let indexState = navList[0] ? {
//             pathname: navList[0].navCode,
//             path: navList[0].path
//         } : null
//
//         let initialReducer = {
//             menu: menuReducer,
//             breadcrumbs: x => resolveBreadcrumbs(childRoutes, { crumbPath: [menu.dispLabel] }),
//         }
//
//         let initialState = {
//             menu: {
//                 noMenu: pageType === PAGE_TYPES.HIDE_MENU,    // 商城不显示menu
//                 list: navList
//             }
//         }
//
//         if (contextJson) {
//             initialReducer = Object.assign(initialReducer, {
//                 context: contextReducer,
//                 common: commonReducer
//             })
//
//             initialState = Object.assign(initialState, {
//                 context: {                              //请求下来的用户国际化信息
//                     adUserName: userData.username,
//                     employeeName: userData.name,
//                     employeeNumber: userData.employeeNumber,
//                     employeeDepartmentName: userData.departmentName,
//                     employeeWorkPhoto: userData.employeeWorkPhoto,
//                     localeLanguage: userData.language,
//                     langList: userData.langList
//                 }
//             })
//         }
//
//         initer.setRootReducer(initialReducer, initialState)
//
//         initer.init({
//             routes: {
//                 path: '/',
//                 component: App, //对应Layout
//                 indexRoute: { onEnter: (nextState, replace) => replace(indexState) },
//                 childRoutes: childRoutes
//             }
//         })
//
//         require('utils/i18n').default.switchLanguage(userData.language)
//
//     }
// }

initer.bindApp = function ({mapStateToProps, bindActions, bindClass }) {
    return boots.connect(
        state => {
            const originToProps = typeof mapStateToProps === 'function' ? mapStateToProps(state) : {}
            return {
                // i18nVersion: state.i18nVersion,
                ...originToProps
            }
        },
        dispatch => bindActionCreators({ ...bindActions }, dispatch)
    )(bindClass)
}

initer.resumeReducer = (reducerName) => {
    initer.boots.resumeReducer(reducerName)
}
initer.pauseReducer = (reducerName) => {
    initer.boots.pauseReducer(reducerName)
}
initer.resetReducer = (reducerName) => {
    initer.boots.resetReducer(reducerName)
}

// initer.fetchContext = fetchContext

// initer.fetchContext = () => {
//     return ajaxAgent.get('/bprouting/rest/api/user/context')
//         .then(json => {
//             if (json.code == '200' && json.data) {
//                 window.defaults = {'adUserName': json.data.adUserName}
//                 return json
//             }
//             else {
//                 window.location.reload()
//             }
//         }, error => {
//             throw error
//             //window.top.location.href = logoutUrl
//         })
// }

module.exports = initer;

// function fetchContext() {
//     return ajaxAgent.get('/user/context')
// }
//
// function fetchMenu(menuOptions) {
//     const defaultOtions = {
//         url: '/flex/select_submenu',
//         param: {
//             attribute1: window.location.pathname
//         }
//     }
//     const menuOpt = Object.assign({}, defaultOtions, menuOptions)
//     return ajaxAgent.post(menuOpt.url, menuOpt.param)
// }

function resolveBreadcrumbs(childRoutes, parent) {
    for (let i = childRoutes.length; i-- > 0;) {
        const route = childRoutes[i]
        if (!route.navCode) {
            const parentNavCode = parent.navCode ? parent.navCode + '/' : ''
            route.navCode = parentNavCode + route.path
        }
        route.crumbPath = parent.crumbPath.slice()
        if (route.dispLabel) {
            route.crumbPath.push(route.dispLabel)
        }

        if (route.childRoutes) {
            route.childRoutes = resolveBreadcrumbs(route.childRoutes, route)
        }
    }

    return childRoutes
}

function resolveMenu(menu, parent) {
    menu = Object.assign({}, menu)
    if (menu.navList) {
        menu.navList = menu.navList.map(navNode => resolveMenu(navNode, menu))
    }

    return menu
}
