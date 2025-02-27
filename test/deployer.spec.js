'use strict';

const { writeFile, mkdir, rm } = require('node:fs/promises');
const pathFn = require('node:path');
const { expect } = require('chai');
const sinon = require('sinon');
const rewire = require('rewire');

const _testDir = 'tmp/_test/';

describe('deployer', () => {
  describe('dry-run', () => {
    let hexo, args;
    const baseDir = pathFn.resolve(_testDir);
    const publicDir = pathFn.resolve(baseDir, 'public');

    const argsDefault = { host: 'example.com', user: 'user', root: '/rootDir' };

    const deployer = rewire('../lib/deployer');
    let fakeHexoSpawn = sinon.fake.resolves();
    deployer.__set__('spawn', fakeHexoSpawn);

    beforeEach(() => {
      hexo = {
        public_dir: publicDir,
        log: {
          info: sinon.stub(),
          fatal: sinon.stub()
        }
      };
      args = { ...argsDefault };

      fakeHexoSpawn = sinon.fake.resolves();
      deployer.__set__('spawn', fakeHexoSpawn);
    });

    afterEach(() => {
      sinon.restore();
    });

    it('should display help message if required args are missing', () => {
      args = {};
      const consoleStub = sinon.stub(console, 'log');

      const result = deployer.call(hexo, args);

      expect(result).to.be.undefined;
      expect(consoleStub.callCount).to.be.equal(1);
      expect(consoleStub.args[0][0]).to.contain(
        'You should configure deployment settings in _config.yml first!'
      );

      expect(fakeHexoSpawn.callCount).to.be.equal(0);

      consoleStub.restore();
    });

    it('should set default values for optional args', () => {
      args = { ...args };

      return deployer.call(hexo, args).then(() => {
        expect(args.delete).to.be.true;
        expect(args.verbose).to.be.true;
        expect(args.progress).to.be.true;
        expect(args.ignore_errors).to.be.false;
        expect(args.create_before_update).to.be.false;

        const spawnArgs = fakeHexoSpawn.args[0][1];
        expect(fakeHexoSpawn.callCount).to.be.equal(1);
        expect(fakeHexoSpawn.args[0][0]).to.equal('rsync');
        expect(fakeHexoSpawn.args[0][2]).to.eql({ verbose: true });

        expect(spawnArgs).to.include('--delete');
        expect(spawnArgs).to.include('-v');
        expect(spawnArgs).to.include('-az');
        expect(spawnArgs).to.include(
          process.platform === 'win32'
            ? pathFn.basename(hexo.public_dir) + '/'
            : hexo.public_dir
        );
        expect(spawnArgs).to.include(`${args.user}@${args.host}:${args.root}`);
      });
    });

    it('should add port to params if provided', () => {
      args = { ...args, port: 11451 };

      return deployer.call(hexo, args).finally(() => {
        const spawnArgs = fakeHexoSpawn.args[0][1];

        expect(fakeHexoSpawn.callCount).to.be.equal(1);
        expect(spawnArgs).to.include(`ssh -p ${args.port}`);
      });
    });

    it('should handle invalid port number', () => {
      args = { ...args, port: 99999 };

      return deployer.call(hexo, args).finally(() => {
        const spawnArgs = fakeHexoSpawn.args[0][1];

        expect(fakeHexoSpawn.callCount).to.be.equal(1);
        expect(spawnArgs.join()).to.not.include(' -p ');
      });
    });

    it('should add port and key to params if provided', () => {
      args = { ...args, port: 2222, key: _testDir + 'key' };

      return deployer.call(hexo, args).finally(() => {
        const spawnArgs = fakeHexoSpawn.args[0][1];

        expect(fakeHexoSpawn.callCount).to.be.equal(1);
        expect(spawnArgs).to.include(`ssh -i ${args.key} -p ${args.port}`);
      });
    });

    it('should add port and rsh to params if provided', () => {
      args = { ...args, port: 2222, rsh: 'mosh' };

      return deployer.call(hexo, args).finally(() => {
        const spawnArgs = fakeHexoSpawn.args[0][1];

        expect(fakeHexoSpawn.callCount).to.be.equal(1);
        expect(spawnArgs).to.include(`'${args.rsh}' -p ${args.port}`);
      });
    });
    it('should add port and rsh and key to params if provided', () => {
      args = { ...args, port: 2222, rsh: 'mosh', key: _testDir + 'key' };

      return deployer.call(hexo, args).finally(() => {
        const spawnArgs = fakeHexoSpawn.args[0][1];

        expect(fakeHexoSpawn.callCount).to.be.equal(1);
        expect(spawnArgs).to.include(
          `'${args.rsh}' -i ${args.key} -p ${args.port}`
        );
      });
    });

    it('should handle create_before_update correctly', async () => {
      args = { ...args, create_before_update: true };

      return deployer.call(hexo, args).finally(() => {
        const spawnArgs1 = fakeHexoSpawn.getCall(0).args[1];
        const spawnArgs2 = fakeHexoSpawn.getCall(1).args[1];

        expect(fakeHexoSpawn.callCount).to.equal(2);
        expect(spawnArgs1).to.include('--ignore-existing');
        expect(spawnArgs2).to.not.include('--ignore-existing');
      });
    });

    it('check sinon work properly', () => {
      expect(fakeHexoSpawn.callCount).to.be.equal(0);
    });
  });
});
