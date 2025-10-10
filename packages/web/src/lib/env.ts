import { ConfigProvider, Layer, pipe } from "effect";

export const ViteEnvConfigProviderLayer = pipe(
  import.meta.env,
  ConfigProvider.fromJson,
  Layer.setConfigProvider,
);
