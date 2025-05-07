import { type CommonGameObject } from "./gameObject";
import { Numeric } from "./math";

export const GROUND_LAYER = 0;
export const FIRST_BASEMENT = -3;
export const FIRST_FLOOR = 3;

/*

Layer numbering guide:
We take 0 as a start to be the basic ground level. Ground levels correspond
to "floors" in a building, and each ground level is separated by stair layers. We use
two stair layers between each ground layer, meaning that ground levels always have
indices which are multiples of 3. The "upper stair" level is the stair level which
is connected to the higher floor, whereas the "lower stair" is connected to the bottom one.

 ground
--------
         ---   stair
            ---
               ---   basement
                   ------------
|< gnd >|         |<   gnd    >|
|<   group down  >|
        |<      group up      >|
        |< stair >|

this can infinitely be extended in both directions

*/

/**
 * Returns whether the provided layer is a "ground" layer.
 * @param layer The layer to evaluate.
 * @returns `true` if the layer is a "ground" layer; `false` otherwise.
 */
export function isGroundLayer(layer: number): boolean {
    return layer % 3 === 0;
}

/**
 * Returns whether the provided layer is a "stair" layer; stair layers serve as transitions
 * between ground layers, and are further split into an upper & lower stair
 * @param layer The layer to evaluate.
 * @returns `true` if the layer is a "stair" layer; `false` otherwise.
 */
export function isStairLayer(layer: number): boolean {
    return layer % 3 !== 0;
}

/**
 * Returns whether the provided layer is a "down group" layer. 'Down group' layers are stair layers
 * neighboring the lower floor
 * @param layer The layer to evaluate
 * @returns `true` if the layer is a "down group"
 */
export function isGroupedDownward(layer: number): boolean {
    return Numeric.absMod(layer, 3) === 2;
}

/**
 * Returns whether the provided layer is a "up group" layer. 'Up group' layers are stair layers
 * neighboring the upper floor
 * @param layer The layer to evaluate
 * @returns `true` if the layer is a "up group"
 */
export function isGroupedUpward(layer: number): boolean {
    return Numeric.absMod(layer, 3) === 1;
}

/**
 * Returns whether a layer is "underground"; underground layers are not visible from above-ground ones.
 * A layer is "underground" if it is lower than or equal to `-3` ({@link FIRST_BASEMENT})
 * @param layer The layer to evaluate
 * @returns `true` if the layer is an "underground" layer; `false` otherwise
 */
export function isUnderground(layer: number): boolean {
    return layer <= FIRST_BASEMENT;
}

export function toStair(observer: number, layer: number): number {
    const mod = layer % 3;
    if (mod !== 0) return layer;
    return observer >= layer ? ++layer : --layer;
}

/**
 * Returns whether or not the two layers are equal.
 * @param focusLayer The reference layer.
 * @param evalLayer The layer to evaluate relative to the reference layer.
 * @returns `true` if the two layers are the same; `false` otherwise.
 */
export function equalLayer(referenceLayer: number, evalLayer: number): boolean {
    return referenceLayer === evalLayer;
}

/**
 * Returns whether or not the layer being evaluated is at the same level, or one level immediately above, the reference
 * layer.
 * @param focusLayer The reference layer.
 * @param evalLayer The layer to evaluate relative to the reference layer.
 * @returns `true` if the evaluated layer is the same, or one layer above, the reference layer.
 */
export function equalOrOneAboveLayer(referenceLayer: number, evalLayer: number): boolean {
    return (referenceLayer === evalLayer) || (referenceLayer + 1 === evalLayer);
}

/**
 * Returns whether or not the layer being evaluated is at the same level, or one level immediately below, the reference
 * layer.
 * @param focusLayer The reference layer.
 * @param evalLayer The layer to evaluate relative to the reference layer.
 * @returns `true` if the evaluated layer is the same, or one layer above, the reference layer.
 */
export function equalOrOneBelowLayer(referenceLayer: number, evalLayer: number): boolean {
    return (referenceLayer === evalLayer) || (referenceLayer - 1 === evalLayer);
}

/**
 * Returns whether or not the layer being evaluated is adjacent (either one above or below) to the
 * given reference layer.
 * @returns `true` if the evaluated layer is a neighbor of the reference layer
 */
export function isAdjacent(num1: number, num2: number): boolean {
    return (num1 - 1 === num2) || (num1 + 1 === num2);
}

/**
 * Returns whether or not the layer being evaluated is identical or adjacent (either one above or below) to the
 * given reference layer.
 * @returns `true` if the evaluated layer is equal to or a neighbor of the reference layer
 */
export function adjacentOrEqualLayer(referenceLayer: number, evalLayer: number): boolean {
    return (referenceLayer - 1 === evalLayer) || (referenceLayer + 1 === evalLayer) || (referenceLayer === evalLayer);
}

export function equivLayer(
    referenceObject: {
        layer: number
        definition?: {
            collideWithLayers?: Layers
            isStair?: boolean
        }
    },
    evalObject: { layer: number }
): boolean {
    if (referenceObject.definition?.isStair) return adjacentOrEqualLayer(referenceObject.layer, evalObject.layer);

    switch (referenceObject.definition?.collideWithLayers) {
        case Layers.All: return true;
        case Layers.Adjacent: return adjacentOrEqualLayer(referenceObject.layer, evalObject.layer);
        case Layers.Equal:
        default:
            return equalLayer(referenceObject.layer, evalObject.layer);
    }
}

export function adjacentOrEquivLayer(
    referenceObject: CommonGameObject,
    evalLayer: number
): boolean {
    const buildingOrObstacle = referenceObject.isObstacle || referenceObject.isBuilding;
    return buildingOrObstacle
        ? equivLayer(referenceObject, { layer: evalLayer })
        : equalLayer(referenceObject.layer, evalLayer);
}
export const enum Layers {
    /**
     * Collide with objects on all layers
     */
    All,
    /**
     * Collide with objects on the same or adjacent layers
     */
    Adjacent,
    /**
     * Only collide with objects on the same layer
     */
    Equal
}
