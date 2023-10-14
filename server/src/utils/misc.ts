import { ObjectCategory } from "../../../common/src/constants";
import { type LootDefinition } from "../../../common/src/definitions/loots";
import { ObjectType } from "../../../common/src/utils/objectType";
import { weightedRandom } from "../../../common/src/utils/random";
import { LootTiers, type WeightedItem } from "../data/lootTables";

export class LootItem {
    idString: string;
    count: number;
    constructor(idString: string, count: number) {
        this.idString = idString;
        this.count = count;
    }
}

export function getLootTableLoot(loots: WeightedItem[]): LootItem[] {
    interface TempLootItem {
        readonly item: string
        readonly count?: number
        readonly isTier: boolean
    }

    const selectedItem = weightedRandom<TempLootItem>(
        loots.map(
            loot => "tier" in loot
                ? {
                    item: loot.tier,
                    isTier: true
                } satisfies TempLootItem
                : {
                    item: loot.item,
                    count: loot.count,
                    isTier: false
                } satisfies TempLootItem
        ),
        loots.map(l => l.weight)
    );

    if (selectedItem.isTier) {
        return getLootTableLoot(LootTiers[selectedItem.item]);
    }

    const type = selectedItem.item;

    if (type === "nothing") return [];

    const count = selectedItem.count ?? 1;
    const loot = [new LootItem(type, count)];

    const definition = ObjectType.fromString<ObjectCategory.Loot, LootDefinition>(ObjectCategory.Loot, type).definition;
    if (definition === undefined) {
        throw new Error(`Unknown loot item: ${type}`);
    }

    if ("ammoSpawnAmount" in definition && "ammoType" in definition) {
        loot.push(new LootItem(definition.ammoType, definition.ammoSpawnAmount));
    }

    return loot;
}

/**
 * Find and remove an element from an array.
 * @param array The array to iterate over.
 * @param value The value to check for.
 */
export function removeFrom<T>(array: T[], value: T): void {
    const index = array.indexOf(value);
    if (index !== -1) array.splice(index, 1);
}
