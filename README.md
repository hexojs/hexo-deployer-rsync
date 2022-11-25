# hexo-deployer-rsync

[![Build Status](https://github.com/hexojs/hexo-deployer-rsync/workflows/Tester/badge.svg)](https://github.com/hexojs/hexo-deployer-rsync/actions?query=workflow%3ATester)
[![NPM version](https://badge.fury.io/js/hexo-deployer-rsync.svg)](https://www.npmjs.com/package/hexo-deployer-rsync)

Rsync deployer plugin for [Hexo].

## Installation

``` bash
$ npm install hexo-deployer-rsync --save
```

## Options

You can configure this plugin in `_config.yml`.

``` yaml
deploy:
  type: rsync
  host: <host>
  user: <user>
  root: <root>
  port: [port] # Default is 22
  delete: [true|false] # Default is true
  args: <rsync args>
  rsh: <remote shell>
  verbose: [true|false] # Default is true
  ignore_errors: [true|false] # Default is false
```

- **host**: Address of remote host  
- **user**: Username  
- **root**: Root directory of remote host   
- **port**: Port
- **delete**: Delete old files on remote host
- **args**: Rsync arguments
- **rsh**: Specify the remote shell to use
- **verbose**: Display verbose messages
- **ignore_errors**: Ignore errors

## License

MIT

[Hexo]: http://hexo.io/
