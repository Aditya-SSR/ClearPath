/**
 * Generic compound-condition rule engine.
 *
 * The SAME evaluator works for DocumentRule.condition and
 * SchemeEligibilityRule.condition — both are JSON blobs shaped like:
 *
 *   Leaf:        { "field": "employeeCount", "op": "gte", "value": 10 }
 *   Compound:    { "and": [ <condition>, <condition> ] }
 *                { "or":  [ <condition>, <condition> ] }
 *                { "not": <condition> }
 *   Shorthand:   [ <condition>, <condition> ]  → treated as AND
 *   Universal:   null / undefined condition     → always matches
 *
 * Operators:
 *   eq, ne         equality (numeric strings are coerced for comparison)
 *   gt, gte, lt, lte  numeric comparisons
 *   in, notIn      membership against an array of values
 *   exists         true  → field present and non-empty
 *                  false → field missing/null/empty
 *
 * Safety rules:
 *   - Missing/null profile fields NEVER crash and NEVER match
 *     (the only exception is { op: "exists", value: false }).
 *   - Unknown operators / malformed conditions evaluate to false (fail-closed).
 *   - Adding a 5th industry = adding seed rows only. Zero code changes here.
 */

function isMissing(value) {
    return value === undefined || value === null || value === ``;
}

function toNumber(value) {
    if (typeof value === `number`) return value;
    if (typeof value === `string` && value.trim() !== `` && !Number.isNaN(Number(value))) {
        return Number(value);
    }
    return Number.NaN;
}

function evaluateLeaf(profile, condition) {
    const { field, op } = condition;

    if (!field || !op) return false;

    const actual = profile ? profile[field] : undefined;
    const expected = condition.value;

    // Missing profile fields are treated as non-match for every operator
    // except an explicit { op: "exists", value: false }.
    if (op === `exists`) {
        return expected ? !isMissing(actual) : isMissing(actual);
    }

    if (isMissing(actual)) return false;

    switch (op) {
        case `in`:
            return Array.isArray(expected) && expected.includes(actual);

        case `notIn`:
            return Array.isArray(expected) && !expected.includes(actual);

        case `eq`: {
            if (actual === expected) return true;
            const a = toNumber(actual);
            const b = toNumber(expected);
            return !Number.isNaN(a) && !Number.isNaN(b) && a === b;
        }

        case `ne`: {
            if (actual === expected) return false;
            const a = toNumber(actual);
            const b = toNumber(expected);
            return Number.isNaN(a) || Number.isNaN(b) ? true : a !== b;
        }

        case `gt`:
        case `gte`:
        case `lt`:
        case `lte`: {
            const a = toNumber(actual);
            const b = toNumber(expected);
            if (Number.isNaN(a) || Number.isNaN(b)) return false;
            if (op === `gt`) return a > b;
            if (op === `gte`) return a >= b;
            if (op === `lt`) return a < b;
            return a <= b;
        }

        default:
            return false; // unknown operator → fail closed
    }
}

function evaluateCondition(profile, condition) {
    if (condition === null || condition === undefined) return true; // universal rule

    try {
        if (Array.isArray(condition)) {
            return condition.every((c) => evaluateCondition(profile, c)); // AND shorthand
        }

        if (typeof condition !== `object`) return false;

        if (Array.isArray(condition.and)) {
            return condition.and.every((c) => evaluateCondition(profile, c));
        }

        if (Array.isArray(condition.or)) {
            return condition.or.some((c) => evaluateCondition(profile, c));
        }

        if (condition.not !== undefined) {
            return !evaluateCondition(profile, condition.not);
        }

        if (condition.field) {
            return evaluateLeaf(profile, condition);
        }

        return false; // malformed object → fail closed
    } catch {
        return false; // never crash on bad data
    }
}

/**
 * Seed-time structural validation so bad condition JSON fails loudly
 * when seeding instead of silently never-matching at runtime.
 */
function validateCondition(condition, path = `condition`) {
    if (condition === null || condition === undefined) return { valid: true };

    if (Array.isArray(condition)) {
        const results = condition.map((c, i) => validateCondition(c, `${path}[${i}]`));
        const invalid = results.find((r) => !r.valid);
        return invalid || { valid: true };
    }

    if (typeof condition !== `object`) {
        return { valid: false, reason: `${path}: must be an object, array or null` };
    }

    if (Array.isArray(condition.and) || Array.isArray(condition.or)) {
        const key = condition.and ? `and` : `or`;
        const results = condition[key].map((c, i) => validateCondition(c, `${path}.${key}[${i}]`));
        const invalid = results.find((r) => !r.valid);
        return invalid || { valid: true };
    }

    if (condition.not !== undefined) {
        return validateCondition(condition.not, `${path}.not`);
    }

    if (typeof condition.field === `string` && typeof condition.op === `string`) {
        return { valid: true };
    }

    return { valid: false, reason: `${path}: leaf conditions need "field" and "op"` };
}

module.exports = { evaluateCondition, validateCondition };