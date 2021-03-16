import React, { Component, Fragment } from 'react';
import { accountLogin, accountRegister } from '@api/header';
import { createDB, insertData, getAllData } from '@indexDB';
import LoginUi from './loginUi.js';

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isInit: true,
      isLogin: true, // 是否登录
      panfishImgType: 1, // 顶部河豚显示状态
      accountValue: '', // 登录账号value
      passwordValue: '', // 登录密码value
      registerAccountValue: '', // 注册账号value
      registerPhoneValue: '', // 注册手机号value
      registerPasswordValue: '' // 注册密码value
    }

    // 登录/注册切换
    this.logonHandover = this.logonHandover.bind(this);
    // 登录部分
    this.accountChange = this.accountChange.bind(this);
    this.accountFocus = this.accountFocus.bind(this);
    this.accountBlur = this.accountBlur.bind(this);
    this.passwordChange = this.passwordChange.bind(this);
    this.passwordFocus = this.passwordFocus.bind(this);
    this.passwordBlur = this.passwordBlur.bind(this);
    this.submit = this.submit.bind(this);
    // 注册部分
    this.registerAccountChange = this.registerAccountChange.bind(this);
    this.registerPhoneChange = this.registerPhoneChange.bind(this);
    this.registerPasswordChange = this.registerPasswordChange.bind(this);
    this.register = this.register.bind(this);
    // 忘记密码
    this.forgetPassword = this.forgetPassword.bind(this);
  }

  // 可以监听到父组件props变化
  // 参数1 父组件props, 参数2 当前组件的state
  // 必须返回对象，或者返回一个null
  static getDerivedStateFromProps(props, curState) {
    // 解决父组件和子组件切换冲突问题
    if (props.loginType === 'login' && curState.isInit) {
      return {
        isLogin: true
      }
    } else if (props.loginType === 'register' && curState.isInit) {
      return {
        isLogin: false
      }
    } else if (props.loginType === 'register' && curState.isLogin) {
      return {
        isLogin: true
      }
    } else {
      return null;
    }
  }

  render() {
    return (
      <Fragment>
        <LoginUi
          isLogin={this.state.isLogin}
          panfishImgType={this.state.panfishImgType}
          close={this.props.close}
          logonHandover={this.logonHandover}
          accountValue={this.state.accountValue}
          accountChange={this.accountChange}
          accountFocus={this.accountFocus}
          accountBlur={this.accountBlur}
          passwordValue={this.state.passwordValue}
          passwordChange={this.passwordChange}
          passwordFocus={this.passwordFocus}
          passwordBlur={this.passwordBlur}
          submit={this.submit}
          registerAccountValue={this.state.registerAccountValue}
          registerAccountChange={this.registerAccountChange}
          registerPhoneValue={this.state.registerPhoneValue}
          registerPhoneChange={this.registerPhoneChange}
          registerPasswordValue={this.registerPasswordValue}
          registerPasswordChange={this.registerPasswordChange}
          register={this.register}
          forgetPassword={this.forgetPassword}
        />
      </Fragment>
    );
  }
  
  // 登录/注册切换
  logonHandover(type) {
    // 用于区分父组件点击还是子组件切换
    if (this.state.isInit) {
      this.setState({ isInit: false });
    }
    if (type === 'login') {
      this.setState({ isLogin: false });
    } else if(type === 'register') {
      this.setState({ isLogin: true });
    }
  }

  // 账号value
  accountChange(e) {
    this.setState({ accountValue: e.target.value });
  }

  // 账号获取焦点
  accountFocus() {
    this.setState({ panfishImgType: 2 });
  }

  // 账号失去焦点
  accountBlur() {
    this.setState({ panfishImgType: 1 });
  }

  // 密码value
  passwordChange(e) {
    this.setState({ passwordValue: e.target.value });
  }

  // 密码获取焦点
  passwordFocus() {
    this.setState({ panfishImgType: 3 });
  }

  // 密码失去焦点
  passwordBlur() {
    this.setState({ panfishImgType: 1 });
  }

  // 登录
  submit() {
    let { accountValue: username, passwordValue: password } = this.state;
    // 数据校验
    if (!username) {
      this.setState({ panfishImgType: 2 });
      React.Message.error('请输入账号!');
      return false;
    } else if (!password) {
      this.setState({ panfishImgType: 2 });
      React.Message.error('请输入密码!');
      return false;
    }

    accountLogin({
      username,
      password
    })
      .then(res => {
        // 进行数据查询
        getAllData('juejinDB', 'user', (data) => {
          let userResult = data.find(item => res.data.username === item.username);
          let phoneResult = data.find(item => res.data.username === item.phone);
          if (userResult || phoneResult) {
            if (userResult.password === password) {
              this.props.close();
              document.cookie = `username=${username}`
              React.Message.info('登录成功');
            } else {
              React.Message.error('请检查用户名或者密码是否正确！');
            }
          } else {
            React.Message.error('该账号没有被注册！');
          }
        })
      })
  }

  // 注册账号
  registerAccountChange(e) {
    this.setState({ registerAccountValue: e.target.value });
  }

  // 注册手机号
  registerPhoneChange(e) {
    this.setState({ registerPhoneValue: e.target.value });
  }

  // 注册密码
  registerPasswordChange(e) {
    this.setState({ registerPasswordValue: e.target.value });
  }
  
  // 注册
  register() {
    let { registerAccountValue: username, registerPhoneValue: phone, registerPasswordValue: password } = this.state;
    // 数据校验
    let reg = /^[1][3,4,5,7,8,9][0-9]{9}$/;
    if (!username) {
      React.Message.error('请输入账号！');
      return false;
    } else if (!phone) {
      React.Message.error('请输入手机号！');
      return false;
    } else if (phone && !reg.test(phone)) {
      React.Message.error('请输入正确的手机号！');
      return false;
    } else if (!password || password.length < 6) {
      React.Message.error('请输入密码');
      return false;
    }

    accountRegister({
      username,
      phone,
      password
    })
      .then(res => {
        let indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB;
        if( !indexedDB ){
          throw Error('当前浏览器不支持 indexed 数据库, 请更换高级浏览器！！！');
        } else {
          createDB('juejinDB', 'user' , 1);
          // 进行数据查询
          getAllData('juejinDB', 'user', (data) => {
            if (data.length === 0) {
              // 第一次注册直接添加
              insertData('juejinDB', 'user', { username, phone, password });
              this.props.close();
              React.Message.info('注册成功!');
            } else {
              // 后续添加进行对比
              let userResult = data.find(item => res.data.username === item.username);
              let phoneResult = data.find(item => res.data.phone === item.phone);
              if (userResult) {
                React.Message.error('账号已存在！');
              } else if (phoneResult) {
                React.Message.error('手机号已被注册，请更换手机号!');
              } else {
                insertData('juejinDB', 'user', { username, phone, password });
                this.props.close();
                React.Message.info('注册成功!');
              }
            }
          })
        }
      })
  }

  // 忘记密码
  forgetPassword() {
    React.Message.info('暂不支持找回密码，请重新注册！');
  }
}
 
export default Login;