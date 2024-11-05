import { fileURLToPath, resolve, resolvePath } from 'mlly';
import { type Plugin, type UserConfig, mergeConfig } from 'vite';
import { importerFilter, logger } from './rules';

export function replaceDayjsToMoment({ toLibrary = 'moment' } = {} as any) {
  const filter = /dayjs/;
  const ignoreSet = new Set();
  const replacedModule = new Map<string, string>();
  let isServe = false;

  return {
    name: 'replace-dayjs-to-moment',
    enforce: 'pre',
    config(config: UserConfig, env) {
      isServe = env.command === 'serve';
      config = mergeConfig(config, {
        optimizeDeps: {
          esbuildOptions: {
            plugins: [
              {
                name: 'vite-plugin-dayjs-to-moment',
                setup(build) {
                  build.onResolve({ filter }, async (args) => {
                    const id = args.path;
                    const { importer } = args;

                    if (!importerFilter(importer)) {
                      return;
                    }

                    const replacedModule = id.replace(new RegExp(filter, 'g'), 'moment');
                    try {
                      const path = await resolvePath(replacedModule, { url: args.importer });
                      return {
                        path,
                      };
                    } catch (e) {
                      logger.warn(`Module can not resolved: ${replacedModule}`);
                    }
                  });
                },
              },
            ],
          },
        },
      });
      return config;
    },
    async resolveId(source, importer, options) {
      if (!importer) {
        return;
      }

      if (!importerFilter(importer)) {
        return;
      }

      try {
        const replacedModule = source.replace(new RegExp(filter, 'g'), 'moment');
        return await resolvePath(replacedModule, { url: importer });
      } catch (e) {
        logger.warn(`Module can not resolved: ${source}`);
        return;
      }
    },
  } as Plugin;
}
