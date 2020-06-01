import { prettyPrint } from '../../../common/print';
import { getBundleCompiler } from '../common';

interface Options {
  dev?: boolean
}

const main = async (options: Options) => {
  const compiler = await getBundleCompiler(options);
  const configs = await compiler.getWebpackConfig('webnew');

  prettyPrint(configs);
};

export default main;
