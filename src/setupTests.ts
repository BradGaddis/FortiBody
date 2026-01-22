const mockAsyncStorage = {
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  multiGet: jest.fn(() => Promise.resolve([])),
  multiSet: jest.fn(() => Promise.resolve()),
  multiRemove: jest.fn(() => Promise.resolve()),
};

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper', () => ({}));

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

jest.mock('expo-camera', () => ({
  Camera: jest.fn(() => null),
  PermissionResponse: {},
  requestCameraPermissionsAsync: jest.fn(),
  requestPermissionAsync: jest.fn(),
}));

jest.mock('expo-barcode-scanner', () => ({
  BarCodeScanner: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  getPermissionsAsync: jest.fn(),
}));

jest.mock('expo-sensors', () => ({
  Pedometer: {
    isAvailableAsync: jest.fn(() => Promise.resolve(true)),
    getStepCountAsync: jest.fn(() => Promise.resolve({ steps: 0 })),
    watchStepCount: jest.fn(() => ({ remove: jest.fn() })),
  },
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    dispatch: jest.fn(),
    goBack: jest.fn(),
    setOptions: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
  useFocusEffect: jest.fn((callback) => callback()),
}));

global.__DEV__ = false;
