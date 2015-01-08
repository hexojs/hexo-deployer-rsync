var chalk = require('chalk');
var spawn = require('child_process').spawn;
var Promise = require('bluebird');

module.exports = function(args){
  if (!args.host || !args.user || !args.root){
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
    help += '    verbose: [true|false] # Default is true\n';
    help += '    ignore_errors: [true|false] # Default is false\n\n';
    help += 'For more help, you can check the docs: ' + chalk.underline('http://hexo.io/docs/deployment.html');

    console.log(help);
    return;
  }

  if (!args.hasOwnProperty('delete')) args.delete = true;
  if (!args.port) args.port = 22;
  if (!args.hasOwnProperty('verbose')) args.verbose = true;

  if (args.port > 65535 || args.port < 1){
    args.port = 22;
  }

  var params = [
    '-az',
    'public/',
    '-e',
    'ssh -p ' + args.port,
    args.user + '@' + args.host + ':' + args.root
  ];

  if (args.verbose) params.unshift('-v');
  if (args.ignore_errors) params.unshift('--ignore-errors');
  if (args.delete) params.unshift('--delete');

  var rsync = spawn('rsync', params);

  rsync.stdout.on('data', function(data){
    process.stdout.write(data);
  });

  rsync.stderr.on('data', function(data){
    process.stderr.write(data);
  });

  return new Promise(function(resolve, reject){
    rsync.on('close', function(code){
      if (code){
        reject(new Error('rsync error: ' + code));
      } else {
        resolve();
      }
    });
  });
};