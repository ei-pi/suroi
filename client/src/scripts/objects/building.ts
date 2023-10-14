import { Container } from "pixi.js";
import { zIndexes, type ObjectCategory } from "../../../../common/src/constants";
import { type BuildingDefinition } from "../../../../common/src/definitions/buildings";
import { type Orientation } from "../../../../common/src/typings";
import { type Hitbox } from "../../../../common/src/utils/hitbox";
import { velFromAngle } from "../../../../common/src/utils/math";
import { type ObjectType } from "../../../../common/src/utils/objectType";
import { type ObjectsNetData } from "../../../../common/src/utils/objectsSerializations";
import { randomFloat, randomRotation } from "../../../../common/src/utils/random";
import type { Game } from "../game";
import { GameObject } from "../types/gameObject";
import { HITBOX_COLORS, HITBOX_DEBUG_MODE } from "../utils/constants";
import { orientationToRotation } from "../utils/misc";
import { SuroiSprite, drawHitbox, toPixiCoords } from "../utils/pixi";
import { EaseFunctions, Tween } from "../utils/tween";

export class Building extends GameObject {
    declare readonly type: ObjectType<ObjectCategory.Building, BuildingDefinition>;

    readonly ceilingContainer: Container;
    ceilingHitbox?: Hitbox;
    ceilingTween?: Tween<Container>;

    orientation!: Orientation;

    ceilingVisible = true;
    isNew = true;

    constructor(game: Game, type: ObjectType, id: number) {
        super(game, type, id);

        const definition = this.type.definition;

        this.container.zIndex = zIndexes.Ground;

        for (const image of definition.floorImages) {
            this.container.addChild(
                new SuroiSprite(image.key)
                    .setVPos(toPixiCoords(image.position))
            );
        }

        this.ceilingContainer = new Container();
        this.ceilingContainer.zIndex = zIndexes.BuildingsCeiling;
        this.game.camera.container.addChild(this.ceilingContainer);
    }

    toggleCeiling(visible: boolean): void {
        if (this.ceilingVisible === visible) return;

        this.ceilingTween?.kill();

        this.ceilingTween = new Tween(
            this.game,
            {
                target: this.ceilingContainer,
                to: { alpha: visible ? 1 : 0 },
                duration: 200,
                ease: EaseFunctions.sineOut,
                onComplete: () => {
                    this.ceilingVisible = visible;
                }
            }
        );
    }

    override updateFromData(data: ObjectsNetData[ObjectCategory.Building]): void {
        const definition = this.type.definition;

        if (data.dead) {
            if (!this.dead && !this.isNew) {
                this.game.particleManager.spawnParticles(10, () => ({
                    frames: `${this.type.idString}_particle`,
                    position: this.ceilingHitbox?.randomPoint() ?? { x: 0, y: 0 },
                    zIndex: 10,
                    lifeTime: 2000,
                    rotation: {
                        start: randomRotation(),
                        end: randomRotation()
                    },
                    alpha: {
                        start: 1,
                        end: 0,
                        ease: EaseFunctions.sextIn
                    },
                    scale: { start: 1, end: 0.2 },
                    speed: velFromAngle(randomRotation(), randomFloat(1, 2))
                }));
                this.playSound("ceiling_collapse", 0.5, 96);
            }
            this.ceilingTween?.kill();
            this.ceilingContainer.zIndex = zIndexes.DeadObstacles;
            this.ceilingContainer.alpha = 1;

            this.ceilingContainer.addChild(new SuroiSprite(`${this.type.idString}_residue`));
        }
        this.dead = data.dead;

        this.ceilingContainer.removeChildren();
        for (const image of definition.ceilingImages) {
            let key = image.key;
            if (this.dead && image.residue) key = image.residue;
            const sprite = new SuroiSprite(key);
            sprite.setVPos(toPixiCoords(image.position));
            this.ceilingContainer.addChild(sprite);
        }

        this.isNew = false;

        if (data.fullUpdate) {
            this.position = data.position;

            const pos = toPixiCoords(this.position);
            this.container.position.copyFrom(pos);
            this.ceilingContainer.position.copyFrom(pos);

            this.orientation = data.rotation;
            this.rotation = orientationToRotation(this.orientation);
            this.container.rotation = this.rotation;
            this.ceilingContainer.rotation = this.rotation;

            this.ceilingHitbox = definition.ceilingHitbox?.transform(this.position, 1, this.orientation);
        }

        if (HITBOX_DEBUG_MODE) {
            this.debugGraphics.clear();
            if (this.ceilingHitbox !== undefined) {
                drawHitbox(this.ceilingHitbox, HITBOX_COLORS.buildingScopeCeiling, this.debugGraphics);
            }

            drawHitbox(
                definition.spawnHitbox.transform(this.position, 1, this.orientation),
                HITBOX_COLORS.spawnHitbox,
                this.debugGraphics
            );

            drawHitbox(
                definition.scopeHitbox.transform(this.position, 1, this.orientation),
                HITBOX_COLORS.buildingZoomCeiling,
                this.debugGraphics
            );
        }
    }

    destroy(): void {
        super.destroy();
        this.ceilingTween?.kill();
        this.ceilingContainer.destroy();
    }
}
