import { USER_INFO, HEADER_NAV_LIST } from './actionTypes';

// 设置头部主导航栏下标
export const userInfoAction = userinfo => ({
  type: USER_INFO,
  userinfo
});

// 设置头部主导航栏下标
export const headerNavAction = index => ({
  type: HEADER_NAV_LIST,
  index
});
