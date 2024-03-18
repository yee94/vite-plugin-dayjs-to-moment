import { logger as _logger } from '@umijs/utils';
export const logger = {
  warn(...message: any[]) {
    _logger.warn(`[vite-plugin-dayjs-to-moment] ${message.join(' ')}`);
  },
};

export const importerFilter = (importer: string) => {
  // @ant-design/pro NO
  if (/\/@ant-design\/pro-/.test(importer)) {
    return false;
  }

  // @开头主要是兼容 tnpm 的包
  // eg. /node_modules/_rc-picker@4.3.0@rc-picker/es/generate/dayjs.js
  if (['antd', '@formily/antd-v5', 'rc-picker'].some((item) => new RegExp(`[@/]${item}/`).test(importer))) {
    return true;
  }

  return false;
};
