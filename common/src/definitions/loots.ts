import { ObjectDefinitions } from "../utils/objectDefinitions";
import { Ammos, type AmmoDefinition } from "./ammos";
import { Armors, type ArmorDefinition } from "./armors";
import { Backpacks, type BackpackDefinition } from "./backpacks";
import { Guns, type GunDefinition } from "./guns";
import { HealingItems, type HealingItemDefinition } from "./healingItems";
import { Melees, type MeleeDefinition } from "./melees";
import { Scopes, type ScopeDefinition } from "./scopes";
import { Skins, type SkinDefinition } from "./skins";

export type LootDefinition = GunDefinition | AmmoDefinition | MeleeDefinition | HealingItemDefinition | ArmorDefinition | BackpackDefinition | ScopeDefinition | SkinDefinition;

export const Loots = new ObjectDefinitions<LootDefinition>(
    Array.prototype.concat(Guns, Ammos, Melees, HealingItems, Armors, Backpacks, Scopes, Skins)
);
