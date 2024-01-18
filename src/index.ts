import createBaseNetwork from './http';

if (window) {
  (window as any).createBaseNetwork = createBaseNetwork;
}

export default createBaseNetwork;
