import { Config as ClientConfig } from "../../client/src/scripts/config";
import { FireMode } from "../../common/src/constants";
import { Ammos } from "../../common/src/definitions/ammos";
import { Armors, type ArmorDefinition } from "../../common/src/definitions/armors";
import { Backpacks } from "../../common/src/definitions/backpacks";
import { Buildings } from "../../common/src/definitions/buildings";
import { Emotes } from "../../common/src/definitions/emotes";
import { Explosions } from "../../common/src/definitions/explosions";
import { Guns } from "../../common/src/definitions/guns";
import { HealingItems } from "../../common/src/definitions/healingItems";
import { Helmets } from "../../common/src/definitions/helmets";
import { Loots } from "../../common/src/definitions/loots";
import { Melees } from "../../common/src/definitions/melees";
import { Obstacles, RotationMode } from "../../common/src/definitions/obstacles";
import { Scopes } from "../../common/src/definitions/scopes";
import { Skins } from "../../common/src/definitions/skins";
import { Vests } from "../../common/src/definitions/vests";
import { CircleHitbox, ComplexHitbox, RectangleHitbox, type Hitbox, PolygonHitbox } from "../../common/src/utils/hitbox";
import { FloorTypes } from "../../common/src/utils/mapUtils";
import { ObstacleSpecialRoles, type BulletDefinition, type ItemDefinition, type ObjectDefinition, type ObjectDefinitions, type WearerAttributes } from "../../common/src/utils/objectDefinitions";
import { type Vector } from "../../common/src/utils/vector";
import { Config as ServerConfig } from "./config";
import { GasStages } from "./data/gasStages";
import { LootTables, LootTiers } from "./data/lootTables";
import { Maps } from "./data/maps";
import { GasMode, SpawnMode } from "./defaultConfig";
import { ColorStyles, FontStyles, styleText } from "./utils/ansiColoring";

const absStart = Date.now();
const tester = (() => {
    const warnings: Array<[string, string]> = [];
    const errors: Array<[string, string]> = [];

    return {
        get warnings() { return warnings; },
        get errors() { return errors; },
        createPath(...components: string[]) {
            return components.join(" -> ");
        },

        assert(condition: boolean, errorMessage: string, errorPath: string): void {
            if (!condition) errors.push([errorPath, errorMessage]);
        },
        assertWarn(condition: boolean, warningMessage: string, errorPath: string): void {
            if (!condition) warnings.push([errorPath, warningMessage]);
        },
        assertNoDuplicateIDStrings(collection: ObjectDefinition[], collectionName: string, errorPath: string): void {
            const dupes: Record<string, number> = {};
            const set = new Set<string>();
            let foundDupes = false;

            for (const def of collection) {
                const oldSize = set.size;
                set.add(def.idString);

                if (oldSize === set.size) { // If the set doesn't grow, then it's a dupe
                    foundDupes = true;
                    dupes[def.idString] = (dupes[def.idString] ?? 1) + 1;
                }
            }

            this.assert(
                !foundDupes,
                `Collection ${collectionName} contained duplicate entries: ${Object.entries(dupes).map(([k, v]) => `'${k}' => ${v} times`).join("; ")}`,
                errorPath
            );
        },
        assertInt<T extends object>(params: {
            obj: T
            field: keyof T
            baseErrorPath: string
        }) {
            const {
                obj,
                field,
                baseErrorPath
            } = params;

            const value = obj[field] as number;
            const errorPath = this.createPath(baseErrorPath, `field '${String(field)}'`);

            tester.assert(value % 1 === 0, `This field must be an integer (received ${value})`, errorPath);
        },
        assertReferenceExists<T extends object>(params: {
            obj: T
            field: keyof T
            baseErrorPath: string
            collection: ObjectDefinitions
        }) {
            const {
                obj,
                field,
                baseErrorPath,
                collection
            } = params;

            this.assertReferenceExistsArray({
                obj,
                field,
                baseErrorPath,
                collection: collection.definitions,
                collectionName: collection.constructor.name
            });
        },
        assertReferenceExistsArray<T extends object>(params: {
            obj: T
            field: keyof T
            baseErrorPath: string
            collection: ObjectDefinition[]
            collectionName: string
        }) {
            const {
                obj,
                field,
                baseErrorPath,
                collection,
                collectionName
            } = params;

            this.assertReferenceExistsObject({
                obj,
                field,
                baseErrorPath,
                collection: collection.reduce<Record<string, unknown>>(
                    (acc, cur) => {
                        acc[cur.idString] = cur;
                        return acc;
                    },
                    {}
                ),
                collectionName
            });
        },
        assertReferenceExistsObject<T extends object>(params: {
            obj: T
            field: keyof T
            baseErrorPath: string
            collection: Record<string, unknown>
            collectionName: string
        }) {
            const {
                obj,
                field,
                baseErrorPath,
                collection,
                collectionName
            } = params;

            const referenceToValidate = obj[field] as string;
            const errorPath = this.createPath(baseErrorPath, `field '${String(field)}'`);

            tester.assert(
                referenceToValidate in collection,
                `This field attempted to refer to member '${referenceToValidate}' of collection '${collectionName}', but no such member exists.`,
                errorPath
            );
        },
        assertIsRealNumber<T extends object>(params: {
            obj: T
            field: keyof T
            baseErrorPath: string
        }): void {
            const {
                obj,
                field,
                baseErrorPath
            } = params;

            this.assertInBounds({
                obj,
                field,
                min: -Infinity,
                max: Infinity,
                includeMin: true,
                includeMax: true,
                baseErrorPath
            });
        },
        assertIsFiniteRealNumber<T extends object>(params: {
            obj: T
            field: keyof T
            baseErrorPath: string
        }): void {
            const {
                obj,
                field,
                baseErrorPath
            } = params;

            this.assertInBounds({
                obj,
                field,
                min: -Infinity,
                max: Infinity,
                includeMin: true,
                baseErrorPath
            });
        },
        assertIsPositiveReal<T extends object>(params: {
            obj: T
            field: keyof T
            baseErrorPath: string
        }): void {
            const {
                obj,
                field,
                baseErrorPath
            } = params;

            this.assertInBounds({
                obj,
                field,
                min: 0,
                max: Infinity,
                includeMin: true,
                includeMax: true,
                baseErrorPath
            });
        },
        assertIsPositiveFiniteReal<T extends object>(params: {
            obj: T
            field: keyof T
            baseErrorPath: string
        }): void {
            const {
                obj,
                field,
                baseErrorPath
            } = params;

            this.assertInBounds({
                obj,
                field,
                min: 0,
                max: Infinity,
                includeMin: true,
                baseErrorPath
            });
        },
        assertIsNaturalNumber<T extends object>(params: {
            obj: T
            field: keyof T
            baseErrorPath: string
        }): void {
            if (Number.isFinite(params.obj[params.field])) {
                this.assertInt(params);
            }
            this.assertIsPositiveReal(params);
        },
        assertIsNaturalFiniteNumber<T extends object>(params: {
            obj: T
            field: keyof T
            baseErrorPath: string
        }): void {
            if (Number.isFinite(params.obj[params.field])) {
                this.assertInt(params);
            }
            this.assertIsPositiveFiniteReal(params);
        },
        assertInBounds<T extends object>(params: {
            obj: T
            field: keyof T
            min: number
            max: number
            includeMin?: boolean
            includeMax?: boolean
            baseErrorPath: string
        }): void {
            const {
                obj,
                field,
                min,
                max,
                includeMin,
                includeMax,
                baseErrorPath
            } = params;

            const value = obj[field] as number;
            const errorPath = this.createPath(baseErrorPath, `field '${String(field)}'`);

            tester.assert(value > min || (includeMin === true && value === min), `This field must be greater than ${includeMin ? "or equal to " : ""}${min} (received ${value})`, errorPath);
            tester.assert(value < max || (includeMax === true && value === max), `This field must be less than ${includeMax ? "or equal to " : ""}${max} (received ${value})`, errorPath);
        },
        assertIntAndInBounds<T extends object>(params: {
            obj: T
            field: keyof T
            min: number
            max: number
            includeMin?: boolean
            includeMax?: boolean
            baseErrorPath: string
        }): void {
            if (Number.isFinite(params.obj[params.field])) {
                this.assertInt(params);
            }

            this.assertInBounds(params);
        }
    };
})();

const validators = Object.freeze({
    ballistics(baseErrorPath: string, ballistics: BulletDefinition): void {
        tester.assertIsRealNumber({
            obj: ballistics,
            field: "damage",
            baseErrorPath
        });

        tester.assertIsRealNumber({
            obj: ballistics,
            field: "obstacleMultiplier",
            baseErrorPath
        });

        tester.assertIsPositiveFiniteReal({
            obj: ballistics,
            field: "speed",
            baseErrorPath
        });

        tester.assertIsPositiveFiniteReal({
            obj: ballistics,
            field: "maxDistance",
            baseErrorPath
        });

        if (ballistics.tracerOpacity) {
            const errorPath3 = tester.createPath(baseErrorPath, "tracer opacity");

            tester.assertInBounds({
                obj: ballistics,
                field: "tracerOpacity",
                min: 0,
                max: 1,
                includeMin: true,
                includeMax: true,
                baseErrorPath: errorPath3
            });
        }

        if (ballistics.tracerWidth) {
            tester.assertIsPositiveReal({
                obj: ballistics,
                field: "tracerWidth",
                baseErrorPath
            });
        }

        if (ballistics.tracerLength) {
            tester.assertIsPositiveReal({
                obj: ballistics,
                field: "tracerLength",
                baseErrorPath
            });
        }

        if (ballistics.variance) {
            tester.assertInBounds({
                obj: ballistics,
                field: "variance",
                min: 0,
                max: 1,
                includeMax: true,
                includeMin: true,
                baseErrorPath
            });
        }
    },
    vector(
        baseErrorPath: string,
        vector: Vector,
        xBounds?: {
            readonly intOnly?: boolean
            readonly min: number
            readonly max: number
            readonly includeMin?: boolean
            readonly includeMax?: boolean
        },
        yBounds?: {
            readonly intOnly?: boolean
            readonly min: number
            readonly max: number
            readonly includeMin?: boolean
            readonly includeMax?: boolean
        }
    ): void {
        (
            xBounds?.intOnly === true
                ? tester.assertIntAndInBounds<Vector>
                : tester.assertInBounds<Vector>
        ).call(
            tester,
            {
                obj: vector,
                field: "x",
                min: xBounds?.min ?? -Infinity,
                max: xBounds?.max ?? Infinity,
                includeMin: xBounds?.includeMin,
                includeMax: xBounds?.includeMax,
                baseErrorPath
            }
        );

        (
            yBounds?.intOnly === true
                ? tester.assertIntAndInBounds<Vector>
                : tester.assertInBounds<Vector>
        ).call(
            tester,
            {
                obj: vector,
                field: "y",
                min: yBounds?.min ?? -Infinity,
                max: yBounds?.max ?? Infinity,
                includeMin: yBounds?.includeMin,
                includeMax: yBounds?.includeMax,
                baseErrorPath
            }
        );
    },
    hitbox(baseErrorPath: string, hitbox: Hitbox): void {
        if (hitbox instanceof CircleHitbox) {
            this.vector(baseErrorPath, hitbox.position);

            tester.assertIsPositiveFiniteReal({
                obj: hitbox,
                field: "radius",
                baseErrorPath
            });
        } else if (hitbox instanceof RectangleHitbox) {
            this.vector(baseErrorPath, hitbox.min);
            this.vector(baseErrorPath, hitbox.max);
        } else if (hitbox instanceof ComplexHitbox) {
            hitbox.hitboxes.map(this.hitbox.bind(this, baseErrorPath));
        } else if (hitbox instanceof PolygonHitbox) {
            hitbox.points.map(v => this.vector(baseErrorPath, v));
        }
    }
});

const logger = (() => {
    interface LoggingLevel {
        readonly title: string
        readonly messages: Array<string | LoggingLevel>
    }
    const messages: LoggingLevel = {
        title: "Validating idString references",
        messages: []
    };
    let current = messages;

    return {
        indent(reason: string, cb: () => void): void {
            const nextLevel: LoggingLevel = {
                title: reason,
                messages: []
            };
            const currentCopy = current;

            current.messages.push(nextLevel);
            current = nextLevel;
            cb();

            current = currentCopy;
        },
        log(message: string): void {
            current.messages.push(message);
        },
        print() {
            // ┬┆┐─└├

            console.clear();
            (function printInternal(base: LoggingLevel, level = 0, dashes: boolean[] = []): void {
                const prePrefix = dashes.map(v => `${v ? "┆" : " "} `).join("");

                for (let i = 0, l = base.messages.length; i < l; i++) {
                    const message = base.messages[i];
                    const isLast = i === l - 1;

                    const basePrefix = `${isLast ? "└" : "├"}─`;
                    if (typeof message === "string") {
                        console.log(`${prePrefix}${basePrefix} ${message}`);
                    } else {
                        const prefix = `${message.messages.length ? "┬" : "─"}─`;
                        console.log(`${prePrefix}${basePrefix}${prefix} ${message.title}`);

                        if (message.messages.length) {
                            printInternal(message, level + 1, dashes.concat(!isLast));
                        }
                    }
                }
            })(messages);
        }
    };
})();

const testStart = Date.now();
logger.log("START");
logger.indent("Validating gas stages", () => {
    for (let i = 0, l = GasStages.length; i < l; i++) {
        const stage = GasStages[i];
        const errorPath = tester.createPath("gas stages", `stage ${i}`);

        logger.indent(`Validating stage ${i}`, () => {
            tester.assertIsPositiveReal({
                obj: stage,
                field: "duration",
                baseErrorPath: errorPath
            });

            tester.assertIsPositiveReal({
                obj: stage,
                field: "dps",
                baseErrorPath: errorPath
            });

            tester.assertIsPositiveReal({
                obj: stage,
                field: "oldRadius",
                baseErrorPath: errorPath
            });

            tester.assertIsPositiveReal({
                obj: stage,
                field: "newRadius",
                baseErrorPath: errorPath
            });
        });
    }
});

logger.indent("Validating loot table references", () => {
    logger.indent("Validating loot tables", () => {
        for (const [name, lootData] of Object.entries(LootTables)) {
            logger.indent(`Validating table '${name}'`, () => {
                const errorPath = tester.createPath("loot table references", "loot tables", `table '${name}'`);

                logger.indent("Validating min/max", () => {
                    tester.assertIntAndInBounds({
                        obj: lootData,
                        field: "min",
                        min: 0,
                        max: lootData.max,
                        includeMin: true,
                        includeMax: true,
                        baseErrorPath: errorPath
                    });

                    tester.assertIntAndInBounds({
                        obj: lootData,
                        field: "max",
                        min: lootData.min,
                        max: Infinity,
                        includeMin: true,
                        includeMax: true,
                        baseErrorPath: errorPath
                    });
                });

                logger.indent("Validating drop declaration", () => {
                    const errorPath2 = tester.createPath(errorPath, "drop declaration");

                    for (const entry of lootData.loot) {
                        if ("item" in entry) {
                            if (entry.count !== undefined) {
                                tester.assertIntAndInBounds({
                                    obj: entry,
                                    field: "count",
                                    min: 0,
                                    max: Infinity,
                                    includeMin: true,
                                    includeMax: true,
                                    baseErrorPath: errorPath2
                                });
                            }

                            tester.assertReferenceExistsArray({
                                obj: entry,
                                field: "item",
                                baseErrorPath: errorPath2,
                                collection: Loots.definitions,
                                collectionName: "Loots"
                            });
                        } else {
                            tester.assertReferenceExistsObject({
                                obj: entry,
                                field: "tier",
                                baseErrorPath: errorPath2,
                                collection: LootTiers,
                                collectionName: "LootTiers"
                            });
                        }

                        tester.assertIsPositiveFiniteReal({
                            obj: entry,
                            field: "weight",
                            baseErrorPath: errorPath2
                        });
                    }
                });
            });
        }
    });

    logger.indent("Validating loot tiers", () => {
        for (const [name, lootTierData] of Object.entries(LootTiers)) {
            logger.indent(`Validating tier '${name}'`, () => {
                const errorPath = tester.createPath("loot table references", "loot tiers", `tier '${name}'`);

                for (const entry of lootTierData) {
                    if ("item" in entry) {
                        if (entry.count !== undefined) {
                            tester.assertIsNaturalNumber({
                                obj: entry,
                                field: "count",
                                baseErrorPath: errorPath
                            });
                        }

                        tester.assertReferenceExistsArray({
                            obj: entry,
                            field: "item",
                            baseErrorPath: errorPath,
                            collection: Loots.definitions,
                            collectionName: "Loots"
                        });
                    }

                    tester.assertIsPositiveFiniteReal({
                        obj: entry,
                        field: "weight",
                        baseErrorPath: errorPath
                    });
                }
            });
        }
    });
});

logger.indent("Validating map definitions", () => {
    for (const [name, definition] of Object.entries(Maps)) {
        logger.indent(`Validating map '${name}'`, () => {
            const errorPath = tester.createPath("maps", `map '${name}'`);

            if (definition.buildings) {
                const errorPath2 = tester.createPath(errorPath, "buildings");

                logger.indent("Validating buildings", () => {
                    /* eslint-disable @typescript-eslint/no-non-null-assertion */
                    for (const [building] of Object.entries(definition.buildings!)) {
                        tester.assertReferenceExists({
                            obj: { [building]: building },
                            field: building,
                            baseErrorPath: errorPath2,
                            collection: Buildings
                        });

                        tester.assertIsNaturalFiniteNumber({
                            obj: definition.buildings!,
                            field: building,
                            baseErrorPath: errorPath2
                        });
                    }
                });
            }

            if (definition.loots) {
                const errorPath2 = tester.createPath(errorPath, "loots");

                logger.indent("Validating loots", () => {
                    /* eslint-disable @typescript-eslint/no-non-null-assertion */
                    for (const [loot] of Object.entries(definition.loots!)) {
                        tester.assertReferenceExistsObject({
                            obj: { [loot]: loot },
                            field: loot,
                            baseErrorPath: errorPath2,
                            collection: LootTables,
                            collectionName: "LootTables"
                        });

                        tester.assertIsNaturalNumber({
                            obj: definition.loots!,
                            field: loot,
                            baseErrorPath: errorPath2
                        });
                    }
                });
            }

            if (definition.specialObstacles) {
                const errorPath2 = tester.createPath(errorPath, "special obstacles");

                logger.indent("Validating special obstacles", () => {
                    /* eslint-disable @typescript-eslint/no-non-null-assertion */
                    for (const [obstacle, config] of Object.entries(definition.specialObstacles!)) {
                        logger.indent(`Validating config for obstacle '${obstacle}'`, () => {
                            tester.assertReferenceExists({
                                obj: { [obstacle]: obstacle },
                                field: obstacle,
                                baseErrorPath: errorPath2,
                                collection: Obstacles
                            });

                            if (config.spawnProbability) {
                                tester.assertInBounds({
                                    obj: config,
                                    field: "spawnProbability",
                                    min: 0,
                                    max: 1,
                                    includeMin: true,
                                    includeMax: true,
                                    baseErrorPath: errorPath2
                                });
                            }

                            if ("count" in config) {
                                tester.assertIsPositiveFiniteReal({
                                    obj: config,
                                    field: "count",
                                    baseErrorPath: errorPath2
                                });
                            } else {
                                tester.assertInBounds({
                                    obj: config,
                                    field: "min",
                                    min: 0,
                                    max: config.max,
                                    includeMin: true,
                                    includeMax: true,
                                    baseErrorPath: errorPath2
                                });

                                tester.assertInBounds({
                                    obj: config,
                                    field: "max",
                                    min: config.min,
                                    max: Infinity,
                                    includeMin: true,
                                    baseErrorPath: errorPath2
                                });
                            }

                            if (config.radius) {
                                tester.assertIsPositiveReal({
                                    obj: config,
                                    field: "radius",
                                    baseErrorPath: errorPath2
                                });
                            }

                            if (config.squareRadius) {
                                tester.assert(config.radius !== undefined, "squareRadius shouldn't be specified without radius", errorPath2);
                            }
                        });
                    }
                });
            }

            tester.assertIsPositiveFiniteReal({
                obj: definition,
                field: "beachSize",
                baseErrorPath: errorPath
            });

            tester.assertIsPositiveFiniteReal({
                obj: definition,
                field: "oceanSize",
                baseErrorPath: errorPath
            });
        });
    }
});

// suck it
// eslint-disable-next-line no-inner-declarations
function validateWearerAttributes(baseErrorPath: string, definition: ItemDefinition): void {
    function validateWearerAttributesInternal(baseErrorPath: string, attributes: WearerAttributes): void {
        if (attributes.maxAdrenaline) {
            tester.assertIsPositiveReal({
                obj: attributes,
                field: "maxAdrenaline",
                baseErrorPath
            });
        }

        if (attributes.minAdrenaline) {
            tester.assertIsPositiveReal({
                obj: attributes,
                field: "minAdrenaline",
                baseErrorPath
            });
        }

        if (attributes.maxHealth) {
            tester.assertIsPositiveReal({
                obj: attributes,
                field: "maxHealth",
                baseErrorPath
            });
        }

        if (attributes.speedBoost) {
            tester.assertIsPositiveReal({
                obj: attributes,
                field: "speedBoost",
                baseErrorPath
            });
        }
    }

    if (definition.wearerAttributes) {
        logger.indent("Validating wearer attributes", () => {
            const wearerAttributes = definition.wearerAttributes;

            if (wearerAttributes!.passive) {
                logger.indent("Validating passive wearer attributes", () => {
                    validateWearerAttributesInternal(tester.createPath(baseErrorPath, "wearer attributes", "passive"), wearerAttributes!.passive!);
                });
            }

            if (wearerAttributes!.active) {
                logger.indent("Validating active wearer attributes", () => {
                    validateWearerAttributesInternal(tester.createPath(baseErrorPath, "wearer attributes", "active"), wearerAttributes!.active!);
                });
            }

            if (wearerAttributes!.on) {
                logger.indent("Validating on wearer attributes", () => {
                    const on = wearerAttributes!.on!;

                    if (on.damageDealt) {
                        logger.indent("Validating on-damage wearer attributes", () => {
                            wearerAttributes!.on!.damageDealt!.forEach((e, i) =>
                                validateWearerAttributesInternal(
                                    tester.createPath(baseErrorPath, "wearer attributes", "on", "damageDealt", `entry ${i}`),
                                    e
                                )
                            );
                        });
                    }

                    if (on.kill) {
                        logger.indent("Validating on-kill wearer attributes", () => {
                            wearerAttributes!.on!.kill!.forEach((e, i) =>
                                validateWearerAttributesInternal(
                                    tester.createPath(baseErrorPath, "wearer attributes", "on", "kill", `entry ${i}`),
                                    e
                                )
                            );
                        });
                    }
                });
            }
        });
    }
}

logger.indent("Validating ammo types", () => {
    tester.assertNoDuplicateIDStrings(Ammos, "Ammos", "ammos");
});

logger.indent("Validating armors", () => {
    tester.assertNoDuplicateIDStrings(Armors, "Armors", "armors");
});

logger.indent("Validating armor definitions", () => {
    function validateArmorDefinition(baseErrorPath: string, definition: ArmorDefinition): void {
        logger.indent(`Validating '${definition.idString}'`, () => {
            tester.assertIsNaturalNumber({
                obj: definition,
                field: "level",
                baseErrorPath
            });

            tester.assertInBounds({
                obj: definition,
                field: "damageReduction",
                min: 0,
                max: 1,
                includeMin: true,
                includeMax: true,
                baseErrorPath
            });

            validateWearerAttributes(baseErrorPath, definition);
        });
    }

    logger.indent("Validating helmet definitions", () => {
        const errorPath = tester.createPath("armors", "helmets");

        tester.assertNoDuplicateIDStrings(Helmets, "Helmets", errorPath);
        Helmets.forEach(validateArmorDefinition.bind(null, errorPath));
    });

    logger.indent("Validating vest definitions", () => {
        const errorPath = tester.createPath("armors", "vests");

        tester.assertNoDuplicateIDStrings(Vests, "Vests", errorPath);
        Vests.forEach(validateArmorDefinition.bind(null, errorPath));
    });
});

logger.indent("Validating backpack definitions", () => {
    tester.assertNoDuplicateIDStrings(Backpacks, "Backpacks", "backpacks");

    for (const backpack of Backpacks) {
        const errorPath = tester.createPath("backpacks", `backpack '${backpack.idString}'`);

        logger.indent(`Validating '${backpack.idString}'`, () => {
            tester.assertIsNaturalNumber({
                obj: backpack,
                field: "level",
                baseErrorPath: errorPath
            });

            validateWearerAttributes(errorPath, backpack);

            logger.indent("Validating maximum capacities", () => {
                const errorPath2 = tester.createPath(errorPath, "maximum capacities");

                for (const [item] of Object.entries(backpack.maxCapacity)) {
                    tester.assertReferenceExistsArray({
                        obj: { [item]: item },
                        field: item,
                        baseErrorPath: errorPath2,
                        collection: (HealingItems as ObjectDefinition[]).concat(Ammos),
                        collectionName: "HealingItems and Ammos"
                    });

                    tester.assertIsNaturalNumber({
                        obj: backpack.maxCapacity,
                        field: item,
                        baseErrorPath: errorPath2
                    });
                }
            });
        });
    }
});

logger.indent("Validating building definitions", () => {
    tester.assertNoDuplicateIDStrings(Buildings.definitions, "Buildings", "buildings");

    for (const building of Buildings.definitions) {
        logger.indent(`Validating '${building.idString}'`, () => {
            const errorPath = tester.createPath("buildings", `building '${building.idString}'`);

            validators.hitbox(errorPath, building.spawnHitbox);
            if (building.ceilingHitbox) validators.hitbox(errorPath, building.ceilingHitbox);
            validators.hitbox(errorPath, building.scopeHitbox);

            if (building.obstacles.length) {
                logger.indent("Validating custom obstacles", () => {
                    const errorPath2 = tester.createPath(errorPath, "custom obstacles");

                    for (const obstacle of building.obstacles) {
                        logger.indent(`Validating '${obstacle.id}'`, () => {
                            tester.assertReferenceExists({
                                obj: obstacle,
                                field: "id",
                                collection: Obstacles,
                                baseErrorPath: errorPath2
                            });

                            validators.vector(errorPath2, obstacle.position);

                            if (obstacle.rotation) {
                                const reference = Obstacles.definitions.find(o => o.idString === obstacle.id);

                                if (reference) {
                                    const rotationMode = reference.rotationMode;

                                    switch (rotationMode) {
                                        case RotationMode.Full: {
                                            tester.assertIsFiniteRealNumber({
                                                obj: obstacle,
                                                field: "rotation",
                                                baseErrorPath: errorPath2
                                            });
                                            break;
                                        }
                                        case RotationMode.Limited: {
                                            tester.assertIntAndInBounds({
                                                obj: obstacle,
                                                field: "rotation",
                                                baseErrorPath: errorPath2,
                                                min: 0,
                                                max: 3,
                                                includeMin: true,
                                                includeMax: true
                                            });
                                            break;
                                        }
                                        case RotationMode.Binary: {
                                            tester.assertIntAndInBounds({
                                                obj: obstacle,
                                                field: "rotation",
                                                baseErrorPath: errorPath2,
                                                min: 0,
                                                max: 1,
                                                includeMin: true,
                                                includeMax: true
                                            });
                                            break;
                                        }
                                        case RotationMode.None: {
                                            tester.assertInBounds({
                                                obj: obstacle,
                                                field: "rotation",
                                                baseErrorPath: errorPath2,
                                                min: 0,
                                                max: 0,
                                                includeMin: true,
                                                includeMax: true
                                            });
                                            break;
                                        }
                                    }
                                }
                            }

                            if (obstacle.scale) {
                                tester.assertIsPositiveFiniteReal({
                                    obj: obstacle,
                                    field: "scale",
                                    baseErrorPath: errorPath2
                                });
                            }

                            if (obstacle.lootSpawnOffset) {
                                validators.vector(errorPath2, obstacle.lootSpawnOffset);
                            }
                        });
                    }
                });
            }

            if (building.lootSpawners?.length) {
                logger.indent("Validating loot spawners", () => {
                    const errorPath2 = tester.createPath(errorPath, "loot spawners");

                    for (const spawner of building.lootSpawners!) {
                        validators.vector(errorPath2, spawner.position);

                        tester.assertReferenceExistsObject({
                            obj: spawner,
                            field: "table",
                            collection: LootTables,
                            collectionName: "LootTables",
                            baseErrorPath: errorPath2
                        });
                    }
                });
            }

            if (building.subBuildings?.length) {
                const errorPath2 = tester.createPath(errorPath, "sub-buildings");

                for (const subbuilding of building.subBuildings) {
                    logger.indent(`Validating sub-building '${subbuilding.id}'`, () => {
                        tester.assertReferenceExists({
                            obj: subbuilding,
                            field: "id",
                            collection: Buildings,
                            baseErrorPath: errorPath2
                        });

                        validators.vector(errorPath2, subbuilding.position);
                    });
                }
            }

            if (building.floorImages.length) {
                const errorPath2 = tester.createPath(errorPath, "floor images");
                for (const image of building.floorImages) {
                    validators.vector(errorPath2, image.position);
                }
            }

            if (building.ceilingImages.length) {
                const errorPath2 = tester.createPath(errorPath, "ceiling images");
                for (const image of building.ceilingImages) {
                    validators.vector(errorPath2, image.position);
                }
            }

            if (building.wallsToDestroy !== undefined) {
                tester.assertIntAndInBounds({
                    obj: building,
                    field: "wallsToDestroy",
                    min: 1,
                    max: building.obstacles.filter(o => Obstacles.definitions.find(ob => ob.idString === o.id)?.role === ObstacleSpecialRoles.Wall).length,
                    includeMin: true,
                    includeMax: true,
                    baseErrorPath: errorPath
                });
            }

            if (building.groundGraphics) {
                const errorPath2 = tester.createPath(errorPath, "ground graphics");
                for (const graphic of building.groundGraphics) {
                    validators.hitbox(errorPath2, graphic.hitbox);

                    tester.assertIntAndInBounds({
                        obj: graphic,
                        baseErrorPath: errorPath2,
                        field: "color",
                        max: 0xffffff,
                        min: 0,
                        includeMax: true,
                        includeMin: true
                    });
                }
            }

            if (building.floors.length) {
                const errorPath2 = tester.createPath(errorPath, "floors");

                for (const floor of building.floors) {
                    validators.hitbox(errorPath2, floor.hitbox);

                    tester.assertReferenceExistsObject({
                        obj: floor,
                        field: "type",
                        collection: FloorTypes,
                        baseErrorPath: errorPath2,
                        collectionName: "Floors"
                    });
                }
            }
        });
    }
});

logger.indent("Validating emotes", () => {
    tester.assertNoDuplicateIDStrings(Emotes.definitions, "Emotes", "emotes");
});

logger.indent("Validating explosions", () => {
    tester.assertNoDuplicateIDStrings(Explosions.definitions, "Explosions", "explosions");

    for (const explosion of Explosions.definitions) {
        const errorPath = tester.createPath("explosions", `explosion '${explosion.idString}'`);

        logger.indent(`Validating explosion '${explosion.idString}'`, () => {
            tester.assertIsRealNumber({
                obj: explosion,
                field: "damage",
                baseErrorPath: errorPath
            });

            tester.assertIsRealNumber({
                obj: explosion,
                field: "obstacleMultiplier",
                baseErrorPath: errorPath
            });

            logger.indent("Validating radii", () => {
                const errorPath2 = tester.createPath(errorPath, "radii");

                tester.assertInBounds({
                    obj: explosion.radius,
                    field: "min",
                    min: 0,
                    max: explosion.radius.max,
                    includeMax: true,
                    baseErrorPath: errorPath2
                });

                tester.assertInBounds({
                    obj: explosion.radius,
                    field: "max",
                    min: explosion.radius.min,
                    max: Infinity,
                    includeMin: true,
                    baseErrorPath: errorPath2
                });
            });

            logger.indent("Validating camera shake", () => {
                const errorPath2 = tester.createPath(errorPath, "camera shake");

                tester.assertIsPositiveReal({
                    obj: explosion.cameraShake,
                    field: "duration",
                    baseErrorPath: errorPath2
                });

                tester.assertIsPositiveFiniteReal({
                    obj: explosion.cameraShake,
                    field: "intensity",
                    baseErrorPath: errorPath2
                });
            });

            logger.indent("Validating animation", () => {
                const errorPath2 = tester.createPath(errorPath, "animation");

                tester.assertIsPositiveReal({
                    obj: explosion.animation,
                    field: "duration",
                    baseErrorPath: errorPath2
                });

                tester.assertIsFiniteRealNumber({
                    obj: explosion.animation,
                    field: "scale",
                    baseErrorPath: errorPath2
                });
            });

            logger.indent("Validating ballistics", () => {
                const errorPath2 = tester.createPath(errorPath, "ballistics");
                validators.ballistics(errorPath2, explosion.ballistics);
            });

            tester.assertIsNaturalFiniteNumber({
                obj: explosion,
                field: "shrapnelCount",
                baseErrorPath: errorPath
            });
        });
    }
});

logger.indent("Validating guns", () => {
    tester.assertNoDuplicateIDStrings(Guns, "Guns", "guns");

    for (const gun of Guns) {
        const errorPath = tester.createPath("guns", `gun '${gun.idString}'`);

        logger.indent(`Validating gun '${gun.idString}'`, () => {
            tester.assertReferenceExistsArray({
                obj: gun,
                field: "ammoType",
                collection: Ammos,
                collectionName: "Ammos",
                baseErrorPath: errorPath
            });

            tester.assertIsNaturalFiniteNumber({
                obj: gun,
                field: "ammoSpawnAmount",
                baseErrorPath: errorPath
            });

            tester.assertIsNaturalFiniteNumber({
                obj: gun,
                field: "capacity",
                baseErrorPath: errorPath
            });

            tester.assertIsPositiveFiniteReal({
                obj: gun,
                field: "reloadTime",
                baseErrorPath: errorPath
            });

            tester.assertIsPositiveFiniteReal({
                obj: gun,
                field: "fireDelay",
                baseErrorPath: errorPath
            });

            tester.assertIsPositiveFiniteReal({
                obj: gun,
                field: "switchDelay",
                baseErrorPath: errorPath
            });

            tester.assertIsFiniteRealNumber({
                obj: gun,
                field: "speedMultiplier",
                baseErrorPath: errorPath
            });

            tester.assertIsFiniteRealNumber({
                obj: gun,
                field: "recoilMultiplier",
                baseErrorPath: errorPath
            });

            tester.assertIsPositiveFiniteReal({
                obj: gun,
                field: "recoilDuration",
                baseErrorPath: errorPath
            });

            tester.assertIsPositiveReal({
                obj: gun,
                field: "shotSpread",
                baseErrorPath: errorPath
            });

            tester.assertIsRealNumber({
                obj: gun,
                field: "moveSpread",
                baseErrorPath: errorPath
            });

            if (gun.bulletCount) {
                tester.assertIsPositiveFiniteReal({
                    obj: gun,
                    field: "bulletCount",
                    baseErrorPath: errorPath
                });
            }

            tester.assertIsPositiveFiniteReal({
                obj: gun,
                field: "length",
                baseErrorPath: errorPath
            });

            logger.indent("Validating fists", () => {
                const errorPath2 = tester.createPath(errorPath, "fists");

                validators.vector(errorPath2, gun.fists.left);
                validators.vector(errorPath2, gun.fists.right);

                tester.assertIsPositiveReal({
                    obj: gun.fists,
                    field: "animationDuration",
                    baseErrorPath: errorPath2
                });
            });

            logger.indent("Validating image", () => {
                const errorPath2 = tester.createPath(errorPath, "image");

                validators.vector(errorPath2, gun.image.position);

                if (gun.image.angle !== undefined) {
                    tester.assertIsRealNumber({
                        obj: gun.image,
                        field: "angle",
                        baseErrorPath: errorPath2
                    });
                }
            });

            if (gun.casingParticles !== undefined) {
                logger.indent("Validating particles", () => {
                    const errorPath2 = tester.createPath(errorPath, "particles");
                    validators.vector(errorPath2, gun.casingParticles!.position);
                });
            }

            logger.indent("Validating ballistics", () => {
                const errorPath2 = tester.createPath(errorPath, "ballistics");
                validators.ballistics(errorPath2, gun.ballistics);
            });

            if (gun.fireMode === FireMode.Burst) {
                logger.indent("Validating burst properties", () => {
                    const errorPath2 = tester.createPath(errorPath, "burst properties");

                    tester.assertIsNaturalFiniteNumber({
                        obj: gun.burstProperties,
                        field: "shotsPerBurst",
                        baseErrorPath: errorPath2
                    });

                    tester.assertIsPositiveReal({
                        obj: gun.burstProperties,
                        field: "burstCooldown",
                        baseErrorPath: errorPath2
                    });
                });
            }

            validateWearerAttributes(errorPath, gun);
        });
    }
});

logger.indent("Validating healing items", () => {
    tester.assertNoDuplicateIDStrings(HealingItems, "HealingItems", "healing items");

    for (const healingItem of HealingItems) {
        const errorPath = tester.createPath("healing items", `healing item '${healingItem.idString}'`);

        logger.indent(`Validating healingItem '${healingItem.idString}'`, () => {
            tester.assertIsRealNumber({
                obj: healingItem,
                field: "restoreAmount",
                baseErrorPath: errorPath
            });

            tester.assertIsPositiveFiniteReal({
                obj: healingItem,
                field: "useTime",
                baseErrorPath: errorPath
            });
        });
    }
});

logger.indent("Validating loots", () => {
    tester.assertNoDuplicateIDStrings(Loots.definitions, "Loots", "loots");
});

logger.indent("Validating melees", () => {
    tester.assertNoDuplicateIDStrings(Melees, "Melees", "melees");

    for (const melee of Melees) {
        const errorPath = tester.createPath("melees", `melee '${melee.idString}'`);

        logger.indent(`Validating melee '${melee.idString}'`, () => {
            tester.assertIsRealNumber({
                obj: melee,
                field: "damage",
                baseErrorPath: errorPath
            });

            tester.assertIsRealNumber({
                obj: melee,
                field: "obstacleMultiplier",
                baseErrorPath: errorPath
            });

            if (melee.piercingMultiplier !== undefined) {
                tester.assertIsRealNumber({
                    obj: melee,
                    field: "piercingMultiplier",
                    baseErrorPath: errorPath
                });
            }

            tester.assertIsPositiveReal({
                obj: melee,
                field: "radius",
                baseErrorPath: errorPath
            });

            validators.vector(errorPath, melee.offset);

            tester.assertIsPositiveReal({
                obj: melee,
                field: "cooldown",
                baseErrorPath: errorPath
            });

            tester.assertIsFiniteRealNumber({
                obj: melee,
                field: "speedMultiplier",
                baseErrorPath: errorPath
            });

            tester.assertIsNaturalNumber({
                obj: melee,
                field: "maxTargets",
                baseErrorPath: errorPath
            });

            logger.indent("Validating fists", () => {
                const errorPath2 = tester.createPath(errorPath, "fists");
                const fists = melee.fists;

                validators.vector(errorPath2, fists.left);
                validators.vector(errorPath2, fists.right);

                validators.vector(errorPath2, fists.useLeft);
                validators.vector(errorPath2, fists.useRight);

                tester.assertIsPositiveReal({
                    obj: fists,
                    field: "animationDuration",
                    baseErrorPath: errorPath2
                });
            });

            if (melee.image) {
                logger.indent("Validating image", () => {
                    const errorPath2 = tester.createPath(errorPath, "image");
                    const image = melee.image!;

                    validators.vector(errorPath2, image.position);
                    validators.vector(errorPath2, image.usePosition);

                    if (image.angle) {
                        tester.assertIsFiniteRealNumber({
                            obj: image,
                            field: "angle",
                            baseErrorPath: errorPath2
                        });
                    }

                    if (image.useAngle) {
                        tester.assertIsFiniteRealNumber({
                            obj: image,
                            field: "useAngle",
                            baseErrorPath: errorPath2
                        });
                    }

                    if (image.lootScale) {
                        tester.assertIsFiniteRealNumber({
                            obj: image,
                            field: "lootScale",
                            baseErrorPath: errorPath2
                        });
                    }
                });
            }

            validateWearerAttributes(errorPath, melee);
        });
    }
});

logger.indent("Validating obstacles", () => {
    tester.assertNoDuplicateIDStrings(Obstacles.definitions, "Obstacles", "obstacles");

    for (const obstacle of Obstacles.definitions) {
        const errorPath = tester.createPath("obstacles", `obstacle '${obstacle.idString}'`);

        logger.indent(`Validating obstacle '${obstacle.idString}'`, () => {
            tester.assertIsPositiveReal({
                obj: obstacle,
                field: "health",
                baseErrorPath: errorPath
            });

            logger.indent("Validating scaling", () => {
                const errorPath2 = tester.createPath(errorPath, "scaling");

                tester.assertInBounds({
                    obj: obstacle.scale,
                    field: "spawnMin",
                    min: -Infinity,
                    max: obstacle.scale.spawnMax,
                    includeMax: true,
                    baseErrorPath: errorPath2
                });

                tester.assertInBounds({
                    obj: obstacle.scale,
                    field: "spawnMax",
                    min: obstacle.scale.spawnMin,
                    max: Infinity,
                    includeMin: true,
                    baseErrorPath: errorPath2
                });

                tester.assertIsFiniteRealNumber({
                    obj: obstacle.scale,
                    field: "destroy",
                    baseErrorPath: errorPath2
                });
            });

            validators.hitbox(errorPath, obstacle.hitbox);

            if (obstacle.spawnHitbox) {
                validators.hitbox(errorPath, obstacle.spawnHitbox);
            }

            if (obstacle.variations) {
                tester.assertIntAndInBounds({
                    obj: obstacle,
                    field: "variations",
                    min: 0,
                    max: 8,
                    includeMin: true,
                    baseErrorPath: errorPath
                });
            }

            if (obstacle.particleVariations) {
                tester.assertIntAndInBounds({
                    obj: obstacle,
                    field: "particleVariations",
                    min: 0,
                    max: 8,
                    includeMin: true,
                    baseErrorPath: errorPath
                });
            }

            if (obstacle.zIndex) {
                tester.assertIsFiniteRealNumber({
                    obj: obstacle,
                    field: "zIndex",
                    baseErrorPath: errorPath
                });
            }

            if (obstacle.explosion !== undefined) {
                tester.assertReferenceExists({
                    obj: obstacle,
                    field: "explosion",
                    collection: Explosions,
                    baseErrorPath: errorPath
                });
            }

            tester.assertWarn(
                obstacle.noResidue !== true || obstacle.frames?.residue === undefined,
                `Obstacle '${obstacle.idString}' specified a residue image, but also specified the 'noResidue' attribute.`,
                errorPath
            );

            tester.assertWarn(
                obstacle.invisible !== true || obstacle.frames?.base === undefined,
                `Obstacle '${obstacle.idString}' specified a base image, but also specified the 'invisible' attribute.`,
                errorPath
            );

            if (obstacle.hasLoot === true || obstacle.spawnWithLoot === true) {
                tester.assertReferenceExistsObject({
                    obj: obstacle,
                    field: "idString",
                    collection: LootTables,
                    collectionName: "LootTables",
                    baseErrorPath: errorPath
                });
            }

            if (obstacle.role !== undefined) {
                tester.assert(
                    obstacle.rotationMode !== RotationMode.Full,
                    `An obstacle whose role is '${ObstacleSpecialRoles[obstacle.role]}' cannot specify a rotation mode of 'Full'`,
                    errorPath
                );

                if (obstacle.role === ObstacleSpecialRoles.Door && obstacle.operationStyle !== "slide") {
                    validators.vector(errorPath, obstacle.hingeOffset);
                }
            }
        });
    }
});

logger.indent("Validating scopes", () => {
    tester.assertNoDuplicateIDStrings(Scopes, "Scopes", "scopes");

    for (const scope of Scopes) {
        const errorPath = tester.createPath("scopes", `scope '${scope.idString}'`);

        logger.indent(`Validating scope '${scope.idString}'`, () => {
            tester.assertIsPositiveFiniteReal({
                obj: scope,
                field: "zoomLevel",
                baseErrorPath: errorPath
            });
        });
    }
});

logger.indent("Validating skins", () => {
    tester.assertNoDuplicateIDStrings(Skins, "Skins", "skins");
});

logger.indent("Validating configurations", () => {
    logger.indent("Validating server config", () => {
        const errorPath = tester.createPath("configs", "server config");

        if (ServerConfig.spawn.mode === SpawnMode.Radius) {
            tester.assertIsFiniteRealNumber({
                obj: ServerConfig.spawn,
                field: "radius",
                baseErrorPath: errorPath
            });
        }

        if (ServerConfig.gas.mode === GasMode.Debug) {
            tester.assertIsPositiveReal({
                obj: ServerConfig.gas,
                field: "overrideDuration",
                baseErrorPath: errorPath
            });
        }

        tester.assertReferenceExistsObject({
            obj: ServerConfig,
            field: "mapName",
            collection: Maps,
            collectionName: "maps",
            baseErrorPath: errorPath
        });

        tester.assertIsNaturalNumber({
            obj: ServerConfig,
            field: "playerLimit",
            baseErrorPath: errorPath
        });

        tester.assertIsPositiveFiniteReal({
            obj: ServerConfig,
            field: "movementSpeed",
            baseErrorPath: errorPath
        });

        if (ServerConfig.protection) {
            logger.indent("Validating protection settings", () => {
                const protection = ServerConfig.protection!;
                const errorPath2 = tester.createPath(errorPath, "protection settings");

                tester.assertIsNaturalFiniteNumber({
                    obj: protection,
                    field: "maxSimultaneousConnections",
                    baseErrorPath: errorPath2
                });

                if (protection.maxJoinAttempts) {
                    tester.assertIsNaturalFiniteNumber({
                        obj: protection.maxJoinAttempts,
                        field: "count",
                        baseErrorPath: errorPath2
                    });

                    tester.assertIsPositiveFiniteReal({
                        obj: protection.maxJoinAttempts,
                        field: "duration",
                        baseErrorPath: errorPath2
                    });
                }

                tester.assertIsPositiveReal({
                    obj: protection,
                    field: "refreshDuration",
                    baseErrorPath: errorPath2
                });
            });
        }
    });

    logger.indent("Validating client config", () => {
        const errorPath = tester.createPath("configs", "client config");

        tester.assertReferenceExistsObject({
            obj: ClientConfig,
            field: "defaultRegion",
            collection: ClientConfig.regions,
            collectionName: "regions",
            baseErrorPath: errorPath
        });
    });
});

logger.print();

const { errors, warnings } = tester;
const exitCode = +(errors.length > 0);
const errorText = errors.length
    ? styleText(`${errors.length} error${errors.length === 1 ? "" : "s"}`, ColorStyles.foreground.red.bright, FontStyles.bold, FontStyles.underline)
    : styleText("no errors", ColorStyles.foreground.green.bright, FontStyles.bold, FontStyles.underline);
const warningText = warnings.length
    ? styleText(`${warnings.length} warning${warnings.length === 1 ? "" : "s"}`, ColorStyles.foreground.yellow.bright, FontStyles.underline)
    : styleText("no warnings", ColorStyles.foreground.green.bright, FontStyles.bold, FontStyles.underline);

console.log(`Validation finished with ${errorText} and ${warningText}.`);

errors.forEach(([path, message]) => {
    console.log(`${styleText(path, ColorStyles.foreground.red.normal, FontStyles.italic)}: ${styleText(message, FontStyles.bold)}`);
});

warnings.forEach(([path, message]) => {
    console.log(`${styleText(path, ColorStyles.foreground.yellow.normal)}: ${styleText(message, FontStyles.italic)}`);
});

const totalRuntime = Date.now() - absStart;
const testRuntime = Date.now() - testStart;
console.log(`Validation took ${totalRuntime}ms (${totalRuntime - testRuntime}ms for setup; ${testRuntime}ms for validation)`);
process.exit(exitCode);
