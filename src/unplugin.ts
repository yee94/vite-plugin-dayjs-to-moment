import { resolve, resolvePath } from 'mlly';
import { createUnplugin } from 'unplugin';
import { importerFilter, logger } from './rules';

export const replaceDayjsToMomentUnplugin = createUnplugin<{
  toLibrary?: string;
}>(({ toLibrary = 'moment' } = {}) => {
  const filter = /dayjs/;
  const ignoreSet = new Set();
  return {
    name: 'replace-dayjs-to-moment',
    async resolveId(source, importer, options) {
      if (!importer) {
        return;
      }

      if (!filter.test(source)) {
        return;
      }

      if (!importerFilter(importer)) {
        return;
      }

      try {
        const replacedModule = source.replace(new RegExp(filter, 'g'), toLibrary);
        return await resolvePath(replacedModule, { url: importer, extensions: ['.js', '.jsx', '.ts', '.tsx'] });
      } catch (e) {
        logger.warn(`Module can not resolved: ${source}`);
        return;
      }
    },
  };
});
