// esbuild resolves require() at bundle time — declare here so tsc doesn't error
declare function require<T = unknown>(module: string): T;
