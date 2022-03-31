'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _redux = require('redux');

var _reactRedux = require('react-redux');

var _ramda = require('ramda');

var _combineNamespacedProps = require('./combineNamespacedProps');

var _combineNamespacedProps2 = _interopRequireDefault(_combineNamespacedProps);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function connectModule(_ref, Component) {
  var _ref$namespace = _ref.namespace;
  var namespace = _ref$namespace === undefined ? '' : _ref$namespace;
  var actions = _ref.actions;
  var selector = _ref.selector;

  var curriedBind = (0, _ramda.curry)(_redux.bindActionCreators);

  return (0, _reactRedux.connect)(selector, curriedBind(actions), (0, _combineNamespacedProps2.default)(namespace))(Component);
}

exports.default = (0, _ramda.curry)(connectModule);