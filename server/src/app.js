"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var env_1 = require("./config/env");
var app = (0, express_1.default)();
// Health check
app.use("/health", function (_req, res) {
    res.status(200).json({ status: "OK" });
});
// 404
app.use(function (err, _req, res, _next) {
    res.status(404).json({ error: "Not Found" });
});
// error handler
app.use(function (err, _req, res, _next) {
    console.error(err.message);
    res
        .status(err.status || 500)
        .json({ error: err.message || "Internal Error" });
});
app.listen(env_1.env.port, function () { return console.log("http://localhost:".concat(env_1.env.port)); });
