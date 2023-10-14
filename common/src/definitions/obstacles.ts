import { zIndexes } from "../constants";
import { type Variation } from "../typings";
import { CircleHitbox, ComplexHitbox, type Hitbox, RectangleHitbox } from "../utils/hitbox";
import { type ObjectDefinition, ObjectDefinitions, ObstacleSpecialRoles } from "../utils/objectDefinitions";
import { v, type Vector } from "../utils/vector";

export type ObstacleDefinition = ObjectDefinition & {
    readonly material: typeof Materials[number]
    readonly health: number
    readonly indestructible?: boolean
    readonly impenetrable?: boolean
    readonly noResidue?: boolean
    readonly invisible?: boolean
    readonly hideOnMap?: boolean
    readonly scale: {
        readonly spawnMin: number
        readonly spawnMax: number
        readonly destroy: number
    }
    readonly hitbox: Hitbox
    readonly spawnHitbox?: Hitbox
    readonly noCollisions?: boolean
    readonly rotationMode: RotationMode
    readonly variations?: Variation
    readonly particleVariations?: number
    readonly zIndex?: number
    readonly hasLoot?: boolean
    readonly spawnWithLoot?: boolean
    readonly explosion?: string
    readonly noMeleeCollision?: boolean
    readonly reflectBullets?: boolean

    readonly tint?: string

    readonly frames?: {
        readonly base?: string
        readonly particle?: string
        readonly residue?: string
    }
} & (
    (
        {
            readonly role: ObstacleSpecialRoles.Door
        } & (
            {
                readonly operationStyle?: "swivel"
                readonly hingeOffset: Vector
            } | {
                readonly operationStyle: "slide"
                /**
                 * Determines how much the door slides. 1 means it'll be displaced by its entire width,
                 * 0.5 means it'll be displaced by half its width, etc
                 */
                readonly slideFactor?: number
            }
        )
    ) | {
        readonly role?: ObstacleSpecialRoles.Wall | ObstacleSpecialRoles.Window
    }
);

export const Materials: string[] = [
    "tree",
    "stone",
    "bush",
    "crate",
    "metal",
    "wood",
    "glass",
    "porcelain",
    "cardboard",
    "appliance",
    "large_refinery_barrel"
];

export enum RotationMode {
    /**
     * Allows rotation in any direction (within the limits of the bit stream's encoding capabilities)
     */
    Full,
    /**
     * Allows rotation in the four cardinal directions: up, right, down and left
     */
    Limited,
    /**
     * Allows rotation in two directions: a "normal" direction and a "flipped" direction; for example,
     * up and down, or left and right
     */
    Binary,
    /**
     * Disabled rotation
     */
    None
}

function makeCrate(idString: string, name: string, options: Partial<ObstacleDefinition>): ObstacleDefinition {
    const definition = {
        ...{
            idString,
            name,
            material: "crate",
            health: 80,
            scale: {
                spawnMin: 1,
                spawnMax: 1,
                destroy: 0.5
            },
            hitbox: RectangleHitbox.fromRect(9.2, 9.2),
            hasLoot: true
        },
        ...options
    };
    return definition as ObstacleDefinition;
}

function makeSpecialCrate(idString: string, name: string): ObstacleDefinition {
    return {
        idString,
        name,
        material: "crate",
        health: 100,
        scale: {
            spawnMin: 1,
            spawnMax: 1,
            destroy: 0.6
        },
        hitbox: RectangleHitbox.fromRect(6.1, 6.1),
        rotationMode: RotationMode.None,
        hasLoot: true,
        frames: {
            particle: "regular_crate_particle",
            residue: "regular_crate_residue"
        }
    };
}

function makeHouseWall(lengthNumber: string, hitbox: Hitbox): ObstacleDefinition {
    return {
        idString: `house_wall_${lengthNumber}`,
        name: `House Wall ${lengthNumber}`,
        material: "wood",
        noResidue: true,
        health: 120,
        scale: {
            spawnMin: 1,
            spawnMax: 1,
            destroy: 0.95
        },
        hitbox,
        rotationMode: RotationMode.Limited,
        frames: {
            particle: "wall_particle"
        },
        role: ObstacleSpecialRoles.Wall
    };
}

function makeConcreteWall(idString: string, name: string, hitbox: Hitbox, indestructible = false, variations?: Variation): ObstacleDefinition {
    return {
        idString,
        name,
        material: "stone",
        health: 500,
        indestructible,
        noResidue: true,
        scale: {
            spawnMin: 1,
            spawnMax: 1,
            destroy: 0.95
        },
        hitbox,
        rotationMode: RotationMode.Limited,
        role: ObstacleSpecialRoles.Wall,
        particleVariations: 2,
        variations,
        frames: {
            particle: "rock_particle"
        }
    };
}

export const Obstacles = new ObjectDefinitions<ObstacleDefinition>(
    [
        {
            idString: "oak_tree",
            name: "Oak Tree",
            material: "tree",
            health: 180,
            scale: {
                spawnMin: 0.9,
                spawnMax: 1,
                destroy: 0.75
            },
            hitbox: new CircleHitbox(5.5),
            spawnHitbox: new CircleHitbox(15),
            rotationMode: RotationMode.Full,
            variations: 3,
            zIndex: zIndexes.ObstaclesLayer4
        },
        {
            idString: "pine_tree",
            name: "Pine Tree",
            material: "tree",
            health: 180,
            scale: {
                spawnMin: 0.9,
                spawnMax: 1.1,
                destroy: 0.75
            },
            hitbox: new CircleHitbox(7),
            spawnHitbox: new CircleHitbox(15),
            rotationMode: RotationMode.Full,
            zIndex: zIndexes.ObstaclesLayer4
        },
        {
            idString: "birch_tree",
            name: "Birch Tree",
            material: "tree",
            health: 240,
            scale: {
                spawnMin: 0.9,
                spawnMax: 1,
                destroy: 0.75
            },
            hitbox: new CircleHitbox(5.5),
            spawnHitbox: new CircleHitbox(15),
            rotationMode: RotationMode.Full,
            zIndex: zIndexes.ObstaclesLayer4
        },
        {
            idString: "rock",
            name: "Rock",
            material: "stone",
            health: 200,
            scale: {
                spawnMin: 0.9,
                spawnMax: 1.1,
                destroy: 0.5
            },
            hitbox: new CircleHitbox(4),
            spawnHitbox: new CircleHitbox(4.5),
            rotationMode: RotationMode.Full,
            variations: 7,
            particleVariations: 2
        },
        {
            idString: "flint_stone",
            name: "Flint Stone",
            material: "stone",
            health: 200,
            indestructible: true,
            noResidue: true,
            scale: {
                spawnMin: 1,
                spawnMax: 1,
                destroy: 0.5
            },
            hitbox: RectangleHitbox.fromRect(6.1, 6.1),
            rotationMode: RotationMode.None,
            particleVariations: 2,
            frames: {
                particle: "rock_particle"
            }
        },
        {
            idString: "bush",
            name: "Bush",
            material: "bush",
            health: 80,
            scale: {
                spawnMin: 0.9,
                spawnMax: 1.1,
                destroy: 0.8
            },
            hitbox: new CircleHitbox(4.2),
            noCollisions: true,
            rotationMode: RotationMode.Full,
            variations: 2,
            particleVariations: 2,
            zIndex: zIndexes.ObstaclesLayer3
        },
        {
            idString: "blueberry_bush",
            name: "Blueberry Bush",
            material: "bush",
            health: 80,
            scale: {
                spawnMin: 0.9,
                spawnMax: 1.1,
                destroy: 0.8
            },
            hitbox: new CircleHitbox(4.2),
            noCollisions: true,
            rotationMode: RotationMode.Full,
            particleVariations: 2,
            zIndex: zIndexes.ObstaclesLayer3,
            spawnWithLoot: true,
            frames: {
                particle: "bush_particle",
                residue: "bush_residue"
            }
        },
        makeCrate("regular_crate", "Regular Crate", {
            rotationMode: RotationMode.Binary
        }),
        makeCrate("flint_crate", "Flint Crate", {
            rotationMode: RotationMode.None,
            hideOnMap: true
        }),
        makeCrate("aegis_crate", "AEGIS Crate", {
            rotationMode: RotationMode.None,
            hideOnMap: true
        }),
        makeSpecialCrate("melee_crate", "Melee Crate"),
        {
            idString: "barrel",
            name: "Barrel",
            material: "metal",
            health: 160,
            scale: {
                spawnMin: 1,
                spawnMax: 1,
                destroy: 0.5
            },
            hitbox: new CircleHitbox(3.65),
            rotationMode: RotationMode.Full,
            explosion: "barrel_explosion",
            reflectBullets: true
        },
        {
            idString: "super_barrel",
            name: "Super Barrel",
            material: "metal",
            health: 240,
            scale: {
                spawnMin: 1,
                spawnMax: 1,
                destroy: 0.5
            },
            hitbox: new CircleHitbox(3.65),
            rotationMode: RotationMode.Full,
            explosion: "super_barrel_explosion",
            reflectBullets: true
        },
        {
            idString: "oil_tank",
            name: "Oil Tank",
            material: "metal",
            health: 2500,
            scale: {
                spawnMin: 1,
                spawnMax: 1,
                destroy: 0.9
            },
            indestructible: true,
            hitbox: new ComplexHitbox(
                RectangleHitbox.fromRect(16.8, 13.6),
                RectangleHitbox.fromRect(26, 2),
                new CircleHitbox(5, v(-8, 1.8)),
                new CircleHitbox(5, v(-8, -1.8)),
                new CircleHitbox(5, v(8, 1.8)),
                new CircleHitbox(5, v(8, -1.8))
            ),
            spawnHitbox: RectangleHitbox.fromRect(28, 18),
            rotationMode: RotationMode.Limited,
            noResidue: true,
            frames: {
                particle: "metal_particle"
            },
            reflectBullets: true
        },
        {
            idString: "gold_rock",
            name: "Gold Rock",
            material: "stone",
            hideOnMap: true,
            health: 250,
            scale: {
                spawnMin: 0.9,
                spawnMax: 1.1,
                destroy: 0.3
            },
            hitbox: new CircleHitbox(4),
            spawnHitbox: new CircleHitbox(4.5),
            rotationMode: RotationMode.Full,
            hasLoot: true
        },
        {
            idString: "warehouse_wall_1",
            name: "Warehouse Wall",
            material: "metal",
            health: 1000,
            indestructible: true,
            hideOnMap: true,
            scale: {
                spawnMin: 1,
                spawnMax: 1,
                destroy: 0.95
            },
            hitbox: RectangleHitbox.fromRect(70.5, 1.6),
            rotationMode: RotationMode.Limited,
            reflectBullets: true,
            noResidue: true,
            frames: {
                particle: "metal_particle"
            }
        },
        {
            idString: "warehouse_wall_2",
            name: "Warehouse Wall",
            material: "metal",
            health: 1000,
            indestructible: true,
            hideOnMap: true,
            scale: {
                spawnMin: 1,
                spawnMax: 1,
                destroy: 0.95
            },
            hitbox: RectangleHitbox.fromRect(10.6, 1.6),
            rotationMode: RotationMode.Limited,
            reflectBullets: true,
            noResidue: true,
            frames: {
                particle: "metal_particle"
            }
        },
        {
            idString: "box",
            name: "Box",
            material: "cardboard",
            health: 60,
            scale: {
                spawnMin: 1,
                spawnMax: 1,
                destroy: 0.8
            },
            hitbox: RectangleHitbox.fromRect(4.4, 4.4),
            rotationMode: RotationMode.Limited,
            variations: 3,
            zIndex: zIndexes.ObstaclesLayer2,
            hasLoot: true
        },
        {
            idString: "metal_shelf",
            name: "Metal Shelf",
            material: "metal",
            health: 1000,
            indestructible: true,
            noMeleeCollision: true,
            hideOnMap: true,
            scale: {
                spawnMin: 1,
                spawnMax: 1,
                destroy: 0.8
            },
            hitbox: RectangleHitbox.fromRect(24, 6.6),
            rotationMode: RotationMode.Limited,
            noResidue: true,
            frames: {
                particle: "metal_particle"
            },
            reflectBullets: true
        },
        makeHouseWall("1", RectangleHitbox.fromRect(9, 2)),
        makeHouseWall("2", RectangleHitbox.fromRect(20.86, 2)),
        makeHouseWall("3", RectangleHitbox.fromRect(11.4, 2)),
        makeHouseWall("4", RectangleHitbox.fromRect(21.4, 2)),
        makeHouseWall("5", RectangleHitbox.fromRect(16, 2)),
        {
            idString: "fridge",
            name: "Fridge",
            material: "appliance",
            health: 140,
            scale: {
                spawnMin: 1,
                spawnMax: 1,
                destroy: 0.8
            },
            hasLoot: true,
            hitbox: RectangleHitbox.fromRect(9.1, 6.45, v(0, -0.45)),
            rotationMode: RotationMode.Limited,
            frames: {
                particle: "metal_particle"
            },
            reflectBullets: true
        },
        {
            idString: "stove",
            name: "Stove",
            material: "metal",
            health: 140,
            scale: {
                spawnMin: 1,
                spawnMax: 1,
                destroy: 0.8
            },
            hitbox: RectangleHitbox.fromRect(9.1, 6.45, v(0, -0.45)),
            rotationMode: RotationMode.Limited,
            explosion: "stove_explosion",
            frames: {
                particle: "metal_particle"
            },
            reflectBullets: true
        },
        {
            idString: "washing_machine",
            name: "Washing Machine",
            material: "appliance",
            health: 140,
            scale: {
                spawnMin: 1,
                spawnMax: 1,
                destroy: 0.8
            },
            hasLoot: true,
            hitbox: RectangleHitbox.fromRect(9.1, 6.45, v(0, -0.45)),
            rotationMode: RotationMode.Limited,
            reflectBullets: true
        },
        {
            idString: "house_exterior",
            name: "House Exterior",
            material: "stone",
            health: 1000,
            indestructible: true,
            hideOnMap: true,
            invisible: true,
            scale: {
                spawnMin: 1,
                spawnMax: 1,
                destroy: 0.9
            },
            hitbox: new ComplexHitbox(
                // Comments assume the building is not rotated (rotation = 0)
                RectangleHitbox.fromRect(14.33, 2, v(-41.16, -34.15)), // First Topmost wall
                RectangleHitbox.fromRect(17, 2, v(-15, -34.15)), // Topmost wall after the first window
                RectangleHitbox.fromRect(44.33, 2, v(26.16, -34.15)), // Topmost wall after the second window
                RectangleHitbox.fromRect(2, 22.3, v(12.88, -22.05)), // Wall coming off of topmost wall
                RectangleHitbox.fromRect(2, 42.68, v(47.36, -11.86)), // Rightmost wall
                RectangleHitbox.fromRect(5.38, 2, v(43.74, 8.53)), // Short wall coming off of rightmost wall
                RectangleHitbox.fromRect(5.51, 2, v(16.62, 8.54)), // Short wall to the left of the previous one
                RectangleHitbox.fromRect(2, 22.7, v(12.88, 10.15)), // Wall coming off of the longer bottommost wall
                RectangleHitbox.fromRect(40.06, 2, v(-6.17, 22.54)), // Longer bottommost wall
                RectangleHitbox.fromRect(12.08, 2, v(-42.29, 22.54)), // Shorter bottommost wall
                RectangleHitbox.fromRect(2, 22.2, v(-47.36, -22.1)), // Leftmost wall until left window
                RectangleHitbox.fromRect(2, 24, v(-47.36, 11.5)), // Leftmost wall after the window

                RectangleHitbox.fromRect(3.25, 3.25, v(-40.27, 33.56)), // Left post
                RectangleHitbox.fromRect(3.25, 3.25, v(-22.48, 33.56)) // Right post
            ),
            rotationMode: RotationMode.Limited,
            noResidue: true,
            frames: {
                particle: "wall_particle"
            }
        },
        {
            idString: "door",
            name: "Door",
            material: "wood",
            health: 120,
            scale: {
                spawnMin: 1,
                spawnMax: 1,
                destroy: 1
            },
            hitbox: RectangleHitbox.fromRect(10.15, 1.6, v(-0.44, 0)),
            rotationMode: RotationMode.Limited,
            noResidue: true,
            role: ObstacleSpecialRoles.Door,
            hingeOffset: v(-5.5, 0),
            zIndex: zIndexes.ObstaclesLayer3,
            frames: {
                particle: "furniture_particle"
            }
        },
        {
            idString: "toilet",
            name: "Toilet",
            material: "porcelain",
            health: 100,
            scale: {
                spawnMin: 1,
                spawnMax: 1,
                destroy: 0.8
            },
            hitbox: new CircleHitbox(2.5),
            // TODO Figure out why this doesn't work
            /*hitbox: new ComplexHitbox([
                RectangleHitbox.fromRect(v(-3.18, 1.25), v(3.2, 4.05)),
                new CircleHitbox(2.5)
            ]),*/
            rotationMode: RotationMode.Limited,
            hasLoot: true
        },
        {
            idString: "used_toilet",
            name: "Used Toilet",
            material: "porcelain",
            health: 100,
            scale: {
                spawnMin: 1,
                spawnMax: 1,
                destroy: 0.8
            },
            hitbox: new CircleHitbox(2.5),
            // TODO Figure out why this doesn't work
            /*hitbox: new ComplexHitbox([
                RectangleHitbox.fromRect(v(-3.18, 1.25), v(3.2, 4.05)),
                new CircleHitbox(2.5)
            ]),*/
            rotationMode: RotationMode.Limited,
            hasLoot: true,
            frames: {
                particle: "toilet_particle",
                residue: "toilet_residue"
            }
        },
        {
            idString: "small_drawer",
            name: "Small Drawer",
            material: "wood",
            health: 80,
            scale: {
                spawnMin: 1,
                spawnMax: 1,
                destroy: 0.8
            },
            hitbox: RectangleHitbox.fromRect(6.2, 6, v(0, -0.5)),
            rotationMode: RotationMode.Limited,
            hasLoot: true,
            frames: {
                particle: "furniture_particle"
            }
        },
        {
            idString: "large_drawer",
            name: "Large Drawer",
            material: "wood",
            health: 80,
            scale: {
                spawnMin: 1,
                spawnMax: 1,
                destroy: 0.8
            },
            hideOnMap: true,
            hitbox: RectangleHitbox.fromRect(12.5, 6, v(0, -0.5)),
            rotationMode: RotationMode.Limited,
            hasLoot: true,
            frames: {
                particle: "furniture_particle"
            }
        },
        {
            idString: "couch",
            name: "Couch",
            material: "wood",
            health: 100,
            scale: {
                spawnMin: 1,
                spawnMax: 1,
                destroy: 0.9
            },
            hideOnMap: true,
            hitbox: RectangleHitbox.fromRect(7, 15.8, v(-0.2, 0)),
            rotationMode: RotationMode.Limited,
            frames: {
                particle: "furniture_particle"
            }
        },
        {
            idString: "tv",
            name: "TV",
            material: "glass",
            health: 100,
            scale: {
                spawnMin: 1,
                spawnMax: 1,
                destroy: 0.9
            },
            hideOnMap: true,
            hitbox: RectangleHitbox.fromRect(1.1, 15.1, v(-0.25, 0)),
            rotationMode: RotationMode.Limited,
            zIndex: zIndexes.ObstaclesLayer2,
            frames: {
                particle: "metal_particle"
            }
        },
        {
            idString: "table",
            name: "Table",
            material: "wood",
            health: 100,
            scale: {
                spawnMin: 1,
                spawnMax: 1,
                destroy: 0.9
            },
            hideOnMap: true,
            hitbox: RectangleHitbox.fromRect(8.3, 12.2),
            rotationMode: RotationMode.Limited,
            frames: {
                particle: "furniture_particle"
            },
            variations: 2,
            zIndex: zIndexes.ObstaclesLayer3,
            noCollisions: true
        },
        {
            idString: "chair",
            name: "Chair",
            material: "wood",
            health: 100,
            scale: {
                spawnMin: 1,
                spawnMax: 1,
                destroy: 0.9
            },
            hideOnMap: true,
            hitbox: RectangleHitbox.fromRect(6.8, 6.7, v(0, 0)),
            rotationMode: RotationMode.Limited,
            frames: {
                particle: "furniture_particle"
            }
        },
        {
            idString: "bookshelf",
            name: "Bookshelf",
            material: "wood",
            health: 80,
            scale: {
                spawnMin: 1,
                spawnMax: 1,
                destroy: 0.8
            },
            hideOnMap: true,
            variations: 2,
            hitbox: RectangleHitbox.fromRect(12.49, 4.24),
            rotationMode: RotationMode.Limited,
            hasLoot: true,
            frames: {
                particle: "furniture_particle"
            }
        },
        {
            idString: "window",
            name: "Window",
            material: "glass",
            health: 20,
            scale: {
                spawnMin: 1,
                spawnMax: 1,
                destroy: 0.95
            },
            hideOnMap: true,
            hitbox: RectangleHitbox.fromRect(1.8, 9.4),
            zIndex: zIndexes.ObstaclesLayer2,
            rotationMode: RotationMode.Limited,
            role: ObstacleSpecialRoles.Window
        },
        {
            idString: "bed",
            name: "Bed",
            material: "wood",
            health: 100,
            scale: {
                spawnMin: 1,
                spawnMax: 1,
                destroy: 0.9
            },
            hideOnMap: true,
            hitbox: RectangleHitbox.fromRect(11.2, 16),
            rotationMode: RotationMode.Limited,
            frames: {
                particle: "furniture_particle"
            }
        },
        {
            idString: "garage_door",
            name: "Garage Door",
            material: "wood",
            health: 200,
            scale: {
                spawnMin: 1,
                spawnMax: 1,
                destroy: 0.95
            },
            hideOnMap: true,
            hitbox: RectangleHitbox.fromRect(21.7, 1.5, v(0, -0.4)),
            rotationMode: RotationMode.Limited,
            frames: {
                particle: "furniture_particle"
            }
        },
        {
            idString: "porta_potty_toilet_open",
            name: "Porta Potty Toilet Open",
            material: "porcelain",
            health: 100,
            scale: {
                spawnMin: 1,
                spawnMax: 1,
                destroy: 0.9
            },
            hideOnMap: true,
            hitbox: RectangleHitbox.fromRect(12.13, 4.3, v(0.02, -1.05)),
            rotationMode: RotationMode.Limited,
            hasLoot: true,
            frames: {
                particle: "porta_potty_toilet_particle",
                residue: "porta_potty_toilet_residue"
            }
        },
        {
            idString: "porta_potty_toilet_closed",
            name: "Porta Potty Toilet Closed",
            material: "porcelain",
            health: 100,
            scale: {
                spawnMin: 1,
                spawnMax: 1,
                destroy: 0.9
            },
            hideOnMap: true,
            hitbox: RectangleHitbox.fromRect(12, 4.3, v(0, -1.05)),
            rotationMode: RotationMode.Limited,
            hasLoot: true,
            frames: {
                particle: "porta_potty_toilet_particle",
                residue: "porta_potty_toilet_residue"
            }
        },
        {
            idString: "porta_potty_back_wall",
            name: "Porta Potty Back Wall",
            material: "wood",
            health: 100,
            noResidue: true,
            scale: {
                spawnMin: 1,
                spawnMax: 1,
                destroy: 0.9
            },
            hideOnMap: true,
            hitbox: RectangleHitbox.fromRect(12.8, 1.6, v(0, 0)),
            rotationMode: RotationMode.Limited,
            role: ObstacleSpecialRoles.Wall,
            frames: {
                particle: "porta_potty_wall_particle"
            }
        },
        {
            idString: "porta_potty_door",
            name: "Porta Potty Door",
            material: "wood",
            health: 100,
            noResidue: true,
            scale: {
                spawnMin: 1,
                spawnMax: 1,
                destroy: 1
            },
            hideOnMap: true,
            hitbox: RectangleHitbox.fromRect(9.2, 1.4, v(-0.8, 0)),
            rotationMode: RotationMode.Limited,
            role: ObstacleSpecialRoles.Door,
            hingeOffset: v(-5.5, 0)
        },
        {
            idString: "porta_potty_front_wall",
            name: "Porta Potty Front Wall",
            material: "wood",
            health: 100,
            noResidue: true,
            scale: {
                spawnMin: 1,
                spawnMax: 1,
                destroy: 0.9
            },
            hideOnMap: true,
            hitbox: RectangleHitbox.fromRect(3, 1.6),
            rotationMode: RotationMode.Limited,
            role: ObstacleSpecialRoles.Wall,
            frames: {
                particle: "porta_potty_wall_particle"
            }
        },
        {
            idString: "porta_potty_sink_wall",
            name: "Porta Potty Sink Wall",
            material: "wood",
            health: 100,
            noResidue: true,
            scale: {
                spawnMin: 1,
                spawnMax: 1,
                destroy: 0.9
            },
            hideOnMap: true,
            hitbox: RectangleHitbox.fromRect(19.2, 1.9, v(0, 1.25)),
            rotationMode: RotationMode.Limited,
            role: ObstacleSpecialRoles.Wall,
            zIndex: zIndexes.ObstaclesLayer2,
            frames: {
                particle: "porta_potty_wall_particle"
            }
        },
        {
            idString: "porta_potty_toilet_paper_wall",
            name: "Porta Potty Toilet Paper Wall",
            material: "wood",
            health: 100,
            noResidue: true,
            scale: {
                spawnMin: 1,
                spawnMax: 1,
                destroy: 0.9
            },
            hideOnMap: true,
            hitbox: RectangleHitbox.fromRect(19.2, 1.7, v(0, -1.15)),
            rotationMode: RotationMode.Limited,
            role: ObstacleSpecialRoles.Wall,
            zIndex: zIndexes.ObstaclesLayer2,
            frames: {
                particle: "porta_potty_wall_particle"
            }
        },
        makeConcreteWall(
            "concrete_wall_end",
            "Concrete Wall End",
            RectangleHitbox.fromRect(2.4, 2),
            true
        ),
        makeConcreteWall(
            "concrete_wall_end_broken",
            "Concrete Wall End Broken",
            RectangleHitbox.fromRect(2.4, 2),
            true,
            2
        ),
        makeConcreteWall(
            "concrete_wall_segment",
            "Concrete Wall Segment",
            RectangleHitbox.fromRect(16, 2),
            true
        ),
        makeConcreteWall(
            "concrete_wall_segment_long",
            "Concrete Wall Segment Long",
            RectangleHitbox.fromRect(32, 2),
            true
        ),
        makeConcreteWall(
            "concrete_wall_corner",
            "Concrete Wall Corner",
            RectangleHitbox.fromRect(2, 2),
            true
        ),
        makeConcreteWall(
            "inner_concrete_wall_1",
            "Inner Concrete Wall 1",
            RectangleHitbox.fromRect(10.8, 1.9)
        ),
        makeConcreteWall(
            "inner_concrete_wall_2",
            "Inner Concrete Wall 2",
            RectangleHitbox.fromRect(36.7, 1.9)
        ),
        makeConcreteWall(
            "inner_concrete_wall_3",
            "Inner Concrete Wall 3",
            RectangleHitbox.fromRect(39.14, 1.9)
        ),
        makeConcreteWall(
            "inner_concrete_wall_4",
            "Inner Concrete Wall 4",
            RectangleHitbox.fromRect(47.14, 1.9)
        ),
        {
            idString: "refinery_walls",
            name: "Refinery Walls",
            material: "stone",
            health: 1000,
            indestructible: true,
            hideOnMap: true,
            invisible: true,
            scale: {
                spawnMin: 1,
                spawnMax: 1,
                destroy: 0.9
            },
            hitbox: new ComplexHitbox(
                RectangleHitbox.fromRect(57, 1.8, v(-22, -36.1)), // First topmost wall
                RectangleHitbox.fromRect(30.75, 1.8, v(35.38, -36.1)), // Wall after the hole
                RectangleHitbox.fromRect(2, 33.5, v(49.75, -22.25)), // Wall from top right to bottom right
                RectangleHitbox.fromRect(16.25, 2.05, v(42.63, -6.53)), // Wall to the right of the entrance
                RectangleHitbox.fromRect(38.5, 2.05, v(2.25, -6.53)), // Wall to the left of the entrance
                RectangleHitbox.fromRect(2, 21.55, v(-16, 3.23)), // Wall on top of the window
                RectangleHitbox.fromRect(2, 13.5, v(-16, 30.25)), // Wall bellow the window
                RectangleHitbox.fromRect(35.5, 2, v(-32.75, 36.25)), // Bottommost wall
                RectangleHitbox.fromRect(2, 74, v(-49.5, 0)), // Wall from topmost to bottommost
                RectangleHitbox.fromRect(13.3, 2, v(-43.35, 9)), // inner door walls
                RectangleHitbox.fromRect(10.5, 2, v(-21.25, 9))
            ),
            rotationMode: RotationMode.Limited,
            particleVariations: 2,
            noResidue: true,
            frames: {
                particle: "rock_particle"
            }
        },
        {
            idString: "small_refinery_barrel",
            name: "Small Refinery Barrel",
            material: "metal",
            health: 250,
            scale: {
                spawnMin: 1,
                spawnMax: 1,
                destroy: 0.5
            },
            hitbox: new CircleHitbox(6.8),
            rotationMode: RotationMode.Full,
            explosion: "small_refinery_barrel_explosion",
            reflectBullets: true,
            frames: {
                particle: "barrel_particle",
                residue: "barrel_residue"
            }
        },
        {
            idString: "large_refinery_barrel",
            name: "Large Refinery Barrel",
            material: "large_refinery_barrel",
            health: 3500,
            scale: {
                spawnMin: 1,
                spawnMax: 1,
                destroy: 0.95
            },
            hitbox: new CircleHitbox(17.15),
            rotationMode: RotationMode.Full,
            explosion: "large_refinery_barrel_explosion",
            reflectBullets: true,
            zIndex: zIndexes.ObstaclesLayer5,
            frames: {
                particle: "barrel_particle"
            }
        },
        {
            idString: "smokestack",
            name: "Smokestack",
            material: "metal",
            health: 500,
            indestructible: true,
            scale: {
                spawnMin: 1,
                spawnMax: 1,
                destroy: 0.5
            },
            hitbox: new CircleHitbox(8.9),
            rotationMode: RotationMode.Limited,
            reflectBullets: true,
            zIndex: zIndexes.ObstaclesLayer5,
            noResidue: true,
            frames: {
                particle: "barrel_particle"
            }
        },
        {
            idString: "distillation_column",
            name: "Distillation Column",
            material: "metal",
            health: 500,
            indestructible: true,
            scale: {
                spawnMin: 1,
                spawnMax: 1,
                destroy: 0.5
            },
            hitbox: new ComplexHitbox(
                new CircleHitbox(5.22, v(0, -0.65)),
                new CircleHitbox(4.9, v(0, 0.9))
            ),
            rotationMode: RotationMode.Limited,
            reflectBullets: true,
            zIndex: zIndexes.ObstaclesLayer5,
            noResidue: true,
            frames: {
                particle: "barrel_particle"
            }
        },
        {
            idString: "distillation_equipment",
            name: "Distillation Equipment",
            material: "metal",
            health: 500,
            indestructible: true,
            scale: {
                spawnMin: 1,
                spawnMax: 1,
                destroy: 0.5
            },
            hitbox: new ComplexHitbox(
                new CircleHitbox(3, v(-11.3, -3.85)), // Main tank rounded corners
                new CircleHitbox(3, v(-11.3, -6.55)),
                RectangleHitbox.fromRect(17.5, 3.5, v(-5.55, -5.25)),
                RectangleHitbox.fromRect(14.2, 8.5, v(-3.9, -5.15)), // Main tank
                new CircleHitbox(3.15, v(0.72, 5.62)), // Bottom left circle
                new CircleHitbox(4.4, v(8.95, 5.62)), // Bottom right circle
                new CircleHitbox(5.35, v(8.95, -4.7)), // Top circle
                RectangleHitbox.fromRect(1.8, 3.7, v(0.65, 0.85)), // Pipe connected to bottom left circle
                RectangleHitbox.fromRect(2.6, 1.2, v(8.95, 1)), // Pipe between 2 rightmost circles
                RectangleHitbox.fromRect(1.6, 1.75, v(4.2, 5.53)), // Pipe between 2 bottommost circles
                RectangleHitbox.fromRect(1.9, -2.6, v(4.05, -6.65)) // Pipe connected to topmost circle
            ),
            rotationMode: RotationMode.Limited,
            reflectBullets: true,
            noResidue: true,
            frames: {
                particle: "barrel_particle"
            }
        },
        {
            idString: "gun_mount",
            name: "Gun Mount",
            material: "wood",
            health: 60,
            scale: {
                spawnMin: 1,
                spawnMax: 1,
                destroy: 0.95
            },
            hasLoot: true,
            hitbox: new ComplexHitbox(
                RectangleHitbox.fromRect(8.2, 0.95, v(0, -1.32)), // Base
                RectangleHitbox.fromRect(0.75, 2.75, v(0, 0.48)), // Center post
                RectangleHitbox.fromRect(0.75, 2.75, v(-3.11, 0.48)), // Left post
                RectangleHitbox.fromRect(0.75, 2.75, v(3.17, 0.48)) // Right post
            ),
            rotationMode: RotationMode.Limited,
            frames: {
                particle: "furniture_particle"
            }
        },
        {
            idString: "pvz_back_fence",
            name: "PvZ back fence",
            material: "wood",
            health: 20,
            scale: {
                spawnMin: 1,
                spawnMax: 1,
                destroy: 1
            },
            noResidue: true,
            hitbox: RectangleHitbox.fromRect(3.75, 2.4),
            rotationMode: RotationMode.Limited,
            frames: {
                particle: "pvz_fence_particle"
            }
        },
        {
            idString: "pvz_front_fence_post",
            name: "PvZ front fence post",
            material: "wood",
            health: 20,
            scale: {
                spawnMin: 1,
                spawnMax: 1,
                destroy: 1
            },
            noResidue: true,
            hitbox: RectangleHitbox.fromRect(3.15, 2.4),
            rotationMode: RotationMode.Limited,
            zIndex: zIndexes.ObstaclesLayer2,
            frames: {
                particle: "pvz_fence_particle"
            }
        },
        {
            idString: "pvz_front_fence_connector",
            name: "PvZ front fence connector",
            material: "wood",
            health: 15,
            scale: {
                spawnMin: 1,
                spawnMax: 1,
                destroy: 1
            },
            noResidue: true,
            hitbox: RectangleHitbox.fromRect(4.083, 1.402),
            rotationMode: RotationMode.Limited,
            frames: {
                particle: "pvz_fence_particle"
            }
        },
        {
            idString: "potted_plant",
            name: "Potted Plant",
            material: "tree",
            health: 90,
            scale: {
                spawnMin: 1,
                spawnMax: 1,
                destroy: 0.9
            },
            hitbox: new CircleHitbox(2.55),
            spawnHitbox: RectangleHitbox.fromRect(7.23, 6.94),
            rotationMode: RotationMode.Full
        },
        {
            idString: "pvz_backyard_table",
            name: "PvZ backyard table",
            material: "porcelain",
            health: 100,
            scale: {
                spawnMin: 1,
                spawnMax: 1,
                destroy: 1
            },
            hitbox: new CircleHitbox(5.65, v(0, 0.5)),
            spawnHitbox: RectangleHitbox.fromRect(11.25, 12.47),
            rotationMode: RotationMode.None,
            zIndex: zIndexes.ObstaclesLayer3,
            frames: {
                particle: "pvz_plastic_particle"
            }
        },
        {
            idString: "pvz_backyard_chair",
            name: "PvZ backyard chair",
            material: "porcelain",
            health: 90,
            scale: {
                spawnMin: 1,
                spawnMax: 1,
                destroy: 0.8
            },
            hitbox: RectangleHitbox.fromRect(4.25, 4.13),
            rotationMode: RotationMode.Limited,
            frames: {
                particle: "pvz_plastic_particle"
            }
        },
        {
            idString: "bbq",
            name: "BBQ",
            material: "metal",
            health: 150,
            explosion: "barrel_explosion",
            scale: {
                spawnMin: 1,
                spawnMax: 1,
                destroy: 0.8
            },
            hitbox: new CircleHitbox(3.64),
            spawnHitbox: RectangleHitbox.fromRect(7.5, 7.25),
            rotationMode: RotationMode.Limited
        },
        {
            idString: "small_couch",
            name: "Small Couch",
            material: "wood",
            health: 100,
            scale: {
                spawnMin: 1,
                spawnMax: 1,
                destroy: 0.9
            },
            hideOnMap: true,
            hitbox: RectangleHitbox.fromRect(7.5, 9.2),
            rotationMode: RotationMode.Limited,
            frames: {
                particle: "furniture_particle"
            }
        },
        {
            idString: "sliding_glass_door",
            name: "Sliding Glass Door",
            material: "glass",
            health: 120,
            scale: {
                spawnMin: 1,
                spawnMax: 1,
                destroy: 1
            },
            hitbox: RectangleHitbox.fromRect(9.38, 2.5, v(0, 0)),
            rotationMode: RotationMode.Limited,
            noResidue: true,
            role: ObstacleSpecialRoles.Door,
            operationStyle: "slide",
            slideFactor: 0.785,
            zIndex: zIndexes.ObstaclesLayer2,
            frames: {
                particle: "window_particle"
            }
        },
        {
            idString: "small_bed",
            name: "Small Bed",
            material: "wood",
            health: 100,
            scale: {
                spawnMin: 1,
                spawnMax: 1,
                destroy: 0.9
            },
            hideOnMap: true,
            hitbox: RectangleHitbox.fromRect(7.75, 16),
            rotationMode: RotationMode.Limited,
            frames: {
                particle: "furniture_particle"
            }
        },
        {
            idString: "shower_wall",
            name: "Shower Wall",
            material: "glass",
            health: 75,
            scale: {
                spawnMin: 1,
                spawnMax: 1,
                destroy: 1
            },
            hitbox: new ComplexHitbox(
                RectangleHitbox.fromRect(1.2, 9.9, v(1.25, 0)),
                RectangleHitbox.fromRect(2.5, 1.2, v(-0.55, 4.38))
            ),
            noResidue: true,
            rotationMode: RotationMode.Limited,
            frames: {
                particle: "window_particle"
            }
        },
        {
            idString: "shower_door",
            name: "Shower Door",
            material: "glass",
            health: 75,
            scale: {
                spawnMin: 1,
                spawnMax: 1,
                destroy: 1
            },
            hitbox: RectangleHitbox.fromRect(6.25, 1.2, v(-2.4, 0)),
            rotationMode: RotationMode.Limited,
            noResidue: true,
            role: ObstacleSpecialRoles.Door,
            hingeOffset: v(-5.5, 0),
            frames: {
                particle: "window_particle"
            }
        },
        {
            idString: "pvz_wall_short",
            name: "PvZ short wall",
            material: "wood",
            health: 110,
            scale: {
                spawnMin: 1,
                spawnMax: 1,
                destroy: 1
            },
            hitbox: RectangleHitbox.fromRect(1.875, 16.15, v(0, 0)),
            rotationMode: RotationMode.Limited,
            noResidue: true,
            role: ObstacleSpecialRoles.Wall,
            frames: {
                particle: "wall_particle"
            }
        },
        {
            idString: "pvz_wall_long",
            name: "PvZ long wall",
            material: "wood",
            health: 110,
            scale: {
                spawnMin: 1,
                spawnMax: 1,
                destroy: 1
            },
            hitbox: RectangleHitbox.fromRect(1.875, 22.875, v(0, 0)),
            rotationMode: RotationMode.Limited,
            noResidue: true,
            role: ObstacleSpecialRoles.Wall,
            frames: {
                particle: "wall_particle"
            }
        },
        {
            idString: "pvz_secret_wall",
            name: "PvZ secret wall",
            material: "wood",
            health: 120,
            scale: {
                spawnMin: 1,
                spawnMax: 1,
                destroy: 1
            },
            hitbox: RectangleHitbox.fromRect(1.875, 10.5, v(0, 0)),
            rotationMode: RotationMode.Limited,
            noResidue: true,
            zIndex: zIndexes.ObstaclesLayer3,
            role: ObstacleSpecialRoles.Wall,
            frames: {
                particle: "wall_particle"
            }
        },
        {
            idString: "shower_head",
            name: "Shower Head",
            material: "metal",
            health: 150,
            indestructible: true,
            scale: {
                spawnMin: 1,
                spawnMax: 1,
                destroy: 1
            },
            hitbox: RectangleHitbox.fromRect(2.35, 3.92),
            rotationMode: RotationMode.Limited,
            zIndex: zIndexes.ObstaclesLayer3,
            noCollisions: true,
            noResidue: true,
            hideOnMap: true
        },
        {
            idString: "sink",
            name: "Sink",
            material: "porcelain",
            health: 120,
            scale: {
                spawnMin: 1,
                spawnMax: 1,
                destroy: 0.8
            },
            hitbox: RectangleHitbox.fromRect(6.1, 8.2),
            rotationMode: RotationMode.Limited,
            hasLoot: true,
            frames: {
                particle: "toilet_particle"
            }
        },
        {
            idString: "small_house_exterior",
            name: "Small House Exterior",
            material: "stone",
            health: 1000,
            indestructible: true,
            hideOnMap: true,
            invisible: true,
            scale: {
                spawnMin: 1.0,
                spawnMax: 1.0,
                destroy: 0.9
            },
            hitbox: new ComplexHitbox(
                // Right walls
                RectangleHitbox.fromRect(2, 9, v(-31, 26)),
                RectangleHitbox.fromRect(2, 22, v(-31, 0.2)),
                RectangleHitbox.fromRect(2, 9.8, v(-31, -25)),

                // Top walls
                RectangleHitbox.fromRect(19.8, 2, v(22, 29.5)),
                RectangleHitbox.fromRect(8.2, 2, v(-26.00, 29.5)),
                RectangleHitbox.fromRect(14, 2, v(-4.6, 29.5)),

                // Left Wall
                RectangleHitbox.fromRect(2, 32, v(30.9, 13.5)),
                RectangleHitbox.fromRect(2, 16, v(30.9, -20.5)),

                RectangleHitbox.fromRect(12.3, 2, v(25.8, -28.9)), // Bottom Left Wall
                RectangleHitbox.fromRect(39.4, 2, v(-10.45, -28.9)) // Bottom Right Wall
            ),
            rotationMode: RotationMode.Limited,
            noResidue: true,
            frames: {
                particle: "wall_particle"
            }
        },
        {
            idString: "pvz_workbench",
            name: "PvZ Workbench",
            material: "metal",
            health: 300,
            indestructible: true,
            scale: {
                spawnMin: 1,
                spawnMax: 1,
                destroy: 1
            },
            hitbox: new ComplexHitbox(
                RectangleHitbox.fromRect(23.57, 7.5, v(-0.08, -10)),
                RectangleHitbox.fromRect(7.5, 27.58, v(7.95, 0.05))
            ),
            rotationMode: RotationMode.Limited,
            zIndex: zIndexes.ObstaclesLayer3,
            noCollisions: true
        },
        {
            idString: "pvz_house_exterior",
            name: "dumb",
            material: "wood",
            health: 1000,
            indestructible: true,
            scale: {
                spawnMin: 1,
                spawnMax: 1,
                destroy: 1
            },
            hitbox: new ComplexHitbox(
                RectangleHitbox.fromRect(29.52, 1.98, v(-18.74, -21.65)), // top left top
                RectangleHitbox.fromRect(29.67, 1.98, v(18.66, -21.65)), // top right top
                RectangleHitbox.fromRect(1.98, 7.75, v(-34.46, -18.75)), // top left left
                RectangleHitbox.fromRect(1.98, 12.22, v(-34.46, 1.28)), // above glass door
                RectangleHitbox.fromRect(1.98, 28.98, v(34.46, -8.17)), // top right right
                RectangleHitbox.fromRect(1.98, 1.3, v(34.46, 17)), // above main door
                RectangleHitbox.fromRect(1.98, 26.01, v(-34.46, 39.2)), // bottom left left
                RectangleHitbox.fromRect(1.98, 24.38, v(34.46, 40)), // bottom right right
                RectangleHitbox.fromRect(26.73, 1.98, v(-20.07, 51.2)), // bottom left bottom
                RectangleHitbox.fromRect(30.29, 1.98, v(18.33, 51.2)), // bottom right bottom
                RectangleHitbox.fromRect(18.49, 1.98, v(-24.25, 36.55)) // fireplace wall
            ),
            rotationMode: RotationMode.Limited,
            zIndex: zIndexes.ObstaclesLayer3,
            frames: {
                particle: "wall_particle"
            }
        },
        {
            idString: "pvz_house_workshop",
            name: "dumber",
            material: "metal",
            health: 1000,
            indestructible: true,
            scale: {
                spawnMin: 1,
                spawnMax: 1,
                destroy: 1
            },
            hitbox: new ComplexHitbox(
                RectangleHitbox.fromRect(1.98, 30.98, v(-32.06, -37.37)),
                RectangleHitbox.fromRect(66.1, 1.98, v(0, -51.87)),
                RectangleHitbox.fromRect(1.98, 30.98, v(32.06, -37.37))
            ),
            rotationMode: RotationMode.Limited,
            zIndex: zIndexes.ObstaclesLayer3,
            reflectBullets: true,
            frames: {
                particle: "metal_particle"
            }
        }
    ]
);
