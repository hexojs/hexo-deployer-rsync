/* global hexo */
'use strict';

hexo.extend.deployer.register('rsync', require('./lib/deployer'));
