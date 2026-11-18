const nativeFetch: typeof globalThis.fetch = (...args) =>
  globalThis.fetch(...args);

export default nativeFetch;
export { nativeFetch as fetch };
export const Headers = globalThis.Headers;
export const Request = globalThis.Request;
export const Response = globalThis.Response;
