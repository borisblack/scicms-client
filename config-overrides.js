module.exports = {
    webpack(config, env) {
        config.ignoreWarnings = [/Failed to parse source map/]
        return config
    }
}