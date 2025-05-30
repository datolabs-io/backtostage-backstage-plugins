import { Config } from "@backstage/config";
import {
    defaultRedisResourceTransformer,
    GoogleRedisResourceTransformer
} from "../transformers/defaultResourceTransformer";
import {
    readTaskScheduleDefinitionFromConfig,
    TaskScheduleDefinition,
} from '@backstage/backend-tasks';
import { getProjectLocator, GoogleProjectLocator } from "../project-locator";

export type GoogleRedisDatabaseEntityProviderConfig = {
    id: string
    projectLocator: GoogleProjectLocator
    location?: string
    ownerLabel: string
    componentLabel: string
    systemLabel: string
    resourceType: string
    suffix: string
    namespaceByProject: boolean
    resourceTransformer: GoogleRedisResourceTransformer
    schedule: TaskScheduleDefinition;
    disabled: boolean;
}

export function readProviderConfigs(options: {
    config: Config,
    resourceTransformer?: GoogleRedisResourceTransformer
}): GoogleRedisDatabaseEntityProviderConfig[] {

    const providersConfig = options.config.getOptionalConfigArray('catalog.providers.gcp');
    if (!providersConfig) {
        return [];
    }

    return providersConfig
    .map(config => readProviderConfig(config, options.resourceTransformer))
    .filter(provider => !provider.disabled);
}

export function readProviderConfig(
    config: Config,
    resourceTransformer?: GoogleRedisResourceTransformer
): GoogleRedisDatabaseEntityProviderConfig {
    // when project is not defined, default to 'organization'
    const id = config.getOptionalString("project") ?? 'organization';
    const ownerLabel = config.getOptionalString('ownerLabel') ?? 'owner'
    const componentLabel = config.getOptionalString('componentLabel') ?? 'component'
    const systemLabel = config.getOptionalString('systemLabel') ?? 'system'
    const resourceType = config.getOptionalString('redis.resourceType') ?? 'Memorystore Redis'
    const suffix = config.getOptionalString('redis.suffix') ?? 'redis'
    const location = config.getOptionalString('redis.location')

    const disabled = config.getOptionalBoolean('redis.disabled') || false;
    const namespaceByProject = config.getOptionalBoolean('redis.namespaceByProject') || false;

    const schedule = readTaskScheduleDefinitionFromConfig(config.getConfig('schedule'));

    return {
        id,
        ownerLabel,
        componentLabel,
        systemLabel,
        resourceType,
        suffix,
        namespaceByProject,
        location,
        projectLocator: getProjectLocator(config),
        resourceTransformer: resourceTransformer ?? defaultRedisResourceTransformer,
        schedule,
        disabled
    }
}
