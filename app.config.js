import appJson from './app.json';

const IS_PREVIEW = process.env.APP_VARIANT === 'preview';
const IS_PRODUCTION = process.env.APP_VARIANT === 'production';

export default {
  ...appJson.expo,
  name: IS_PREVIEW ? 'TAK Game (Preview)' : 'TAK Game',
  slug: 'tak-game',
  owner: 'davidmarte',
  version: process.env.APP_VERSION || appJson.expo.version,

  // Dynamic app identifier for different variants
  ios: {
    ...appJson.expo.ios,
    bundleIdentifier: IS_PREVIEW
      ? 'com.takgame.app.preview'
      : 'com.takgame.app',
  },

  android: {
    ...appJson.expo.android,
    package: IS_PREVIEW
      ? 'com.takgame.app.preview'
      : 'com.takgame.app',
  },

  // Additional build metadata
  extra: {
    buildNumber: process.env.GITHUB_RUN_NUMBER || '0',
    buildCommit: process.env.GITHUB_SHA || 'local',
    buildDate: new Date().toISOString(),
    isPreview: IS_PREVIEW,
    isProduction: IS_PRODUCTION,
    eas: {
      projectId: '1f480a26-c818-4900-ab25-35313d590085',
    },
  },
};
