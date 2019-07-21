'use strict';

const chalk = require('chalk');
const spawn = require('hexo-util/lib/spawn');
const pathFn = require('path');

module.exports = function(args) {
  if (!args.host || !args.user || !args.root) {
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
    help += '    args: <rsync args>\n';
    help += '    verbose: [true|false] # Default is true\n';
    help += '    ignore_errors: [true|false] # Default is false\n\n';
    help += 'For more help, you can check the docs: ' + chalk.underline('https://hexo.io/docs/deployment.html');

    console.log(help);
    return;
  }

  if (!Object.prototype.hasOwnProperty.call(args, 'delete')) args.delete = true;
  if (!Object.prototype.hasOwnProperty.call(args, 'verbose')) args.verbose = true;
  if (!Object.prototype.hasOwnProperty.call(args, 'ignore_errors')) args.ignore_errors = false;

  const params = [
    '-az',
    process.platform === 'win32' ? pathFn.basename(this.public_dir) + '/' : this.public_dir,
    args.user + '@' + args.host + ':' + args.root
  ];

  if (args.port && args.port > 0 && args.port < 65536) {
    params.splice(params.length - 2, 0, '-e');
    params.splice(params.length - 2, 0, 'ssh -p ' + args.port);
  }

  if (args.verbose) params.unshift('-v');
  if (args.ignore_errors) params.unshift('--ignore-errors');
  if (args.delete) params.unshift('--delete');
  if (args.args) params.unshift(args.args);

  return spawn('rsync', params, {verbose: true});
};
