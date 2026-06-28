var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// node_modules/react/cjs/react-jsx-runtime.production.js
var require_react_jsx_runtime_production = __commonJS({
  "node_modules/react/cjs/react-jsx-runtime.production.js"(exports2) {
    "use strict";
    var REACT_ELEMENT_TYPE = /* @__PURE__ */ Symbol.for("react.transitional.element");
    var REACT_FRAGMENT_TYPE = /* @__PURE__ */ Symbol.for("react.fragment");
    function jsxProd(type, config, maybeKey) {
      var key = null;
      void 0 !== maybeKey && (key = "" + maybeKey);
      void 0 !== config.key && (key = "" + config.key);
      if ("key" in config) {
        maybeKey = {};
        for (var propName in config)
          "key" !== propName && (maybeKey[propName] = config[propName]);
      } else maybeKey = config;
      config = maybeKey.ref;
      return {
        $$typeof: REACT_ELEMENT_TYPE,
        type,
        key,
        ref: void 0 !== config ? config : null,
        props: maybeKey
      };
    }
    exports2.Fragment = REACT_FRAGMENT_TYPE;
    exports2.jsx = jsxProd;
    exports2.jsxs = jsxProd;
  }
});

// node_modules/react/cjs/react.production.js
var require_react_production = __commonJS({
  "node_modules/react/cjs/react.production.js"(exports2) {
    "use strict";
    var REACT_ELEMENT_TYPE = /* @__PURE__ */ Symbol.for("react.transitional.element");
    var REACT_PORTAL_TYPE = /* @__PURE__ */ Symbol.for("react.portal");
    var REACT_FRAGMENT_TYPE = /* @__PURE__ */ Symbol.for("react.fragment");
    var REACT_STRICT_MODE_TYPE = /* @__PURE__ */ Symbol.for("react.strict_mode");
    var REACT_PROFILER_TYPE = /* @__PURE__ */ Symbol.for("react.profiler");
    var REACT_CONSUMER_TYPE = /* @__PURE__ */ Symbol.for("react.consumer");
    var REACT_CONTEXT_TYPE = /* @__PURE__ */ Symbol.for("react.context");
    var REACT_FORWARD_REF_TYPE = /* @__PURE__ */ Symbol.for("react.forward_ref");
    var REACT_SUSPENSE_TYPE = /* @__PURE__ */ Symbol.for("react.suspense");
    var REACT_MEMO_TYPE = /* @__PURE__ */ Symbol.for("react.memo");
    var REACT_LAZY_TYPE = /* @__PURE__ */ Symbol.for("react.lazy");
    var REACT_ACTIVITY_TYPE = /* @__PURE__ */ Symbol.for("react.activity");
    var MAYBE_ITERATOR_SYMBOL = Symbol.iterator;
    function getIteratorFn(maybeIterable) {
      if (null === maybeIterable || "object" !== typeof maybeIterable) return null;
      maybeIterable = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable["@@iterator"];
      return "function" === typeof maybeIterable ? maybeIterable : null;
    }
    var ReactNoopUpdateQueue = {
      isMounted: function() {
        return false;
      },
      enqueueForceUpdate: function() {
      },
      enqueueReplaceState: function() {
      },
      enqueueSetState: function() {
      }
    };
    var assign = Object.assign;
    var emptyObject = {};
    function Component(props, context, updater) {
      this.props = props;
      this.context = context;
      this.refs = emptyObject;
      this.updater = updater || ReactNoopUpdateQueue;
    }
    Component.prototype.isReactComponent = {};
    Component.prototype.setState = function(partialState, callback) {
      if ("object" !== typeof partialState && "function" !== typeof partialState && null != partialState)
        throw Error(
          "takes an object of state variables to update or a function which returns an object of state variables."
        );
      this.updater.enqueueSetState(this, partialState, callback, "setState");
    };
    Component.prototype.forceUpdate = function(callback) {
      this.updater.enqueueForceUpdate(this, callback, "forceUpdate");
    };
    function ComponentDummy() {
    }
    ComponentDummy.prototype = Component.prototype;
    function PureComponent(props, context, updater) {
      this.props = props;
      this.context = context;
      this.refs = emptyObject;
      this.updater = updater || ReactNoopUpdateQueue;
    }
    var pureComponentPrototype = PureComponent.prototype = new ComponentDummy();
    pureComponentPrototype.constructor = PureComponent;
    assign(pureComponentPrototype, Component.prototype);
    pureComponentPrototype.isPureReactComponent = true;
    var isArrayImpl = Array.isArray;
    function noop() {
    }
    var ReactSharedInternals = { H: null, A: null, T: null, S: null };
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    function ReactElement(type, key, props) {
      var refProp = props.ref;
      return {
        $$typeof: REACT_ELEMENT_TYPE,
        type,
        key,
        ref: void 0 !== refProp ? refProp : null,
        props
      };
    }
    function cloneAndReplaceKey(oldElement, newKey) {
      return ReactElement(oldElement.type, newKey, oldElement.props);
    }
    function isValidElement(object) {
      return "object" === typeof object && null !== object && object.$$typeof === REACT_ELEMENT_TYPE;
    }
    function escape(key) {
      var escaperLookup = { "=": "=0", ":": "=2" };
      return "$" + key.replace(/[=:]/g, function(match) {
        return escaperLookup[match];
      });
    }
    var userProvidedKeyEscapeRegex = /\/+/g;
    function getElementKey(element, index) {
      return "object" === typeof element && null !== element && null != element.key ? escape("" + element.key) : index.toString(36);
    }
    function resolveThenable(thenable) {
      switch (thenable.status) {
        case "fulfilled":
          return thenable.value;
        case "rejected":
          throw thenable.reason;
        default:
          switch ("string" === typeof thenable.status ? thenable.then(noop, noop) : (thenable.status = "pending", thenable.then(
            function(fulfilledValue) {
              "pending" === thenable.status && (thenable.status = "fulfilled", thenable.value = fulfilledValue);
            },
            function(error) {
              "pending" === thenable.status && (thenable.status = "rejected", thenable.reason = error);
            }
          )), thenable.status) {
            case "fulfilled":
              return thenable.value;
            case "rejected":
              throw thenable.reason;
          }
      }
      throw thenable;
    }
    function mapIntoArray(children, array, escapedPrefix, nameSoFar, callback) {
      var type = typeof children;
      if ("undefined" === type || "boolean" === type) children = null;
      var invokeCallback = false;
      if (null === children) invokeCallback = true;
      else
        switch (type) {
          case "bigint":
          case "string":
          case "number":
            invokeCallback = true;
            break;
          case "object":
            switch (children.$$typeof) {
              case REACT_ELEMENT_TYPE:
              case REACT_PORTAL_TYPE:
                invokeCallback = true;
                break;
              case REACT_LAZY_TYPE:
                return invokeCallback = children._init, mapIntoArray(
                  invokeCallback(children._payload),
                  array,
                  escapedPrefix,
                  nameSoFar,
                  callback
                );
            }
        }
      if (invokeCallback)
        return callback = callback(children), invokeCallback = "" === nameSoFar ? "." + getElementKey(children, 0) : nameSoFar, isArrayImpl(callback) ? (escapedPrefix = "", null != invokeCallback && (escapedPrefix = invokeCallback.replace(userProvidedKeyEscapeRegex, "$&/") + "/"), mapIntoArray(callback, array, escapedPrefix, "", function(c) {
          return c;
        })) : null != callback && (isValidElement(callback) && (callback = cloneAndReplaceKey(
          callback,
          escapedPrefix + (null == callback.key || children && children.key === callback.key ? "" : ("" + callback.key).replace(
            userProvidedKeyEscapeRegex,
            "$&/"
          ) + "/") + invokeCallback
        )), array.push(callback)), 1;
      invokeCallback = 0;
      var nextNamePrefix = "" === nameSoFar ? "." : nameSoFar + ":";
      if (isArrayImpl(children))
        for (var i = 0; i < children.length; i++)
          nameSoFar = children[i], type = nextNamePrefix + getElementKey(nameSoFar, i), invokeCallback += mapIntoArray(
            nameSoFar,
            array,
            escapedPrefix,
            type,
            callback
          );
      else if (i = getIteratorFn(children), "function" === typeof i)
        for (children = i.call(children), i = 0; !(nameSoFar = children.next()).done; )
          nameSoFar = nameSoFar.value, type = nextNamePrefix + getElementKey(nameSoFar, i++), invokeCallback += mapIntoArray(
            nameSoFar,
            array,
            escapedPrefix,
            type,
            callback
          );
      else if ("object" === type) {
        if ("function" === typeof children.then)
          return mapIntoArray(
            resolveThenable(children),
            array,
            escapedPrefix,
            nameSoFar,
            callback
          );
        array = String(children);
        throw Error(
          "Objects are not valid as a React child (found: " + ("[object Object]" === array ? "object with keys {" + Object.keys(children).join(", ") + "}" : array) + "). If you meant to render a collection of children, use an array instead."
        );
      }
      return invokeCallback;
    }
    function mapChildren(children, func, context) {
      if (null == children) return children;
      var result = [], count = 0;
      mapIntoArray(children, result, "", "", function(child) {
        return func.call(context, child, count++);
      });
      return result;
    }
    function lazyInitializer(payload) {
      if (-1 === payload._status) {
        var ctor = payload._result;
        ctor = ctor();
        ctor.then(
          function(moduleObject) {
            if (0 === payload._status || -1 === payload._status)
              payload._status = 1, payload._result = moduleObject;
          },
          function(error) {
            if (0 === payload._status || -1 === payload._status)
              payload._status = 2, payload._result = error;
          }
        );
        -1 === payload._status && (payload._status = 0, payload._result = ctor);
      }
      if (1 === payload._status) return payload._result.default;
      throw payload._result;
    }
    var reportGlobalError = "function" === typeof reportError ? reportError : function(error) {
      if ("object" === typeof window && "function" === typeof window.ErrorEvent) {
        var event = new window.ErrorEvent("error", {
          bubbles: true,
          cancelable: true,
          message: "object" === typeof error && null !== error && "string" === typeof error.message ? String(error.message) : String(error),
          error
        });
        if (!window.dispatchEvent(event)) return;
      } else if ("object" === typeof process && "function" === typeof process.emit) {
        process.emit("uncaughtException", error);
        return;
      }
      console.error(error);
    };
    var Children = {
      map: mapChildren,
      forEach: function(children, forEachFunc, forEachContext) {
        mapChildren(
          children,
          function() {
            forEachFunc.apply(this, arguments);
          },
          forEachContext
        );
      },
      count: function(children) {
        var n = 0;
        mapChildren(children, function() {
          n++;
        });
        return n;
      },
      toArray: function(children) {
        return mapChildren(children, function(child) {
          return child;
        }) || [];
      },
      only: function(children) {
        if (!isValidElement(children))
          throw Error(
            "React.Children.only expected to receive a single React element child."
          );
        return children;
      }
    };
    exports2.Activity = REACT_ACTIVITY_TYPE;
    exports2.Children = Children;
    exports2.Component = Component;
    exports2.Fragment = REACT_FRAGMENT_TYPE;
    exports2.Profiler = REACT_PROFILER_TYPE;
    exports2.PureComponent = PureComponent;
    exports2.StrictMode = REACT_STRICT_MODE_TYPE;
    exports2.Suspense = REACT_SUSPENSE_TYPE;
    exports2.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = ReactSharedInternals;
    exports2.__COMPILER_RUNTIME = {
      __proto__: null,
      c: function(size) {
        return ReactSharedInternals.H.useMemoCache(size);
      }
    };
    exports2.cache = function(fn) {
      return function() {
        return fn.apply(null, arguments);
      };
    };
    exports2.cacheSignal = function() {
      return null;
    };
    exports2.cloneElement = function(element, config, children) {
      if (null === element || void 0 === element)
        throw Error(
          "The argument must be a React element, but you passed " + element + "."
        );
      var props = assign({}, element.props), key = element.key;
      if (null != config)
        for (propName in void 0 !== config.key && (key = "" + config.key), config)
          !hasOwnProperty.call(config, propName) || "key" === propName || "__self" === propName || "__source" === propName || "ref" === propName && void 0 === config.ref || (props[propName] = config[propName]);
      var propName = arguments.length - 2;
      if (1 === propName) props.children = children;
      else if (1 < propName) {
        for (var childArray = Array(propName), i = 0; i < propName; i++)
          childArray[i] = arguments[i + 2];
        props.children = childArray;
      }
      return ReactElement(element.type, key, props);
    };
    exports2.createContext = function(defaultValue) {
      defaultValue = {
        $$typeof: REACT_CONTEXT_TYPE,
        _currentValue: defaultValue,
        _currentValue2: defaultValue,
        _threadCount: 0,
        Provider: null,
        Consumer: null
      };
      defaultValue.Provider = defaultValue;
      defaultValue.Consumer = {
        $$typeof: REACT_CONSUMER_TYPE,
        _context: defaultValue
      };
      return defaultValue;
    };
    exports2.createElement = function(type, config, children) {
      var propName, props = {}, key = null;
      if (null != config)
        for (propName in void 0 !== config.key && (key = "" + config.key), config)
          hasOwnProperty.call(config, propName) && "key" !== propName && "__self" !== propName && "__source" !== propName && (props[propName] = config[propName]);
      var childrenLength = arguments.length - 2;
      if (1 === childrenLength) props.children = children;
      else if (1 < childrenLength) {
        for (var childArray = Array(childrenLength), i = 0; i < childrenLength; i++)
          childArray[i] = arguments[i + 2];
        props.children = childArray;
      }
      if (type && type.defaultProps)
        for (propName in childrenLength = type.defaultProps, childrenLength)
          void 0 === props[propName] && (props[propName] = childrenLength[propName]);
      return ReactElement(type, key, props);
    };
    exports2.createRef = function() {
      return { current: null };
    };
    exports2.forwardRef = function(render) {
      return { $$typeof: REACT_FORWARD_REF_TYPE, render };
    };
    exports2.isValidElement = isValidElement;
    exports2.lazy = function(ctor) {
      return {
        $$typeof: REACT_LAZY_TYPE,
        _payload: { _status: -1, _result: ctor },
        _init: lazyInitializer
      };
    };
    exports2.memo = function(type, compare) {
      return {
        $$typeof: REACT_MEMO_TYPE,
        type,
        compare: void 0 === compare ? null : compare
      };
    };
    exports2.startTransition = function(scope) {
      var prevTransition = ReactSharedInternals.T, currentTransition = {};
      ReactSharedInternals.T = currentTransition;
      try {
        var returnValue = scope(), onStartTransitionFinish = ReactSharedInternals.S;
        null !== onStartTransitionFinish && onStartTransitionFinish(currentTransition, returnValue);
        "object" === typeof returnValue && null !== returnValue && "function" === typeof returnValue.then && returnValue.then(noop, reportGlobalError);
      } catch (error) {
        reportGlobalError(error);
      } finally {
        null !== prevTransition && null !== currentTransition.types && (prevTransition.types = currentTransition.types), ReactSharedInternals.T = prevTransition;
      }
    };
    exports2.unstable_useCacheRefresh = function() {
      return ReactSharedInternals.H.useCacheRefresh();
    };
    exports2.use = function(usable) {
      return ReactSharedInternals.H.use(usable);
    };
    exports2.useActionState = function(action, initialState, permalink) {
      return ReactSharedInternals.H.useActionState(action, initialState, permalink);
    };
    exports2.useCallback = function(callback, deps) {
      return ReactSharedInternals.H.useCallback(callback, deps);
    };
    exports2.useContext = function(Context) {
      return ReactSharedInternals.H.useContext(Context);
    };
    exports2.useDebugValue = function() {
    };
    exports2.useDeferredValue = function(value, initialValue) {
      return ReactSharedInternals.H.useDeferredValue(value, initialValue);
    };
    exports2.useEffect = function(create, deps) {
      return ReactSharedInternals.H.useEffect(create, deps);
    };
    exports2.useEffectEvent = function(callback) {
      return ReactSharedInternals.H.useEffectEvent(callback);
    };
    exports2.useId = function() {
      return ReactSharedInternals.H.useId();
    };
    exports2.useImperativeHandle = function(ref, create, deps) {
      return ReactSharedInternals.H.useImperativeHandle(ref, create, deps);
    };
    exports2.useInsertionEffect = function(create, deps) {
      return ReactSharedInternals.H.useInsertionEffect(create, deps);
    };
    exports2.useLayoutEffect = function(create, deps) {
      return ReactSharedInternals.H.useLayoutEffect(create, deps);
    };
    exports2.useMemo = function(create, deps) {
      return ReactSharedInternals.H.useMemo(create, deps);
    };
    exports2.useOptimistic = function(passthrough, reducer) {
      return ReactSharedInternals.H.useOptimistic(passthrough, reducer);
    };
    exports2.useReducer = function(reducer, initialArg, init) {
      return ReactSharedInternals.H.useReducer(reducer, initialArg, init);
    };
    exports2.useRef = function(initialValue) {
      return ReactSharedInternals.H.useRef(initialValue);
    };
    exports2.useState = function(initialState) {
      return ReactSharedInternals.H.useState(initialState);
    };
    exports2.useSyncExternalStore = function(subscribe, getSnapshot, getServerSnapshot) {
      return ReactSharedInternals.H.useSyncExternalStore(
        subscribe,
        getSnapshot,
        getServerSnapshot
      );
    };
    exports2.useTransition = function() {
      return ReactSharedInternals.H.useTransition();
    };
    exports2.version = "19.2.4";
  }
});

// node_modules/react/cjs/react.development.js
var require_react_development = __commonJS({
  "node_modules/react/cjs/react.development.js"(exports2, module2) {
    "use strict";
    "production" !== process.env.NODE_ENV && (function() {
      function defineDeprecationWarning(methodName, info) {
        Object.defineProperty(Component.prototype, methodName, {
          get: function() {
            console.warn(
              "%s(...) is deprecated in plain JavaScript React classes. %s",
              info[0],
              info[1]
            );
          }
        });
      }
      function getIteratorFn(maybeIterable) {
        if (null === maybeIterable || "object" !== typeof maybeIterable)
          return null;
        maybeIterable = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable["@@iterator"];
        return "function" === typeof maybeIterable ? maybeIterable : null;
      }
      function warnNoop(publicInstance, callerName) {
        publicInstance = (publicInstance = publicInstance.constructor) && (publicInstance.displayName || publicInstance.name) || "ReactClass";
        var warningKey = publicInstance + "." + callerName;
        didWarnStateUpdateForUnmountedComponent[warningKey] || (console.error(
          "Can't call %s on a component that is not yet mounted. This is a no-op, but it might indicate a bug in your application. Instead, assign to `this.state` directly or define a `state = {};` class property with the desired state in the %s component.",
          callerName,
          publicInstance
        ), didWarnStateUpdateForUnmountedComponent[warningKey] = true);
      }
      function Component(props, context, updater) {
        this.props = props;
        this.context = context;
        this.refs = emptyObject;
        this.updater = updater || ReactNoopUpdateQueue;
      }
      function ComponentDummy() {
      }
      function PureComponent(props, context, updater) {
        this.props = props;
        this.context = context;
        this.refs = emptyObject;
        this.updater = updater || ReactNoopUpdateQueue;
      }
      function noop() {
      }
      function testStringCoercion(value) {
        return "" + value;
      }
      function checkKeyStringCoercion(value) {
        try {
          testStringCoercion(value);
          var JSCompiler_inline_result = false;
        } catch (e) {
          JSCompiler_inline_result = true;
        }
        if (JSCompiler_inline_result) {
          JSCompiler_inline_result = console;
          var JSCompiler_temp_const = JSCompiler_inline_result.error;
          var JSCompiler_inline_result$jscomp$0 = "function" === typeof Symbol && Symbol.toStringTag && value[Symbol.toStringTag] || value.constructor.name || "Object";
          JSCompiler_temp_const.call(
            JSCompiler_inline_result,
            "The provided key is an unsupported type %s. This value must be coerced to a string before using it here.",
            JSCompiler_inline_result$jscomp$0
          );
          return testStringCoercion(value);
        }
      }
      function getComponentNameFromType(type) {
        if (null == type) return null;
        if ("function" === typeof type)
          return type.$$typeof === REACT_CLIENT_REFERENCE ? null : type.displayName || type.name || null;
        if ("string" === typeof type) return type;
        switch (type) {
          case REACT_FRAGMENT_TYPE:
            return "Fragment";
          case REACT_PROFILER_TYPE:
            return "Profiler";
          case REACT_STRICT_MODE_TYPE:
            return "StrictMode";
          case REACT_SUSPENSE_TYPE:
            return "Suspense";
          case REACT_SUSPENSE_LIST_TYPE:
            return "SuspenseList";
          case REACT_ACTIVITY_TYPE:
            return "Activity";
        }
        if ("object" === typeof type)
          switch ("number" === typeof type.tag && console.error(
            "Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."
          ), type.$$typeof) {
            case REACT_PORTAL_TYPE:
              return "Portal";
            case REACT_CONTEXT_TYPE:
              return type.displayName || "Context";
            case REACT_CONSUMER_TYPE:
              return (type._context.displayName || "Context") + ".Consumer";
            case REACT_FORWARD_REF_TYPE:
              var innerType = type.render;
              type = type.displayName;
              type || (type = innerType.displayName || innerType.name || "", type = "" !== type ? "ForwardRef(" + type + ")" : "ForwardRef");
              return type;
            case REACT_MEMO_TYPE:
              return innerType = type.displayName || null, null !== innerType ? innerType : getComponentNameFromType(type.type) || "Memo";
            case REACT_LAZY_TYPE:
              innerType = type._payload;
              type = type._init;
              try {
                return getComponentNameFromType(type(innerType));
              } catch (x) {
              }
          }
        return null;
      }
      function getTaskName(type) {
        if (type === REACT_FRAGMENT_TYPE) return "<>";
        if ("object" === typeof type && null !== type && type.$$typeof === REACT_LAZY_TYPE)
          return "<...>";
        try {
          var name = getComponentNameFromType(type);
          return name ? "<" + name + ">" : "<...>";
        } catch (x) {
          return "<...>";
        }
      }
      function getOwner() {
        var dispatcher = ReactSharedInternals.A;
        return null === dispatcher ? null : dispatcher.getOwner();
      }
      function UnknownOwner() {
        return Error("react-stack-top-frame");
      }
      function hasValidKey(config) {
        if (hasOwnProperty.call(config, "key")) {
          var getter = Object.getOwnPropertyDescriptor(config, "key").get;
          if (getter && getter.isReactWarning) return false;
        }
        return void 0 !== config.key;
      }
      function defineKeyPropWarningGetter(props, displayName) {
        function warnAboutAccessingKey() {
          specialPropKeyWarningShown || (specialPropKeyWarningShown = true, console.error(
            "%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)",
            displayName
          ));
        }
        warnAboutAccessingKey.isReactWarning = true;
        Object.defineProperty(props, "key", {
          get: warnAboutAccessingKey,
          configurable: true
        });
      }
      function elementRefGetterWithDeprecationWarning() {
        var componentName = getComponentNameFromType(this.type);
        didWarnAboutElementRef[componentName] || (didWarnAboutElementRef[componentName] = true, console.error(
          "Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release."
        ));
        componentName = this.props.ref;
        return void 0 !== componentName ? componentName : null;
      }
      function ReactElement(type, key, props, owner, debugStack, debugTask) {
        var refProp = props.ref;
        type = {
          $$typeof: REACT_ELEMENT_TYPE,
          type,
          key,
          props,
          _owner: owner
        };
        null !== (void 0 !== refProp ? refProp : null) ? Object.defineProperty(type, "ref", {
          enumerable: false,
          get: elementRefGetterWithDeprecationWarning
        }) : Object.defineProperty(type, "ref", { enumerable: false, value: null });
        type._store = {};
        Object.defineProperty(type._store, "validated", {
          configurable: false,
          enumerable: false,
          writable: true,
          value: 0
        });
        Object.defineProperty(type, "_debugInfo", {
          configurable: false,
          enumerable: false,
          writable: true,
          value: null
        });
        Object.defineProperty(type, "_debugStack", {
          configurable: false,
          enumerable: false,
          writable: true,
          value: debugStack
        });
        Object.defineProperty(type, "_debugTask", {
          configurable: false,
          enumerable: false,
          writable: true,
          value: debugTask
        });
        Object.freeze && (Object.freeze(type.props), Object.freeze(type));
        return type;
      }
      function cloneAndReplaceKey(oldElement, newKey) {
        newKey = ReactElement(
          oldElement.type,
          newKey,
          oldElement.props,
          oldElement._owner,
          oldElement._debugStack,
          oldElement._debugTask
        );
        oldElement._store && (newKey._store.validated = oldElement._store.validated);
        return newKey;
      }
      function validateChildKeys(node) {
        isValidElement(node) ? node._store && (node._store.validated = 1) : "object" === typeof node && null !== node && node.$$typeof === REACT_LAZY_TYPE && ("fulfilled" === node._payload.status ? isValidElement(node._payload.value) && node._payload.value._store && (node._payload.value._store.validated = 1) : node._store && (node._store.validated = 1));
      }
      function isValidElement(object) {
        return "object" === typeof object && null !== object && object.$$typeof === REACT_ELEMENT_TYPE;
      }
      function escape(key) {
        var escaperLookup = { "=": "=0", ":": "=2" };
        return "$" + key.replace(/[=:]/g, function(match) {
          return escaperLookup[match];
        });
      }
      function getElementKey(element, index) {
        return "object" === typeof element && null !== element && null != element.key ? (checkKeyStringCoercion(element.key), escape("" + element.key)) : index.toString(36);
      }
      function resolveThenable(thenable) {
        switch (thenable.status) {
          case "fulfilled":
            return thenable.value;
          case "rejected":
            throw thenable.reason;
          default:
            switch ("string" === typeof thenable.status ? thenable.then(noop, noop) : (thenable.status = "pending", thenable.then(
              function(fulfilledValue) {
                "pending" === thenable.status && (thenable.status = "fulfilled", thenable.value = fulfilledValue);
              },
              function(error) {
                "pending" === thenable.status && (thenable.status = "rejected", thenable.reason = error);
              }
            )), thenable.status) {
              case "fulfilled":
                return thenable.value;
              case "rejected":
                throw thenable.reason;
            }
        }
        throw thenable;
      }
      function mapIntoArray(children, array, escapedPrefix, nameSoFar, callback) {
        var type = typeof children;
        if ("undefined" === type || "boolean" === type) children = null;
        var invokeCallback = false;
        if (null === children) invokeCallback = true;
        else
          switch (type) {
            case "bigint":
            case "string":
            case "number":
              invokeCallback = true;
              break;
            case "object":
              switch (children.$$typeof) {
                case REACT_ELEMENT_TYPE:
                case REACT_PORTAL_TYPE:
                  invokeCallback = true;
                  break;
                case REACT_LAZY_TYPE:
                  return invokeCallback = children._init, mapIntoArray(
                    invokeCallback(children._payload),
                    array,
                    escapedPrefix,
                    nameSoFar,
                    callback
                  );
              }
          }
        if (invokeCallback) {
          invokeCallback = children;
          callback = callback(invokeCallback);
          var childKey = "" === nameSoFar ? "." + getElementKey(invokeCallback, 0) : nameSoFar;
          isArrayImpl(callback) ? (escapedPrefix = "", null != childKey && (escapedPrefix = childKey.replace(userProvidedKeyEscapeRegex, "$&/") + "/"), mapIntoArray(callback, array, escapedPrefix, "", function(c) {
            return c;
          })) : null != callback && (isValidElement(callback) && (null != callback.key && (invokeCallback && invokeCallback.key === callback.key || checkKeyStringCoercion(callback.key)), escapedPrefix = cloneAndReplaceKey(
            callback,
            escapedPrefix + (null == callback.key || invokeCallback && invokeCallback.key === callback.key ? "" : ("" + callback.key).replace(
              userProvidedKeyEscapeRegex,
              "$&/"
            ) + "/") + childKey
          ), "" !== nameSoFar && null != invokeCallback && isValidElement(invokeCallback) && null == invokeCallback.key && invokeCallback._store && !invokeCallback._store.validated && (escapedPrefix._store.validated = 2), callback = escapedPrefix), array.push(callback));
          return 1;
        }
        invokeCallback = 0;
        childKey = "" === nameSoFar ? "." : nameSoFar + ":";
        if (isArrayImpl(children))
          for (var i = 0; i < children.length; i++)
            nameSoFar = children[i], type = childKey + getElementKey(nameSoFar, i), invokeCallback += mapIntoArray(
              nameSoFar,
              array,
              escapedPrefix,
              type,
              callback
            );
        else if (i = getIteratorFn(children), "function" === typeof i)
          for (i === children.entries && (didWarnAboutMaps || console.warn(
            "Using Maps as children is not supported. Use an array of keyed ReactElements instead."
          ), didWarnAboutMaps = true), children = i.call(children), i = 0; !(nameSoFar = children.next()).done; )
            nameSoFar = nameSoFar.value, type = childKey + getElementKey(nameSoFar, i++), invokeCallback += mapIntoArray(
              nameSoFar,
              array,
              escapedPrefix,
              type,
              callback
            );
        else if ("object" === type) {
          if ("function" === typeof children.then)
            return mapIntoArray(
              resolveThenable(children),
              array,
              escapedPrefix,
              nameSoFar,
              callback
            );
          array = String(children);
          throw Error(
            "Objects are not valid as a React child (found: " + ("[object Object]" === array ? "object with keys {" + Object.keys(children).join(", ") + "}" : array) + "). If you meant to render a collection of children, use an array instead."
          );
        }
        return invokeCallback;
      }
      function mapChildren(children, func, context) {
        if (null == children) return children;
        var result = [], count = 0;
        mapIntoArray(children, result, "", "", function(child) {
          return func.call(context, child, count++);
        });
        return result;
      }
      function lazyInitializer(payload) {
        if (-1 === payload._status) {
          var ioInfo = payload._ioInfo;
          null != ioInfo && (ioInfo.start = ioInfo.end = performance.now());
          ioInfo = payload._result;
          var thenable = ioInfo();
          thenable.then(
            function(moduleObject) {
              if (0 === payload._status || -1 === payload._status) {
                payload._status = 1;
                payload._result = moduleObject;
                var _ioInfo = payload._ioInfo;
                null != _ioInfo && (_ioInfo.end = performance.now());
                void 0 === thenable.status && (thenable.status = "fulfilled", thenable.value = moduleObject);
              }
            },
            function(error) {
              if (0 === payload._status || -1 === payload._status) {
                payload._status = 2;
                payload._result = error;
                var _ioInfo2 = payload._ioInfo;
                null != _ioInfo2 && (_ioInfo2.end = performance.now());
                void 0 === thenable.status && (thenable.status = "rejected", thenable.reason = error);
              }
            }
          );
          ioInfo = payload._ioInfo;
          if (null != ioInfo) {
            ioInfo.value = thenable;
            var displayName = thenable.displayName;
            "string" === typeof displayName && (ioInfo.name = displayName);
          }
          -1 === payload._status && (payload._status = 0, payload._result = thenable);
        }
        if (1 === payload._status)
          return ioInfo = payload._result, void 0 === ioInfo && console.error(
            "lazy: Expected the result of a dynamic import() call. Instead received: %s\n\nYour code should look like: \n  const MyComponent = lazy(() => import('./MyComponent'))\n\nDid you accidentally put curly braces around the import?",
            ioInfo
          ), "default" in ioInfo || console.error(
            "lazy: Expected the result of a dynamic import() call. Instead received: %s\n\nYour code should look like: \n  const MyComponent = lazy(() => import('./MyComponent'))",
            ioInfo
          ), ioInfo.default;
        throw payload._result;
      }
      function resolveDispatcher() {
        var dispatcher = ReactSharedInternals.H;
        null === dispatcher && console.error(
          "Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:\n1. You might have mismatching versions of React and the renderer (such as React DOM)\n2. You might be breaking the Rules of Hooks\n3. You might have more than one copy of React in the same app\nSee https://react.dev/link/invalid-hook-call for tips about how to debug and fix this problem."
        );
        return dispatcher;
      }
      function releaseAsyncTransition() {
        ReactSharedInternals.asyncTransitions--;
      }
      function enqueueTask(task) {
        if (null === enqueueTaskImpl)
          try {
            var requireString = ("require" + Math.random()).slice(0, 7);
            enqueueTaskImpl = (module2 && module2[requireString]).call(
              module2,
              "timers"
            ).setImmediate;
          } catch (_err) {
            enqueueTaskImpl = function(callback) {
              false === didWarnAboutMessageChannel && (didWarnAboutMessageChannel = true, "undefined" === typeof MessageChannel && console.error(
                "This browser does not have a MessageChannel implementation, so enqueuing tasks via await act(async () => ...) will fail. Please file an issue at https://github.com/facebook/react/issues if you encounter this warning."
              ));
              var channel = new MessageChannel();
              channel.port1.onmessage = callback;
              channel.port2.postMessage(void 0);
            };
          }
        return enqueueTaskImpl(task);
      }
      function aggregateErrors(errors) {
        return 1 < errors.length && "function" === typeof AggregateError ? new AggregateError(errors) : errors[0];
      }
      function popActScope(prevActQueue, prevActScopeDepth) {
        prevActScopeDepth !== actScopeDepth - 1 && console.error(
          "You seem to have overlapping act() calls, this is not supported. Be sure to await previous act() calls before making a new one. "
        );
        actScopeDepth = prevActScopeDepth;
      }
      function recursivelyFlushAsyncActWork(returnValue, resolve, reject) {
        var queue = ReactSharedInternals.actQueue;
        if (null !== queue)
          if (0 !== queue.length)
            try {
              flushActQueue(queue);
              enqueueTask(function() {
                return recursivelyFlushAsyncActWork(returnValue, resolve, reject);
              });
              return;
            } catch (error) {
              ReactSharedInternals.thrownErrors.push(error);
            }
          else ReactSharedInternals.actQueue = null;
        0 < ReactSharedInternals.thrownErrors.length ? (queue = aggregateErrors(ReactSharedInternals.thrownErrors), ReactSharedInternals.thrownErrors.length = 0, reject(queue)) : resolve(returnValue);
      }
      function flushActQueue(queue) {
        if (!isFlushing) {
          isFlushing = true;
          var i = 0;
          try {
            for (; i < queue.length; i++) {
              var callback = queue[i];
              do {
                ReactSharedInternals.didUsePromise = false;
                var continuation = callback(false);
                if (null !== continuation) {
                  if (ReactSharedInternals.didUsePromise) {
                    queue[i] = callback;
                    queue.splice(0, i);
                    return;
                  }
                  callback = continuation;
                } else break;
              } while (1);
            }
            queue.length = 0;
          } catch (error) {
            queue.splice(0, i + 1), ReactSharedInternals.thrownErrors.push(error);
          } finally {
            isFlushing = false;
          }
        }
      }
      "undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ && "function" === typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(Error());
      var REACT_ELEMENT_TYPE = /* @__PURE__ */ Symbol.for("react.transitional.element"), REACT_PORTAL_TYPE = /* @__PURE__ */ Symbol.for("react.portal"), REACT_FRAGMENT_TYPE = /* @__PURE__ */ Symbol.for("react.fragment"), REACT_STRICT_MODE_TYPE = /* @__PURE__ */ Symbol.for("react.strict_mode"), REACT_PROFILER_TYPE = /* @__PURE__ */ Symbol.for("react.profiler"), REACT_CONSUMER_TYPE = /* @__PURE__ */ Symbol.for("react.consumer"), REACT_CONTEXT_TYPE = /* @__PURE__ */ Symbol.for("react.context"), REACT_FORWARD_REF_TYPE = /* @__PURE__ */ Symbol.for("react.forward_ref"), REACT_SUSPENSE_TYPE = /* @__PURE__ */ Symbol.for("react.suspense"), REACT_SUSPENSE_LIST_TYPE = /* @__PURE__ */ Symbol.for("react.suspense_list"), REACT_MEMO_TYPE = /* @__PURE__ */ Symbol.for("react.memo"), REACT_LAZY_TYPE = /* @__PURE__ */ Symbol.for("react.lazy"), REACT_ACTIVITY_TYPE = /* @__PURE__ */ Symbol.for("react.activity"), MAYBE_ITERATOR_SYMBOL = Symbol.iterator, didWarnStateUpdateForUnmountedComponent = {}, ReactNoopUpdateQueue = {
        isMounted: function() {
          return false;
        },
        enqueueForceUpdate: function(publicInstance) {
          warnNoop(publicInstance, "forceUpdate");
        },
        enqueueReplaceState: function(publicInstance) {
          warnNoop(publicInstance, "replaceState");
        },
        enqueueSetState: function(publicInstance) {
          warnNoop(publicInstance, "setState");
        }
      }, assign = Object.assign, emptyObject = {};
      Object.freeze(emptyObject);
      Component.prototype.isReactComponent = {};
      Component.prototype.setState = function(partialState, callback) {
        if ("object" !== typeof partialState && "function" !== typeof partialState && null != partialState)
          throw Error(
            "takes an object of state variables to update or a function which returns an object of state variables."
          );
        this.updater.enqueueSetState(this, partialState, callback, "setState");
      };
      Component.prototype.forceUpdate = function(callback) {
        this.updater.enqueueForceUpdate(this, callback, "forceUpdate");
      };
      var deprecatedAPIs = {
        isMounted: [
          "isMounted",
          "Instead, make sure to clean up subscriptions and pending requests in componentWillUnmount to prevent memory leaks."
        ],
        replaceState: [
          "replaceState",
          "Refactor your code to use setState instead (see https://github.com/facebook/react/issues/3236)."
        ]
      };
      for (fnName in deprecatedAPIs)
        deprecatedAPIs.hasOwnProperty(fnName) && defineDeprecationWarning(fnName, deprecatedAPIs[fnName]);
      ComponentDummy.prototype = Component.prototype;
      deprecatedAPIs = PureComponent.prototype = new ComponentDummy();
      deprecatedAPIs.constructor = PureComponent;
      assign(deprecatedAPIs, Component.prototype);
      deprecatedAPIs.isPureReactComponent = true;
      var isArrayImpl = Array.isArray, REACT_CLIENT_REFERENCE = /* @__PURE__ */ Symbol.for("react.client.reference"), ReactSharedInternals = {
        H: null,
        A: null,
        T: null,
        S: null,
        actQueue: null,
        asyncTransitions: 0,
        isBatchingLegacy: false,
        didScheduleLegacyUpdate: false,
        didUsePromise: false,
        thrownErrors: [],
        getCurrentStack: null,
        recentlyCreatedOwnerStacks: 0
      }, hasOwnProperty = Object.prototype.hasOwnProperty, createTask = console.createTask ? console.createTask : function() {
        return null;
      };
      deprecatedAPIs = {
        react_stack_bottom_frame: function(callStackForError) {
          return callStackForError();
        }
      };
      var specialPropKeyWarningShown, didWarnAboutOldJSXRuntime;
      var didWarnAboutElementRef = {};
      var unknownOwnerDebugStack = deprecatedAPIs.react_stack_bottom_frame.bind(
        deprecatedAPIs,
        UnknownOwner
      )();
      var unknownOwnerDebugTask = createTask(getTaskName(UnknownOwner));
      var didWarnAboutMaps = false, userProvidedKeyEscapeRegex = /\/+/g, reportGlobalError = "function" === typeof reportError ? reportError : function(error) {
        if ("object" === typeof window && "function" === typeof window.ErrorEvent) {
          var event = new window.ErrorEvent("error", {
            bubbles: true,
            cancelable: true,
            message: "object" === typeof error && null !== error && "string" === typeof error.message ? String(error.message) : String(error),
            error
          });
          if (!window.dispatchEvent(event)) return;
        } else if ("object" === typeof process && "function" === typeof process.emit) {
          process.emit("uncaughtException", error);
          return;
        }
        console.error(error);
      }, didWarnAboutMessageChannel = false, enqueueTaskImpl = null, actScopeDepth = 0, didWarnNoAwaitAct = false, isFlushing = false, queueSeveralMicrotasks = "function" === typeof queueMicrotask ? function(callback) {
        queueMicrotask(function() {
          return queueMicrotask(callback);
        });
      } : enqueueTask;
      deprecatedAPIs = Object.freeze({
        __proto__: null,
        c: function(size) {
          return resolveDispatcher().useMemoCache(size);
        }
      });
      var fnName = {
        map: mapChildren,
        forEach: function(children, forEachFunc, forEachContext) {
          mapChildren(
            children,
            function() {
              forEachFunc.apply(this, arguments);
            },
            forEachContext
          );
        },
        count: function(children) {
          var n = 0;
          mapChildren(children, function() {
            n++;
          });
          return n;
        },
        toArray: function(children) {
          return mapChildren(children, function(child) {
            return child;
          }) || [];
        },
        only: function(children) {
          if (!isValidElement(children))
            throw Error(
              "React.Children.only expected to receive a single React element child."
            );
          return children;
        }
      };
      exports2.Activity = REACT_ACTIVITY_TYPE;
      exports2.Children = fnName;
      exports2.Component = Component;
      exports2.Fragment = REACT_FRAGMENT_TYPE;
      exports2.Profiler = REACT_PROFILER_TYPE;
      exports2.PureComponent = PureComponent;
      exports2.StrictMode = REACT_STRICT_MODE_TYPE;
      exports2.Suspense = REACT_SUSPENSE_TYPE;
      exports2.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = ReactSharedInternals;
      exports2.__COMPILER_RUNTIME = deprecatedAPIs;
      exports2.act = function(callback) {
        var prevActQueue = ReactSharedInternals.actQueue, prevActScopeDepth = actScopeDepth;
        actScopeDepth++;
        var queue = ReactSharedInternals.actQueue = null !== prevActQueue ? prevActQueue : [], didAwaitActCall = false;
        try {
          var result = callback();
        } catch (error) {
          ReactSharedInternals.thrownErrors.push(error);
        }
        if (0 < ReactSharedInternals.thrownErrors.length)
          throw popActScope(prevActQueue, prevActScopeDepth), callback = aggregateErrors(ReactSharedInternals.thrownErrors), ReactSharedInternals.thrownErrors.length = 0, callback;
        if (null !== result && "object" === typeof result && "function" === typeof result.then) {
          var thenable = result;
          queueSeveralMicrotasks(function() {
            didAwaitActCall || didWarnNoAwaitAct || (didWarnNoAwaitAct = true, console.error(
              "You called act(async () => ...) without await. This could lead to unexpected testing behaviour, interleaving multiple act calls and mixing their scopes. You should - await act(async () => ...);"
            ));
          });
          return {
            then: function(resolve, reject) {
              didAwaitActCall = true;
              thenable.then(
                function(returnValue) {
                  popActScope(prevActQueue, prevActScopeDepth);
                  if (0 === prevActScopeDepth) {
                    try {
                      flushActQueue(queue), enqueueTask(function() {
                        return recursivelyFlushAsyncActWork(
                          returnValue,
                          resolve,
                          reject
                        );
                      });
                    } catch (error$0) {
                      ReactSharedInternals.thrownErrors.push(error$0);
                    }
                    if (0 < ReactSharedInternals.thrownErrors.length) {
                      var _thrownError = aggregateErrors(
                        ReactSharedInternals.thrownErrors
                      );
                      ReactSharedInternals.thrownErrors.length = 0;
                      reject(_thrownError);
                    }
                  } else resolve(returnValue);
                },
                function(error) {
                  popActScope(prevActQueue, prevActScopeDepth);
                  0 < ReactSharedInternals.thrownErrors.length ? (error = aggregateErrors(
                    ReactSharedInternals.thrownErrors
                  ), ReactSharedInternals.thrownErrors.length = 0, reject(error)) : reject(error);
                }
              );
            }
          };
        }
        var returnValue$jscomp$0 = result;
        popActScope(prevActQueue, prevActScopeDepth);
        0 === prevActScopeDepth && (flushActQueue(queue), 0 !== queue.length && queueSeveralMicrotasks(function() {
          didAwaitActCall || didWarnNoAwaitAct || (didWarnNoAwaitAct = true, console.error(
            "A component suspended inside an `act` scope, but the `act` call was not awaited. When testing React components that depend on asynchronous data, you must await the result:\n\nawait act(() => ...)"
          ));
        }), ReactSharedInternals.actQueue = null);
        if (0 < ReactSharedInternals.thrownErrors.length)
          throw callback = aggregateErrors(ReactSharedInternals.thrownErrors), ReactSharedInternals.thrownErrors.length = 0, callback;
        return {
          then: function(resolve, reject) {
            didAwaitActCall = true;
            0 === prevActScopeDepth ? (ReactSharedInternals.actQueue = queue, enqueueTask(function() {
              return recursivelyFlushAsyncActWork(
                returnValue$jscomp$0,
                resolve,
                reject
              );
            })) : resolve(returnValue$jscomp$0);
          }
        };
      };
      exports2.cache = function(fn) {
        return function() {
          return fn.apply(null, arguments);
        };
      };
      exports2.cacheSignal = function() {
        return null;
      };
      exports2.captureOwnerStack = function() {
        var getCurrentStack = ReactSharedInternals.getCurrentStack;
        return null === getCurrentStack ? null : getCurrentStack();
      };
      exports2.cloneElement = function(element, config, children) {
        if (null === element || void 0 === element)
          throw Error(
            "The argument must be a React element, but you passed " + element + "."
          );
        var props = assign({}, element.props), key = element.key, owner = element._owner;
        if (null != config) {
          var JSCompiler_inline_result;
          a: {
            if (hasOwnProperty.call(config, "ref") && (JSCompiler_inline_result = Object.getOwnPropertyDescriptor(
              config,
              "ref"
            ).get) && JSCompiler_inline_result.isReactWarning) {
              JSCompiler_inline_result = false;
              break a;
            }
            JSCompiler_inline_result = void 0 !== config.ref;
          }
          JSCompiler_inline_result && (owner = getOwner());
          hasValidKey(config) && (checkKeyStringCoercion(config.key), key = "" + config.key);
          for (propName in config)
            !hasOwnProperty.call(config, propName) || "key" === propName || "__self" === propName || "__source" === propName || "ref" === propName && void 0 === config.ref || (props[propName] = config[propName]);
        }
        var propName = arguments.length - 2;
        if (1 === propName) props.children = children;
        else if (1 < propName) {
          JSCompiler_inline_result = Array(propName);
          for (var i = 0; i < propName; i++)
            JSCompiler_inline_result[i] = arguments[i + 2];
          props.children = JSCompiler_inline_result;
        }
        props = ReactElement(
          element.type,
          key,
          props,
          owner,
          element._debugStack,
          element._debugTask
        );
        for (key = 2; key < arguments.length; key++)
          validateChildKeys(arguments[key]);
        return props;
      };
      exports2.createContext = function(defaultValue) {
        defaultValue = {
          $$typeof: REACT_CONTEXT_TYPE,
          _currentValue: defaultValue,
          _currentValue2: defaultValue,
          _threadCount: 0,
          Provider: null,
          Consumer: null
        };
        defaultValue.Provider = defaultValue;
        defaultValue.Consumer = {
          $$typeof: REACT_CONSUMER_TYPE,
          _context: defaultValue
        };
        defaultValue._currentRenderer = null;
        defaultValue._currentRenderer2 = null;
        return defaultValue;
      };
      exports2.createElement = function(type, config, children) {
        for (var i = 2; i < arguments.length; i++)
          validateChildKeys(arguments[i]);
        i = {};
        var key = null;
        if (null != config)
          for (propName in didWarnAboutOldJSXRuntime || !("__self" in config) || "key" in config || (didWarnAboutOldJSXRuntime = true, console.warn(
            "Your app (or one of its dependencies) is using an outdated JSX transform. Update to the modern JSX transform for faster performance: https://react.dev/link/new-jsx-transform"
          )), hasValidKey(config) && (checkKeyStringCoercion(config.key), key = "" + config.key), config)
            hasOwnProperty.call(config, propName) && "key" !== propName && "__self" !== propName && "__source" !== propName && (i[propName] = config[propName]);
        var childrenLength = arguments.length - 2;
        if (1 === childrenLength) i.children = children;
        else if (1 < childrenLength) {
          for (var childArray = Array(childrenLength), _i = 0; _i < childrenLength; _i++)
            childArray[_i] = arguments[_i + 2];
          Object.freeze && Object.freeze(childArray);
          i.children = childArray;
        }
        if (type && type.defaultProps)
          for (propName in childrenLength = type.defaultProps, childrenLength)
            void 0 === i[propName] && (i[propName] = childrenLength[propName]);
        key && defineKeyPropWarningGetter(
          i,
          "function" === typeof type ? type.displayName || type.name || "Unknown" : type
        );
        var propName = 1e4 > ReactSharedInternals.recentlyCreatedOwnerStacks++;
        return ReactElement(
          type,
          key,
          i,
          getOwner(),
          propName ? Error("react-stack-top-frame") : unknownOwnerDebugStack,
          propName ? createTask(getTaskName(type)) : unknownOwnerDebugTask
        );
      };
      exports2.createRef = function() {
        var refObject = { current: null };
        Object.seal(refObject);
        return refObject;
      };
      exports2.forwardRef = function(render) {
        null != render && render.$$typeof === REACT_MEMO_TYPE ? console.error(
          "forwardRef requires a render function but received a `memo` component. Instead of forwardRef(memo(...)), use memo(forwardRef(...))."
        ) : "function" !== typeof render ? console.error(
          "forwardRef requires a render function but was given %s.",
          null === render ? "null" : typeof render
        ) : 0 !== render.length && 2 !== render.length && console.error(
          "forwardRef render functions accept exactly two parameters: props and ref. %s",
          1 === render.length ? "Did you forget to use the ref parameter?" : "Any additional parameter will be undefined."
        );
        null != render && null != render.defaultProps && console.error(
          "forwardRef render functions do not support defaultProps. Did you accidentally pass a React component?"
        );
        var elementType = { $$typeof: REACT_FORWARD_REF_TYPE, render }, ownName;
        Object.defineProperty(elementType, "displayName", {
          enumerable: false,
          configurable: true,
          get: function() {
            return ownName;
          },
          set: function(name) {
            ownName = name;
            render.name || render.displayName || (Object.defineProperty(render, "name", { value: name }), render.displayName = name);
          }
        });
        return elementType;
      };
      exports2.isValidElement = isValidElement;
      exports2.lazy = function(ctor) {
        ctor = { _status: -1, _result: ctor };
        var lazyType = {
          $$typeof: REACT_LAZY_TYPE,
          _payload: ctor,
          _init: lazyInitializer
        }, ioInfo = {
          name: "lazy",
          start: -1,
          end: -1,
          value: null,
          owner: null,
          debugStack: Error("react-stack-top-frame"),
          debugTask: console.createTask ? console.createTask("lazy()") : null
        };
        ctor._ioInfo = ioInfo;
        lazyType._debugInfo = [{ awaited: ioInfo }];
        return lazyType;
      };
      exports2.memo = function(type, compare) {
        null == type && console.error(
          "memo: The first argument must be a component. Instead received: %s",
          null === type ? "null" : typeof type
        );
        compare = {
          $$typeof: REACT_MEMO_TYPE,
          type,
          compare: void 0 === compare ? null : compare
        };
        var ownName;
        Object.defineProperty(compare, "displayName", {
          enumerable: false,
          configurable: true,
          get: function() {
            return ownName;
          },
          set: function(name) {
            ownName = name;
            type.name || type.displayName || (Object.defineProperty(type, "name", { value: name }), type.displayName = name);
          }
        });
        return compare;
      };
      exports2.startTransition = function(scope) {
        var prevTransition = ReactSharedInternals.T, currentTransition = {};
        currentTransition._updatedFibers = /* @__PURE__ */ new Set();
        ReactSharedInternals.T = currentTransition;
        try {
          var returnValue = scope(), onStartTransitionFinish = ReactSharedInternals.S;
          null !== onStartTransitionFinish && onStartTransitionFinish(currentTransition, returnValue);
          "object" === typeof returnValue && null !== returnValue && "function" === typeof returnValue.then && (ReactSharedInternals.asyncTransitions++, returnValue.then(releaseAsyncTransition, releaseAsyncTransition), returnValue.then(noop, reportGlobalError));
        } catch (error) {
          reportGlobalError(error);
        } finally {
          null === prevTransition && currentTransition._updatedFibers && (scope = currentTransition._updatedFibers.size, currentTransition._updatedFibers.clear(), 10 < scope && console.warn(
            "Detected a large number of updates inside startTransition. If this is due to a subscription please re-write it to use React provided hooks. Otherwise concurrent mode guarantees are off the table."
          )), null !== prevTransition && null !== currentTransition.types && (null !== prevTransition.types && prevTransition.types !== currentTransition.types && console.error(
            "We expected inner Transitions to have transferred the outer types set and that you cannot add to the outer Transition while inside the inner.This is a bug in React."
          ), prevTransition.types = currentTransition.types), ReactSharedInternals.T = prevTransition;
        }
      };
      exports2.unstable_useCacheRefresh = function() {
        return resolveDispatcher().useCacheRefresh();
      };
      exports2.use = function(usable) {
        return resolveDispatcher().use(usable);
      };
      exports2.useActionState = function(action, initialState, permalink) {
        return resolveDispatcher().useActionState(
          action,
          initialState,
          permalink
        );
      };
      exports2.useCallback = function(callback, deps) {
        return resolveDispatcher().useCallback(callback, deps);
      };
      exports2.useContext = function(Context) {
        var dispatcher = resolveDispatcher();
        Context.$$typeof === REACT_CONSUMER_TYPE && console.error(
          "Calling useContext(Context.Consumer) is not supported and will cause bugs. Did you mean to call useContext(Context) instead?"
        );
        return dispatcher.useContext(Context);
      };
      exports2.useDebugValue = function(value, formatterFn) {
        return resolveDispatcher().useDebugValue(value, formatterFn);
      };
      exports2.useDeferredValue = function(value, initialValue) {
        return resolveDispatcher().useDeferredValue(value, initialValue);
      };
      exports2.useEffect = function(create, deps) {
        null == create && console.warn(
          "React Hook useEffect requires an effect callback. Did you forget to pass a callback to the hook?"
        );
        return resolveDispatcher().useEffect(create, deps);
      };
      exports2.useEffectEvent = function(callback) {
        return resolveDispatcher().useEffectEvent(callback);
      };
      exports2.useId = function() {
        return resolveDispatcher().useId();
      };
      exports2.useImperativeHandle = function(ref, create, deps) {
        return resolveDispatcher().useImperativeHandle(ref, create, deps);
      };
      exports2.useInsertionEffect = function(create, deps) {
        null == create && console.warn(
          "React Hook useInsertionEffect requires an effect callback. Did you forget to pass a callback to the hook?"
        );
        return resolveDispatcher().useInsertionEffect(create, deps);
      };
      exports2.useLayoutEffect = function(create, deps) {
        null == create && console.warn(
          "React Hook useLayoutEffect requires an effect callback. Did you forget to pass a callback to the hook?"
        );
        return resolveDispatcher().useLayoutEffect(create, deps);
      };
      exports2.useMemo = function(create, deps) {
        return resolveDispatcher().useMemo(create, deps);
      };
      exports2.useOptimistic = function(passthrough, reducer) {
        return resolveDispatcher().useOptimistic(passthrough, reducer);
      };
      exports2.useReducer = function(reducer, initialArg, init) {
        return resolveDispatcher().useReducer(reducer, initialArg, init);
      };
      exports2.useRef = function(initialValue) {
        return resolveDispatcher().useRef(initialValue);
      };
      exports2.useState = function(initialState) {
        return resolveDispatcher().useState(initialState);
      };
      exports2.useSyncExternalStore = function(subscribe, getSnapshot, getServerSnapshot) {
        return resolveDispatcher().useSyncExternalStore(
          subscribe,
          getSnapshot,
          getServerSnapshot
        );
      };
      exports2.useTransition = function() {
        return resolveDispatcher().useTransition();
      };
      exports2.version = "19.2.4";
      "undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ && "function" === typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(Error());
    })();
  }
});

// node_modules/react/index.js
var require_react = __commonJS({
  "node_modules/react/index.js"(exports2, module2) {
    "use strict";
    if (process.env.NODE_ENV === "production") {
      module2.exports = require_react_production();
    } else {
      module2.exports = require_react_development();
    }
  }
});

// node_modules/react/cjs/react-jsx-runtime.development.js
var require_react_jsx_runtime_development = __commonJS({
  "node_modules/react/cjs/react-jsx-runtime.development.js"(exports2) {
    "use strict";
    "production" !== process.env.NODE_ENV && (function() {
      function getComponentNameFromType(type) {
        if (null == type) return null;
        if ("function" === typeof type)
          return type.$$typeof === REACT_CLIENT_REFERENCE ? null : type.displayName || type.name || null;
        if ("string" === typeof type) return type;
        switch (type) {
          case REACT_FRAGMENT_TYPE:
            return "Fragment";
          case REACT_PROFILER_TYPE:
            return "Profiler";
          case REACT_STRICT_MODE_TYPE:
            return "StrictMode";
          case REACT_SUSPENSE_TYPE:
            return "Suspense";
          case REACT_SUSPENSE_LIST_TYPE:
            return "SuspenseList";
          case REACT_ACTIVITY_TYPE:
            return "Activity";
        }
        if ("object" === typeof type)
          switch ("number" === typeof type.tag && console.error(
            "Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."
          ), type.$$typeof) {
            case REACT_PORTAL_TYPE:
              return "Portal";
            case REACT_CONTEXT_TYPE:
              return type.displayName || "Context";
            case REACT_CONSUMER_TYPE:
              return (type._context.displayName || "Context") + ".Consumer";
            case REACT_FORWARD_REF_TYPE:
              var innerType = type.render;
              type = type.displayName;
              type || (type = innerType.displayName || innerType.name || "", type = "" !== type ? "ForwardRef(" + type + ")" : "ForwardRef");
              return type;
            case REACT_MEMO_TYPE:
              return innerType = type.displayName || null, null !== innerType ? innerType : getComponentNameFromType(type.type) || "Memo";
            case REACT_LAZY_TYPE:
              innerType = type._payload;
              type = type._init;
              try {
                return getComponentNameFromType(type(innerType));
              } catch (x) {
              }
          }
        return null;
      }
      function testStringCoercion(value) {
        return "" + value;
      }
      function checkKeyStringCoercion(value) {
        try {
          testStringCoercion(value);
          var JSCompiler_inline_result = false;
        } catch (e) {
          JSCompiler_inline_result = true;
        }
        if (JSCompiler_inline_result) {
          JSCompiler_inline_result = console;
          var JSCompiler_temp_const = JSCompiler_inline_result.error;
          var JSCompiler_inline_result$jscomp$0 = "function" === typeof Symbol && Symbol.toStringTag && value[Symbol.toStringTag] || value.constructor.name || "Object";
          JSCompiler_temp_const.call(
            JSCompiler_inline_result,
            "The provided key is an unsupported type %s. This value must be coerced to a string before using it here.",
            JSCompiler_inline_result$jscomp$0
          );
          return testStringCoercion(value);
        }
      }
      function getTaskName(type) {
        if (type === REACT_FRAGMENT_TYPE) return "<>";
        if ("object" === typeof type && null !== type && type.$$typeof === REACT_LAZY_TYPE)
          return "<...>";
        try {
          var name = getComponentNameFromType(type);
          return name ? "<" + name + ">" : "<...>";
        } catch (x) {
          return "<...>";
        }
      }
      function getOwner() {
        var dispatcher = ReactSharedInternals.A;
        return null === dispatcher ? null : dispatcher.getOwner();
      }
      function UnknownOwner() {
        return Error("react-stack-top-frame");
      }
      function hasValidKey(config) {
        if (hasOwnProperty.call(config, "key")) {
          var getter = Object.getOwnPropertyDescriptor(config, "key").get;
          if (getter && getter.isReactWarning) return false;
        }
        return void 0 !== config.key;
      }
      function defineKeyPropWarningGetter(props, displayName) {
        function warnAboutAccessingKey() {
          specialPropKeyWarningShown || (specialPropKeyWarningShown = true, console.error(
            "%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)",
            displayName
          ));
        }
        warnAboutAccessingKey.isReactWarning = true;
        Object.defineProperty(props, "key", {
          get: warnAboutAccessingKey,
          configurable: true
        });
      }
      function elementRefGetterWithDeprecationWarning() {
        var componentName = getComponentNameFromType(this.type);
        didWarnAboutElementRef[componentName] || (didWarnAboutElementRef[componentName] = true, console.error(
          "Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release."
        ));
        componentName = this.props.ref;
        return void 0 !== componentName ? componentName : null;
      }
      function ReactElement(type, key, props, owner, debugStack, debugTask) {
        var refProp = props.ref;
        type = {
          $$typeof: REACT_ELEMENT_TYPE,
          type,
          key,
          props,
          _owner: owner
        };
        null !== (void 0 !== refProp ? refProp : null) ? Object.defineProperty(type, "ref", {
          enumerable: false,
          get: elementRefGetterWithDeprecationWarning
        }) : Object.defineProperty(type, "ref", { enumerable: false, value: null });
        type._store = {};
        Object.defineProperty(type._store, "validated", {
          configurable: false,
          enumerable: false,
          writable: true,
          value: 0
        });
        Object.defineProperty(type, "_debugInfo", {
          configurable: false,
          enumerable: false,
          writable: true,
          value: null
        });
        Object.defineProperty(type, "_debugStack", {
          configurable: false,
          enumerable: false,
          writable: true,
          value: debugStack
        });
        Object.defineProperty(type, "_debugTask", {
          configurable: false,
          enumerable: false,
          writable: true,
          value: debugTask
        });
        Object.freeze && (Object.freeze(type.props), Object.freeze(type));
        return type;
      }
      function jsxDEVImpl(type, config, maybeKey, isStaticChildren, debugStack, debugTask) {
        var children = config.children;
        if (void 0 !== children)
          if (isStaticChildren)
            if (isArrayImpl(children)) {
              for (isStaticChildren = 0; isStaticChildren < children.length; isStaticChildren++)
                validateChildKeys(children[isStaticChildren]);
              Object.freeze && Object.freeze(children);
            } else
              console.error(
                "React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead."
              );
          else validateChildKeys(children);
        if (hasOwnProperty.call(config, "key")) {
          children = getComponentNameFromType(type);
          var keys = Object.keys(config).filter(function(k) {
            return "key" !== k;
          });
          isStaticChildren = 0 < keys.length ? "{key: someKey, " + keys.join(": ..., ") + ": ...}" : "{key: someKey}";
          didWarnAboutKeySpread[children + isStaticChildren] || (keys = 0 < keys.length ? "{" + keys.join(": ..., ") + ": ...}" : "{}", console.error(
            'A props object containing a "key" prop is being spread into JSX:\n  let props = %s;\n  <%s {...props} />\nReact keys must be passed directly to JSX without using spread:\n  let props = %s;\n  <%s key={someKey} {...props} />',
            isStaticChildren,
            children,
            keys,
            children
          ), didWarnAboutKeySpread[children + isStaticChildren] = true);
        }
        children = null;
        void 0 !== maybeKey && (checkKeyStringCoercion(maybeKey), children = "" + maybeKey);
        hasValidKey(config) && (checkKeyStringCoercion(config.key), children = "" + config.key);
        if ("key" in config) {
          maybeKey = {};
          for (var propName in config)
            "key" !== propName && (maybeKey[propName] = config[propName]);
        } else maybeKey = config;
        children && defineKeyPropWarningGetter(
          maybeKey,
          "function" === typeof type ? type.displayName || type.name || "Unknown" : type
        );
        return ReactElement(
          type,
          children,
          maybeKey,
          getOwner(),
          debugStack,
          debugTask
        );
      }
      function validateChildKeys(node) {
        isValidElement(node) ? node._store && (node._store.validated = 1) : "object" === typeof node && null !== node && node.$$typeof === REACT_LAZY_TYPE && ("fulfilled" === node._payload.status ? isValidElement(node._payload.value) && node._payload.value._store && (node._payload.value._store.validated = 1) : node._store && (node._store.validated = 1));
      }
      function isValidElement(object) {
        return "object" === typeof object && null !== object && object.$$typeof === REACT_ELEMENT_TYPE;
      }
      var React = require_react(), REACT_ELEMENT_TYPE = /* @__PURE__ */ Symbol.for("react.transitional.element"), REACT_PORTAL_TYPE = /* @__PURE__ */ Symbol.for("react.portal"), REACT_FRAGMENT_TYPE = /* @__PURE__ */ Symbol.for("react.fragment"), REACT_STRICT_MODE_TYPE = /* @__PURE__ */ Symbol.for("react.strict_mode"), REACT_PROFILER_TYPE = /* @__PURE__ */ Symbol.for("react.profiler"), REACT_CONSUMER_TYPE = /* @__PURE__ */ Symbol.for("react.consumer"), REACT_CONTEXT_TYPE = /* @__PURE__ */ Symbol.for("react.context"), REACT_FORWARD_REF_TYPE = /* @__PURE__ */ Symbol.for("react.forward_ref"), REACT_SUSPENSE_TYPE = /* @__PURE__ */ Symbol.for("react.suspense"), REACT_SUSPENSE_LIST_TYPE = /* @__PURE__ */ Symbol.for("react.suspense_list"), REACT_MEMO_TYPE = /* @__PURE__ */ Symbol.for("react.memo"), REACT_LAZY_TYPE = /* @__PURE__ */ Symbol.for("react.lazy"), REACT_ACTIVITY_TYPE = /* @__PURE__ */ Symbol.for("react.activity"), REACT_CLIENT_REFERENCE = /* @__PURE__ */ Symbol.for("react.client.reference"), ReactSharedInternals = React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, hasOwnProperty = Object.prototype.hasOwnProperty, isArrayImpl = Array.isArray, createTask = console.createTask ? console.createTask : function() {
        return null;
      };
      React = {
        react_stack_bottom_frame: function(callStackForError) {
          return callStackForError();
        }
      };
      var specialPropKeyWarningShown;
      var didWarnAboutElementRef = {};
      var unknownOwnerDebugStack = React.react_stack_bottom_frame.bind(
        React,
        UnknownOwner
      )();
      var unknownOwnerDebugTask = createTask(getTaskName(UnknownOwner));
      var didWarnAboutKeySpread = {};
      exports2.Fragment = REACT_FRAGMENT_TYPE;
      exports2.jsx = function(type, config, maybeKey) {
        var trackActualOwner = 1e4 > ReactSharedInternals.recentlyCreatedOwnerStacks++;
        return jsxDEVImpl(
          type,
          config,
          maybeKey,
          false,
          trackActualOwner ? Error("react-stack-top-frame") : unknownOwnerDebugStack,
          trackActualOwner ? createTask(getTaskName(type)) : unknownOwnerDebugTask
        );
      };
      exports2.jsxs = function(type, config, maybeKey) {
        var trackActualOwner = 1e4 > ReactSharedInternals.recentlyCreatedOwnerStacks++;
        return jsxDEVImpl(
          type,
          config,
          maybeKey,
          true,
          trackActualOwner ? Error("react-stack-top-frame") : unknownOwnerDebugStack,
          trackActualOwner ? createTask(getTaskName(type)) : unknownOwnerDebugTask
        );
      };
    })();
  }
});

// node_modules/react/jsx-runtime.js
var require_jsx_runtime = __commonJS({
  "node_modules/react/jsx-runtime.js"(exports2, module2) {
    "use strict";
    if (process.env.NODE_ENV === "production") {
      module2.exports = require_react_jsx_runtime_production();
    } else {
      module2.exports = require_react_jsx_runtime_development();
    }
  }
});

// src/components/Logo.tsx
var Logo_exports = {};
__export(Logo_exports, {
  HuggingFaceLogo: () => HuggingFaceLogo
});
module.exports = __toCommonJS(Logo_exports);

// node_modules/clsx/dist/clsx.mjs
function r(e) {
  var t, f, n = "";
  if ("string" == typeof e || "number" == typeof e) n += e;
  else if ("object" == typeof e) if (Array.isArray(e)) {
    var o = e.length;
    for (t = 0; t < o; t++) e[t] && (f = r(e[t])) && (n && (n += " "), n += f);
  } else for (f in e) e[f] && (n && (n += " "), n += f);
  return n;
}
function clsx() {
  for (var e, t, f = 0, n = "", o = arguments.length; f < o; f++) (e = arguments[f]) && (t = r(e)) && (n && (n += " "), n += t);
  return n;
}

// node_modules/tailwind-merge/dist/bundle-mjs.mjs
var concatArrays = (array1, array2) => {
  const combinedArray = new Array(array1.length + array2.length);
  for (let i = 0; i < array1.length; i++) {
    combinedArray[i] = array1[i];
  }
  for (let i = 0; i < array2.length; i++) {
    combinedArray[array1.length + i] = array2[i];
  }
  return combinedArray;
};
var createClassValidatorObject = (classGroupId, validator) => ({
  classGroupId,
  validator
});
var createClassPartObject = (nextPart = /* @__PURE__ */ new Map(), validators = null, classGroupId) => ({
  nextPart,
  validators,
  classGroupId
});
var CLASS_PART_SEPARATOR = "-";
var EMPTY_CONFLICTS = [];
var ARBITRARY_PROPERTY_PREFIX = "arbitrary..";
var createClassGroupUtils = (config) => {
  const classMap = createClassMap(config);
  const {
    conflictingClassGroups,
    conflictingClassGroupModifiers
  } = config;
  const getClassGroupId = (className) => {
    if (className.startsWith("[") && className.endsWith("]")) {
      return getGroupIdForArbitraryProperty(className);
    }
    const classParts = className.split(CLASS_PART_SEPARATOR);
    const startIndex = classParts[0] === "" && classParts.length > 1 ? 1 : 0;
    return getGroupRecursive(classParts, startIndex, classMap);
  };
  const getConflictingClassGroupIds = (classGroupId, hasPostfixModifier) => {
    if (hasPostfixModifier) {
      const modifierConflicts = conflictingClassGroupModifiers[classGroupId];
      const baseConflicts = conflictingClassGroups[classGroupId];
      if (modifierConflicts) {
        if (baseConflicts) {
          return concatArrays(baseConflicts, modifierConflicts);
        }
        return modifierConflicts;
      }
      return baseConflicts || EMPTY_CONFLICTS;
    }
    return conflictingClassGroups[classGroupId] || EMPTY_CONFLICTS;
  };
  return {
    getClassGroupId,
    getConflictingClassGroupIds
  };
};
var getGroupRecursive = (classParts, startIndex, classPartObject) => {
  const classPathsLength = classParts.length - startIndex;
  if (classPathsLength === 0) {
    return classPartObject.classGroupId;
  }
  const currentClassPart = classParts[startIndex];
  const nextClassPartObject = classPartObject.nextPart.get(currentClassPart);
  if (nextClassPartObject) {
    const result = getGroupRecursive(classParts, startIndex + 1, nextClassPartObject);
    if (result) return result;
  }
  const validators = classPartObject.validators;
  if (validators === null) {
    return void 0;
  }
  const classRest = startIndex === 0 ? classParts.join(CLASS_PART_SEPARATOR) : classParts.slice(startIndex).join(CLASS_PART_SEPARATOR);
  const validatorsLength = validators.length;
  for (let i = 0; i < validatorsLength; i++) {
    const validatorObj = validators[i];
    if (validatorObj.validator(classRest)) {
      return validatorObj.classGroupId;
    }
  }
  return void 0;
};
var getGroupIdForArbitraryProperty = (className) => className.slice(1, -1).indexOf(":") === -1 ? void 0 : (() => {
  const content = className.slice(1, -1);
  const colonIndex = content.indexOf(":");
  const property = content.slice(0, colonIndex);
  return property ? ARBITRARY_PROPERTY_PREFIX + property : void 0;
})();
var createClassMap = (config) => {
  const {
    theme,
    classGroups
  } = config;
  return processClassGroups(classGroups, theme);
};
var processClassGroups = (classGroups, theme) => {
  const classMap = createClassPartObject();
  for (const classGroupId in classGroups) {
    const group = classGroups[classGroupId];
    processClassesRecursively(group, classMap, classGroupId, theme);
  }
  return classMap;
};
var processClassesRecursively = (classGroup, classPartObject, classGroupId, theme) => {
  const len = classGroup.length;
  for (let i = 0; i < len; i++) {
    const classDefinition = classGroup[i];
    processClassDefinition(classDefinition, classPartObject, classGroupId, theme);
  }
};
var processClassDefinition = (classDefinition, classPartObject, classGroupId, theme) => {
  if (typeof classDefinition === "string") {
    processStringDefinition(classDefinition, classPartObject, classGroupId);
    return;
  }
  if (typeof classDefinition === "function") {
    processFunctionDefinition(classDefinition, classPartObject, classGroupId, theme);
    return;
  }
  processObjectDefinition(classDefinition, classPartObject, classGroupId, theme);
};
var processStringDefinition = (classDefinition, classPartObject, classGroupId) => {
  const classPartObjectToEdit = classDefinition === "" ? classPartObject : getPart(classPartObject, classDefinition);
  classPartObjectToEdit.classGroupId = classGroupId;
};
var processFunctionDefinition = (classDefinition, classPartObject, classGroupId, theme) => {
  if (isThemeGetter(classDefinition)) {
    processClassesRecursively(classDefinition(theme), classPartObject, classGroupId, theme);
    return;
  }
  if (classPartObject.validators === null) {
    classPartObject.validators = [];
  }
  classPartObject.validators.push(createClassValidatorObject(classGroupId, classDefinition));
};
var processObjectDefinition = (classDefinition, classPartObject, classGroupId, theme) => {
  const entries = Object.entries(classDefinition);
  const len = entries.length;
  for (let i = 0; i < len; i++) {
    const [key, value] = entries[i];
    processClassesRecursively(value, getPart(classPartObject, key), classGroupId, theme);
  }
};
var getPart = (classPartObject, path) => {
  let current = classPartObject;
  const parts = path.split(CLASS_PART_SEPARATOR);
  const len = parts.length;
  for (let i = 0; i < len; i++) {
    const part = parts[i];
    let next = current.nextPart.get(part);
    if (!next) {
      next = createClassPartObject();
      current.nextPart.set(part, next);
    }
    current = next;
  }
  return current;
};
var isThemeGetter = (func) => "isThemeGetter" in func && func.isThemeGetter === true;
var createLruCache = (maxCacheSize) => {
  if (maxCacheSize < 1) {
    return {
      get: () => void 0,
      set: () => {
      }
    };
  }
  let cacheSize = 0;
  let cache = /* @__PURE__ */ Object.create(null);
  let previousCache = /* @__PURE__ */ Object.create(null);
  const update = (key, value) => {
    cache[key] = value;
    cacheSize++;
    if (cacheSize > maxCacheSize) {
      cacheSize = 0;
      previousCache = cache;
      cache = /* @__PURE__ */ Object.create(null);
    }
  };
  return {
    get(key) {
      let value = cache[key];
      if (value !== void 0) {
        return value;
      }
      if ((value = previousCache[key]) !== void 0) {
        update(key, value);
        return value;
      }
    },
    set(key, value) {
      if (key in cache) {
        cache[key] = value;
      } else {
        update(key, value);
      }
    }
  };
};
var IMPORTANT_MODIFIER = "!";
var MODIFIER_SEPARATOR = ":";
var EMPTY_MODIFIERS = [];
var createResultObject = (modifiers, hasImportantModifier, baseClassName, maybePostfixModifierPosition, isExternal) => ({
  modifiers,
  hasImportantModifier,
  baseClassName,
  maybePostfixModifierPosition,
  isExternal
});
var createParseClassName = (config) => {
  const {
    prefix,
    experimentalParseClassName
  } = config;
  let parseClassName = (className) => {
    const modifiers = [];
    let bracketDepth = 0;
    let parenDepth = 0;
    let modifierStart = 0;
    let postfixModifierPosition;
    const len = className.length;
    for (let index = 0; index < len; index++) {
      const currentCharacter = className[index];
      if (bracketDepth === 0 && parenDepth === 0) {
        if (currentCharacter === MODIFIER_SEPARATOR) {
          modifiers.push(className.slice(modifierStart, index));
          modifierStart = index + 1;
          continue;
        }
        if (currentCharacter === "/") {
          postfixModifierPosition = index;
          continue;
        }
      }
      if (currentCharacter === "[") bracketDepth++;
      else if (currentCharacter === "]") bracketDepth--;
      else if (currentCharacter === "(") parenDepth++;
      else if (currentCharacter === ")") parenDepth--;
    }
    const baseClassNameWithImportantModifier = modifiers.length === 0 ? className : className.slice(modifierStart);
    let baseClassName = baseClassNameWithImportantModifier;
    let hasImportantModifier = false;
    if (baseClassNameWithImportantModifier.endsWith(IMPORTANT_MODIFIER)) {
      baseClassName = baseClassNameWithImportantModifier.slice(0, -1);
      hasImportantModifier = true;
    } else if (
      /**
       * In Tailwind CSS v3 the important modifier was at the start of the base class name. This is still supported for legacy reasons.
       * @see https://github.com/dcastil/tailwind-merge/issues/513#issuecomment-2614029864
       */
      baseClassNameWithImportantModifier.startsWith(IMPORTANT_MODIFIER)
    ) {
      baseClassName = baseClassNameWithImportantModifier.slice(1);
      hasImportantModifier = true;
    }
    const maybePostfixModifierPosition = postfixModifierPosition && postfixModifierPosition > modifierStart ? postfixModifierPosition - modifierStart : void 0;
    return createResultObject(modifiers, hasImportantModifier, baseClassName, maybePostfixModifierPosition);
  };
  if (prefix) {
    const fullPrefix = prefix + MODIFIER_SEPARATOR;
    const parseClassNameOriginal = parseClassName;
    parseClassName = (className) => className.startsWith(fullPrefix) ? parseClassNameOriginal(className.slice(fullPrefix.length)) : createResultObject(EMPTY_MODIFIERS, false, className, void 0, true);
  }
  if (experimentalParseClassName) {
    const parseClassNameOriginal = parseClassName;
    parseClassName = (className) => experimentalParseClassName({
      className,
      parseClassName: parseClassNameOriginal
    });
  }
  return parseClassName;
};
var createSortModifiers = (config) => {
  const modifierWeights = /* @__PURE__ */ new Map();
  config.orderSensitiveModifiers.forEach((mod, index) => {
    modifierWeights.set(mod, 1e6 + index);
  });
  return (modifiers) => {
    const result = [];
    let currentSegment = [];
    for (let i = 0; i < modifiers.length; i++) {
      const modifier = modifiers[i];
      const isArbitrary = modifier[0] === "[";
      const isOrderSensitive = modifierWeights.has(modifier);
      if (isArbitrary || isOrderSensitive) {
        if (currentSegment.length > 0) {
          currentSegment.sort();
          result.push(...currentSegment);
          currentSegment = [];
        }
        result.push(modifier);
      } else {
        currentSegment.push(modifier);
      }
    }
    if (currentSegment.length > 0) {
      currentSegment.sort();
      result.push(...currentSegment);
    }
    return result;
  };
};
var createConfigUtils = (config) => ({
  cache: createLruCache(config.cacheSize),
  parseClassName: createParseClassName(config),
  sortModifiers: createSortModifiers(config),
  ...createClassGroupUtils(config)
});
var SPLIT_CLASSES_REGEX = /\s+/;
var mergeClassList = (classList, configUtils) => {
  const {
    parseClassName,
    getClassGroupId,
    getConflictingClassGroupIds,
    sortModifiers
  } = configUtils;
  const classGroupsInConflict = [];
  const classNames = classList.trim().split(SPLIT_CLASSES_REGEX);
  let result = "";
  for (let index = classNames.length - 1; index >= 0; index -= 1) {
    const originalClassName = classNames[index];
    const {
      isExternal,
      modifiers,
      hasImportantModifier,
      baseClassName,
      maybePostfixModifierPosition
    } = parseClassName(originalClassName);
    if (isExternal) {
      result = originalClassName + (result.length > 0 ? " " + result : result);
      continue;
    }
    let hasPostfixModifier = !!maybePostfixModifierPosition;
    let classGroupId = getClassGroupId(hasPostfixModifier ? baseClassName.substring(0, maybePostfixModifierPosition) : baseClassName);
    if (!classGroupId) {
      if (!hasPostfixModifier) {
        result = originalClassName + (result.length > 0 ? " " + result : result);
        continue;
      }
      classGroupId = getClassGroupId(baseClassName);
      if (!classGroupId) {
        result = originalClassName + (result.length > 0 ? " " + result : result);
        continue;
      }
      hasPostfixModifier = false;
    }
    const variantModifier = modifiers.length === 0 ? "" : modifiers.length === 1 ? modifiers[0] : sortModifiers(modifiers).join(":");
    const modifierId = hasImportantModifier ? variantModifier + IMPORTANT_MODIFIER : variantModifier;
    const classId = modifierId + classGroupId;
    if (classGroupsInConflict.indexOf(classId) > -1) {
      continue;
    }
    classGroupsInConflict.push(classId);
    const conflictGroups = getConflictingClassGroupIds(classGroupId, hasPostfixModifier);
    for (let i = 0; i < conflictGroups.length; ++i) {
      const group = conflictGroups[i];
      classGroupsInConflict.push(modifierId + group);
    }
    result = originalClassName + (result.length > 0 ? " " + result : result);
  }
  return result;
};
var twJoin = (...classLists) => {
  let index = 0;
  let argument;
  let resolvedValue;
  let string = "";
  while (index < classLists.length) {
    if (argument = classLists[index++]) {
      if (resolvedValue = toValue(argument)) {
        string && (string += " ");
        string += resolvedValue;
      }
    }
  }
  return string;
};
var toValue = (mix) => {
  if (typeof mix === "string") {
    return mix;
  }
  let resolvedValue;
  let string = "";
  for (let k = 0; k < mix.length; k++) {
    if (mix[k]) {
      if (resolvedValue = toValue(mix[k])) {
        string && (string += " ");
        string += resolvedValue;
      }
    }
  }
  return string;
};
var createTailwindMerge = (createConfigFirst, ...createConfigRest) => {
  let configUtils;
  let cacheGet;
  let cacheSet;
  let functionToCall;
  const initTailwindMerge = (classList) => {
    const config = createConfigRest.reduce((previousConfig, createConfigCurrent) => createConfigCurrent(previousConfig), createConfigFirst());
    configUtils = createConfigUtils(config);
    cacheGet = configUtils.cache.get;
    cacheSet = configUtils.cache.set;
    functionToCall = tailwindMerge;
    return tailwindMerge(classList);
  };
  const tailwindMerge = (classList) => {
    const cachedResult = cacheGet(classList);
    if (cachedResult) {
      return cachedResult;
    }
    const result = mergeClassList(classList, configUtils);
    cacheSet(classList, result);
    return result;
  };
  functionToCall = initTailwindMerge;
  return (...args) => functionToCall(twJoin(...args));
};
var fallbackThemeArr = [];
var fromTheme = (key) => {
  const themeGetter = (theme) => theme[key] || fallbackThemeArr;
  themeGetter.isThemeGetter = true;
  return themeGetter;
};
var arbitraryValueRegex = /^\[(?:(\w[\w-]*):)?(.+)\]$/i;
var arbitraryVariableRegex = /^\((?:(\w[\w-]*):)?(.+)\)$/i;
var fractionRegex = /^\d+(?:\.\d+)?\/\d+(?:\.\d+)?$/;
var tshirtUnitRegex = /^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/;
var lengthUnitRegex = /\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/;
var colorFunctionRegex = /^(rgba?|hsla?|hwb|(ok)?(lab|lch)|color-mix)\(.+\)$/;
var shadowRegex = /^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/;
var imageRegex = /^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/;
var isFraction = (value) => fractionRegex.test(value);
var isNumber = (value) => !!value && !Number.isNaN(Number(value));
var isInteger = (value) => !!value && Number.isInteger(Number(value));
var isPercent = (value) => value.endsWith("%") && isNumber(value.slice(0, -1));
var isTshirtSize = (value) => tshirtUnitRegex.test(value);
var isAny = () => true;
var isLengthOnly = (value) => (
  // `colorFunctionRegex` check is necessary because color functions can have percentages in them which which would be incorrectly classified as lengths.
  // For example, `hsl(0 0% 0%)` would be classified as a length without this check.
  // I could also use lookbehind assertion in `lengthUnitRegex` but that isn't supported widely enough.
  lengthUnitRegex.test(value) && !colorFunctionRegex.test(value)
);
var isNever = () => false;
var isShadow = (value) => shadowRegex.test(value);
var isImage = (value) => imageRegex.test(value);
var isAnyNonArbitrary = (value) => !isArbitraryValue(value) && !isArbitraryVariable(value);
var isArbitrarySize = (value) => getIsArbitraryValue(value, isLabelSize, isNever);
var isArbitraryValue = (value) => arbitraryValueRegex.test(value);
var isArbitraryLength = (value) => getIsArbitraryValue(value, isLabelLength, isLengthOnly);
var isArbitraryNumber = (value) => getIsArbitraryValue(value, isLabelNumber, isNumber);
var isArbitraryWeight = (value) => getIsArbitraryValue(value, isLabelWeight, isAny);
var isArbitraryFamilyName = (value) => getIsArbitraryValue(value, isLabelFamilyName, isNever);
var isArbitraryPosition = (value) => getIsArbitraryValue(value, isLabelPosition, isNever);
var isArbitraryImage = (value) => getIsArbitraryValue(value, isLabelImage, isImage);
var isArbitraryShadow = (value) => getIsArbitraryValue(value, isLabelShadow, isShadow);
var isArbitraryVariable = (value) => arbitraryVariableRegex.test(value);
var isArbitraryVariableLength = (value) => getIsArbitraryVariable(value, isLabelLength);
var isArbitraryVariableFamilyName = (value) => getIsArbitraryVariable(value, isLabelFamilyName);
var isArbitraryVariablePosition = (value) => getIsArbitraryVariable(value, isLabelPosition);
var isArbitraryVariableSize = (value) => getIsArbitraryVariable(value, isLabelSize);
var isArbitraryVariableImage = (value) => getIsArbitraryVariable(value, isLabelImage);
var isArbitraryVariableShadow = (value) => getIsArbitraryVariable(value, isLabelShadow, true);
var isArbitraryVariableWeight = (value) => getIsArbitraryVariable(value, isLabelWeight, true);
var getIsArbitraryValue = (value, testLabel, testValue) => {
  const result = arbitraryValueRegex.exec(value);
  if (result) {
    if (result[1]) {
      return testLabel(result[1]);
    }
    return testValue(result[2]);
  }
  return false;
};
var getIsArbitraryVariable = (value, testLabel, shouldMatchNoLabel = false) => {
  const result = arbitraryVariableRegex.exec(value);
  if (result) {
    if (result[1]) {
      return testLabel(result[1]);
    }
    return shouldMatchNoLabel;
  }
  return false;
};
var isLabelPosition = (label) => label === "position" || label === "percentage";
var isLabelImage = (label) => label === "image" || label === "url";
var isLabelSize = (label) => label === "length" || label === "size" || label === "bg-size";
var isLabelLength = (label) => label === "length";
var isLabelNumber = (label) => label === "number";
var isLabelFamilyName = (label) => label === "family-name";
var isLabelWeight = (label) => label === "number" || label === "weight";
var isLabelShadow = (label) => label === "shadow";
var getDefaultConfig = () => {
  const themeColor = fromTheme("color");
  const themeFont = fromTheme("font");
  const themeText = fromTheme("text");
  const themeFontWeight = fromTheme("font-weight");
  const themeTracking = fromTheme("tracking");
  const themeLeading = fromTheme("leading");
  const themeBreakpoint = fromTheme("breakpoint");
  const themeContainer = fromTheme("container");
  const themeSpacing = fromTheme("spacing");
  const themeRadius = fromTheme("radius");
  const themeShadow = fromTheme("shadow");
  const themeInsetShadow = fromTheme("inset-shadow");
  const themeTextShadow = fromTheme("text-shadow");
  const themeDropShadow = fromTheme("drop-shadow");
  const themeBlur = fromTheme("blur");
  const themePerspective = fromTheme("perspective");
  const themeAspect = fromTheme("aspect");
  const themeEase = fromTheme("ease");
  const themeAnimate = fromTheme("animate");
  const scaleBreak = () => ["auto", "avoid", "all", "avoid-page", "page", "left", "right", "column"];
  const scalePosition = () => [
    "center",
    "top",
    "bottom",
    "left",
    "right",
    "top-left",
    // Deprecated since Tailwind CSS v4.1.0, see https://github.com/tailwindlabs/tailwindcss/pull/17378
    "left-top",
    "top-right",
    // Deprecated since Tailwind CSS v4.1.0, see https://github.com/tailwindlabs/tailwindcss/pull/17378
    "right-top",
    "bottom-right",
    // Deprecated since Tailwind CSS v4.1.0, see https://github.com/tailwindlabs/tailwindcss/pull/17378
    "right-bottom",
    "bottom-left",
    // Deprecated since Tailwind CSS v4.1.0, see https://github.com/tailwindlabs/tailwindcss/pull/17378
    "left-bottom"
  ];
  const scalePositionWithArbitrary = () => [...scalePosition(), isArbitraryVariable, isArbitraryValue];
  const scaleOverflow = () => ["auto", "hidden", "clip", "visible", "scroll"];
  const scaleOverscroll = () => ["auto", "contain", "none"];
  const scaleUnambiguousSpacing = () => [isArbitraryVariable, isArbitraryValue, themeSpacing];
  const scaleInset = () => [isFraction, "full", "auto", ...scaleUnambiguousSpacing()];
  const scaleGridTemplateColsRows = () => [isInteger, "none", "subgrid", isArbitraryVariable, isArbitraryValue];
  const scaleGridColRowStartAndEnd = () => ["auto", {
    span: ["full", isInteger, isArbitraryVariable, isArbitraryValue]
  }, isInteger, isArbitraryVariable, isArbitraryValue];
  const scaleGridColRowStartOrEnd = () => [isInteger, "auto", isArbitraryVariable, isArbitraryValue];
  const scaleGridAutoColsRows = () => ["auto", "min", "max", "fr", isArbitraryVariable, isArbitraryValue];
  const scaleAlignPrimaryAxis = () => ["start", "end", "center", "between", "around", "evenly", "stretch", "baseline", "center-safe", "end-safe"];
  const scaleAlignSecondaryAxis = () => ["start", "end", "center", "stretch", "center-safe", "end-safe"];
  const scaleMargin = () => ["auto", ...scaleUnambiguousSpacing()];
  const scaleSizing = () => [isFraction, "auto", "full", "dvw", "dvh", "lvw", "lvh", "svw", "svh", "min", "max", "fit", ...scaleUnambiguousSpacing()];
  const scaleSizingInline = () => [isFraction, "screen", "full", "dvw", "lvw", "svw", "min", "max", "fit", ...scaleUnambiguousSpacing()];
  const scaleSizingBlock = () => [isFraction, "screen", "full", "lh", "dvh", "lvh", "svh", "min", "max", "fit", ...scaleUnambiguousSpacing()];
  const scaleColor = () => [themeColor, isArbitraryVariable, isArbitraryValue];
  const scaleBgPosition = () => [...scalePosition(), isArbitraryVariablePosition, isArbitraryPosition, {
    position: [isArbitraryVariable, isArbitraryValue]
  }];
  const scaleBgRepeat = () => ["no-repeat", {
    repeat: ["", "x", "y", "space", "round"]
  }];
  const scaleBgSize = () => ["auto", "cover", "contain", isArbitraryVariableSize, isArbitrarySize, {
    size: [isArbitraryVariable, isArbitraryValue]
  }];
  const scaleGradientStopPosition = () => [isPercent, isArbitraryVariableLength, isArbitraryLength];
  const scaleRadius = () => [
    // Deprecated since Tailwind CSS v4.0.0
    "",
    "none",
    "full",
    themeRadius,
    isArbitraryVariable,
    isArbitraryValue
  ];
  const scaleBorderWidth = () => ["", isNumber, isArbitraryVariableLength, isArbitraryLength];
  const scaleLineStyle = () => ["solid", "dashed", "dotted", "double"];
  const scaleBlendMode = () => ["normal", "multiply", "screen", "overlay", "darken", "lighten", "color-dodge", "color-burn", "hard-light", "soft-light", "difference", "exclusion", "hue", "saturation", "color", "luminosity"];
  const scaleMaskImagePosition = () => [isNumber, isPercent, isArbitraryVariablePosition, isArbitraryPosition];
  const scaleBlur = () => [
    // Deprecated since Tailwind CSS v4.0.0
    "",
    "none",
    themeBlur,
    isArbitraryVariable,
    isArbitraryValue
  ];
  const scaleRotate = () => ["none", isNumber, isArbitraryVariable, isArbitraryValue];
  const scaleScale = () => ["none", isNumber, isArbitraryVariable, isArbitraryValue];
  const scaleSkew = () => [isNumber, isArbitraryVariable, isArbitraryValue];
  const scaleTranslate = () => [isFraction, "full", ...scaleUnambiguousSpacing()];
  return {
    cacheSize: 500,
    theme: {
      animate: ["spin", "ping", "pulse", "bounce"],
      aspect: ["video"],
      blur: [isTshirtSize],
      breakpoint: [isTshirtSize],
      color: [isAny],
      container: [isTshirtSize],
      "drop-shadow": [isTshirtSize],
      ease: ["in", "out", "in-out"],
      font: [isAnyNonArbitrary],
      "font-weight": ["thin", "extralight", "light", "normal", "medium", "semibold", "bold", "extrabold", "black"],
      "inset-shadow": [isTshirtSize],
      leading: ["none", "tight", "snug", "normal", "relaxed", "loose"],
      perspective: ["dramatic", "near", "normal", "midrange", "distant", "none"],
      radius: [isTshirtSize],
      shadow: [isTshirtSize],
      spacing: ["px", isNumber],
      text: [isTshirtSize],
      "text-shadow": [isTshirtSize],
      tracking: ["tighter", "tight", "normal", "wide", "wider", "widest"]
    },
    classGroups: {
      // --------------
      // --- Layout ---
      // --------------
      /**
       * Aspect Ratio
       * @see https://tailwindcss.com/docs/aspect-ratio
       */
      aspect: [{
        aspect: ["auto", "square", isFraction, isArbitraryValue, isArbitraryVariable, themeAspect]
      }],
      /**
       * Container
       * @see https://tailwindcss.com/docs/container
       * @deprecated since Tailwind CSS v4.0.0
       */
      container: ["container"],
      /**
       * Columns
       * @see https://tailwindcss.com/docs/columns
       */
      columns: [{
        columns: [isNumber, isArbitraryValue, isArbitraryVariable, themeContainer]
      }],
      /**
       * Break After
       * @see https://tailwindcss.com/docs/break-after
       */
      "break-after": [{
        "break-after": scaleBreak()
      }],
      /**
       * Break Before
       * @see https://tailwindcss.com/docs/break-before
       */
      "break-before": [{
        "break-before": scaleBreak()
      }],
      /**
       * Break Inside
       * @see https://tailwindcss.com/docs/break-inside
       */
      "break-inside": [{
        "break-inside": ["auto", "avoid", "avoid-page", "avoid-column"]
      }],
      /**
       * Box Decoration Break
       * @see https://tailwindcss.com/docs/box-decoration-break
       */
      "box-decoration": [{
        "box-decoration": ["slice", "clone"]
      }],
      /**
       * Box Sizing
       * @see https://tailwindcss.com/docs/box-sizing
       */
      box: [{
        box: ["border", "content"]
      }],
      /**
       * Display
       * @see https://tailwindcss.com/docs/display
       */
      display: ["block", "inline-block", "inline", "flex", "inline-flex", "table", "inline-table", "table-caption", "table-cell", "table-column", "table-column-group", "table-footer-group", "table-header-group", "table-row-group", "table-row", "flow-root", "grid", "inline-grid", "contents", "list-item", "hidden"],
      /**
       * Screen Reader Only
       * @see https://tailwindcss.com/docs/display#screen-reader-only
       */
      sr: ["sr-only", "not-sr-only"],
      /**
       * Floats
       * @see https://tailwindcss.com/docs/float
       */
      float: [{
        float: ["right", "left", "none", "start", "end"]
      }],
      /**
       * Clear
       * @see https://tailwindcss.com/docs/clear
       */
      clear: [{
        clear: ["left", "right", "both", "none", "start", "end"]
      }],
      /**
       * Isolation
       * @see https://tailwindcss.com/docs/isolation
       */
      isolation: ["isolate", "isolation-auto"],
      /**
       * Object Fit
       * @see https://tailwindcss.com/docs/object-fit
       */
      "object-fit": [{
        object: ["contain", "cover", "fill", "none", "scale-down"]
      }],
      /**
       * Object Position
       * @see https://tailwindcss.com/docs/object-position
       */
      "object-position": [{
        object: scalePositionWithArbitrary()
      }],
      /**
       * Overflow
       * @see https://tailwindcss.com/docs/overflow
       */
      overflow: [{
        overflow: scaleOverflow()
      }],
      /**
       * Overflow X
       * @see https://tailwindcss.com/docs/overflow
       */
      "overflow-x": [{
        "overflow-x": scaleOverflow()
      }],
      /**
       * Overflow Y
       * @see https://tailwindcss.com/docs/overflow
       */
      "overflow-y": [{
        "overflow-y": scaleOverflow()
      }],
      /**
       * Overscroll Behavior
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      overscroll: [{
        overscroll: scaleOverscroll()
      }],
      /**
       * Overscroll Behavior X
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      "overscroll-x": [{
        "overscroll-x": scaleOverscroll()
      }],
      /**
       * Overscroll Behavior Y
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      "overscroll-y": [{
        "overscroll-y": scaleOverscroll()
      }],
      /**
       * Position
       * @see https://tailwindcss.com/docs/position
       */
      position: ["static", "fixed", "absolute", "relative", "sticky"],
      /**
       * Inset
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      inset: [{
        inset: scaleInset()
      }],
      /**
       * Inset Inline
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      "inset-x": [{
        "inset-x": scaleInset()
      }],
      /**
       * Inset Block
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      "inset-y": [{
        "inset-y": scaleInset()
      }],
      /**
       * Inset Inline Start
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       * @todo class group will be renamed to `inset-s` in next major release
       */
      start: [{
        "inset-s": scaleInset(),
        /**
         * @deprecated since Tailwind CSS v4.2.0 in favor of `inset-s-*` utilities.
         * @see https://github.com/tailwindlabs/tailwindcss/pull/19613
         */
        start: scaleInset()
      }],
      /**
       * Inset Inline End
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       * @todo class group will be renamed to `inset-e` in next major release
       */
      end: [{
        "inset-e": scaleInset(),
        /**
         * @deprecated since Tailwind CSS v4.2.0 in favor of `inset-e-*` utilities.
         * @see https://github.com/tailwindlabs/tailwindcss/pull/19613
         */
        end: scaleInset()
      }],
      /**
       * Inset Block Start
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      "inset-bs": [{
        "inset-bs": scaleInset()
      }],
      /**
       * Inset Block End
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      "inset-be": [{
        "inset-be": scaleInset()
      }],
      /**
       * Top
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      top: [{
        top: scaleInset()
      }],
      /**
       * Right
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      right: [{
        right: scaleInset()
      }],
      /**
       * Bottom
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      bottom: [{
        bottom: scaleInset()
      }],
      /**
       * Left
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      left: [{
        left: scaleInset()
      }],
      /**
       * Visibility
       * @see https://tailwindcss.com/docs/visibility
       */
      visibility: ["visible", "invisible", "collapse"],
      /**
       * Z-Index
       * @see https://tailwindcss.com/docs/z-index
       */
      z: [{
        z: [isInteger, "auto", isArbitraryVariable, isArbitraryValue]
      }],
      // ------------------------
      // --- Flexbox and Grid ---
      // ------------------------
      /**
       * Flex Basis
       * @see https://tailwindcss.com/docs/flex-basis
       */
      basis: [{
        basis: [isFraction, "full", "auto", themeContainer, ...scaleUnambiguousSpacing()]
      }],
      /**
       * Flex Direction
       * @see https://tailwindcss.com/docs/flex-direction
       */
      "flex-direction": [{
        flex: ["row", "row-reverse", "col", "col-reverse"]
      }],
      /**
       * Flex Wrap
       * @see https://tailwindcss.com/docs/flex-wrap
       */
      "flex-wrap": [{
        flex: ["nowrap", "wrap", "wrap-reverse"]
      }],
      /**
       * Flex
       * @see https://tailwindcss.com/docs/flex
       */
      flex: [{
        flex: [isNumber, isFraction, "auto", "initial", "none", isArbitraryValue]
      }],
      /**
       * Flex Grow
       * @see https://tailwindcss.com/docs/flex-grow
       */
      grow: [{
        grow: ["", isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Flex Shrink
       * @see https://tailwindcss.com/docs/flex-shrink
       */
      shrink: [{
        shrink: ["", isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Order
       * @see https://tailwindcss.com/docs/order
       */
      order: [{
        order: [isInteger, "first", "last", "none", isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Grid Template Columns
       * @see https://tailwindcss.com/docs/grid-template-columns
       */
      "grid-cols": [{
        "grid-cols": scaleGridTemplateColsRows()
      }],
      /**
       * Grid Column Start / End
       * @see https://tailwindcss.com/docs/grid-column
       */
      "col-start-end": [{
        col: scaleGridColRowStartAndEnd()
      }],
      /**
       * Grid Column Start
       * @see https://tailwindcss.com/docs/grid-column
       */
      "col-start": [{
        "col-start": scaleGridColRowStartOrEnd()
      }],
      /**
       * Grid Column End
       * @see https://tailwindcss.com/docs/grid-column
       */
      "col-end": [{
        "col-end": scaleGridColRowStartOrEnd()
      }],
      /**
       * Grid Template Rows
       * @see https://tailwindcss.com/docs/grid-template-rows
       */
      "grid-rows": [{
        "grid-rows": scaleGridTemplateColsRows()
      }],
      /**
       * Grid Row Start / End
       * @see https://tailwindcss.com/docs/grid-row
       */
      "row-start-end": [{
        row: scaleGridColRowStartAndEnd()
      }],
      /**
       * Grid Row Start
       * @see https://tailwindcss.com/docs/grid-row
       */
      "row-start": [{
        "row-start": scaleGridColRowStartOrEnd()
      }],
      /**
       * Grid Row End
       * @see https://tailwindcss.com/docs/grid-row
       */
      "row-end": [{
        "row-end": scaleGridColRowStartOrEnd()
      }],
      /**
       * Grid Auto Flow
       * @see https://tailwindcss.com/docs/grid-auto-flow
       */
      "grid-flow": [{
        "grid-flow": ["row", "col", "dense", "row-dense", "col-dense"]
      }],
      /**
       * Grid Auto Columns
       * @see https://tailwindcss.com/docs/grid-auto-columns
       */
      "auto-cols": [{
        "auto-cols": scaleGridAutoColsRows()
      }],
      /**
       * Grid Auto Rows
       * @see https://tailwindcss.com/docs/grid-auto-rows
       */
      "auto-rows": [{
        "auto-rows": scaleGridAutoColsRows()
      }],
      /**
       * Gap
       * @see https://tailwindcss.com/docs/gap
       */
      gap: [{
        gap: scaleUnambiguousSpacing()
      }],
      /**
       * Gap X
       * @see https://tailwindcss.com/docs/gap
       */
      "gap-x": [{
        "gap-x": scaleUnambiguousSpacing()
      }],
      /**
       * Gap Y
       * @see https://tailwindcss.com/docs/gap
       */
      "gap-y": [{
        "gap-y": scaleUnambiguousSpacing()
      }],
      /**
       * Justify Content
       * @see https://tailwindcss.com/docs/justify-content
       */
      "justify-content": [{
        justify: [...scaleAlignPrimaryAxis(), "normal"]
      }],
      /**
       * Justify Items
       * @see https://tailwindcss.com/docs/justify-items
       */
      "justify-items": [{
        "justify-items": [...scaleAlignSecondaryAxis(), "normal"]
      }],
      /**
       * Justify Self
       * @see https://tailwindcss.com/docs/justify-self
       */
      "justify-self": [{
        "justify-self": ["auto", ...scaleAlignSecondaryAxis()]
      }],
      /**
       * Align Content
       * @see https://tailwindcss.com/docs/align-content
       */
      "align-content": [{
        content: ["normal", ...scaleAlignPrimaryAxis()]
      }],
      /**
       * Align Items
       * @see https://tailwindcss.com/docs/align-items
       */
      "align-items": [{
        items: [...scaleAlignSecondaryAxis(), {
          baseline: ["", "last"]
        }]
      }],
      /**
       * Align Self
       * @see https://tailwindcss.com/docs/align-self
       */
      "align-self": [{
        self: ["auto", ...scaleAlignSecondaryAxis(), {
          baseline: ["", "last"]
        }]
      }],
      /**
       * Place Content
       * @see https://tailwindcss.com/docs/place-content
       */
      "place-content": [{
        "place-content": scaleAlignPrimaryAxis()
      }],
      /**
       * Place Items
       * @see https://tailwindcss.com/docs/place-items
       */
      "place-items": [{
        "place-items": [...scaleAlignSecondaryAxis(), "baseline"]
      }],
      /**
       * Place Self
       * @see https://tailwindcss.com/docs/place-self
       */
      "place-self": [{
        "place-self": ["auto", ...scaleAlignSecondaryAxis()]
      }],
      // Spacing
      /**
       * Padding
       * @see https://tailwindcss.com/docs/padding
       */
      p: [{
        p: scaleUnambiguousSpacing()
      }],
      /**
       * Padding Inline
       * @see https://tailwindcss.com/docs/padding
       */
      px: [{
        px: scaleUnambiguousSpacing()
      }],
      /**
       * Padding Block
       * @see https://tailwindcss.com/docs/padding
       */
      py: [{
        py: scaleUnambiguousSpacing()
      }],
      /**
       * Padding Inline Start
       * @see https://tailwindcss.com/docs/padding
       */
      ps: [{
        ps: scaleUnambiguousSpacing()
      }],
      /**
       * Padding Inline End
       * @see https://tailwindcss.com/docs/padding
       */
      pe: [{
        pe: scaleUnambiguousSpacing()
      }],
      /**
       * Padding Block Start
       * @see https://tailwindcss.com/docs/padding
       */
      pbs: [{
        pbs: scaleUnambiguousSpacing()
      }],
      /**
       * Padding Block End
       * @see https://tailwindcss.com/docs/padding
       */
      pbe: [{
        pbe: scaleUnambiguousSpacing()
      }],
      /**
       * Padding Top
       * @see https://tailwindcss.com/docs/padding
       */
      pt: [{
        pt: scaleUnambiguousSpacing()
      }],
      /**
       * Padding Right
       * @see https://tailwindcss.com/docs/padding
       */
      pr: [{
        pr: scaleUnambiguousSpacing()
      }],
      /**
       * Padding Bottom
       * @see https://tailwindcss.com/docs/padding
       */
      pb: [{
        pb: scaleUnambiguousSpacing()
      }],
      /**
       * Padding Left
       * @see https://tailwindcss.com/docs/padding
       */
      pl: [{
        pl: scaleUnambiguousSpacing()
      }],
      /**
       * Margin
       * @see https://tailwindcss.com/docs/margin
       */
      m: [{
        m: scaleMargin()
      }],
      /**
       * Margin Inline
       * @see https://tailwindcss.com/docs/margin
       */
      mx: [{
        mx: scaleMargin()
      }],
      /**
       * Margin Block
       * @see https://tailwindcss.com/docs/margin
       */
      my: [{
        my: scaleMargin()
      }],
      /**
       * Margin Inline Start
       * @see https://tailwindcss.com/docs/margin
       */
      ms: [{
        ms: scaleMargin()
      }],
      /**
       * Margin Inline End
       * @see https://tailwindcss.com/docs/margin
       */
      me: [{
        me: scaleMargin()
      }],
      /**
       * Margin Block Start
       * @see https://tailwindcss.com/docs/margin
       */
      mbs: [{
        mbs: scaleMargin()
      }],
      /**
       * Margin Block End
       * @see https://tailwindcss.com/docs/margin
       */
      mbe: [{
        mbe: scaleMargin()
      }],
      /**
       * Margin Top
       * @see https://tailwindcss.com/docs/margin
       */
      mt: [{
        mt: scaleMargin()
      }],
      /**
       * Margin Right
       * @see https://tailwindcss.com/docs/margin
       */
      mr: [{
        mr: scaleMargin()
      }],
      /**
       * Margin Bottom
       * @see https://tailwindcss.com/docs/margin
       */
      mb: [{
        mb: scaleMargin()
      }],
      /**
       * Margin Left
       * @see https://tailwindcss.com/docs/margin
       */
      ml: [{
        ml: scaleMargin()
      }],
      /**
       * Space Between X
       * @see https://tailwindcss.com/docs/margin#adding-space-between-children
       */
      "space-x": [{
        "space-x": scaleUnambiguousSpacing()
      }],
      /**
       * Space Between X Reverse
       * @see https://tailwindcss.com/docs/margin#adding-space-between-children
       */
      "space-x-reverse": ["space-x-reverse"],
      /**
       * Space Between Y
       * @see https://tailwindcss.com/docs/margin#adding-space-between-children
       */
      "space-y": [{
        "space-y": scaleUnambiguousSpacing()
      }],
      /**
       * Space Between Y Reverse
       * @see https://tailwindcss.com/docs/margin#adding-space-between-children
       */
      "space-y-reverse": ["space-y-reverse"],
      // --------------
      // --- Sizing ---
      // --------------
      /**
       * Size
       * @see https://tailwindcss.com/docs/width#setting-both-width-and-height
       */
      size: [{
        size: scaleSizing()
      }],
      /**
       * Inline Size
       * @see https://tailwindcss.com/docs/width
       */
      "inline-size": [{
        inline: ["auto", ...scaleSizingInline()]
      }],
      /**
       * Min-Inline Size
       * @see https://tailwindcss.com/docs/min-width
       */
      "min-inline-size": [{
        "min-inline": ["auto", ...scaleSizingInline()]
      }],
      /**
       * Max-Inline Size
       * @see https://tailwindcss.com/docs/max-width
       */
      "max-inline-size": [{
        "max-inline": ["none", ...scaleSizingInline()]
      }],
      /**
       * Block Size
       * @see https://tailwindcss.com/docs/height
       */
      "block-size": [{
        block: ["auto", ...scaleSizingBlock()]
      }],
      /**
       * Min-Block Size
       * @see https://tailwindcss.com/docs/min-height
       */
      "min-block-size": [{
        "min-block": ["auto", ...scaleSizingBlock()]
      }],
      /**
       * Max-Block Size
       * @see https://tailwindcss.com/docs/max-height
       */
      "max-block-size": [{
        "max-block": ["none", ...scaleSizingBlock()]
      }],
      /**
       * Width
       * @see https://tailwindcss.com/docs/width
       */
      w: [{
        w: [themeContainer, "screen", ...scaleSizing()]
      }],
      /**
       * Min-Width
       * @see https://tailwindcss.com/docs/min-width
       */
      "min-w": [{
        "min-w": [
          themeContainer,
          "screen",
          /** Deprecated. @see https://github.com/tailwindlabs/tailwindcss.com/issues/2027#issuecomment-2620152757 */
          "none",
          ...scaleSizing()
        ]
      }],
      /**
       * Max-Width
       * @see https://tailwindcss.com/docs/max-width
       */
      "max-w": [{
        "max-w": [
          themeContainer,
          "screen",
          "none",
          /** Deprecated since Tailwind CSS v4.0.0. @see https://github.com/tailwindlabs/tailwindcss.com/issues/2027#issuecomment-2620152757 */
          "prose",
          /** Deprecated since Tailwind CSS v4.0.0. @see https://github.com/tailwindlabs/tailwindcss.com/issues/2027#issuecomment-2620152757 */
          {
            screen: [themeBreakpoint]
          },
          ...scaleSizing()
        ]
      }],
      /**
       * Height
       * @see https://tailwindcss.com/docs/height
       */
      h: [{
        h: ["screen", "lh", ...scaleSizing()]
      }],
      /**
       * Min-Height
       * @see https://tailwindcss.com/docs/min-height
       */
      "min-h": [{
        "min-h": ["screen", "lh", "none", ...scaleSizing()]
      }],
      /**
       * Max-Height
       * @see https://tailwindcss.com/docs/max-height
       */
      "max-h": [{
        "max-h": ["screen", "lh", ...scaleSizing()]
      }],
      // ------------------
      // --- Typography ---
      // ------------------
      /**
       * Font Size
       * @see https://tailwindcss.com/docs/font-size
       */
      "font-size": [{
        text: ["base", themeText, isArbitraryVariableLength, isArbitraryLength]
      }],
      /**
       * Font Smoothing
       * @see https://tailwindcss.com/docs/font-smoothing
       */
      "font-smoothing": ["antialiased", "subpixel-antialiased"],
      /**
       * Font Style
       * @see https://tailwindcss.com/docs/font-style
       */
      "font-style": ["italic", "not-italic"],
      /**
       * Font Weight
       * @see https://tailwindcss.com/docs/font-weight
       */
      "font-weight": [{
        font: [themeFontWeight, isArbitraryVariableWeight, isArbitraryWeight]
      }],
      /**
       * Font Stretch
       * @see https://tailwindcss.com/docs/font-stretch
       */
      "font-stretch": [{
        "font-stretch": ["ultra-condensed", "extra-condensed", "condensed", "semi-condensed", "normal", "semi-expanded", "expanded", "extra-expanded", "ultra-expanded", isPercent, isArbitraryValue]
      }],
      /**
       * Font Family
       * @see https://tailwindcss.com/docs/font-family
       */
      "font-family": [{
        font: [isArbitraryVariableFamilyName, isArbitraryFamilyName, themeFont]
      }],
      /**
       * Font Feature Settings
       * @see https://tailwindcss.com/docs/font-feature-settings
       */
      "font-features": [{
        "font-features": [isArbitraryValue]
      }],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-normal": ["normal-nums"],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-ordinal": ["ordinal"],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-slashed-zero": ["slashed-zero"],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-figure": ["lining-nums", "oldstyle-nums"],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-spacing": ["proportional-nums", "tabular-nums"],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-fraction": ["diagonal-fractions", "stacked-fractions"],
      /**
       * Letter Spacing
       * @see https://tailwindcss.com/docs/letter-spacing
       */
      tracking: [{
        tracking: [themeTracking, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Line Clamp
       * @see https://tailwindcss.com/docs/line-clamp
       */
      "line-clamp": [{
        "line-clamp": [isNumber, "none", isArbitraryVariable, isArbitraryNumber]
      }],
      /**
       * Line Height
       * @see https://tailwindcss.com/docs/line-height
       */
      leading: [{
        leading: [
          /** Deprecated since Tailwind CSS v4.0.0. @see https://github.com/tailwindlabs/tailwindcss.com/issues/2027#issuecomment-2620152757 */
          themeLeading,
          ...scaleUnambiguousSpacing()
        ]
      }],
      /**
       * List Style Image
       * @see https://tailwindcss.com/docs/list-style-image
       */
      "list-image": [{
        "list-image": ["none", isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * List Style Position
       * @see https://tailwindcss.com/docs/list-style-position
       */
      "list-style-position": [{
        list: ["inside", "outside"]
      }],
      /**
       * List Style Type
       * @see https://tailwindcss.com/docs/list-style-type
       */
      "list-style-type": [{
        list: ["disc", "decimal", "none", isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Text Alignment
       * @see https://tailwindcss.com/docs/text-align
       */
      "text-alignment": [{
        text: ["left", "center", "right", "justify", "start", "end"]
      }],
      /**
       * Placeholder Color
       * @deprecated since Tailwind CSS v3.0.0
       * @see https://v3.tailwindcss.com/docs/placeholder-color
       */
      "placeholder-color": [{
        placeholder: scaleColor()
      }],
      /**
       * Text Color
       * @see https://tailwindcss.com/docs/text-color
       */
      "text-color": [{
        text: scaleColor()
      }],
      /**
       * Text Decoration
       * @see https://tailwindcss.com/docs/text-decoration
       */
      "text-decoration": ["underline", "overline", "line-through", "no-underline"],
      /**
       * Text Decoration Style
       * @see https://tailwindcss.com/docs/text-decoration-style
       */
      "text-decoration-style": [{
        decoration: [...scaleLineStyle(), "wavy"]
      }],
      /**
       * Text Decoration Thickness
       * @see https://tailwindcss.com/docs/text-decoration-thickness
       */
      "text-decoration-thickness": [{
        decoration: [isNumber, "from-font", "auto", isArbitraryVariable, isArbitraryLength]
      }],
      /**
       * Text Decoration Color
       * @see https://tailwindcss.com/docs/text-decoration-color
       */
      "text-decoration-color": [{
        decoration: scaleColor()
      }],
      /**
       * Text Underline Offset
       * @see https://tailwindcss.com/docs/text-underline-offset
       */
      "underline-offset": [{
        "underline-offset": [isNumber, "auto", isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Text Transform
       * @see https://tailwindcss.com/docs/text-transform
       */
      "text-transform": ["uppercase", "lowercase", "capitalize", "normal-case"],
      /**
       * Text Overflow
       * @see https://tailwindcss.com/docs/text-overflow
       */
      "text-overflow": ["truncate", "text-ellipsis", "text-clip"],
      /**
       * Text Wrap
       * @see https://tailwindcss.com/docs/text-wrap
       */
      "text-wrap": [{
        text: ["wrap", "nowrap", "balance", "pretty"]
      }],
      /**
       * Text Indent
       * @see https://tailwindcss.com/docs/text-indent
       */
      indent: [{
        indent: scaleUnambiguousSpacing()
      }],
      /**
       * Vertical Alignment
       * @see https://tailwindcss.com/docs/vertical-align
       */
      "vertical-align": [{
        align: ["baseline", "top", "middle", "bottom", "text-top", "text-bottom", "sub", "super", isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Whitespace
       * @see https://tailwindcss.com/docs/whitespace
       */
      whitespace: [{
        whitespace: ["normal", "nowrap", "pre", "pre-line", "pre-wrap", "break-spaces"]
      }],
      /**
       * Word Break
       * @see https://tailwindcss.com/docs/word-break
       */
      break: [{
        break: ["normal", "words", "all", "keep"]
      }],
      /**
       * Overflow Wrap
       * @see https://tailwindcss.com/docs/overflow-wrap
       */
      wrap: [{
        wrap: ["break-word", "anywhere", "normal"]
      }],
      /**
       * Hyphens
       * @see https://tailwindcss.com/docs/hyphens
       */
      hyphens: [{
        hyphens: ["none", "manual", "auto"]
      }],
      /**
       * Content
       * @see https://tailwindcss.com/docs/content
       */
      content: [{
        content: ["none", isArbitraryVariable, isArbitraryValue]
      }],
      // -------------------
      // --- Backgrounds ---
      // -------------------
      /**
       * Background Attachment
       * @see https://tailwindcss.com/docs/background-attachment
       */
      "bg-attachment": [{
        bg: ["fixed", "local", "scroll"]
      }],
      /**
       * Background Clip
       * @see https://tailwindcss.com/docs/background-clip
       */
      "bg-clip": [{
        "bg-clip": ["border", "padding", "content", "text"]
      }],
      /**
       * Background Origin
       * @see https://tailwindcss.com/docs/background-origin
       */
      "bg-origin": [{
        "bg-origin": ["border", "padding", "content"]
      }],
      /**
       * Background Position
       * @see https://tailwindcss.com/docs/background-position
       */
      "bg-position": [{
        bg: scaleBgPosition()
      }],
      /**
       * Background Repeat
       * @see https://tailwindcss.com/docs/background-repeat
       */
      "bg-repeat": [{
        bg: scaleBgRepeat()
      }],
      /**
       * Background Size
       * @see https://tailwindcss.com/docs/background-size
       */
      "bg-size": [{
        bg: scaleBgSize()
      }],
      /**
       * Background Image
       * @see https://tailwindcss.com/docs/background-image
       */
      "bg-image": [{
        bg: ["none", {
          linear: [{
            to: ["t", "tr", "r", "br", "b", "bl", "l", "tl"]
          }, isInteger, isArbitraryVariable, isArbitraryValue],
          radial: ["", isArbitraryVariable, isArbitraryValue],
          conic: [isInteger, isArbitraryVariable, isArbitraryValue]
        }, isArbitraryVariableImage, isArbitraryImage]
      }],
      /**
       * Background Color
       * @see https://tailwindcss.com/docs/background-color
       */
      "bg-color": [{
        bg: scaleColor()
      }],
      /**
       * Gradient Color Stops From Position
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-from-pos": [{
        from: scaleGradientStopPosition()
      }],
      /**
       * Gradient Color Stops Via Position
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-via-pos": [{
        via: scaleGradientStopPosition()
      }],
      /**
       * Gradient Color Stops To Position
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-to-pos": [{
        to: scaleGradientStopPosition()
      }],
      /**
       * Gradient Color Stops From
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-from": [{
        from: scaleColor()
      }],
      /**
       * Gradient Color Stops Via
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-via": [{
        via: scaleColor()
      }],
      /**
       * Gradient Color Stops To
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-to": [{
        to: scaleColor()
      }],
      // ---------------
      // --- Borders ---
      // ---------------
      /**
       * Border Radius
       * @see https://tailwindcss.com/docs/border-radius
       */
      rounded: [{
        rounded: scaleRadius()
      }],
      /**
       * Border Radius Start
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-s": [{
        "rounded-s": scaleRadius()
      }],
      /**
       * Border Radius End
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-e": [{
        "rounded-e": scaleRadius()
      }],
      /**
       * Border Radius Top
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-t": [{
        "rounded-t": scaleRadius()
      }],
      /**
       * Border Radius Right
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-r": [{
        "rounded-r": scaleRadius()
      }],
      /**
       * Border Radius Bottom
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-b": [{
        "rounded-b": scaleRadius()
      }],
      /**
       * Border Radius Left
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-l": [{
        "rounded-l": scaleRadius()
      }],
      /**
       * Border Radius Start Start
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-ss": [{
        "rounded-ss": scaleRadius()
      }],
      /**
       * Border Radius Start End
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-se": [{
        "rounded-se": scaleRadius()
      }],
      /**
       * Border Radius End End
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-ee": [{
        "rounded-ee": scaleRadius()
      }],
      /**
       * Border Radius End Start
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-es": [{
        "rounded-es": scaleRadius()
      }],
      /**
       * Border Radius Top Left
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-tl": [{
        "rounded-tl": scaleRadius()
      }],
      /**
       * Border Radius Top Right
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-tr": [{
        "rounded-tr": scaleRadius()
      }],
      /**
       * Border Radius Bottom Right
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-br": [{
        "rounded-br": scaleRadius()
      }],
      /**
       * Border Radius Bottom Left
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-bl": [{
        "rounded-bl": scaleRadius()
      }],
      /**
       * Border Width
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w": [{
        border: scaleBorderWidth()
      }],
      /**
       * Border Width Inline
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-x": [{
        "border-x": scaleBorderWidth()
      }],
      /**
       * Border Width Block
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-y": [{
        "border-y": scaleBorderWidth()
      }],
      /**
       * Border Width Inline Start
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-s": [{
        "border-s": scaleBorderWidth()
      }],
      /**
       * Border Width Inline End
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-e": [{
        "border-e": scaleBorderWidth()
      }],
      /**
       * Border Width Block Start
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-bs": [{
        "border-bs": scaleBorderWidth()
      }],
      /**
       * Border Width Block End
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-be": [{
        "border-be": scaleBorderWidth()
      }],
      /**
       * Border Width Top
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-t": [{
        "border-t": scaleBorderWidth()
      }],
      /**
       * Border Width Right
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-r": [{
        "border-r": scaleBorderWidth()
      }],
      /**
       * Border Width Bottom
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-b": [{
        "border-b": scaleBorderWidth()
      }],
      /**
       * Border Width Left
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-l": [{
        "border-l": scaleBorderWidth()
      }],
      /**
       * Divide Width X
       * @see https://tailwindcss.com/docs/border-width#between-children
       */
      "divide-x": [{
        "divide-x": scaleBorderWidth()
      }],
      /**
       * Divide Width X Reverse
       * @see https://tailwindcss.com/docs/border-width#between-children
       */
      "divide-x-reverse": ["divide-x-reverse"],
      /**
       * Divide Width Y
       * @see https://tailwindcss.com/docs/border-width#between-children
       */
      "divide-y": [{
        "divide-y": scaleBorderWidth()
      }],
      /**
       * Divide Width Y Reverse
       * @see https://tailwindcss.com/docs/border-width#between-children
       */
      "divide-y-reverse": ["divide-y-reverse"],
      /**
       * Border Style
       * @see https://tailwindcss.com/docs/border-style
       */
      "border-style": [{
        border: [...scaleLineStyle(), "hidden", "none"]
      }],
      /**
       * Divide Style
       * @see https://tailwindcss.com/docs/border-style#setting-the-divider-style
       */
      "divide-style": [{
        divide: [...scaleLineStyle(), "hidden", "none"]
      }],
      /**
       * Border Color
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color": [{
        border: scaleColor()
      }],
      /**
       * Border Color Inline
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-x": [{
        "border-x": scaleColor()
      }],
      /**
       * Border Color Block
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-y": [{
        "border-y": scaleColor()
      }],
      /**
       * Border Color Inline Start
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-s": [{
        "border-s": scaleColor()
      }],
      /**
       * Border Color Inline End
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-e": [{
        "border-e": scaleColor()
      }],
      /**
       * Border Color Block Start
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-bs": [{
        "border-bs": scaleColor()
      }],
      /**
       * Border Color Block End
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-be": [{
        "border-be": scaleColor()
      }],
      /**
       * Border Color Top
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-t": [{
        "border-t": scaleColor()
      }],
      /**
       * Border Color Right
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-r": [{
        "border-r": scaleColor()
      }],
      /**
       * Border Color Bottom
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-b": [{
        "border-b": scaleColor()
      }],
      /**
       * Border Color Left
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-l": [{
        "border-l": scaleColor()
      }],
      /**
       * Divide Color
       * @see https://tailwindcss.com/docs/divide-color
       */
      "divide-color": [{
        divide: scaleColor()
      }],
      /**
       * Outline Style
       * @see https://tailwindcss.com/docs/outline-style
       */
      "outline-style": [{
        outline: [...scaleLineStyle(), "none", "hidden"]
      }],
      /**
       * Outline Offset
       * @see https://tailwindcss.com/docs/outline-offset
       */
      "outline-offset": [{
        "outline-offset": [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Outline Width
       * @see https://tailwindcss.com/docs/outline-width
       */
      "outline-w": [{
        outline: ["", isNumber, isArbitraryVariableLength, isArbitraryLength]
      }],
      /**
       * Outline Color
       * @see https://tailwindcss.com/docs/outline-color
       */
      "outline-color": [{
        outline: scaleColor()
      }],
      // ---------------
      // --- Effects ---
      // ---------------
      /**
       * Box Shadow
       * @see https://tailwindcss.com/docs/box-shadow
       */
      shadow: [{
        shadow: [
          // Deprecated since Tailwind CSS v4.0.0
          "",
          "none",
          themeShadow,
          isArbitraryVariableShadow,
          isArbitraryShadow
        ]
      }],
      /**
       * Box Shadow Color
       * @see https://tailwindcss.com/docs/box-shadow#setting-the-shadow-color
       */
      "shadow-color": [{
        shadow: scaleColor()
      }],
      /**
       * Inset Box Shadow
       * @see https://tailwindcss.com/docs/box-shadow#adding-an-inset-shadow
       */
      "inset-shadow": [{
        "inset-shadow": ["none", themeInsetShadow, isArbitraryVariableShadow, isArbitraryShadow]
      }],
      /**
       * Inset Box Shadow Color
       * @see https://tailwindcss.com/docs/box-shadow#setting-the-inset-shadow-color
       */
      "inset-shadow-color": [{
        "inset-shadow": scaleColor()
      }],
      /**
       * Ring Width
       * @see https://tailwindcss.com/docs/box-shadow#adding-a-ring
       */
      "ring-w": [{
        ring: scaleBorderWidth()
      }],
      /**
       * Ring Width Inset
       * @see https://v3.tailwindcss.com/docs/ring-width#inset-rings
       * @deprecated since Tailwind CSS v4.0.0
       * @see https://github.com/tailwindlabs/tailwindcss/blob/v4.0.0/packages/tailwindcss/src/utilities.ts#L4158
       */
      "ring-w-inset": ["ring-inset"],
      /**
       * Ring Color
       * @see https://tailwindcss.com/docs/box-shadow#setting-the-ring-color
       */
      "ring-color": [{
        ring: scaleColor()
      }],
      /**
       * Ring Offset Width
       * @see https://v3.tailwindcss.com/docs/ring-offset-width
       * @deprecated since Tailwind CSS v4.0.0
       * @see https://github.com/tailwindlabs/tailwindcss/blob/v4.0.0/packages/tailwindcss/src/utilities.ts#L4158
       */
      "ring-offset-w": [{
        "ring-offset": [isNumber, isArbitraryLength]
      }],
      /**
       * Ring Offset Color
       * @see https://v3.tailwindcss.com/docs/ring-offset-color
       * @deprecated since Tailwind CSS v4.0.0
       * @see https://github.com/tailwindlabs/tailwindcss/blob/v4.0.0/packages/tailwindcss/src/utilities.ts#L4158
       */
      "ring-offset-color": [{
        "ring-offset": scaleColor()
      }],
      /**
       * Inset Ring Width
       * @see https://tailwindcss.com/docs/box-shadow#adding-an-inset-ring
       */
      "inset-ring-w": [{
        "inset-ring": scaleBorderWidth()
      }],
      /**
       * Inset Ring Color
       * @see https://tailwindcss.com/docs/box-shadow#setting-the-inset-ring-color
       */
      "inset-ring-color": [{
        "inset-ring": scaleColor()
      }],
      /**
       * Text Shadow
       * @see https://tailwindcss.com/docs/text-shadow
       */
      "text-shadow": [{
        "text-shadow": ["none", themeTextShadow, isArbitraryVariableShadow, isArbitraryShadow]
      }],
      /**
       * Text Shadow Color
       * @see https://tailwindcss.com/docs/text-shadow#setting-the-shadow-color
       */
      "text-shadow-color": [{
        "text-shadow": scaleColor()
      }],
      /**
       * Opacity
       * @see https://tailwindcss.com/docs/opacity
       */
      opacity: [{
        opacity: [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Mix Blend Mode
       * @see https://tailwindcss.com/docs/mix-blend-mode
       */
      "mix-blend": [{
        "mix-blend": [...scaleBlendMode(), "plus-darker", "plus-lighter"]
      }],
      /**
       * Background Blend Mode
       * @see https://tailwindcss.com/docs/background-blend-mode
       */
      "bg-blend": [{
        "bg-blend": scaleBlendMode()
      }],
      /**
       * Mask Clip
       * @see https://tailwindcss.com/docs/mask-clip
       */
      "mask-clip": [{
        "mask-clip": ["border", "padding", "content", "fill", "stroke", "view"]
      }, "mask-no-clip"],
      /**
       * Mask Composite
       * @see https://tailwindcss.com/docs/mask-composite
       */
      "mask-composite": [{
        mask: ["add", "subtract", "intersect", "exclude"]
      }],
      /**
       * Mask Image
       * @see https://tailwindcss.com/docs/mask-image
       */
      "mask-image-linear-pos": [{
        "mask-linear": [isNumber]
      }],
      "mask-image-linear-from-pos": [{
        "mask-linear-from": scaleMaskImagePosition()
      }],
      "mask-image-linear-to-pos": [{
        "mask-linear-to": scaleMaskImagePosition()
      }],
      "mask-image-linear-from-color": [{
        "mask-linear-from": scaleColor()
      }],
      "mask-image-linear-to-color": [{
        "mask-linear-to": scaleColor()
      }],
      "mask-image-t-from-pos": [{
        "mask-t-from": scaleMaskImagePosition()
      }],
      "mask-image-t-to-pos": [{
        "mask-t-to": scaleMaskImagePosition()
      }],
      "mask-image-t-from-color": [{
        "mask-t-from": scaleColor()
      }],
      "mask-image-t-to-color": [{
        "mask-t-to": scaleColor()
      }],
      "mask-image-r-from-pos": [{
        "mask-r-from": scaleMaskImagePosition()
      }],
      "mask-image-r-to-pos": [{
        "mask-r-to": scaleMaskImagePosition()
      }],
      "mask-image-r-from-color": [{
        "mask-r-from": scaleColor()
      }],
      "mask-image-r-to-color": [{
        "mask-r-to": scaleColor()
      }],
      "mask-image-b-from-pos": [{
        "mask-b-from": scaleMaskImagePosition()
      }],
      "mask-image-b-to-pos": [{
        "mask-b-to": scaleMaskImagePosition()
      }],
      "mask-image-b-from-color": [{
        "mask-b-from": scaleColor()
      }],
      "mask-image-b-to-color": [{
        "mask-b-to": scaleColor()
      }],
      "mask-image-l-from-pos": [{
        "mask-l-from": scaleMaskImagePosition()
      }],
      "mask-image-l-to-pos": [{
        "mask-l-to": scaleMaskImagePosition()
      }],
      "mask-image-l-from-color": [{
        "mask-l-from": scaleColor()
      }],
      "mask-image-l-to-color": [{
        "mask-l-to": scaleColor()
      }],
      "mask-image-x-from-pos": [{
        "mask-x-from": scaleMaskImagePosition()
      }],
      "mask-image-x-to-pos": [{
        "mask-x-to": scaleMaskImagePosition()
      }],
      "mask-image-x-from-color": [{
        "mask-x-from": scaleColor()
      }],
      "mask-image-x-to-color": [{
        "mask-x-to": scaleColor()
      }],
      "mask-image-y-from-pos": [{
        "mask-y-from": scaleMaskImagePosition()
      }],
      "mask-image-y-to-pos": [{
        "mask-y-to": scaleMaskImagePosition()
      }],
      "mask-image-y-from-color": [{
        "mask-y-from": scaleColor()
      }],
      "mask-image-y-to-color": [{
        "mask-y-to": scaleColor()
      }],
      "mask-image-radial": [{
        "mask-radial": [isArbitraryVariable, isArbitraryValue]
      }],
      "mask-image-radial-from-pos": [{
        "mask-radial-from": scaleMaskImagePosition()
      }],
      "mask-image-radial-to-pos": [{
        "mask-radial-to": scaleMaskImagePosition()
      }],
      "mask-image-radial-from-color": [{
        "mask-radial-from": scaleColor()
      }],
      "mask-image-radial-to-color": [{
        "mask-radial-to": scaleColor()
      }],
      "mask-image-radial-shape": [{
        "mask-radial": ["circle", "ellipse"]
      }],
      "mask-image-radial-size": [{
        "mask-radial": [{
          closest: ["side", "corner"],
          farthest: ["side", "corner"]
        }]
      }],
      "mask-image-radial-pos": [{
        "mask-radial-at": scalePosition()
      }],
      "mask-image-conic-pos": [{
        "mask-conic": [isNumber]
      }],
      "mask-image-conic-from-pos": [{
        "mask-conic-from": scaleMaskImagePosition()
      }],
      "mask-image-conic-to-pos": [{
        "mask-conic-to": scaleMaskImagePosition()
      }],
      "mask-image-conic-from-color": [{
        "mask-conic-from": scaleColor()
      }],
      "mask-image-conic-to-color": [{
        "mask-conic-to": scaleColor()
      }],
      /**
       * Mask Mode
       * @see https://tailwindcss.com/docs/mask-mode
       */
      "mask-mode": [{
        mask: ["alpha", "luminance", "match"]
      }],
      /**
       * Mask Origin
       * @see https://tailwindcss.com/docs/mask-origin
       */
      "mask-origin": [{
        "mask-origin": ["border", "padding", "content", "fill", "stroke", "view"]
      }],
      /**
       * Mask Position
       * @see https://tailwindcss.com/docs/mask-position
       */
      "mask-position": [{
        mask: scaleBgPosition()
      }],
      /**
       * Mask Repeat
       * @see https://tailwindcss.com/docs/mask-repeat
       */
      "mask-repeat": [{
        mask: scaleBgRepeat()
      }],
      /**
       * Mask Size
       * @see https://tailwindcss.com/docs/mask-size
       */
      "mask-size": [{
        mask: scaleBgSize()
      }],
      /**
       * Mask Type
       * @see https://tailwindcss.com/docs/mask-type
       */
      "mask-type": [{
        "mask-type": ["alpha", "luminance"]
      }],
      /**
       * Mask Image
       * @see https://tailwindcss.com/docs/mask-image
       */
      "mask-image": [{
        mask: ["none", isArbitraryVariable, isArbitraryValue]
      }],
      // ---------------
      // --- Filters ---
      // ---------------
      /**
       * Filter
       * @see https://tailwindcss.com/docs/filter
       */
      filter: [{
        filter: [
          // Deprecated since Tailwind CSS v3.0.0
          "",
          "none",
          isArbitraryVariable,
          isArbitraryValue
        ]
      }],
      /**
       * Blur
       * @see https://tailwindcss.com/docs/blur
       */
      blur: [{
        blur: scaleBlur()
      }],
      /**
       * Brightness
       * @see https://tailwindcss.com/docs/brightness
       */
      brightness: [{
        brightness: [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Contrast
       * @see https://tailwindcss.com/docs/contrast
       */
      contrast: [{
        contrast: [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Drop Shadow
       * @see https://tailwindcss.com/docs/drop-shadow
       */
      "drop-shadow": [{
        "drop-shadow": [
          // Deprecated since Tailwind CSS v4.0.0
          "",
          "none",
          themeDropShadow,
          isArbitraryVariableShadow,
          isArbitraryShadow
        ]
      }],
      /**
       * Drop Shadow Color
       * @see https://tailwindcss.com/docs/filter-drop-shadow#setting-the-shadow-color
       */
      "drop-shadow-color": [{
        "drop-shadow": scaleColor()
      }],
      /**
       * Grayscale
       * @see https://tailwindcss.com/docs/grayscale
       */
      grayscale: [{
        grayscale: ["", isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Hue Rotate
       * @see https://tailwindcss.com/docs/hue-rotate
       */
      "hue-rotate": [{
        "hue-rotate": [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Invert
       * @see https://tailwindcss.com/docs/invert
       */
      invert: [{
        invert: ["", isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Saturate
       * @see https://tailwindcss.com/docs/saturate
       */
      saturate: [{
        saturate: [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Sepia
       * @see https://tailwindcss.com/docs/sepia
       */
      sepia: [{
        sepia: ["", isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Filter
       * @see https://tailwindcss.com/docs/backdrop-filter
       */
      "backdrop-filter": [{
        "backdrop-filter": [
          // Deprecated since Tailwind CSS v3.0.0
          "",
          "none",
          isArbitraryVariable,
          isArbitraryValue
        ]
      }],
      /**
       * Backdrop Blur
       * @see https://tailwindcss.com/docs/backdrop-blur
       */
      "backdrop-blur": [{
        "backdrop-blur": scaleBlur()
      }],
      /**
       * Backdrop Brightness
       * @see https://tailwindcss.com/docs/backdrop-brightness
       */
      "backdrop-brightness": [{
        "backdrop-brightness": [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Contrast
       * @see https://tailwindcss.com/docs/backdrop-contrast
       */
      "backdrop-contrast": [{
        "backdrop-contrast": [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Grayscale
       * @see https://tailwindcss.com/docs/backdrop-grayscale
       */
      "backdrop-grayscale": [{
        "backdrop-grayscale": ["", isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Hue Rotate
       * @see https://tailwindcss.com/docs/backdrop-hue-rotate
       */
      "backdrop-hue-rotate": [{
        "backdrop-hue-rotate": [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Invert
       * @see https://tailwindcss.com/docs/backdrop-invert
       */
      "backdrop-invert": [{
        "backdrop-invert": ["", isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Opacity
       * @see https://tailwindcss.com/docs/backdrop-opacity
       */
      "backdrop-opacity": [{
        "backdrop-opacity": [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Saturate
       * @see https://tailwindcss.com/docs/backdrop-saturate
       */
      "backdrop-saturate": [{
        "backdrop-saturate": [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Sepia
       * @see https://tailwindcss.com/docs/backdrop-sepia
       */
      "backdrop-sepia": [{
        "backdrop-sepia": ["", isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      // --------------
      // --- Tables ---
      // --------------
      /**
       * Border Collapse
       * @see https://tailwindcss.com/docs/border-collapse
       */
      "border-collapse": [{
        border: ["collapse", "separate"]
      }],
      /**
       * Border Spacing
       * @see https://tailwindcss.com/docs/border-spacing
       */
      "border-spacing": [{
        "border-spacing": scaleUnambiguousSpacing()
      }],
      /**
       * Border Spacing X
       * @see https://tailwindcss.com/docs/border-spacing
       */
      "border-spacing-x": [{
        "border-spacing-x": scaleUnambiguousSpacing()
      }],
      /**
       * Border Spacing Y
       * @see https://tailwindcss.com/docs/border-spacing
       */
      "border-spacing-y": [{
        "border-spacing-y": scaleUnambiguousSpacing()
      }],
      /**
       * Table Layout
       * @see https://tailwindcss.com/docs/table-layout
       */
      "table-layout": [{
        table: ["auto", "fixed"]
      }],
      /**
       * Caption Side
       * @see https://tailwindcss.com/docs/caption-side
       */
      caption: [{
        caption: ["top", "bottom"]
      }],
      // ---------------------------------
      // --- Transitions and Animation ---
      // ---------------------------------
      /**
       * Transition Property
       * @see https://tailwindcss.com/docs/transition-property
       */
      transition: [{
        transition: ["", "all", "colors", "opacity", "shadow", "transform", "none", isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Transition Behavior
       * @see https://tailwindcss.com/docs/transition-behavior
       */
      "transition-behavior": [{
        transition: ["normal", "discrete"]
      }],
      /**
       * Transition Duration
       * @see https://tailwindcss.com/docs/transition-duration
       */
      duration: [{
        duration: [isNumber, "initial", isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Transition Timing Function
       * @see https://tailwindcss.com/docs/transition-timing-function
       */
      ease: [{
        ease: ["linear", "initial", themeEase, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Transition Delay
       * @see https://tailwindcss.com/docs/transition-delay
       */
      delay: [{
        delay: [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Animation
       * @see https://tailwindcss.com/docs/animation
       */
      animate: [{
        animate: ["none", themeAnimate, isArbitraryVariable, isArbitraryValue]
      }],
      // ------------------
      // --- Transforms ---
      // ------------------
      /**
       * Backface Visibility
       * @see https://tailwindcss.com/docs/backface-visibility
       */
      backface: [{
        backface: ["hidden", "visible"]
      }],
      /**
       * Perspective
       * @see https://tailwindcss.com/docs/perspective
       */
      perspective: [{
        perspective: [themePerspective, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Perspective Origin
       * @see https://tailwindcss.com/docs/perspective-origin
       */
      "perspective-origin": [{
        "perspective-origin": scalePositionWithArbitrary()
      }],
      /**
       * Rotate
       * @see https://tailwindcss.com/docs/rotate
       */
      rotate: [{
        rotate: scaleRotate()
      }],
      /**
       * Rotate X
       * @see https://tailwindcss.com/docs/rotate
       */
      "rotate-x": [{
        "rotate-x": scaleRotate()
      }],
      /**
       * Rotate Y
       * @see https://tailwindcss.com/docs/rotate
       */
      "rotate-y": [{
        "rotate-y": scaleRotate()
      }],
      /**
       * Rotate Z
       * @see https://tailwindcss.com/docs/rotate
       */
      "rotate-z": [{
        "rotate-z": scaleRotate()
      }],
      /**
       * Scale
       * @see https://tailwindcss.com/docs/scale
       */
      scale: [{
        scale: scaleScale()
      }],
      /**
       * Scale X
       * @see https://tailwindcss.com/docs/scale
       */
      "scale-x": [{
        "scale-x": scaleScale()
      }],
      /**
       * Scale Y
       * @see https://tailwindcss.com/docs/scale
       */
      "scale-y": [{
        "scale-y": scaleScale()
      }],
      /**
       * Scale Z
       * @see https://tailwindcss.com/docs/scale
       */
      "scale-z": [{
        "scale-z": scaleScale()
      }],
      /**
       * Scale 3D
       * @see https://tailwindcss.com/docs/scale
       */
      "scale-3d": ["scale-3d"],
      /**
       * Skew
       * @see https://tailwindcss.com/docs/skew
       */
      skew: [{
        skew: scaleSkew()
      }],
      /**
       * Skew X
       * @see https://tailwindcss.com/docs/skew
       */
      "skew-x": [{
        "skew-x": scaleSkew()
      }],
      /**
       * Skew Y
       * @see https://tailwindcss.com/docs/skew
       */
      "skew-y": [{
        "skew-y": scaleSkew()
      }],
      /**
       * Transform
       * @see https://tailwindcss.com/docs/transform
       */
      transform: [{
        transform: [isArbitraryVariable, isArbitraryValue, "", "none", "gpu", "cpu"]
      }],
      /**
       * Transform Origin
       * @see https://tailwindcss.com/docs/transform-origin
       */
      "transform-origin": [{
        origin: scalePositionWithArbitrary()
      }],
      /**
       * Transform Style
       * @see https://tailwindcss.com/docs/transform-style
       */
      "transform-style": [{
        transform: ["3d", "flat"]
      }],
      /**
       * Translate
       * @see https://tailwindcss.com/docs/translate
       */
      translate: [{
        translate: scaleTranslate()
      }],
      /**
       * Translate X
       * @see https://tailwindcss.com/docs/translate
       */
      "translate-x": [{
        "translate-x": scaleTranslate()
      }],
      /**
       * Translate Y
       * @see https://tailwindcss.com/docs/translate
       */
      "translate-y": [{
        "translate-y": scaleTranslate()
      }],
      /**
       * Translate Z
       * @see https://tailwindcss.com/docs/translate
       */
      "translate-z": [{
        "translate-z": scaleTranslate()
      }],
      /**
       * Translate None
       * @see https://tailwindcss.com/docs/translate
       */
      "translate-none": ["translate-none"],
      // ---------------------
      // --- Interactivity ---
      // ---------------------
      /**
       * Accent Color
       * @see https://tailwindcss.com/docs/accent-color
       */
      accent: [{
        accent: scaleColor()
      }],
      /**
       * Appearance
       * @see https://tailwindcss.com/docs/appearance
       */
      appearance: [{
        appearance: ["none", "auto"]
      }],
      /**
       * Caret Color
       * @see https://tailwindcss.com/docs/just-in-time-mode#caret-color-utilities
       */
      "caret-color": [{
        caret: scaleColor()
      }],
      /**
       * Color Scheme
       * @see https://tailwindcss.com/docs/color-scheme
       */
      "color-scheme": [{
        scheme: ["normal", "dark", "light", "light-dark", "only-dark", "only-light"]
      }],
      /**
       * Cursor
       * @see https://tailwindcss.com/docs/cursor
       */
      cursor: [{
        cursor: ["auto", "default", "pointer", "wait", "text", "move", "help", "not-allowed", "none", "context-menu", "progress", "cell", "crosshair", "vertical-text", "alias", "copy", "no-drop", "grab", "grabbing", "all-scroll", "col-resize", "row-resize", "n-resize", "e-resize", "s-resize", "w-resize", "ne-resize", "nw-resize", "se-resize", "sw-resize", "ew-resize", "ns-resize", "nesw-resize", "nwse-resize", "zoom-in", "zoom-out", isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Field Sizing
       * @see https://tailwindcss.com/docs/field-sizing
       */
      "field-sizing": [{
        "field-sizing": ["fixed", "content"]
      }],
      /**
       * Pointer Events
       * @see https://tailwindcss.com/docs/pointer-events
       */
      "pointer-events": [{
        "pointer-events": ["auto", "none"]
      }],
      /**
       * Resize
       * @see https://tailwindcss.com/docs/resize
       */
      resize: [{
        resize: ["none", "", "y", "x"]
      }],
      /**
       * Scroll Behavior
       * @see https://tailwindcss.com/docs/scroll-behavior
       */
      "scroll-behavior": [{
        scroll: ["auto", "smooth"]
      }],
      /**
       * Scroll Margin
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-m": [{
        "scroll-m": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin Inline
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mx": [{
        "scroll-mx": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin Block
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-my": [{
        "scroll-my": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin Inline Start
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-ms": [{
        "scroll-ms": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin Inline End
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-me": [{
        "scroll-me": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin Block Start
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mbs": [{
        "scroll-mbs": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin Block End
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mbe": [{
        "scroll-mbe": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin Top
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mt": [{
        "scroll-mt": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin Right
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mr": [{
        "scroll-mr": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin Bottom
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mb": [{
        "scroll-mb": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin Left
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-ml": [{
        "scroll-ml": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-p": [{
        "scroll-p": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding Inline
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-px": [{
        "scroll-px": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding Block
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-py": [{
        "scroll-py": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding Inline Start
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-ps": [{
        "scroll-ps": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding Inline End
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pe": [{
        "scroll-pe": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding Block Start
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pbs": [{
        "scroll-pbs": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding Block End
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pbe": [{
        "scroll-pbe": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding Top
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pt": [{
        "scroll-pt": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding Right
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pr": [{
        "scroll-pr": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding Bottom
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pb": [{
        "scroll-pb": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding Left
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pl": [{
        "scroll-pl": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Snap Align
       * @see https://tailwindcss.com/docs/scroll-snap-align
       */
      "snap-align": [{
        snap: ["start", "end", "center", "align-none"]
      }],
      /**
       * Scroll Snap Stop
       * @see https://tailwindcss.com/docs/scroll-snap-stop
       */
      "snap-stop": [{
        snap: ["normal", "always"]
      }],
      /**
       * Scroll Snap Type
       * @see https://tailwindcss.com/docs/scroll-snap-type
       */
      "snap-type": [{
        snap: ["none", "x", "y", "both"]
      }],
      /**
       * Scroll Snap Type Strictness
       * @see https://tailwindcss.com/docs/scroll-snap-type
       */
      "snap-strictness": [{
        snap: ["mandatory", "proximity"]
      }],
      /**
       * Touch Action
       * @see https://tailwindcss.com/docs/touch-action
       */
      touch: [{
        touch: ["auto", "none", "manipulation"]
      }],
      /**
       * Touch Action X
       * @see https://tailwindcss.com/docs/touch-action
       */
      "touch-x": [{
        "touch-pan": ["x", "left", "right"]
      }],
      /**
       * Touch Action Y
       * @see https://tailwindcss.com/docs/touch-action
       */
      "touch-y": [{
        "touch-pan": ["y", "up", "down"]
      }],
      /**
       * Touch Action Pinch Zoom
       * @see https://tailwindcss.com/docs/touch-action
       */
      "touch-pz": ["touch-pinch-zoom"],
      /**
       * User Select
       * @see https://tailwindcss.com/docs/user-select
       */
      select: [{
        select: ["none", "text", "all", "auto"]
      }],
      /**
       * Will Change
       * @see https://tailwindcss.com/docs/will-change
       */
      "will-change": [{
        "will-change": ["auto", "scroll", "contents", "transform", isArbitraryVariable, isArbitraryValue]
      }],
      // -----------
      // --- SVG ---
      // -----------
      /**
       * Fill
       * @see https://tailwindcss.com/docs/fill
       */
      fill: [{
        fill: ["none", ...scaleColor()]
      }],
      /**
       * Stroke Width
       * @see https://tailwindcss.com/docs/stroke-width
       */
      "stroke-w": [{
        stroke: [isNumber, isArbitraryVariableLength, isArbitraryLength, isArbitraryNumber]
      }],
      /**
       * Stroke
       * @see https://tailwindcss.com/docs/stroke
       */
      stroke: [{
        stroke: ["none", ...scaleColor()]
      }],
      // ---------------------
      // --- Accessibility ---
      // ---------------------
      /**
       * Forced Color Adjust
       * @see https://tailwindcss.com/docs/forced-color-adjust
       */
      "forced-color-adjust": [{
        "forced-color-adjust": ["auto", "none"]
      }]
    },
    conflictingClassGroups: {
      overflow: ["overflow-x", "overflow-y"],
      overscroll: ["overscroll-x", "overscroll-y"],
      inset: ["inset-x", "inset-y", "inset-bs", "inset-be", "start", "end", "top", "right", "bottom", "left"],
      "inset-x": ["right", "left"],
      "inset-y": ["top", "bottom"],
      flex: ["basis", "grow", "shrink"],
      gap: ["gap-x", "gap-y"],
      p: ["px", "py", "ps", "pe", "pbs", "pbe", "pt", "pr", "pb", "pl"],
      px: ["pr", "pl"],
      py: ["pt", "pb"],
      m: ["mx", "my", "ms", "me", "mbs", "mbe", "mt", "mr", "mb", "ml"],
      mx: ["mr", "ml"],
      my: ["mt", "mb"],
      size: ["w", "h"],
      "font-size": ["leading"],
      "fvn-normal": ["fvn-ordinal", "fvn-slashed-zero", "fvn-figure", "fvn-spacing", "fvn-fraction"],
      "fvn-ordinal": ["fvn-normal"],
      "fvn-slashed-zero": ["fvn-normal"],
      "fvn-figure": ["fvn-normal"],
      "fvn-spacing": ["fvn-normal"],
      "fvn-fraction": ["fvn-normal"],
      "line-clamp": ["display", "overflow"],
      rounded: ["rounded-s", "rounded-e", "rounded-t", "rounded-r", "rounded-b", "rounded-l", "rounded-ss", "rounded-se", "rounded-ee", "rounded-es", "rounded-tl", "rounded-tr", "rounded-br", "rounded-bl"],
      "rounded-s": ["rounded-ss", "rounded-es"],
      "rounded-e": ["rounded-se", "rounded-ee"],
      "rounded-t": ["rounded-tl", "rounded-tr"],
      "rounded-r": ["rounded-tr", "rounded-br"],
      "rounded-b": ["rounded-br", "rounded-bl"],
      "rounded-l": ["rounded-tl", "rounded-bl"],
      "border-spacing": ["border-spacing-x", "border-spacing-y"],
      "border-w": ["border-w-x", "border-w-y", "border-w-s", "border-w-e", "border-w-bs", "border-w-be", "border-w-t", "border-w-r", "border-w-b", "border-w-l"],
      "border-w-x": ["border-w-r", "border-w-l"],
      "border-w-y": ["border-w-t", "border-w-b"],
      "border-color": ["border-color-x", "border-color-y", "border-color-s", "border-color-e", "border-color-bs", "border-color-be", "border-color-t", "border-color-r", "border-color-b", "border-color-l"],
      "border-color-x": ["border-color-r", "border-color-l"],
      "border-color-y": ["border-color-t", "border-color-b"],
      translate: ["translate-x", "translate-y", "translate-none"],
      "translate-none": ["translate", "translate-x", "translate-y", "translate-z"],
      "scroll-m": ["scroll-mx", "scroll-my", "scroll-ms", "scroll-me", "scroll-mbs", "scroll-mbe", "scroll-mt", "scroll-mr", "scroll-mb", "scroll-ml"],
      "scroll-mx": ["scroll-mr", "scroll-ml"],
      "scroll-my": ["scroll-mt", "scroll-mb"],
      "scroll-p": ["scroll-px", "scroll-py", "scroll-ps", "scroll-pe", "scroll-pbs", "scroll-pbe", "scroll-pt", "scroll-pr", "scroll-pb", "scroll-pl"],
      "scroll-px": ["scroll-pr", "scroll-pl"],
      "scroll-py": ["scroll-pt", "scroll-pb"],
      touch: ["touch-x", "touch-y", "touch-pz"],
      "touch-x": ["touch"],
      "touch-y": ["touch"],
      "touch-pz": ["touch"]
    },
    conflictingClassGroupModifiers: {
      "font-size": ["leading"]
    },
    orderSensitiveModifiers: ["*", "**", "after", "backdrop", "before", "details-content", "file", "first-letter", "first-line", "marker", "placeholder", "selection"]
  };
};
var twMerge = /* @__PURE__ */ createTailwindMerge(getDefaultConfig);

// src/lib/utils.ts
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// src/components/Logo.tsx
var import_jsx_runtime = __toESM(require_jsx_runtime(), 1);
var HuggingFaceLogo = ({ className }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: cn("overflow-hidden rounded-full flex items-center justify-center shrink-0", className), children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", { src: "data:image/png;base64,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", alt: "Brand Logo", className: "w-full h-full object-cover scale-[1.5] block" }) });
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  HuggingFaceLogo
});
/*! Bundled license information:

react/cjs/react-jsx-runtime.production.js:
  (**
   * @license React
   * react-jsx-runtime.production.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

react/cjs/react.production.js:
  (**
   * @license React
   * react.production.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

react/cjs/react.development.js:
  (**
   * @license React
   * react.development.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

react/cjs/react-jsx-runtime.development.js:
  (**
   * @license React
   * react-jsx-runtime.development.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)
*/
