
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

  if (['antd', '@formily/antd-v5', 'rc-picker'].some((item) => importer.includes(`/${item}/`))) {
    return true;
  }

  return false;
};
