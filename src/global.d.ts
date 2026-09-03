export {};

declare global {
  interface Window {
    _axiosPromiseArr: Array<{ cancel: () => void }>;
  }
}
