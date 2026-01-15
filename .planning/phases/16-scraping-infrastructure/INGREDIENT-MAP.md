# Ingredient Category Mapping

Reference for batch processing Broma Bakery recipes (Phases 17-20).

## Overview

Maps common baking ingredients to app categories for consistent import formatting.

**Valid Categories:** produce, meat, dairy, pantry, frozen, bakery, snacks, beverages, baking

**Default Store:** costco (unless noted otherwise)

---

## Category Mappings

### baking

All core baking ingredients go here.

| Ingredient | Variations | Default Store |
|------------|------------|---------------|
| all-purpose flour | flour, AP flour | costco |
| bread flour | | costco |
| cake flour | | costco |
| whole wheat flour | | costco |
| granulated sugar | sugar, white sugar | costco |
| light brown sugar | brown sugar, packed brown sugar | costco |
| dark brown sugar | | costco |
| powdered sugar | confectioners sugar, icing sugar | costco |
| baking soda | | costco |
| baking powder | | costco |
| vanilla extract | pure vanilla extract | costco |
| almond extract | | trader-joes |
| Dutch-process cocoa powder | cocoa powder | costco |
| natural cocoa powder | | costco |
| chocolate chips | semisweet chocolate chips, semi-sweet | costco |
| dark chocolate chips | bittersweet chocolate chips | costco |
| white chocolate chips | | trader-joes |
| salt | table salt, fine salt | costco |
| kosher salt | flaky salt | costco |
| cornstarch | corn starch | costco |
| instant yeast | active dry yeast, yeast | costco |
| espresso powder | instant espresso | trader-joes |
| cinnamon | ground cinnamon | costco |
| nutmeg | ground nutmeg | costco |
| ginger | ground ginger | costco |
| cloves | ground cloves | trader-joes |
| allspice | | trader-joes |
| cream of tartar | | trader-joes |

### dairy

All dairy products including eggs.

| Ingredient | Variations | Default Store |
|------------|------------|---------------|
| unsalted butter | butter | costco |
| salted butter | | costco |
| eggs | large eggs | costco |
| egg whites | | costco |
| egg yolks | egg yolk | costco |
| whole milk | milk | costco |
| buttermilk | | trader-joes |
| heavy cream | heavy whipping cream, whipping cream | costco |
| cream cheese | | costco |
| sour cream | | costco |
| greek yogurt | plain greek yogurt | costco |
| sweetened condensed milk | | costco |
| evaporated milk | | costco |

### pantry

Oils, syrups, nut butters, nuts, and shelf-stable items.

| Ingredient | Variations | Default Store |
|------------|------------|---------------|
| vegetable oil | canola oil, neutral oil | costco |
| coconut oil | | trader-joes |
| olive oil | extra virgin olive oil | costco |
| honey | | costco |
| maple syrup | pure maple syrup | costco |
| molasses | | trader-joes |
| corn syrup | light corn syrup | safeway |
| peanut butter | creamy peanut butter | costco |
| almond butter | | trader-joes |
| nutella | | costco |
| old fashioned oats | rolled oats, oats | costco |
| quick oats | instant oats | costco |
| almonds | slivered almonds, sliced almonds | costco |
| walnuts | chopped walnuts | costco |
| pecans | chopped pecans | costco |
| hazelnuts | | trader-joes |
| peanuts | | costco |
| macadamia nuts | | trader-joes |
| shredded coconut | coconut flakes, sweetened coconut | costco |
| dried cranberries | craisins | costco |
| raisins | | costco |
| dried cherries | | trader-joes |
| caramels | soft caramels, Werther's caramels | safeway |
| marshmallows | mini marshmallows | safeway |
| marshmallow fluff | | safeway |
| graham crackers | graham cracker crumbs | safeway |
| Oreos | Oreo cookies | safeway |
| sprinkles | | safeway |
| peppermint candies | candy canes, crushed peppermint | safeway |

### produce

Fresh fruits and zests.

| Ingredient | Variations | Default Store |
|------------|------------|---------------|
| bananas | ripe bananas | costco |
| fresh strawberries | strawberries | costco |
| fresh blueberries | blueberries | costco |
| fresh raspberries | raspberries | costco |
| apples | Granny Smith apples | costco |
| peaches | fresh peaches | costco |
| lemons | | costco |
| lemon zest | | costco |
| lemon juice | fresh lemon juice | costco |
| oranges | | costco |
| orange zest | | costco |
| orange juice | fresh orange juice | costco |
| lime zest | | costco |
| lime juice | fresh lime juice | costco |

---

## Usage Notes

### When Processing Recipes

1. **Match ingredient name** to table (case-insensitive)
2. **Check variations** if exact match not found
3. **Use default store** unless recipe specifies otherwise
4. **Default to "baking"** category if ingredient is unclear but baking-related
5. **Default to "pantry"** for truly ambiguous items

### Common Parsing Patterns

```
"1 cup all-purpose flour" → { name: "all-purpose flour", category: "baking", defaultStore: "costco" }
"2 large eggs, room temperature" → { name: "eggs", category: "dairy", defaultStore: "costco" }
"1/2 cup unsalted butter, melted" → { name: "unsalted butter", category: "dairy", defaultStore: "costco" }
"1 teaspoon vanilla extract" → { name: "vanilla extract", category: "baking", defaultStore: "costco" }
```

### Edge Cases

- **"butter"** without qualifier → default to "unsalted butter" (dairy)
- **"sugar"** without qualifier → default to "granulated sugar" (baking)
- **"chocolate"** without qualifier → default to "chocolate chips" (baking)
- **"flour"** without qualifier → default to "all-purpose flour" (baking)
- **"cocoa powder"** → default to "Dutch-process cocoa powder" (baking)

---

## Recipes Sampled

This mapping was built from analysis of:

- **Cookies**: The BEST Chocolate Chip Cookies
- **Muffins**: Double Chocolate Muffins (greek yogurt, buttermilk, cocoa, baking powder)
- **Brownies**: Brown Butter Brownies (Dutch-process cocoa, brown sugar)
- **Bars**: The Best Carmelitas (oats, caramels, heavy cream, baking soda)

Covers 91 target recipes across Cookies (27), Bars (25), Muffins (18), Brownies (21).

---

*Created: 2026-01-15*
*Phase: 16-scraping-infrastructure*
