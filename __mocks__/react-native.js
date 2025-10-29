// Manual mock for react-native
const React = require('react');

// Create basic mocks for React Native components
const mockComponent = (name) => {
  const component = (props) => {
    return React.createElement(name, props, props.children);
  };
  component.displayName = name;
  return component;
};

const View = mockComponent('View');
const Text = mockComponent('Text');
const Image = mockComponent('Image');
const ScrollView = mockComponent('ScrollView');
const TouchableOpacity = mockComponent('TouchableOpacity');
const TouchableHighlight = mockComponent('TouchableHighlight');
const TouchableWithoutFeedback = mockComponent('TouchableWithoutFeedback');
const Pressable = mockComponent('Pressable');
const FlatList = mockComponent('FlatList');
const SectionList = mockComponent('SectionList');
const ActivityIndicator = mockComponent('ActivityIndicator');
const Modal = mockComponent('Modal');
const SafeAreaView = mockComponent('SafeAreaView');
const TextInput = mockComponent('TextInput');

module.exports = {
  // Basic components
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  TouchableHighlight,
  TouchableWithoutFeedback,
  Pressable,
  FlatList,
  SectionList,
  ActivityIndicator,
  Modal,
  SafeAreaView,
  TextInput,

  StyleSheet: {
    create: (styles) => styles,
    flatten: (style) => style,
    compose: (style1, style2) => [style1, style2],
    hairlineWidth: 1,
    absoluteFill: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
    },
    absoluteFillObject: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
    },
  },
  Platform: {
    OS: 'ios',
    Version: 123,
    select: (obj) => obj.ios || obj.default,
    isPad: false,
    isTV: false,
    isTesting: true,
  },
  Dimensions: {
    get: () => ({ width: 400, height: 800 }),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  },
  Animated: {
    View: View,
    Text: Text,
    Image: Image,
    timing: jest.fn(() => ({
      start: jest.fn((callback) => callback && callback({ finished: true })),
      stop: jest.fn(),
      reset: jest.fn(),
    })),
    spring: jest.fn(() => ({
      start: jest.fn((callback) => callback && callback({ finished: true })),
      stop: jest.fn(),
      reset: jest.fn(),
    })),
    sequence: jest.fn((animations) => ({
      start: jest.fn((callback) => callback && callback({ finished: true })),
      stop: jest.fn(),
      reset: jest.fn(),
    })),
    parallel: jest.fn((animations) => ({
      start: jest.fn((callback) => callback && callback({ finished: true })),
      stop: jest.fn(),
      reset: jest.fn(),
    })),
    loop: jest.fn((animation) => ({
      start: jest.fn((callback) => callback && callback({ finished: true })),
      stop: jest.fn(),
      reset: jest.fn(),
    })),
    delay: jest.fn(() => ({
      start: jest.fn((callback) => callback && callback({ finished: true })),
      stop: jest.fn(),
      reset: jest.fn(),
    })),
    Value: jest.fn((value) => ({
      setValue: jest.fn(),
      setOffset: jest.fn(),
      flattenOffset: jest.fn(),
      extractOffset: jest.fn(),
      addListener: jest.fn(),
      removeListener: jest.fn(),
      removeAllListeners: jest.fn(),
      stopAnimation: jest.fn(),
      resetAnimation: jest.fn(),
      interpolate: jest.fn(() => value),
      _value: value,
    })),
    ValueXY: jest.fn((value) => ({
      setValue: jest.fn(),
      setOffset: jest.fn(),
      flattenOffset: jest.fn(),
      extractOffset: jest.fn(),
      addListener: jest.fn(),
      removeListener: jest.fn(),
      removeAllListeners: jest.fn(),
      stopAnimation: jest.fn(),
      resetAnimation: jest.fn(),
      getLayout: jest.fn(),
      getTranslateTransform: jest.fn(),
      x: value?.x || 0,
      y: value?.y || 0,
    })),
    createAnimatedComponent: (Component) => Component,
  },
};
