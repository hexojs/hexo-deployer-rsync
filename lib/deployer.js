'use strict';

const color = require('picocolors');
const { spawn } = require('hexo-util');
const pathFn = require('path');
require('dotenv/config');

module.exports = function(args) {
  if (!args.dotenv && (!args.host || !args.user || !args.root)) {
    let help = '';

    help += 'You should configure deployment settings in _config.yml first!\n\n';
    help += 'Example:\n';
    help += '  deploy:\n';
    help += '    type: rsync\n';
    help += '    host: <host>\n';
    help += '    user: <user>\n';
    help += '    root: <root>\n';
    help += '    port: [port] # Default is 22\n';
    help += '    delete: [true|false] # Default is true\n';
    help += '    progress: [true|false] # Default is true\n';
    help += '    dotenv: [true|false] # Default is false\n';
    help += '    args: <rsync args>\n';
    help += '    rsh: <remote shell>\n';
    help += '    key: <key>\n';
    help += '    verbose: [true|false] # Default is true\n';
    help += '    ignore_errors: [true|false] # Default is false\n';
    help += '    create_before_update: [true|false] # Default is false\n\n';
    help += 'For more help, you can check the docs: ' + color.underline('https://hexo.io/docs/deployment.html');

    console.log(help);
    return;
  }

  if (!Object.prototype.hasOwnProperty.call(args, 'delete')) args.delete = true;
  if (!Object.prototype.hasOwnProperty.call(args, 'verbose')) args.verbose = true;
  if (!Object.prototype.hasOwnProperty.call(args, 'progress')) args.progress = true;
  if (!Object.prototype.hasOwnProperty.call(args, 'ignore_errors')) args.ignore_errors = false;
  if (!Object.prototype.hasOwnProperty.call(args, 'create_before_update')) args.create_before_update = false;
  if (!Object.prototype.hasOwnProperty.call(args, 'dotenv')) args.dotenv = true;

  if (args.dotenv === true) {
    const {
      HEXO_RSYNC_HOST,
      HEXO_RSYNC_PORT,
      HEXO_RSYNC_USER,
      HEXO_RSYNC_ROOT,
    } = process.env;
    
    if (HEXO_RSYNC_HOST) {
      args.host = HEXO_RSYNC_HOST;
    }
    
    if (HEXO_RSYNC_PORT) {
      args.port = HEXO_RSYNC_PORT;
    }
    
    if (HEXO_RSYNC_USER) {
      args.user = HEXO_RSYNC_USER;
    }
    
    if (HEXO_RSYNC_ROOT) {
      args.root = HEXO_RSYNC_ROOT;
    }
  }

  const params = [
    '-az',
    process.platform === 'win32' ? pathFn.basename(this.public_dir) + '/' : this.public_dir,
    args.user + '@' + args.host + ':' + args.root
  ];

  if (args.port && args.port > 0 && args.port < 65536) {
    params.splice(params.length - 2, 0, '-e');
    if (args.rsh) {
      if (args.key) {
        params.splice(params.length - 2, 0, `'${args.rsh}' -i ${args.key} -p ${args.port}`);
      } else {
        params.splice(params.length - 2, 0, `'${args.rsh}' -p ${args.port}`);
      }
    } else if (args.key) {
      params.splice(params.length - 2, 0, 'ssh -i ' + args.key + ' -p ' + args.port);
    } else {
      params.splice(params.length - 2, 0, 'ssh -p ' + args.port);
    }
  }

  if (args.verbose) params.unshift('-v');
  if (args.ignore_errors) params.unshift('--ignore-errors');
  if (args.delete) params.unshift('--delete');
  if (args.progress) params.unshift('--progress');
  if (args.args) params.unshift(...args.args.split(' '));

  if (args.create_before_update) {
    // Create non-existing files before updating existing files.
    // New files may be large documents, images and media, and we want to upload them first before updating links to them in the existing pages.
    // Otherwise, the links may be updated first and temporarily point to new files that have not been uploaded yet.
    params.unshift('--ignore-existing');
    return spawn('rsync', [...params], {verbose: true}).then(() => {
      params.shift();
      return spawn('rsync', [...params], {verbose: true});
    });
  }
  return spawn('rsync', params, {verbose: true});
};