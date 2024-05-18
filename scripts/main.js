import { world, system } from "@minecraft/server";

// Store the previously viewed items
const previousViewedItems = new Map();

function itemNameTag() {
    for (const player of world.getPlayers()) {
        try {
            if (typeof player !== 'undefined') {
                const entities = player.getEntitiesFromViewDirection({maxDistance:15})
                
                //if(entities[0]?.distance > 2) return
                const viewedEntities = entities.map(ray => ray.entity);
                // Set name tags for viewed items
                viewedEntities.forEach(entity => {
                    try {
                        if (!entity || entity.typeId !== "minecraft:item") return;
                        const item = entity.getComponent("item");
                        if (!item || !item.isValid()) return;
                        const idName = item.itemStack.typeId.split(":")[1];
                        if (!idName) return;
                        
                        const displayName = item.itemStack.nameTag ?? idName
                            .replaceAll("_", " ")
                            .replaceAll("-", " ")
                            .split(" ")
                            .map(v => v.charAt(0).toUpperCase() + v.substring(1))
                            .join(" ");
                        
                        // Update the name tag only if entity is valid
                        if (entity) {
                            entity.nameTag = displayName;

                            // Update the map with the viewed items
                            previousViewedItems.set(entity.typeId, entity);
                        }
                    } catch (error) {
                        console.error("Error setting name tag for entity:", error);
                    }
                });

                // Remove name tags from items that were viewed previously but not anymore
                previousViewedItems.forEach((item) => {
                    try {
                        if (!viewedEntities.some((entity) => entity && entity?.typeId === item.typeId)) {
                            if (item) item.nameTag = ""; // Or any default value you prefer
                            previousViewedItems.delete(item.id);
                        }
                    } catch (error) {
                        previousViewedItems.delete(item.id);
                    }
                });
            }
        } catch (error) {
            console.error("Error in itemNameTag function:", error);
        }
    }
}

system.runInterval(() => {
    itemNameTag();
});