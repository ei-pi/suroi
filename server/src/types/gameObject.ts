import { type Hitbox } from "../../../common/src/utils/hitbox";
import { type ObjectType } from "../../../common/src/utils/objectType";
import { type SuroiBitStream } from "../../../common/src/utils/suroiBitStream";
import { type Vector } from "../../../common/src/utils/vector";
import { type Game } from "../game";

export abstract class GameObject {
    damageable = false;

    id: number;
    type: ObjectType;

    game: Game;

    _position: Vector;
    get position(): Vector { return this._position; }
    set position(position: Vector) { this._position = position; }

    _rotation = 0;
    get rotation(): number { return this._rotation; }
    set rotation(rotation: number) { this._rotation = rotation; }

    scale = 1;
    dead = false;
    hitbox?: Hitbox;

    // which grid cells this object is occupying
    gridCells: Vector[] = [];

    protected constructor(game: Game, type: ObjectType, position: Vector) {
        this.id = game.nextObjectID;
        this.game = game;
        this.type = type;
        this._position = position;
        game.updateObjects = true;
    }

    abstract damage(amount: number, source?: GameObject): void;

    abstract serializePartial(stream: SuroiBitStream): void;
    abstract serializeFull(stream: SuroiBitStream): void;
}
