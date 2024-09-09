import { fileURLToPath, resolve } from 'mlly';
import { Plugin, UserConfig, mergeConfig } from 'vite';
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
                      ignoreSet.add(id);
                    }

                    const replacedModule = id.replace(new RegExp(filter, 'g'), 'moment');
                    if (ignoreSet.has(id)) {
                      return;
                    }
                    try {
                      await resolve(replacedModule, { url: args.importer });
                    } catch (e) {
                      // logger.warn(`Module can not resolved: ${replacedModule}`);
                      ignoreSet.add(id);
                    }
                  });
                },
              },
            ],
          },
        },
        resolve: {
          alias: [
            {
              find: filter,
              replacement: (match, index, matchStr) => {
                if (ignoreSet.has(matchStr)) {
                  return match;
                }

                replacedModule.set(matchStr.replace(filter, toLibrary), matchStr);

                return toLibrary;
              },
            },
          ],
        },
      });
      return config;
    },
    async resolveId(source, importer, options) {
      if (isServe) return;

      if (replacedModule.has(source)) {
        const resolveOriginModule = async () => {
          try {
            return fileURLToPath(await resolve(replacedModule.get(source)!, { url: importer }))!;
          } catch (e) {
            return require.resolve(source, {
              paths: importer ? [importer] : undefined,
            });
          }
        };

        if (!importer || !importerFilter(importer)) {
          ignoreSet.add(source);
        }

        if (ignoreSet.has(source)) return resolveOriginModule();

        try {
          await resolve(source, { url: importer });
        } catch (e) {
          logger.warn(`Module can not resolved: ${source}`);
          ignoreSet.add(source);
          return resolveOriginModule();
        }
      }
    },
  } as Plugin;
}
