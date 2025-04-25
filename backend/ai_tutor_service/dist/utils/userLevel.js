"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.determineUserLevel = void 0;
const determineUserLevel = (age) => {
    console.log('level age', age);
    if (age >= 5 && age <= 8)
        return "beginner";
    if (age >= 9 && age <= 12)
        return "intermediate";
    return "advanced";
};
exports.determineUserLevel = determineUserLevel;
