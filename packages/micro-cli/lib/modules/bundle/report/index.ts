import open from 'open';

const target = 'bundle';

const main = async () => {
  console.log(`🦄 Starting ${target} report`);

  open('http://webpack.github.io/analyse/');
};

export default main;
