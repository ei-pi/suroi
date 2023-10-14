import { type Orientation, type Variation } from "../typings";
import { CircleHitbox, ComplexHitbox, PolygonHitbox, RectangleHitbox, type Hitbox } from "../utils/hitbox";
import { type FloorTypes } from "../utils/mapUtils";
import { ObjectDefinitions, type ObjectDefinition } from "../utils/objectDefinitions";
import { pickRandomInArray, randomBoolean, weightedRandom } from "../utils/random";
import { v, type Vector } from "../utils/vector";

interface BuildingObstacle {
    readonly id: string
    readonly position: Vector
    readonly rotation?: number
    readonly variation?: Variation
    readonly scale?: number
    readonly lootSpawnOffset?: Vector
}

interface LootSpawner {
    readonly position: Vector
    readonly table: string
}

interface SubBuilding {
    readonly id: string
    readonly position: Vector
    readonly orientation?: Orientation
}

export interface BuildingDefinition extends ObjectDefinition {
    readonly spawnHitbox: Hitbox
    readonly ceilingHitbox?: Hitbox
    readonly scopeHitbox: Hitbox
    readonly hideOnMap?: boolean

    readonly obstacles: BuildingObstacle[]
    readonly lootSpawners?: LootSpawner[]
    readonly subBuildings?: SubBuilding[]

    readonly floorImages: Array<{
        readonly key: string
        readonly position: Vector
        readonly tint?: string
    }>

    readonly ceilingImages: Array<{
        readonly key: string
        readonly position: Vector
        readonly residue?: string
        readonly tint?: string
    }>

    // How many walls need to be broken to destroy the ceiling
    readonly wallsToDestroy?: number

    readonly floors: Array<{
        readonly type: keyof typeof FloorTypes
        readonly hitbox: Hitbox
    }>

    readonly groundGraphics?: Array<{
        readonly color: number
        readonly hitbox: Hitbox
    }>
}

export const Buildings = new ObjectDefinitions<BuildingDefinition>([
    {
        idString: "porta_potty",
        name: "Porta Potty",
        spawnHitbox: RectangleHitbox.fromRect(20, 32),
        ceilingHitbox: RectangleHitbox.fromRect(14, 18),
        scopeHitbox: RectangleHitbox.fromRect(14, 18),
        floorImages: [{
            key: "porta_potty_floor",
            position: v(0, 1.5)
        }],
        ceilingImages: [{
            key: "porta_potty_ceiling",
            position: v(0, 0),
            residue: "porta_potty_residue"
        }],
        wallsToDestroy: 2,
        floors: [
            {
                type: "wood",
                hitbox: RectangleHitbox.fromRect(14, 18)
            }
        ],
        obstacles: [
            {
                get id() {
                    return weightedRandom(["porta_potty_toilet_open", "porta_potty_toilet_closed"], [0.7, 0.3]);
                },
                position: v(0, -5),
                rotation: 0
            },
            {
                id: "porta_potty_back_wall",
                position: v(0, -8.7),
                rotation: 0
            },
            {
                id: "porta_potty_sink_wall",
                position: v(-5.65, 0),
                rotation: 3
            },
            {
                id: "porta_potty_toilet_paper_wall",
                position: v(5.7, 0),
                rotation: 3
            },
            {
                id: "porta_potty_door",
                position: v(2.2, 8.8),
                rotation: 0
            },
            {
                id: "porta_potty_front_wall",
                position: v(-4.6, 8.7),
                rotation: 2
            }
        ]
    },
    {
        idString: "house",
        name: "House",
        spawnHitbox: new ComplexHitbox(
            RectangleHitbox.fromRect(41, 51, v(31.50, -14.50)), // Garage
            RectangleHitbox.fromRect(68, 68, v(-18, -6)), // Main House
            RectangleHitbox.fromRect(28, 17, v(-31, 31.50)) // Doorstep
        ),
        ceilingHitbox: new ComplexHitbox(
            RectangleHitbox.fromRect(34.50, 42, v(29.25, -15.50)), // Garage
            RectangleHitbox.fromRect(60.50, 56, v(-17.25, -8.50)), // Main House
            RectangleHitbox.fromRect(21, 16, v(-31.50, 27)), // Doorstep
            new CircleHitbox(5, v(-1.5, -37)), // Living room window
            new CircleHitbox(5, v(-28.5, -37)), // Bedroom window
            new CircleHitbox(5, v(-47.5, -8.5)) // Dining Room Window
        ),
        scopeHitbox: new ComplexHitbox(
            RectangleHitbox.fromRect(34.50, 42, v(29.25, -15.50)), // Garage
            RectangleHitbox.fromRect(60.50, 56, v(-17.25, -8.50)), // Main House
            RectangleHitbox.fromRect(15, 11, v(-31.50, 24.50)) // Doorstep
        ),
        floorImages: [{
            key: "house_floor",
            position: v(0, 0)
        }],
        ceilingImages: [{
            key: "house_ceiling",
            position: v(0, -1.5)
        }],
        floors: [
            {
                type: "stone",
                hitbox: RectangleHitbox.fromRect(33, 41.50, v(29.50, -15.25)) // Garage
            },
            {
                type: "wood",
                hitbox: new ComplexHitbox(
                    RectangleHitbox.fromRect(60, 56, v(-18, -9)), // Main House
                    RectangleHitbox.fromRect(18.80, 14, v(-31.40, 27)) // Doorstep
                )
            }
        ],
        obstacles: [
            // Bathroom Left
            {
                id: "house_wall_4",
                position: v(-3.6, 8.5),
                rotation: 1
            },
            // Bathroom Top
            {
                id: "house_wall_1",
                position: v(-2.6, -2.8),
                rotation: 0
            },
            // Entrance Right
            {
                id: "house_wall_4",
                position: v(-25.2, 8.5),
                rotation: 1
            },
            // Kitchen Top
            {
                id: "house_wall_1",
                position: v(-21.65, -2.8),
                rotation: 0
            },
            // Living Room Bottom Right
            {
                id: "house_wall_3",
                position: v(6.35, -14.5),
                rotation: 0
            },
            // Living Room Left
            {
                id: "house_wall_2",
                position: v(-18.25, -25.6),
                rotation: 1
            },
            // Bedroom Bottom Left
            {
                id: "house_wall_3",
                position: v(-41, -14.5),
                rotation: 0
            },
            // Bedroom Bottom Right/Living Room Bottom Left
            {
                id: "house_wall_5",
                position: v(-17.28, -14.5),
                rotation: 0
            },
            {
                get id() {
                    return weightedRandom(["toilet", "used_toilet"], [0.7, 0.3]);
                },
                position: v(7, 14.4),
                rotation: 2
            },
            {
                id: "stove",
                position: v(-9.3, 15.3),
                rotation: 2
            },
            {
                id: "fridge",
                position: v(-19.5, 15.3),
                rotation: 2
            },
            // Living Room Couch
            {
                id: "couch",
                position: v(-13.3, -26),
                rotation: 0
            },
            // Living Room Large Drawers
            {
                id: "large_drawer",
                position: v(8.2, -26),
                rotation: 3
            },
            // Living Room TV
            {
                id: "tv",
                position: v(11.5, -26),
                rotation: 0
            },
            // House Exterior
            {
                id: "house_exterior",
                position: v(0, -2.6),
                rotation: 0
            },
            // Chair Bottom
            {
                id: "chair",
                position: v(-41, 13),
                rotation: 0
            },
            // Chair Top
            {
                id: "chair",
                position: v(-41, 3),
                rotation: 2
            },
            {
                id: "table",
                position: v(-41, 8),
                rotation: 0,
                variation: 0
            },
            {
                id: "bed",
                position: v(-40.6, -27.5),
                rotation: 0
            },
            // Bedroom Bookshelf
            {
                id: "bookshelf",
                position: v(-21.6, -29.25),
                rotation: 1
            },
            // Bedroom Drawer
            {
                id: "small_drawer",
                position: v(-23, -19.3),
                rotation: 3
            },
            // Toilet Bookshelf
            {
                id: "bookshelf",
                position: v(-0.2, 12.5),
                rotation: 1
            },
            // Garage Washing Machine
            {
                id: "washing_machine",
                position: v(18.7, -31.9),
                rotation: 0
            },
            // Garage Crate
            {
                id: "regular_crate",
                position: v(41.5, -30.9),
                rotation: 0
            },
            // Garage Barrel
            {
                id: "barrel",
                position: v(41.5, -20),
                rotation: 0
            },
            // Garage Bookshelf
            {
                id: "bookshelf",
                position: v(44.05, -1.55),
                rotation: 1
            },
            // Garage Door
            {
                id: "garage_door",
                position: v(30.18, 6.5),
                rotation: 0
            },
            // Front Door
            {
                id: "door",
                position: v(-30.85, 20),
                rotation: 0
            },
            // Bedroom Door
            {
                id: "door",
                position: v(-29.85, -14.5),
                rotation: 0
            },
            // Living Room Door
            {
                id: "door",
                position: v(-3.85, -14.5),
                rotation: 0
            },
            // Kitchen Door
            {
                id: "door",
                position: v(-12.6, -2.8),
                rotation: 2
            },
            // Door to Garage
            {
                id: "door",
                position: v(13, -8.1),
                rotation: 3
            },
            // Bathroom Door
            {
                id: "door",
                position: v(6.5, -2.8),
                rotation: 2
            },
            // Living Room Window
            {
                id: "window",
                position: v(-1.4, -36.75),
                rotation: 1
            },
            // Bedroom Window
            {
                id: "window",
                position: v(-28.65, -36.75),
                rotation: 1
            },
            // Dining Room Window
            {
                id: "window",
                position: v(-47.35, -8.35),
                rotation: 0
            }
        ]
    },
    {
        idString: "warehouse",
        name: "Warehouse",
        spawnHitbox: RectangleHitbox.fromRect(60, 88),
        ceilingHitbox: RectangleHitbox.fromRect(40, 80),
        scopeHitbox: RectangleHitbox.fromRect(40, 70),
        floorImages: [{
            key: "warehouse_floor",
            position: v(0, 0)
        }],
        ceilingImages: [{
            key: "warehouse_ceiling",
            position: v(0, -1.5)
        }],
        floors: [
            {
                type: "stone",
                hitbox: RectangleHitbox.fromRect(40, 88)
            }
        ],
        obstacles: [
            {
                id: "warehouse_wall_1",
                position: v(-20, 0),
                rotation: 1
            },
            {
                id: "warehouse_wall_1",
                position: v(20, 0),
                rotation: 1
            },
            {
                id: "warehouse_wall_2",
                position: v(14, -34.4),
                rotation: 0
            },
            {
                id: "warehouse_wall_2",
                position: v(-14, -34.4),
                rotation: 0
            },
            {
                id: "warehouse_wall_2",
                position: v(14, 34.4),
                rotation: 0
            },
            {
                id: "warehouse_wall_2",
                position: v(-14, 34.4),
                rotation: 0
            },
            {
                id: "regular_crate",
                position: v(14, -28.5)
            },
            {
                id: "regular_crate",
                position: v(-14, -28.5)
            },
            {
                // TODO: better way of adding random obstacles
                get id() {
                    return weightedRandom(["regular_crate", "flint_crate"], [0.7, 0.3]);
                },
                position: v(-14, 28.5)
            },
            {
                id: "barrel",
                position: v(14.6, 29.2)
            },
            {
                id: "metal_shelf",
                position: v(-16, 0),
                rotation: 1
            },
            {
                id: "box",
                position: v(-15.7, 0),
                lootSpawnOffset: v(5, 0)
            },
            {
                id: "box",
                position: v(-15.8, 6.4),
                lootSpawnOffset: v(5, 0)
            },
            {
                id: "box",
                position: v(-15.7, -8),
                lootSpawnOffset: v(5, 0)
            },
            {
                id: "metal_shelf",
                position: v(16, 0),
                rotation: 1
            },
            {
                id: "box",
                position: v(15.8, 0),
                lootSpawnOffset: v(-5, 0)
            },
            {
                id: "box",
                position: v(15.7, 6),
                lootSpawnOffset: v(-5, 0)
            },
            {
                id: "box",
                position: v(15.6, -7),
                lootSpawnOffset: v(-5, 0)
            }
        ],

        lootSpawners: [
            {
                position: v(0, 0),
                table: "warehouse"
            }
        ]
    },
    {
        idString: "refinery",
        name: "Refinery",
        spawnHitbox: RectangleHitbox.fromRect(184, 131, v(35, 21.50)),
        scopeHitbox: new ComplexHitbox(
            RectangleHitbox.fromRect(33.50, 72, v(-32.75, 0)),
            RectangleHitbox.fromRect(65.50, 29.50, v(16.75, -21.25))
        ),
        ceilingHitbox: new ComplexHitbox(
            RectangleHitbox.fromRect(33.50, 72, v(-32.75, 0)),
            RectangleHitbox.fromRect(65.50, 29.50, v(16.75, -21.25)),
            RectangleHitbox.fromRect(13, 7, v(28.50, -3.50)), // door
            new CircleHitbox(5, v(-16, 18.5)) // window
        ),
        floorImages: [
            {
                key: "refinery_floor",
                position: v(0, 0)
            }
        ],
        ceilingImages: [
            {
                key: "refinery_ceiling",
                position: v(0, 0)
            }
        ],
        groundGraphics: [
            { color: 0x595959, hitbox: RectangleHitbox.fromRect(176, 123, v(35, 21.50)) }, // base
            { color: 0xb2b200, hitbox: new CircleHitbox(21, v(45.5, 59.1)) }, // circles
            { color: 0x505050, hitbox: new CircleHitbox(19, v(45.5, 59.1)) },
            { color: 0xb2b200, hitbox: new CircleHitbox(21, v(97, 59.1)) },
            { color: 0x505050, hitbox: new CircleHitbox(19, v(97, 59.1)) },
            { color: 0xb2b200, hitbox: RectangleHitbox.fromRect(2, 81, v(-9, 42.50)) }, // roads
            { color: 0xb2b200, hitbox: RectangleHitbox.fromRect(2, 59, v(16, 53.50)) },
            { color: 0xb2b200, hitbox: RectangleHitbox.fromRect(133, 2, v(56.50, 3)) },
            { color: 0xb2b200, hitbox: RectangleHitbox.fromRect(108, 2, v(69, 25)) }
        ],
        floors: [
            {
                type: "wood",
                hitbox: RectangleHitbox.fromRect(33.50, 27, v(-32.75, 22.50))
            },
            {
                type: "stone",
                hitbox: RectangleHitbox.fromRect(176, 123, v(35, 21.50))
            }
        ],
        obstacles: [
            {
                id: "refinery_walls",
                position: v(0, 0),
                rotation: 0
            },
            //
            // Inner room obstacles
            //
            {
                id: "window",
                position: v(-16, 18.5),
                rotation: 0
            },
            {
                id: "door",
                position: v(-31.15, 9.2),
                rotation: 0
            },
            {
                id: "table",
                position: v(-22, 28),
                rotation: 0,
                variation: 0
            },
            {
                id: "chair",
                position: v(-26, 28),
                rotation: 3
            },
            {
                id: "gun_mount",
                position: v(-46.8, 28),
                rotation: 1
            },
            //
            // Building obstacles
            //
            {
                id: "small_refinery_barrel",
                position: v(41.3, -14.8)
            },
            {
                id: "distillation_column",
                position: v(42.7, -28),
                rotation: 0
            },
            {
                id: "distillation_column",
                position: v(-42.65, 1),
                rotation: 0
            },
            {
                id: "distillation_equipment",
                position: v(0, -18),
                rotation: 2
            },
            {
                id: "smokestack",
                position: v(-39, -25.59)
            },
            {
                get id(): string {
                    return randomBoolean() ? "barrel" : "super_barrel";
                },
                position: v(-26, -30)
            },
            {
                get id(): string {
                    return randomBoolean() ? "barrel" : "super_barrel";
                },
                position: v(-21.5, 4)
            },
            {
                id: "regular_crate",
                position: v(28.75, -30)
            },
            {
                id: "regular_crate",
                position: v(-43, -11)
            },
            //
            // Outside obstacles
            //
            // Bottom left
            {
                id: "oil_tank",
                position: v(-38, 73),
                rotation: 0
            },
            {
                id: "barrel",
                position: v(-20.5, 77.5),
                rotation: 0
            },
            {
                id: "barrel",
                position: v(-21.5, 67),
                rotation: 0
            },
            {
                id: "regular_crate",
                position: v(-46.5, 45.5)
            },
            {
                id: "regular_crate",
                position: v(-36, 48)
            },
            // Bottom right
            {
                id: "large_refinery_barrel",
                position: v(45.5, 59.1)
            },
            {
                id: "large_refinery_barrel",
                position: v(97, 59.2)
            },
            {
                id: "regular_crate",
                position: v(69, 62)
            },
            {
                id: "aegis_crate",
                position: v(64, 75)
            },
            {
                id: "aegis_crate",
                position: v(77, 73)
            },
            {
                id: "barrel",
                position: v(117.5, 77.5)
            },
            {
                id: "regular_crate",
                position: v(117, 40)
            },
            {
                id: "super_barrel",
                position: v(27.5, 39)
            },
            {
                id: "barrel",
                position: v(-10, 0)
            },
            // Top right
            {
                id: "oil_tank",
                position: v(113, -25),
                rotation: 1
            },
            {
                id: "barrel",
                position: v(117.5, -7)
            },
            {
                id: "regular_crate",
                position: v(95, -33)
            },
            {
                id: "aegis_crate",
                position: v(76.25, -33.5)
            },
            {
                id: "super_barrel",
                position: v(85.25, -33.5)
            },
            {
                get id(): string {
                    return randomBoolean() ? "barrel" : "super_barrel";
                },
                position: v(83, -25)
            },
            {
                id: "super_barrel",
                position: v(75, -23)
            },
            {
                id: "regular_crate",
                position: v(76.25, -12)
            },
            //
            // Inner walls
            //
            // Top right
            { id: "inner_concrete_wall_1", position: v(116.75, -1.5), rotation: 0 },
            { id: "inner_concrete_wall_1", position: v(106.05, -1.5), rotation: 0 },
            { id: "inner_concrete_wall_2", position: v(70.05, -20.75), rotation: 1 },
            { id: "inner_concrete_wall_1", position: v(74.5, -1.5), rotation: 0 },
            // Bottom right
            { id: "inner_concrete_wall_1", position: v(116.75, 34), rotation: 0 },
            { id: "inner_concrete_wall_1", position: v(106.05, 34), rotation: 0 },
            { id: "inner_concrete_wall_1", position: v(95.35, 34), rotation: 0 },
            { id: "inner_concrete_wall_1", position: v(47.84, 34), rotation: 0 },
            { id: "inner_concrete_wall_1", position: v(37.14, 34), rotation: 0 },
            { id: "inner_concrete_wall_1", position: v(26.44, 34), rotation: 0 },
            { id: "inner_concrete_wall_4", position: v(22, 58.5), rotation: 1 },
            // Bottom left
            { id: "inner_concrete_wall_3", position: v(-32.45, 39), rotation: 0 },
            { id: "inner_concrete_wall_1", position: v(-15, 76.65), rotation: 1 },
            { id: "inner_concrete_wall_1", position: v(-15, 65.95), rotation: 1 },
            //
            // Outer walls
            //
            // Bottom left walls
            { id: "concrete_wall_end", position: v(-15, 83), rotation: 0 },
            { id: "concrete_wall_segment_long", position: v(-32, 83), rotation: 0 },
            { id: "concrete_wall_segment", position: v(-44.3, 83), rotation: 0 },
            { id: "concrete_wall_corner", position: v(-53, 83), rotation: 0 },
            { id: "concrete_wall_segment", position: v(-53, 74.4), rotation: 1 },
            { id: "concrete_wall_end_broken", position: v(-53, 65.5), rotation: 1 },
            // Wall from bottom left to top left
            { id: "concrete_wall_end_broken", position: v(-53, 44), rotation: 3 },
            { id: "concrete_wall_segment_long", position: v(-53, 28), rotation: 3 },
            { id: "concrete_wall_segment_long", position: v(-53, 0), rotation: 3 },
            { id: "concrete_wall_segment_long", position: v(-53, -23.3), rotation: 3 },
            // Top left corner
            { id: "concrete_wall_corner", position: v(-53, -40), rotation: 3 },
            { id: "concrete_wall_segment_long", position: v(-36.3, -40), rotation: 0 },
            { id: "concrete_wall_segment_long", position: v(-10, -40), rotation: 0 },
            { id: "concrete_wall_end_broken", position: v(7, -40), rotation: 0 },
            { id: "concrete_wall_end_broken", position: v(20, -40), rotation: 2 },
            { id: "concrete_wall_segment_long", position: v(36, -40), rotation: 0 },
            { id: "concrete_wall_segment_long", position: v(65, -40), rotation: 0 },
            { id: "concrete_wall_end_broken", position: v(82, -40), rotation: 0 },
            { id: "concrete_wall_end_broken", position: v(106, -40), rotation: 2 },
            { id: "concrete_wall_segment", position: v(114.2, -40), rotation: 2 },
            // Top right corner
            { id: "concrete_wall_corner", position: v(123, -40), rotation: 2 },
            { id: "concrete_wall_segment_long", position: v(123, -23.2), rotation: 1 },
            { id: "concrete_wall_segment", position: v(123, -10), rotation: 1 },
            { id: "concrete_wall_end", position: v(123, -1.5), rotation: 3 },
            { id: "concrete_wall_end", position: v(123, 29.5), rotation: 1 },
            { id: "concrete_wall_segment_long", position: v(123, 46), rotation: 1 },
            { id: "concrete_wall_segment_long", position: v(123, 66.3), rotation: 1 },
            // Bottom right corner
            { id: "concrete_wall_corner", position: v(123, 83), rotation: 1 },
            { id: "concrete_wall_segment_long", position: v(106.3, 83), rotation: 0 },
            { id: "concrete_wall_segment_long", position: v(76, 83), rotation: 0 },
            { id: "concrete_wall_segment_long", position: v(47, 83), rotation: 0 },
            { id: "concrete_wall_segment", position: v(30, 83), rotation: 0 },
            { id: "concrete_wall_end", position: v(22, 83), rotation: 2 }
        ],
        subBuildings: [
            {
                id: "porta_potty",
                position: v(59.75, -27.6)
            }
        ]
    },
    {
        idString: "small_house",
        name: "Small House",
        spawnHitbox: RectangleHitbox.fromRect(80, 80),
        ceilingHitbox: new ComplexHitbox(
            RectangleHitbox.fromRect(62, 58, v(0, -0.3)),
            new CircleHitbox(5, v(-7.2, -29.5)),
            new CircleHitbox(5, v(-31, 7.5)),
            new CircleHitbox(5, v(31, 15.4)),
            new CircleHitbox(5, v(31, -15.9))
        ),
        scopeHitbox: RectangleHitbox.fromRect(62, 58, v(0, -0.3)),
        floorImages: [{
            key: "house_floor_small",
            position: v(0, 0)
        }],
        ceilingImages: [{
            key: "house_ceiling_small",
            position: v(0, 0)
        }],
        floors: [
            {
                type: "wood",
                hitbox: RectangleHitbox.fromRect(62, 58.50, v(0, -0.25))
            },
            {
                type: "stone",
                hitbox: RectangleHitbox.fromRect(-10.10, 4.70, v(16.55, -31.75))

            },
            {
                type: "stone",
                hitbox: RectangleHitbox.fromRect(10.10, -4.70, v(-14.45, 31.75))
            }
        ],
        obstacles: [
            // Bedroom Right
            {
                id: "house_wall_2",
                position: v(-19.5, -6.75),
                rotation: 2
            },
            // Bedroom Bottom Right
            {
                id: "house_wall_1",
                position: v(5.4, -6.75),
                rotation: 2
            }, // Bedroom Bottom Left
            {
                id: "house_wall_2",
                position: v(8.85, -18),
                rotation: 1
            }, // Bedroom Door
            {
                id: "door",
                position: v(-4.5, -6.75),
                rotation: 2
            }, //  Bathroom Left
            {
                id: "house_wall_4",
                position: v(-2.50, 17.2),
                rotation: 1
            }, //  Bathroom Right
            {
                id: "house_wall_4",
                position: v(9.55, 17.2),
                rotation: 1
            }, // Bathroom Door
            {
                id: "door",
                position: v(3.1, 7.2),
                rotation: 2
            }, // Bathroom Toilet
            {
                id: "toilet",
                position: v(3.6, 23.5),
                rotation: 2
            }, // Front Door
            {
                id: "door",
                position: v(-14.8, 29),
                rotation: 2
            },
            {
                id: "door",
                position: v(16.2, -29.5),
                rotation: 2
            }, // Living Room Cough
            {
                id: "couch",
                position: v(-21.6, -1.8),
                rotation: 3
            },
            // Living Room Drawer
            {
                id: "large_drawer",
                position: v(-26.2, 21.5),
                rotation: 1
            },
            // Living Room Bookshelf
            {
                id: "bookshelf",
                position: v(-6, 17.5),
                rotation: 3
            }, // Kitchen Stove
            {
                id: "stove",
                position: v(15.5, 24),
                rotation: 2
            }, // Kitchen Fridge
            {
                id: "fridge",
                position: v(25, 24),
                rotation: 2
            },
            // Near Kitchen Chair
            {
                id: "chair",
                position: v(25, 5),
                rotation: 0
            }, // Near Backdoor Chair
            {
                id: "chair",
                position: v(25, -5),
                rotation: 2
            },
            // Dining Room Table
            {
                id: "table",
                position: v(25, 0),
                rotation: 2,
                variation: 0
            },
            // Backdoor Drawer
            {
                id: "small_drawer",
                position: v(26, -25),
                rotation: 3
            },
            // Bedroom Bed
            {
                id: "bed",
                position: v(-21.5, -22.5),
                rotation: 1
            }, // Bedroom Drawer
            {
                id: "small_drawer",
                position: v(-26, -11.5),
                rotation: 1
            }, // Bedroom Bookshelf
            {
                id: "bookshelf",
                position: v(5.5, -22),
                rotation: 1
            }, // Bedroom Window
            {
                id: "window",
                position: v(-7.2, -29.5),
                rotation: 1
            }, // Living Room Window
            {
                id: "window",
                position: v(-31, 7.5),
                rotation: 2
            }, // Kitchen Window
            {
                id: "window",
                position: v(31, 15.4),
                rotation: 2
            }, // Backdoor Window
            {
                id: "window",
                position: v(31, -15.9),
                rotation: 2
            },
            {
                id: "small_house_exterior",
                position: v(0, 0),
                rotation: 2
            }
        ]
    },
    {
        idString: "pvz_workshop",
        name: "PvZ house workshop",
        spawnHitbox: RectangleHitbox.fromRect(219.39, 110.15),
        ceilingHitbox: RectangleHitbox.fromRect(65, 30, v(8, -37.5)),
        scopeHitbox: RectangleHitbox.fromRect(65, 30, v(8, -37.5)),
        floorImages: [],
        ceilingImages: [{
            key: "pvz_workshop_ceiling",
            position: v(8.1, -38.3)
        }],
        floors: [],
        obstacles: [
            {
                id: "bookshelf",
                position: v(-11.8, -48.73),
                rotation: 0
            },
            {
                id: "bookshelf",
                position: v(-20.55, -44.61),
                rotation: 1
            },
            {
                id: "pvz_workbench",
                position: v(27.58, -37.4),
                rotation: 0
            },
            ...(() => {
                const [width, height] = [3, 3];
                const boxHalfDimension = 86.55 / 2;
                const spacing = 90;
                const exclude = Array.from(
                    { length: 2 },
                    (_, x) => Array.from(
                        { length: 2 },
                        (_, y) => v(x, y)
                    )
                ).flat();
                // Exclude a 2x2 square

                return Array.from<BuildingObstacle[], BuildingObstacle[]>(
                    { length: width },
                    (_, x) => Array.from<BuildingObstacle | undefined, BuildingObstacle | undefined>(
                        { length: height },
                        (_, y) => (
                            exclude.some(entry => entry.x === x && entry.y === y)
                                ? undefined
                                : {
                                    id: "box",
                                    position: v(
                                        (-457.47 + boxHalfDimension + spacing * x) / 20,
                                        (-565.04 + boxHalfDimension - spacing * y) / 20
                                    ),
                                    rotation: 0
                                } satisfies BuildingObstacle
                        )
                    ).filter(((v: BuildingObstacle | undefined) => v) as unknown as (v: BuildingObstacle | undefined) => v is BuildingObstacle)
                ).flat();
            })()
        ]
    },
    {
        idString: "pvz_house",
        name: "PvZ House",
        spawnHitbox: RectangleHitbox.fromRect(219.39, 110.15),
        ceilingHitbox: new ComplexHitbox(
            RectangleHitbox.fromRect(67.5, 80, v(7.6, 17.5)), // main house
            RectangleHitbox.fromRect(65, 30, v(8, -37.5)), // workshop

            // windows
            new CircleHitbox(5, v(6.41, 50.5)),
            new CircleHitbox(5, v(42.62, 10.65)),
            new CircleHitbox(5, v(-26.26, -10.56)),

            // glass doors
            RectangleHitbox.fromRect(5, 18.75, v(-28.76, 15.82)),

            // front door
            new CircleHitbox(5, v(42.62, 21.95))
        ),
        scopeHitbox: new ComplexHitbox(
            RectangleHitbox.fromRect(67.5, 80, v(7.6, 17.5)), // main house
            RectangleHitbox.fromRect(65, 30, v(8, -37.5)) // workshop
        ),
        floorImages: [
            {
                key: "pvz_house_floor",
                position: v(0, 0.17)
            }
        ],
        ceilingImages: [
            {
                key: "pvz_house_ceiling",
                position: v(8.6, 0)
            }
        ],
        lootSpawners: [
            {
                position: v(-18.26, -27.94),
                table: "pvz_workshop"
            }
        ],
        floors: [
            {
                type: "wood",
                hitbox: RectangleHitbox.fromRect(70.07, 72.8, v(7.8, 13.32))
            },
            {
                type: "metal",
                hitbox: RectangleHitbox.fromRect(64, 28.69, v(7.3, -37.47))
            },
            (() => {
                const padding = 3;

                // This is used to smooth out the rough edges to make traversal
                // smoother for everyone :3

                return {
                    type: "grass",
                    hitbox: new PolygonHitbox(
                        v(-94.97, 15.95),
                        v(-88.57 - padding, 15.95),
                        v(-88.57, 15.95 - padding),
                        v(-88.57, 9.39),
                        v(-83.42 + padding, 9.39),
                        v(-83.42, 9.39 + padding),
                        v(-83.42, 21.89),
                        v(-94.97 - padding, 21.89),
                        v(-94.97, 21.89 - padding)
                    )
                };
            })(),
            (() => {
                const padding = 3;

                return {
                    type: "grass",
                    hitbox: new PolygonHitbox(
                        v(-69.97, 15.95),
                        v(-64.2 - padding, 15.95),
                        v(-64.2, 15.95 - padding),
                        v(-64.2, 9.39),
                        v(-51.7, 9.39),
                        v(-51.7, 15.95 - padding),
                        v(-51.7 + padding, 15.95),
                        v(-45.45, 15.95),
                        v(-45.45, 21.89),
                        v(-51.7, 21.89),
                        v(-51.7, 15.95 + padding),
                        v(-51.7 - padding, 15.95),
                        v(-64.2 + padding, 15.95),
                        v(-64.2, 15.95 + padding),
                        v(-64.2, 21.89),
                        v(-69.97 - padding, 21.89),
                        v(-69.97, 21.89 - padding)
                    )
                };
            })(),
            {
                type: "water",
                hitbox: RectangleHitbox.fromRect(56.25, 12.5, v(-73.57, 15.64))
            }
        ],
        subBuildings: [{
            id: "pvz_workshop",
            position: v(0, 0),
            orientation: 0
        }],
        obstacles: [
            {
                id: "pvz_house_exterior",
                position: v(8.18, -1.03),
                rotation: 0
            },
            {
                id: "pvz_house_workshop",
                position: v(8.18, -0.3),
                rotation: 0
            },
            ...(() => // front yard fence connectors
                [-1.69, 32.98].map(y =>
                    Array.from(
                        { length: 14 },
                        (_, i) => i
                    ).map(i => ({
                        id: "pvz_front_fence_connector",
                        position: v((906.9 + 89.96 * i + 81.66 / 2) / 20, y),
                        rotation: 0
                    }))
                ).flat()
            )(),
            ...(() => // front yard fence posts
                [-1.69, 32.98].map(y =>
                    Array.from(
                        { length: 15 },
                        (_, i) => i
                    ).map(i => ({
                        id: "pvz_front_fence_post",
                        position: v((871.4 + 89.95 * i + 63 / 2) / 20, y),
                        rotation: 0
                    }))
                ).flat()
            )(),
            ...(() => // back yard fence (vertical)
                Array.from(
                    { length: 10 },
                    (_, i) => i
                ).map(i => ({
                    id: "pvz_back_fence",
                    position: v(-108.5, (-62.2 + 75 * i + 75 / 2) / 20),
                    rotation: 1
                }))
            )(),
            ...(() => // back yard fence (horizontal)
                [-4.31, 35.59].map(y =>
                    Array.from(
                        { length: 22 },
                        (_, i) => i
                    ).map(i => ({
                        id: "pvz_back_fence",
                        position: v((-2193.9 + 75 * i + 75 / 2) / 20, y),
                        rotation: 0
                    }))
                ).flat()
            )(),
            {
                id: "potted_plant",
                position: v(49.08, 8.47),
                rotation: 0
            },
            {
                id: "pvz_backyard_chair",
                position: v(-37.17, -0.1),
                rotation: 2
            },
            {
                id: "pvz_backyard_chair",
                position: v(-31.61, 10.28),
                rotation: 0
            },
            {
                id: "pvz_backyard_table",
                position: v(-34.42, 4.28),
                rotation: 0
            },
            {
                id: "bbq",
                position: v(-33.12, 30.01),
                rotation: 0
            },
            {
                id: "fridge",
                position: v(-20.69, 30.93),
                rotation: 2,
                variation: 2
            },
            {
                id: "stove",
                position: v(-11.49, 30.85),
                rotation: 2,
                variation: 2
            },
            {
                id: "small_drawer",
                position: v(-21.45, 1.3),
                rotation: 1
            },
            {
                id: "small_drawer",
                position: v(37.77, 1.06),
                rotation: 3
            },
            {
                id: "small_drawer",
                position: v(38.17, 9.9),
                rotation: 0
            },
            {
                id: "large_drawer",
                position: v(6.41, 45.32),
                rotation: 2
            },
            {
                id: "large_drawer",
                position: v(38.03, 39.74),
                rotation: 3
            },
            {
                id: "bookshelf",
                position: v(-6.6, -15.28),
                rotation: 3
            },
            {
                id: "bookshelf",
                position: v(28.52, 8.53),
                rotation: 0
            },
            {
                id: "small_bed",
                position: v(-21.23, -13.46),
                rotation: 0
            },
            {
                get id() { return pickRandomInArray(["toilet", "used_toilet"]); },
                position: v(37.44, -18.36),
                rotation: 3
            },
            {
                id: "sink",
                position: v(38.63, -10.29),
                rotation: 0
            },
            {
                id: "tv",
                position: v(40.82, 39.74),
                rotation: 0
            },
            {
                id: "small_couch",
                position: v(23.08, 38.77),
                rotation: 0
            },
            {
                id: "chair",
                position: v(8.33, 24.9),
                rotation: 0
            },
            {
                id: "chair",
                position: v(13.2, 18.13),
                rotation: 1
            },
            {
                id: "chair",
                position: v(8.33, 11.35),
                rotation: 2
            },
            {
                id: "chair",
                position: v(3.46, 18.13),
                rotation: 3
            },
            {
                id: "table",
                position: v(8.33, 18.13),
                rotation: 0,
                variation: 1
            },
            {
                id: "shower_head",
                position: v(25.3, -19.7),
                rotation: 0
            },
            {
                id: "door",
                position: v(-3.37, -1.15),
                rotation: 1
            },
            {
                id: "door",
                position: v(19.65, -1.15),
                rotation: 1
            },
            {
                id: "door",
                position: v(42.62, 21.23),
                rotation: 1
            },
            {
                id: "sliding_glass_door",
                position: v(-26.26, 20.37),
                rotation: 1
            },
            {
                id: "sliding_glass_door",
                position: v(-26.26, 11.01),
                rotation: 3
            },
            {
                id: "shower_wall",
                position: v(28.63, -16.78),
                rotation: 0
            },
            {
                id: "shower_door",
                position: v(21.43, -12.41),
                rotation: 2
            },
            {
                id: "window",
                position: v(6.41, 50.1),
                rotation: 1
            },
            {
                id: "window",
                position: v(42.62, 10.35),
                rotation: 0
            },
            {
                id: "window",
                position: v(-26.26, -10.26),
                rotation: 0
            },
            {
                id: "pvz_wall_short",
                position: v(-3.4, -13.8),
                rotation: 0
            },
            {
                id: "pvz_wall_long",
                position: v(-13.84, 5.3),
                rotation: 1
            },
            {
                id: "pvz_wall_short",
                position: v(19.71, -13.8),
                rotation: 0
            },
            {
                id: "pvz_wall_long",
                position: v(30.17, 5.3),
                rotation: 3
            },
            {
                id: "pvz_secret_wall",
                position: v(8.15, -22.64),
                rotation: 1
            }
        ]
    }
]);
