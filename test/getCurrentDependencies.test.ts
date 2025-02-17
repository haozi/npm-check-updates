import chai from 'chai'
import getCurrentDependencies from '../src/lib/getCurrentDependencies'
import { PackageFile } from '../src/types'

chai.should()

describe('getCurrentDependencies', () => {

  let deps: PackageFile
  beforeEach(() => {
    deps = {
      dependencies: {
        mocha: '1.2'
      },
      devDependencies: {
        lodash: '^3.9.3'
      },
      peerDependencies: {
        moment: '^1.0.0'
      },
      optionalDependencies: {
        chalk: '^1.1.0'
      },
      bundleDependencies: {
        bluebird: '^1.0.0'
      }
    }
  })

  it('return an empty object for an empty package.json and handle default options', () => {
    getCurrentDependencies().should.eql({})
    getCurrentDependencies({}).should.eql({})
    getCurrentDependencies({}, {}).should.eql({})
  })

  it('get dependencies, devDependencies, and optionalDependencies by default', () => {
    getCurrentDependencies(deps).should.eql({
      mocha: '1.2',
      lodash: '^3.9.3',
      chalk: '^1.1.0',
      bluebird: '^1.0.0',
      moment: '^1.0.0'
    })
  })

  it('only get dependencies with --dep prod', () => {
    getCurrentDependencies(deps, { dep: 'prod' }).should.eql({
      mocha: '1.2'
    })
  })

  it('only get devDependencies with --dep dev', () => {
    getCurrentDependencies(deps, { dep: 'dev' }).should.eql({
      lodash: '^3.9.3'
    })
  })

  it('only get optionalDependencies with --dep optional', () => {
    getCurrentDependencies(deps, { dep: 'optional' }).should.eql({
      chalk: '^1.1.0'
    })
  })

  it('only get peerDependencies with --dep peer', () => {
    getCurrentDependencies(deps, { dep: 'peer' }).should.eql({
      moment: '^1.0.0'
    })
  })

  it('only get bundleDependencies with --dep bundle', () => {
    getCurrentDependencies(deps, { dep: 'bundle' }).should.eql({
      bluebird: '^1.0.0'
    })
  })

  it('only get devDependencies and peerDependencies with --dep dev,peer', () => {
    getCurrentDependencies(deps, { dep: 'dev,peer' }).should.eql({
      lodash: '^3.9.3',
      moment: '^1.0.0'
    })
  })

  describe('filter', () => {

    it('filter dependencies by package name', () => {
      getCurrentDependencies(deps, { filter: 'mocha' }).should.eql({
        mocha: '1.2'
      })
    })

    it('filter dependencies by @org/package name', () => {
      const deps = {
        dependencies: {
          '@ngrx/store': '4.0.0',
          mocha: '1.0.0'
        }
      }

      getCurrentDependencies(deps, { filter: '@ngrx/store' }).should.eql({
        '@ngrx/store': '4.0.0'
      })
    })

    it('do not filter out dependencies with a partial package name', () => {
      getCurrentDependencies(deps, { filter: 'o' }).should.eql({})
    })

    it('filter dependencies by multiple packages', () => {
      getCurrentDependencies(deps, { filter: 'mocha lodash' }).should.eql({
        mocha: '1.2',
        lodash: '^3.9.3'
      })
      getCurrentDependencies(deps, { filter: 'mocha,lodash' }).should.eql({
        mocha: '1.2',
        lodash: '^3.9.3'
      })
      getCurrentDependencies(deps, { filter: ['mocha', 'lodash'] }).should.eql({
        mocha: '1.2',
        lodash: '^3.9.3'
      })
    })

    it('filter dependencies by regex', () => {
      getCurrentDependencies(deps, { filter: /o/ }).should.eql({
        lodash: '^3.9.3',
        mocha: '1.2',
        moment: '^1.0.0'
      })
      getCurrentDependencies(deps, { filter: '/o/' }).should.eql({
        lodash: '^3.9.3',
        mocha: '1.2',
        moment: '^1.0.0'
      })
    })

    it.skip('should filter org dependencies by regex', () => {
      getCurrentDependencies(deps, { filter: /store/ }).should.eql({
        '@ngrx/store': '4.0.0'
      })
    })
  })

  describe('reject', () => {

    it('reject dependencies by package name', () => {
      getCurrentDependencies(deps, { reject: 'chalk' }).should.eql({
        mocha: '1.2',
        lodash: '^3.9.3',
        bluebird: '^1.0.0',
        moment: '^1.0.0'
      })
    })

    it('do not reject dependencies with a partial package name', () => {
      getCurrentDependencies(deps, { reject: 'o' }).should.eql({
        mocha: '1.2',
        lodash: '^3.9.3',
        chalk: '^1.1.0',
        bluebird: '^1.0.0',
        moment: '^1.0.0'
      })
    })

    it('reject dependencies by multiple packages', () => {
      getCurrentDependencies(deps, { reject: 'mocha lodash' }).should.eql({
        chalk: '^1.1.0',
        bluebird: '^1.0.0',
        moment: '^1.0.0'
      })
      getCurrentDependencies(deps, { reject: 'mocha,lodash' }).should.eql({
        chalk: '^1.1.0',
        bluebird: '^1.0.0',
        moment: '^1.0.0'
      })
      getCurrentDependencies(deps, { reject: ['mocha', 'lodash'] }).should.eql({
        chalk: '^1.1.0',
        bluebird: '^1.0.0',
        moment: '^1.0.0'
      })
    })

    it('filter dependencies by regex', () => {
      getCurrentDependencies(deps, { reject: /o/ }).should.eql({
        chalk: '^1.1.0',
        bluebird: '^1.0.0'
      })
      getCurrentDependencies(deps, { reject: '/o/' }).should.eql({
        chalk: '^1.1.0',
        bluebird: '^1.0.0'
      })
    })

    it('filter and reject', () => {
      getCurrentDependencies(deps, { filter: 'mocha chalk', reject: 'chalk' }).should.eql({
        mocha: '1.2'
      })
    })
  })

})
