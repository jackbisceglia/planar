import { ConfigProvider, Layer } from "effect";

type JsonArg = Parameters<typeof ConfigProvider.fromJson>[0];

export function createConfigProviderFromViteEnv(importDotMeta: JsonArg) {
  const Provider = ConfigProvider.fromJson(importDotMeta);

  const ProviderLayer = Provider.pipe(Layer.setConfigProvider);

  return ProviderLayer;
}
