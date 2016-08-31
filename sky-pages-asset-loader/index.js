'use strict';

const loaderUtils = require('loader-utils');

module.exports = function(source) {
  const query = loaderUtils.parseQuery(this.query);
  const assets = this.options.SKY_PAGES.assets;

  if (assets && query.key && assets[query.key] && assets[query.key].length) {
    this.addDependency(assets[query.key][0].path);
    source = assets[query.key][0].get();
  }

  return source;
}
