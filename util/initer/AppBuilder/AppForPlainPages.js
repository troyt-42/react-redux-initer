require('style/main.less')

import React, {Component} from 'react'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import OuterWrapper from 'Component/OuterWrapper'

module.exports = () => {
  //App将绑定context值属性
  function mapStateToProps(state) {
    return {
      context: state.context,
    }
  }

  //App将绑定userActions的方法，
  // 即userActions定义的方法将做为App的一个方法属性
  function mapDispatchToProps(dispatch) {
    return bindActionCreators({
    }, dispatch)
  }

  class App extends Component {
    render() {
      return <div>
        {this.props.children}
        <OuterWrapper />
      </div>
    }
  }

  return connect(mapStateToProps, mapDispatchToProps)(App)
}
