'use strict';

var chalk = require('chalk');
var spawn = require('hexo-util/lib/spawn');

module.exports = function(args) {
  if (!args.host || !args.user || !args.root) {
    var help = '';

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
    help += 'For more help, you can check the docs: ' + chalk.underline('http://hexo.io/docs/deployment.html');

    console.log(help);
    return;
  }

  if (!args.hasOwnProperty('port')) args.port = 22;
  if (!args.hasOwnProperty('delete')) args.delete = true;
  if (!args.hasOwnProperty('verbose')) args.verbose = true;
  if (!args.hasOwnProperty('ignore_errors')) args.ignore_errors = false;

  var params = [
    '-az',
    this.public_dir,
    '-e ssh',
    args.user + '@' + args.host + ':' + args.root
  ];

  if (args.port && args.port > 0 && args.port < 65536) {
    params.splice(params.length - 1, 0, '--port=' + args.port);
  }

  if (args.verbose) params.unshift('-v');
  if (args.ignore_errors) params.unshift('--ignore-errors');
  if (args.delete) params.unshift('--delete');
  if (args.args) params.unshift(args.args);

  return spawn('rsync', params, {verbose: true});
};
