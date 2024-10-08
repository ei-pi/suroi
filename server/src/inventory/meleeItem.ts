import { AnimationType, FireMode } from "@common/constants";
import { type MeleeDefinition } from "@common/definitions/melees";
import { CircleHitbox } from "@common/utils/hitbox";
import { ItemType, type ReferenceTo } from "@common/utils/objectDefinitions";
import { Vec } from "@common/utils/vector";

import { adjacentOrEqualLayer } from "@common/utils/layer";
import { type CollidableGameObject } from "../objects/gameObject";
import { type Player } from "../objects/player";
import { InventoryItem } from "./inventoryItem";

/**
 * A class representing a melee weapon
 */
export class MeleeItem extends InventoryItem<MeleeDefinition> {
    declare readonly category: ItemType.Melee;

    private _autoUseTimeoutID?: NodeJS.Timeout;

    /**
     * Constructs a new melee weapon
     * @param idString The `idString` of a `MeleeDefinition` in the item schema that this object is to base itself off of
     * @param owner The `Player` that owns this melee weapon
     * @throws {TypeError} If the `idString` given does not point to a definition for a melee weapon
     */
    constructor(idString: ReferenceTo<MeleeDefinition>, owner: Player) {
        super(idString, owner);

        if (this.category !== ItemType.Melee) {
            throw new TypeError(`Attempted to create a Melee object based on a definition for a non-melee object (Received a ${this.category as unknown as string} definition)`);
        }
    }

    /**
     * As the name implies, this version does not check whether the firing delay
     * has been respected. Used in conjunction with other time-keeping mechanisms,
     * namely setTimeout
     */
    private _useItemNoDelayCheck(skipAttackCheck: boolean): void {
        const owner = this.owner;
        const definition = this.definition;

        this._lastUse = owner.game.now;
        owner.animation = AnimationType.Melee;
        owner.setPartialDirty();

        owner.action?.cancel();

        this.owner.game.addTimeout((): void => {
            if (
                this.owner.activeItem === this
                && (owner.attacking || skipAttackCheck)
                && !owner.dead
                && !owner.downed
                && !owner.disconnected
            ) {
                const rotated = Vec.rotate(definition.offset, owner.rotation);
                const position = Vec.add(owner.position, rotated);
                const hitbox = new CircleHitbox(definition.radius, position);

                // Damage the closest object
                const damagedObjects: readonly CollidableGameObject[] = (
                    [...owner.game.grid.intersectsHitbox(hitbox)]
                        .filter(
                            object => !object.dead
                                && object !== owner
                                && (object.damageable || (object.isThrowableProjectile && object.definition.c4))
                                && (!object.isObstacle || (!object.definition.isStair))
                                && object.hitbox?.collidesWith(hitbox)
                                && adjacentOrEqualLayer(object.layer, this.owner.layer)
                        ) as CollidableGameObject[]
                ).sort((a, b) => {
                    if (
                        (a.isObstacle && a.definition.noMeleeCollision)
                        || (owner.game.teamMode && a.isPlayer && a.teamID === this.owner.teamID)
                    ) return Infinity;

                    if (
                        (b.isObstacle && b.definition.noMeleeCollision)
                        || (owner.game.teamMode && b.isPlayer && b.teamID === this.owner.teamID)
                    ) return -Infinity;

                    return a.hitbox.distanceTo(this.owner.hitbox).distance - b.hitbox.distanceTo(this.owner.hitbox).distance;
                });

                const targetLimit = Math.min(damagedObjects.length, definition.maxTargets);
                for (let i = 0; i < targetLimit; i++) {
                    const closestObject = damagedObjects[i];
                    let multiplier = 1;

                    if (closestObject.isObstacle) {
                        multiplier = definition.piercingMultiplier !== undefined && closestObject.definition.impenetrable
                            ? definition.piercingMultiplier
                            : definition.obstacleMultiplier;
                    }

                    if (closestObject.isThrowableProjectile) { // C4
                        // Currently this code treats C4 as if it is an obstacle in terms of melee damage.
                        closestObject.damageC4(definition.damage * definition.obstacleMultiplier);
                    } else {
                        closestObject.damage({
                            amount: definition.damage * multiplier,
                            source: owner,
                            weaponUsed: this
                        });
                    }

                    if (closestObject.isObstacle && !closestObject.dead) {
                        closestObject.interact(this.owner);
                    }
                }

                if (definition.fireMode === FireMode.Auto || owner.isMobile) {
                    clearTimeout(this._autoUseTimeoutID);
                    this._autoUseTimeoutID = setTimeout(
                        this._useItemNoDelayCheck.bind(this, false),
                        definition.cooldown
                    );
                }
            }
        }, 50);
    }

    override useItem(): void {
        super._bufferAttack(
            this.definition.cooldown,
            this._useItemNoDelayCheck.bind(this, true)
        );
    }
}
