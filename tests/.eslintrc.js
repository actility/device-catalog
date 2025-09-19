module.exports = {
    "env": {
        "browser": true,
        "commonjs": true,
        "es2021": true
    },
    "extends": "eslint:recommended",
    "overrides": [
        {
            "env": {
                "node": true
            },
            "files": [
                ".eslintrc.{js,cjs}"
            ],
            "parserOptions": {
                "sourceType": "script"
            }
        }
    ],
    "parserOptions": {
        "ecmaVersion": "latest"
    },
    "rules": {
        "no-inner-declarations": 0,
        "no-unused-expressions": 0,
        "no-unused-labels": 0,
        "no-unused-vars": 0,
        "no-case-declarations": 0,
        "no-fallthrough": 0,
        "no-unreachable": 0,
        "no-mixed-spaces-and-tabs": 0,
        "no-extra-semi": 0,
        "no-redeclare": 0,
        "no-extra-boolean-cast": 0,
        "no-prototype-builtins": 0,
        "no-useless-escape": 0,
        "no-loss-of-precision": 0,
        "no-dupe-else-if": 0,
        "no-duplicate-case": 0,
        "no-restricted-properties": 0,
        "no-irregular-whitespace": 0
    },
    "globals": {
        Buffer: true
    }
}
