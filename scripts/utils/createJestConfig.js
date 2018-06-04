// @remove-file-on-eject
/* eslint no-console: "off" */

const fs = require('fs');
const chalk = require('chalk');
const paths = require('../../config/paths');

module.exports = (resolve, rootDir, isEjecting) => {
    // Use this instead of `paths.testsSetup` to avoid putting
    // an absolute filename into configuration after ejecting.
    const setupTestsFile = fs.existsSync(paths.testsSetup)
        ? '<rootDir>/src/setupTests.js'
        : undefined;

    // TODO: I don't know if it's safe or not to just use / as path separator
    // in Jest configs. We need help from somebody with Windows to determine this.
    const config = {
        collectCoverageFrom: ['src/**/*.{js,jsx}'],
        setupFiles: [resolve('config/polyfills.js'), resolve('config/mocking.js')],
        setupTestFrameworkScriptFile: setupTestsFile,
        testMatch: [
            '<rootDir>/src/**/__tests__/**/*.js?(x)',
            '<rootDir>/src/**/?(*.)(spec|test).js?(x)',
        ],
        testEnvironment: 'node',
        testURL: 'http://localhost',
        transform: {
            '^.+\\.(js|jsx)$': isEjecting
                ? '<rootDir>/node_modules/babel-jest'
                : resolve('config/jest/babelTransform.js'),
            '^.+\\.css$': resolve('config/jest/cssTransform.js'),
            '^(?!.*\\.(js|jsx|css|json)$)': resolve('config/jest/fileTransform.js'),
        },
        transformIgnorePatterns: ['[/\\\\]node_modules[/\\\\].+\\.(js|jsx)$'],
        moduleNameMapper: {
            '^react-native$': 'react-native-web',
        },
        moduleFileExtensions: ['web.js', 'js', 'json', 'web.jsx', 'jsx', 'node'],
    };
    if (rootDir) {
        config.rootDir = rootDir;
    }
    const overrides = Object.assign({}, require(paths.appPackageJson).jest);
    const supportedKeys = [
        'collectCoverageFrom',
        'coverageReporters',
        'coverageThreshold',
        'snapshotSerializers',
    ];
    if (overrides) {
        supportedKeys.forEach(key => {
            if (overrides.hasOwnProperty(key)) {
                config[key] = overrides[key];
                delete overrides[key];
            }
        });
        const unsupportedKeys = Object.keys(overrides);
        if (unsupportedKeys.length) {
            console.error(
                chalk.red(
                    'Out of the box, Borderline only supports overriding ' +
                    'these Jest options:\n\n' +
                    supportedKeys.map(key => chalk.bold('  \u2022 ' + key)).join('\n') +
                    '.\n\n' +
                    'These options in your package.json Jest configuration ' +
                    'are not currently supported by Borderline:\n\n' +
                    unsupportedKeys
                        .map(key => chalk.bold('  \u2022 ' + key))
                        .join('\n') +
                    'You may also file an issue with Borderline to discuss ' +
                    'supporting more options out of the box.\n'
                )
            );
            process.exit(1);
        }
    }
    return config;
};
