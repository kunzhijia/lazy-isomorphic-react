'use strict';

import expect from 'expect';
import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import createHistory from '../createMemoryHistory';
import IndexRoute from '../IndexRoute';
import Router from '../Router';
import Route from '../Route';
import qs from 'qs';

describe('isActive', function () {

  var node = undefined;
  beforeEach(function () {
    node = document.createElement('div');
  });

  afterEach(function () {
    unmountComponentAtNode(node);
  });

  describe('a pathname that matches the URL', function () {
    describe('with no query', function () {
      it('is active', function (done) {
        var history = createHistory('/home');
        render(React.createElement(
          Router,
          { history: history },
          React.createElement(Route, { path: '/home' })
        ), node, function () {
          expect(this.router.isActive('/home')).toBe(true);
          done();
        });
      });
    });

    describe('with a query that also matches', function () {
      it('is active', function (done) {
        render(React.createElement(
          Router,
          { history: createHistory('/home?the=query') },
          React.createElement(Route, { path: '/home' })
        ), node, function () {
          expect(this.router.isActive({
            pathname: '/home',
            query: { the: 'query' }
          })).toBe(true);
          done();
        });
      });
    });

    describe('with a query that also matches by value, but not by type', function () {
      it('is active', function (done) {
        render(React.createElement(
          Router,
          { history: createHistory('/home?the=query&n=2&show=false') },
          React.createElement(Route, { path: '/home' })
        ), node, function () {
          expect(this.router.isActive({
            pathname: '/home',
            query: { the: 'query', n: 2, show: false }
          })).toBe(true);
          done();
        });
      });
    });

    describe('with a query that does not match', function () {
      it('is not active', function (done) {
        render(React.createElement(
          Router,
          { history: createHistory('/home?the=query') },
          React.createElement(Route, { path: '/home' })
        ), node, function () {
          expect(this.router.isActive({
            pathname: '/home',
            query: { something: 'else' }
          })).toBe(false);
          done();
        });
      });
    });
  });

  describe('nested routes', function () {
    describe('on the child', function () {
      it('is active for the child and the parent', function (done) {
        render(React.createElement(
          Router,
          { history: createHistory('/parent/child') },
          React.createElement(
            Route,
            { path: '/parent' },
            React.createElement(Route, { path: 'child' })
          )
        ), node, function () {
          expect(this.router.isActive('/parent/child')).toBe(true);
          expect(this.router.isActive('/parent/child', true)).toBe(true);
          expect(this.router.isActive('/parent')).toBe(true);
          expect(this.router.isActive('/parent', true)).toBe(false);
          done();
        });
      });

      it('is active with extraneous slashes', function (done) {
        render(React.createElement(
          Router,
          { history: createHistory('/parent/child') },
          React.createElement(
            Route,
            { path: '/parent' },
            React.createElement(Route, { path: 'child' })
          )
        ), node, function () {
          expect(this.router.isActive('/parent////child////')).toBe(true);
          done();
        });
      });

      it('is not active with missing slashes', function (done) {
        render(React.createElement(
          Router,
          { history: createHistory('/parent/child') },
          React.createElement(
            Route,
            { path: '/parent' },
            React.createElement(Route, { path: 'child' })
          )
        ), node, function () {
          expect(this.router.isActive('/parentchild')).toBe(false);
          done();
        });
      });
    });

    describe('on the parent', function () {
      it('is active for the parent', function (done) {
        render(React.createElement(
          Router,
          { history: createHistory('/parent') },
          React.createElement(
            Route,
            { path: '/parent' },
            React.createElement(Route, { path: 'child' })
          )
        ), node, function () {
          expect(this.router.isActive('/parent/child')).toBe(false);
          expect(this.router.isActive('/parent/child', true)).toBe(false);
          expect(this.router.isActive('/parent')).toBe(true);
          expect(this.router.isActive('/parent', true)).toBe(true);
          done();
        });
      });
    });
  });

  describe('a pathname that matches a parent route, but not the URL directly', function () {
    describe('with no query', function () {
      it('is active', function (done) {
        render(React.createElement(
          Router,
          { history: createHistory('/absolute') },
          React.createElement(
            Route,
            { path: '/home' },
            React.createElement(Route, { path: '/absolute' })
          )
        ), node, function () {
          expect(this.router.isActive('/home')).toBe(true);
          expect(this.router.isActive('/home', true)).toBe(false);
          done();
        });
      });
    });

    describe('with a query that also matches', function () {
      it('is active', function (done) {
        render(React.createElement(
          Router,
          { history: createHistory('/absolute?the=query') },
          React.createElement(
            Route,
            { path: '/home' },
            React.createElement(Route, { path: '/absolute' })
          )
        ), node, function () {
          expect(this.router.isActive({
            pathname: '/home',
            query: { the: 'query' }
          })).toBe(true);
          expect(this.router.isActive({
            pathname: '/home',
            query: { the: 'query' }
          }, true)).toBe(false);
          done();
        });
      });
    });

    describe('with a query that does not match', function () {
      it('is active', function (done) {
        render(React.createElement(
          Router,
          { history: createHistory('/absolute?the=query') },
          React.createElement(
            Route,
            { path: '/home' },
            React.createElement(Route, { path: '/absolute' })
          )
        ), node, function () {
          expect(this.router.isActive({
            pathname: '/home',
            query: { something: 'else' }
          })).toBe(false);
          expect(this.router.isActive({
            pathname: '/home',
            query: { something: 'else' }
          }, true)).toBe(false);
          done();
        });
      });
    });
  });

  describe('a pathname that matches a nested absolute path', function () {
    describe('with no query', function () {
      it('is active', function (done) {
        render(React.createElement(
          Router,
          { history: createHistory('/absolute') },
          React.createElement(
            Route,
            { path: '/home' },
            React.createElement(Route, { path: '/absolute' })
          )
        ), node, function () {
          expect(this.router.isActive('/absolute')).toBe(true);
          expect(this.router.isActive('/absolute', true)).toBe(true);
          done();
        });
      });
    });
  });

  describe('a pathname that matches an index URL', function () {
    describe('with no query', function () {
      it('is active', function (done) {
        render(React.createElement(
          Router,
          { history: createHistory('/home') },
          React.createElement(
            Route,
            { path: '/home' },
            React.createElement(IndexRoute, null)
          )
        ), node, function () {
          expect(this.router.isActive('/home')).toBe(true);
          expect(this.router.isActive('/home', true)).toBe(true);
          done();
        });
      });
    });

    describe('with a query that also matches', function () {
      it('is active', function (done) {
        render(React.createElement(
          Router,
          { history: createHistory('/home?the=query') },
          React.createElement(
            Route,
            { path: '/home' },
            React.createElement(IndexRoute, null)
          )
        ), node, function () {
          expect(this.router.isActive({
            pathname: '/home',
            query: { the: 'query' }
          })).toBe(true);
          expect(this.router.isActive({
            pathname: '/home',
            query: { the: 'query' }
          }, true)).toBe(true);
          done();
        });
      });
    });

    describe('with a query that does not match', function () {
      it('is not active', function (done) {
        render(React.createElement(
          Router,
          { history: createHistory('/home?the=query') },
          React.createElement(
            Route,
            { path: '/home' },
            React.createElement(IndexRoute, null)
          )
        ), node, function () {
          expect(this.router.isActive({
            pathname: '/home',
            query: { something: 'else' }
          })).toBe(false);
          expect(this.router.isActive({
            pathname: '/home',
            query: { something: 'else' }
          }, true)).toBe(false);
          done();
        });
      });
    });

    describe('with the index route nested under a pathless route', function () {
      it('is active', function (done) {
        render(React.createElement(
          Router,
          { history: createHistory('/home') },
          React.createElement(
            Route,
            { path: '/home' },
            React.createElement(
              Route,
              null,
              React.createElement(IndexRoute, null)
            )
          )
        ), node, function () {
          expect(this.router.isActive('/home')).toBe(true);
          expect(this.router.isActive('/home', true)).toBe(true);
          done();
        });
      });
    });

    describe('with a nested index route', function () {
      it('is active', function (done) {
        render(React.createElement(
          Router,
          { history: createHistory('/parent/child') },
          React.createElement(
            Route,
            { path: '/parent' },
            React.createElement(
              Route,
              { path: 'child' },
              React.createElement(IndexRoute, null)
            )
          )
        ), node, function () {
          expect(this.router.isActive('/parent/child')).toBe(true);
          expect(this.router.isActive('/parent/child', true)).toBe(true);
          done();
        });
      });

      it('is active with extraneous slashes', function (done) {
        render(React.createElement(
          Router,
          { history: createHistory('/parent/child') },
          React.createElement(
            Route,
            { path: '/parent' },
            React.createElement(
              Route,
              { path: 'child' },
              React.createElement(IndexRoute, null)
            )
          )
        ), node, function () {
          expect(this.router.isActive('/parent///child///')).toBe(true);
          expect(this.router.isActive('/parent///child///', true)).toBe(true);
          done();
        });
      });
    });

    describe('with a nested index route under a pathless route', function () {
      it('is active', function (done) {
        render(React.createElement(
          Router,
          { history: createHistory('/parent/child') },
          React.createElement(
            Route,
            { path: '/parent' },
            React.createElement(
              Route,
              { path: 'child' },
              React.createElement(
                Route,
                null,
                React.createElement(IndexRoute, null)
              )
            )
          )
        ), node, function () {
          expect(this.router.isActive('/parent/child')).toBe(true);
          expect(this.router.isActive('/parent/child', true)).toBe(true);
          done();
        });
      });

      it('is active with extraneous slashes', function (done) {
        render(React.createElement(
          Router,
          { history: createHistory('/parent/child') },
          React.createElement(
            Route,
            { path: '/parent' },
            React.createElement(
              Route,
              { path: 'child' },
              React.createElement(
                Route,
                null,
                React.createElement(IndexRoute, null)
              )
            )
          )
        ), node, function () {
          expect(this.router.isActive('/parent///child///')).toBe(true);
          expect(this.router.isActive('/parent///child///', true)).toBe(true);
          done();
        });
      });
    });
  });

  describe('a pathname that matches only the beginning of the URL', function () {
    it('is not active', function (done) {
      render(React.createElement(
        Router,
        { history: createHistory('/home') },
        React.createElement(Route, { path: '/home' })
      ), node, function () {
        expect(this.router.isActive('/h')).toBe(false);
        done();
      });
    });
  });

  describe('a pathname that matches the root URL only if it is a parent route', function () {
    it('is active', function (done) {
      render(React.createElement(
        Router,
        { history: createHistory('/home') },
        React.createElement(
          Route,
          { path: '/' },
          React.createElement(Route, { path: '/home' })
        )
      ), node, function () {
        expect(this.router.isActive('/')).toBe(true);
        done();
      });
    });
  });

  describe('a pathname that does not match the root URL if it is not a parent route', function () {
    it('is not active', function (done) {
      render(React.createElement(
        Router,
        { history: createHistory('/home') },
        React.createElement(Route, { path: '/' }),
        React.createElement(Route, { path: '/home' })
      ), node, function () {
        expect(this.router.isActive('/')).toBe(false);
        done();
      });
    });
  });

  describe('a pathname that matches URL', function () {
    describe('with query that does match', function () {
      it('is active', function (done) {
        render(React.createElement(
          Router,
          { history: createHistory('/home?foo=bar&foo=bar1&foo=bar2') },
          React.createElement(Route, { path: '/' }),
          React.createElement(Route, { path: '/home' })
        ), node, function () {
          expect(this.router.isActive({
            pathname: '/home',
            query: { foo: ['bar', 'bar1', 'bar2'] }
          })).toBe(true);
          done();
        });
      });
    });

    describe('with a custom parse function and a query that does not match', function () {
      it('is not active', function (done) {
        var history = createHistory({
          entries: ['/home?foo[1]=bar'],
          stringifyQuery: function stringifyQuery(params) {
            return qs.stringify(params, { arrayFormat: 'indices' });
          },
          parseQueryString: function parseQueryString(query) {
            return qs.parse(query, { parseArrays: false });
          }
        });

        render(React.createElement(
          Router,
          { history: history },
          React.createElement(Route, { path: '/' }),
          React.createElement(Route, { path: '/home' })
        ), node, function () {
          expect(this.router.isActive({
            pathname: '/home',
            query: { foo: { 4: 'bar' } }
          })).toBe(false);
          done();
        });
      });
    });

    describe('with a query with explicit undefined values', function () {
      it('matches missing query keys', function (done) {
        render(React.createElement(
          Router,
          { history: createHistory('/home?foo=1') },
          React.createElement(Route, { path: '/' }),
          React.createElement(Route, { path: '/home' })
        ), node, function () {
          expect(this.router.isActive({
            pathname: '/home',
            query: { foo: 1, bar: undefined }
          })).toBe(true);
          done();
        });
      });

      it('does not match a present query key', function (done) {
        render(React.createElement(
          Router,
          { history: createHistory('/home?foo=1&bar=') },
          React.createElement(Route, { path: '/' }),
          React.createElement(Route, { path: '/home' })
        ), node, function () {
          expect(this.router.isActive({
            pathname: '/home',
            query: { foo: 1, bar: undefined }
          })).toBe(false);
          done();
        });
      });
    });
  });

  describe('dynamic routes', function () {
    var routes = {
      path: '/',
      childRoutes: [{ path: 'foo' }],
      getIndexRoute: function getIndexRoute(location, callback) {
        setTimeout(function () {
          return callback(null, {});
        });
      }
    };

    describe('when not on index route', function () {
      it('does not show index as active', function (done) {
        render(React.createElement(Router, { history: createHistory('/foo'), routes: routes }), node, function () {
          expect(this.router.isActive('/')).toBe(true);
          expect(this.router.isActive('/', true)).toBe(false);
          expect(this.router.isActive('/foo')).toBe(true);
          done();
        });
      });
    });

    describe('when on index route', function () {
      it('shows index as active', function (done) {
        render(React.createElement(Router, { history: createHistory('/'), routes: routes }), node, function () {
          var _this = this;

          // Need to wait for async match to complete.
          setTimeout(function () {
            expect(_this.router.isActive('/')).toBe(true);
            expect(_this.router.isActive('/', true)).toBe(true);
            expect(_this.router.isActive('/foo')).toBe(false);
            done();
          });
        });
      });
    });
  });
});