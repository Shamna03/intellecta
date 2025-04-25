"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (err, req, res, next) => {
    var _a, _b, _c, _d, _e;
    switch (true) {
        case (_a = err === null || err === void 0 ? void 0 : err.error) === null || _a === void 0 ? void 0 : _a.isJoi:
            const joiMessage = ((_d = (_c = (_b = err.error) === null || _b === void 0 ? void 0 : _b.details) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.message) || "Validation error";
            return res.status(400).json({ message: joiMessage });
        case !!err.statusCode:
            return res.status(err.statusCode).json({ message: err.message });
        case err.name === "CastError":
            return res.status(400).json({ message: "Invalid ID format" });
        case err.name === "TokenExpiredError":
            return res
                .status(401)
                .json({ message: "Unauthorized: Your token has expired. Login again." });
        case err.name === "JsonWebTokenError":
            return res.status(401).json({ message: "Unauthorized: Invalid token." });
        case err.code === 11000:
            const keyName = Object.keys((_e = err.keyValue) !== null && _e !== void 0 ? _e : {})[0];
            return res.status(409).json({ message: `Given ${keyName} already exists` });
        default:
            return res.status(500).json({ message: err.message || "Internal Server Error" });
    }
};
exports.errorHandler = errorHandler;
