"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
require("dotenv/config");
var get = function (key, fallback) {
    var v = process.env[key];
    if (v === undefined) {
        if (fallback !== undefined)
            return fallback;
        throw new Error("Missing env: ".concat(key));
    }
    return v;
};
exports.env = {
    port: Number(get("PORT", "3000")),
};
