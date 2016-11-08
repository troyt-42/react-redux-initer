require('style/main.less')

import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import ajaxAgent from 'utils/ajax-agent'

import { tellBackendSwitch } from 'utils/i18n'
import { PAGE_TYPES } from 'consts'
import urls from '../contextUrls'
import Layout from 'asset/Component/Layout'
import NavMenu from '../Component/NavMenu'
import { FormSet, FormItem, Modal } from 'asset/Component'
import OuterWrapper from 'Component/OuterWrapper'

module.exports = (pageType) => {
    const globalActions = {                                 //一个对象实体包含两个对象
        fetchHeaderNav() {                             //初始时加载顶级菜单
            return (dispatch) => {
                return ajaxAgent.post('/flex/select_one_level_menu')
                    .then(json => {
                        json.status == 'ok' ?
                            dispatch({
                                type: 'global_receive_headerNav',
                                list: json.data
                            }) : null
                    })
            }
        }
    }

    //App将绑定context值属性
    function mapStateToProps(state) {
        return {
            context: state.context,
            common: state.common
        }
    }

    //App将绑定userActions的方法，
    // 即userActions定义的方法将做为App的一个方法属性
    function mapDispatchToProps(dispatch) {
        return bindActionCreators({
            ...globalActions
        }, dispatch)
    }

    class App extends Component {
        componentWillMount() {
            this.props.fetchHeaderNav()
        }

        render() {
            if (pageType === PAGE_TYPES.NO_CONTEXT) {
                return (
                    <NavMenu>
                        {this.props.children}
                        <OuterWrapper />
                    </NavMenu>
                )
            }
            else {
                const {context, common, ...props} = this.props
                const layoutData = this.transLayoutData(context)


                let dialog = common.toJS().dialog;
                let dialogBtns = this.renderDialogBtns(dialog);

                return (
                    <Layout {...layoutData}>
                        <NavMenu>
                            {this.props.children}
                        </NavMenu>


                        <Modal isShow={dialog.isShow}>
                            {dialog.msg}
                            {dialogBtns}
                        </Modal>
                        <OuterWrapper />
                    </Layout>
                )
            }
        }

        transLayoutData(context) {
            return {
                appTitle: _i('common/采购平台'),
                homeUrl: urls.erpUrl,
                imgSrc: context.employeeWorkPhoto,
                userName: context.employeeName,
                userNumber: context.employeeNumber,
                depart: context.employeeDepartmentName,
                navList: context.navList || [],
                langList: context.langList,
                settingList: [
                    {
                        dispLabel: _i('common/切换语言'),
                        code: "lang",
                        jumpFunc: lang => tellBackendSwitch(lang)
                    },
                    {
                        dispLabel: _i('common/退出登录'),
                        jumpFunc: () => window.top.location.href = urls.logoutUrl
                    }
                ]
            }
        }

        renderDialogBtns(dialog) {
            let btns = [];
            if (dialog.type != 'tips') {
                btns.push(<FormItem key="1" item={dialog.actions.confirm} confirm={dialog.confirm}></FormItem>);
                if (dialog.type == 'confirm') {
                    btns.push(<FormItem key="0" item={dialog.actions.cancel} cancel={dialog.cancel}></FormItem>);
                }
            }
            return btns;
        }
    }

    return connect(mapStateToProps, mapDispatchToProps)(App)
}
