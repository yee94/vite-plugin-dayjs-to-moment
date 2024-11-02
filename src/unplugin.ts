import { resolve } from 'mlly';
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
      if (!filter.test(source)) return;
      if (!importer || !importerFilter(importer)) {
        ignoreSet.add(source);
      }

      if (ignoreSet.has(source)) return;

      try {
        await resolve(source, { url: importer });

        return source.replace(filter, toLibrary);
      } catch (e) {
        logger.warn(`Module can not resolved: ${source}`);
        ignoreSet.add(source);
        return;
      }
    },
  };
});
