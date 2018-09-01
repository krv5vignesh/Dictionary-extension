module.exports = {
    "env": {
        "browser": true,
        "es6": true
    },
    "extends": ["plugin:prettier/recommended", "eslint:recommended"],
    "parserOptions": {
        "ecmaVersion": 2016
    },
    "plugins": ["prettier"],
    "rules": {
        "prettier/prettier": "error",
        "linebreak-style": [
            "error",
            "windows"
        ],
        "quotes": [
            "error",
            "double",
            { "avoidEscape": true }
        ],
        "semi": [
            "error",
            "always"
        ],
        "no-console": ["error", {"allow": ["warn", "error"]}]
    }
};
