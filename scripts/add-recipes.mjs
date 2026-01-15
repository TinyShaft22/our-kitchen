// Script to add sample recipes to a household
// Run with: node scripts/add-recipes.mjs

const API_URL = 'https://us-central1-grocery-store-app-c3aa5.cloudfunctions.net/importRecipe';
const API_KEY = 'ourkitchen2024';
const HOUSEHOLD_CODE = '0428';

const recipes = [
  // === SOUS VIDE RECIPES ===
  {
    name: 'Sous Vide Ribeye Steak',
    servings: 2,
    ingredients: [
      '2 ribeye steaks (1.5 inch thick)',
      '2 tbsp coarse sea salt',
      '1 tbsp black pepper',
      '4 sprigs fresh rosemary',
      '4 sprigs fresh thyme',
      '4 cloves garlic',
      '3 tbsp butter'
    ],
    instructions: `## Sous Vide Ribeye Steak

**Temperature:** 130°F for medium-rare (adjust: 125°F rare, 140°F medium)

### Steps:
1. **Prep:** Season steaks generously with salt and pepper on both sides
2. **Bag:** Place each steak in its own vacuum bag with rosemary, thyme, and garlic
3. **Cook:** Submerge in preheated water bath, cook for 2 hours (up to 4 hours for extra tender)
4. **Rest:** Remove from bag, pat completely dry with paper towels
5. **Sear:** Heat cast iron to smoking hot, add butter, sear 1 minute per side

*Pro tip: Steaks must be completely dry for a good sear!*`
  },
  {
    name: 'Sous Vide Chicken Breast',
    servings: 4,
    ingredients: [
      '4 boneless skinless chicken breasts',
      '2 tsp salt',
      '1 tsp black pepper',
      '1 tsp garlic powder',
      '2 tbsp olive oil',
      '2 sprigs fresh thyme',
      '1 lemon (zest only)'
    ],
    instructions: `## Sous Vide Chicken Breast

**Temperature:** 145°F for juicy, tender chicken

### Steps:
1. **Prep:** Season chicken with salt, pepper, and garlic powder
2. **Bag:** Place chicken in bags with thyme and lemon zest, one breast per bag
3. **Cook:** Submerge in 145°F water bath for 1-2 hours (safe up to 4 hours)
4. **Sear (optional):** Pat dry, sear in hot pan with olive oil for 30 seconds per side

*Note: Chicken will be fully pasteurized and safe at 145°F after 1 hour - it's science!*`
  },
  {
    name: 'Sous Vide Pork Chops',
    servings: 4,
    ingredients: [
      '4 bone-in pork chops (1.5 inch thick)',
      '2 tsp salt',
      '1 tsp black pepper',
      '1 tsp smoked paprika',
      '4 cloves garlic (smashed)',
      '4 sprigs fresh thyme',
      '2 tbsp butter',
      '1 tbsp vegetable oil'
    ],
    instructions: `## Sous Vide Pork Chops

**Temperature:** 140°F for tender, juicy pork (145°F for firmer texture)

### Steps:
1. **Season:** Rub pork chops with salt, pepper, and smoked paprika
2. **Bag:** Add to bags with garlic and thyme
3. **Cook:** Submerge in 140°F water bath for 2-3 hours
4. **Sear:** Pat dry, sear in hot skillet with butter and oil, 1-2 minutes per side

*These will be the juiciest pork chops you've ever had!*`
  },
  {
    name: 'Sous Vide Burgers',
    servings: 4,
    ingredients: [
      '1.5 lb ground beef (80/20)',
      '1 tsp salt',
      '1 tsp black pepper',
      '4 slices cheddar cheese',
      '4 brioche buns',
      '2 tbsp butter',
      'Lettuce, tomato, onion for serving'
    ],
    instructions: `## Sous Vide Burgers

**Temperature:** 137°F for medium (130°F medium-rare, 145°F medium-well)

### Steps:
1. **Form patties:** Divide beef into 4 portions (6oz each), shape gently into patties
2. **Season:** Salt and pepper the outside only (not mixed in)
3. **Bag:** Place patties in bags, one per bag
4. **Cook:** Submerge in 137°F water bath for 1 hour
5. **Rest:** Remove from bags, pat very dry, rest 10 minutes
6. **Sear:** High heat cast iron with butter, 45 seconds per side, add cheese to melt

*Sous vide pasteurizes the beef so medium-rare is safe!*`
  },

  // === AIR FRYER RECIPES ===
  {
    name: 'Air Fryer Crispy Chicken Wings',
    servings: 4,
    ingredients: [
      '2 lbs chicken wings (drumettes and flats)',
      '1 tbsp baking powder (aluminum-free)',
      '1 tsp garlic powder',
      '1 tsp smoked paprika',
      '1 tsp salt',
      '1/2 tsp black pepper',
      '1/2 cup hot sauce (Frank\'s RedHot)',
      '4 tbsp butter (melted)'
    ],
    instructions: `## Air Fryer Crispy Chicken Wings

**Temperature:** 400°F

### Steps:
1. **Prep:** Pat wings completely dry with paper towels
2. **Season:** Toss wings with baking powder, garlic powder, paprika, salt, pepper
3. **Air Fry:** Single layer, cook 12 minutes, flip, cook 12 more minutes until golden
4. **Sauce:** Mix hot sauce with melted butter, toss wings in sauce

*Secret: Baking powder draws moisture out for extra crispy skin!*`
  },
  {
    name: 'Air Fryer Honey Garlic Salmon',
    servings: 2,
    ingredients: [
      '2 salmon fillets (6oz each)',
      '2 tbsp honey',
      '1 tbsp soy sauce',
      '1 tsp garlic powder',
      '1 tsp smoked paprika',
      '1/2 tsp salt',
      '1/4 tsp black pepper',
      '1 tbsp olive oil',
      'Lemon wedges for serving'
    ],
    instructions: `## Air Fryer Honey Garlic Salmon

**Temperature:** 400°F

### Steps:
1. **Prep:** Pat salmon dry with paper towels
2. **Glaze:** Mix honey, soy sauce, and garlic powder
3. **Season:** Rub salmon with olive oil, paprika, salt, pepper
4. **Air Fry:** Cook 7-9 minutes until internal temp reaches 145°F
5. **Glaze:** Brush with honey garlic glaze last 2 minutes

*Ready in under 10 minutes!*`
  },
  {
    name: 'Air Fryer Pork Chops',
    servings: 4,
    ingredients: [
      '4 boneless pork chops (1 inch thick)',
      '1 tbsp brown sugar',
      '1 tsp smoked paprika',
      '1 tsp garlic powder',
      '1 tsp dried thyme',
      '1/2 tsp onion powder',
      '1 tsp salt',
      '1/2 tsp black pepper',
      '1 tbsp olive oil'
    ],
    instructions: `## Air Fryer Pork Chops

**Temperature:** 400°F

### Steps:
1. **Mix rub:** Combine brown sugar, paprika, garlic powder, thyme, onion powder, salt, pepper
2. **Prep:** Brush pork chops with olive oil on both sides
3. **Season:** Press spice rub onto all sides of chops
4. **Air Fry:** Cook 5 minutes, flip, cook 5-7 more minutes until internal temp is 145°F

*The brown sugar creates a beautiful caramelized crust!*`
  },
  {
    name: 'Air Fryer Crispy Chicken Thighs',
    servings: 4,
    ingredients: [
      '4 bone-in skin-on chicken thighs',
      '1 tsp baking powder',
      '1 tsp smoked paprika',
      '1 tsp garlic powder',
      '1/2 tsp onion powder',
      '1/2 tsp dried oregano',
      '1 tsp salt',
      '1/2 tsp black pepper',
      '1 tbsp olive oil'
    ],
    instructions: `## Air Fryer Crispy Chicken Thighs

**Temperature:** 400°F

### Steps:
1. **Prep:** Pat chicken thighs very dry with paper towels
2. **Season:** Mix all spices with baking powder, rub under and over skin
3. **Oil:** Drizzle with olive oil
4. **Air Fry:** Cook skin-side down 12 minutes, flip, cook 7-12 more minutes until 165°F internal

*Baking powder = ultra crispy skin!*`
  },

  // === CROCK POT RECIPES ===
  {
    name: 'Crock Pot Beef Stew',
    servings: 6,
    ingredients: [
      '2.5 lbs beef chuck (cubed)',
      '1/4 cup flour',
      '1 lb baby yukon gold potatoes (halved)',
      '4 carrots (chunked)',
      '2 stalks celery (chopped)',
      '1 yellow onion (diced)',
      '4 cloves garlic (minced)',
      '4 cups beef broth',
      '2 tbsp tomato paste',
      '2 tbsp Worcestershire sauce',
      '1 cup red wine (optional)',
      '1 tsp salt',
      '1/2 tsp black pepper',
      '2 tbsp olive oil'
    ],
    instructions: `## Crock Pot Beef Stew

**Cook Time:** 8 hours on LOW or 4 hours on HIGH

### Steps:
1. **Prep beef:** Toss beef cubes in flour, salt, and pepper
2. **Sear (optional but recommended):** Brown beef in batches in hot oil, adds flavor
3. **Layer:** Add potatoes, carrots, celery, onion, and garlic to crock pot
4. **Add beef:** Place seared beef on top of vegetables
5. **Liquid:** Mix broth, tomato paste, Worcestershire, and wine. Pour over everything
6. **Cook:** LOW 8 hours or HIGH 4 hours until beef is tender

*The flour coating thickens the stew beautifully!*`
  },
  {
    name: 'Crock Pot BBQ Pulled Pork',
    servings: 8,
    ingredients: [
      '4 lb pork shoulder (bone-in or boneless)',
      '2 tbsp brown sugar',
      '1 tbsp smoked paprika',
      '1 tsp garlic powder',
      '1 tsp onion powder',
      '1 tsp salt',
      '1/2 tsp black pepper',
      '1 cup BBQ sauce',
      '1/2 cup apple cider vinegar',
      '1/2 cup chicken broth',
      'Brioche buns for serving',
      'Coleslaw for serving'
    ],
    instructions: `## Crock Pot BBQ Pulled Pork

**Cook Time:** 8-10 hours on LOW or 5-6 hours on HIGH

### Steps:
1. **Make rub:** Mix brown sugar, paprika, garlic powder, onion powder, salt, pepper
2. **Prep pork:** Rub spice mixture all over pork shoulder
3. **Add liquid:** Pour vinegar and broth into crock pot
4. **Cook:** Place pork in crock pot, cook LOW 8-10 hours until fork tender
5. **Shred:** Remove pork, shred with two forks, discard fat
6. **Sauce:** Mix shredded pork with BBQ sauce, return to crock pot to keep warm

*Let it rest 1 hour after cooking for maximum juiciness!*`
  }
];

async function addRecipe(recipe) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY
    },
    body: JSON.stringify({
      ...recipe,
      householdCode: HOUSEHOLD_CODE
    })
  });

  const result = await response.json();
  return result;
}

async function main() {
  console.log(`Adding ${recipes.length} recipes to household ${HOUSEHOLD_CODE}...\n`);

  for (const recipe of recipes) {
    try {
      const result = await addRecipe(recipe);
      if (result.success) {
        console.log(`✓ Added: ${recipe.name}`);
      } else {
        console.log(`✗ Failed: ${recipe.name} - ${result.error}`);
      }
    } catch (error) {
      console.log(`✗ Error: ${recipe.name} - ${error.message}`);
    }
  }

  console.log('\nDone!');
}

main();
