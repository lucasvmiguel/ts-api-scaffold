import "reflect-metadata";

import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import type { RouteConfig } from "@asteasolutions/zod-to-openapi";

export const OPENAPI_METADATA_KEY = "openapi:path";
export const OPENAPI_TAGS_KEY = "openapi:tags";

export function ApiTags(tags: string[]) {
  return function (constructor: Function) {
    Reflect.defineMetadata(OPENAPI_TAGS_KEY, tags, constructor.prototype);
  };
}

export function OpenApi(
  config: Omit<RouteConfig, "method" | "path"> & {
    method: RouteConfig["method"];
    path: string;
  },
) {
  return function (
    target: any,
    propertyKey: string,
    descriptor?: PropertyDescriptor,
  ) {
    // Get existing config or create new
    const existingConfig = Reflect.getMetadata(
      OPENAPI_METADATA_KEY,
      target,
      propertyKey,
    );
    Reflect.defineMetadata(
      OPENAPI_METADATA_KEY,
      { ...existingConfig, ...config },
      target,
      propertyKey,
    );
  };
}

export function registerSchemas(registry: OpenAPIRegistry, modules: object[]) {
  modules.forEach((module) => {
    Object.values(module).forEach((exported) => {
      if (
        exported &&
        typeof exported === "object" &&
        "definitions" in exported
      ) {
        // It helps if we can identify it as a Zod schema with OpenAPI metadata
        // but zod-to-openapi doesn't expose a clean "isOpenApiSchema" check easily
        // We rely on the fact that we registered them with .openapi("Name")
        try {
          // @ts-ignore
          if (exported._def?.openapi?.metadata?.refId) {
            // @ts-ignore
            const refId = exported._def.openapi.metadata.refId;
            registry.register(refId, exported);
          }
        } catch (e) {
          // Ignore
        }
      }
    });
  });
}

export function registerControllers(
  registry: OpenAPIRegistry,
  controllers: any[],
) {
  controllers.forEach((controller) => {
    const prototype = Object.getPrototypeOf(controller);
    const classTags: string[] =
      Reflect.getMetadata(OPENAPI_TAGS_KEY, prototype) || [];

    // Get all property names from both instance and prototype
    const instanceProperties = Object.getOwnPropertyNames(controller);
    const prototypeProperties = Object.getOwnPropertyNames(prototype);
    const propertyNames = new Set([
      ...instanceProperties,
      ...prototypeProperties,
    ]);

    propertyNames.forEach((propertyName) => {
      // Skip constructor
      if (propertyName === "constructor") return;

      const routeConfig: RouteConfig | undefined = Reflect.getMetadata(
        OPENAPI_METADATA_KEY,
        controller,
        propertyName,
      );

      if (routeConfig) {
        if (classTags.length > 0) {
          routeConfig.tags = [...(routeConfig.tags || []), ...classTags];
        }
        registry.registerPath(routeConfig);
      }
    });
  });
}
