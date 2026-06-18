INSERT INTO "Food" (id, name, category, "caloriesPer100g", "proteinPer100g", "carbsPer100g", "fatPer100g", "defaultQty", "quantityMode", "gramsPerPiece", "isIndian")
VALUES

-- ==================== INTERNATIONAL-SPECIFIC REPLACEMENT IDs (skip conflicts) ====================

-- PIZZA / PASTA (more)
('pizza-pepperoni-intl', 'Pepperoni Pizza (1 slice)', 'Junk Food', 280, 12, 28, 14, 2, 'piece', 90, false),
('pizza-bbq-chicken-intl', 'BBQ Chicken Pizza (1 slice)', 'Junk Food', 270, 13, 27, 13, 2, 'piece', 90, false),
('pizza-hawaiian-intl', 'Hawaiian Pizza (1 slice)', 'Junk Food', 250, 10, 30, 11, 2, 'piece', 90, false),
('pizza-four-cheese-intl', 'Four Cheese Pizza (1 slice)', 'Junk Food', 290, 14, 26, 15, 2, 'piece', 85, false),
('pizza-thin-crust-intl', 'Thin Crust Pizza (1 slice)', 'Junk Food', 220, 8, 26, 9, 2, 'piece', 70, false),
('pasta-carbonara-intl', 'Pasta Carbonara', 'Junk Food', 220, 10, 24, 10, 250, 'grams', NULL, false),
('pasta-aglio-olio-intl', 'Pasta Aglio Olio', 'Junk Food', 180, 5, 28, 6, 250, 'grams', NULL, false),
('pasta-puttanesca-intl', 'Pasta Puttanesca', 'Junk Food', 160, 5, 24, 5, 250, 'grams', NULL, false),
('ravioli-cheese-intl', 'Ravioli (Cheese)', 'Junk Food', 190, 9, 26, 6, 250, 'grams', NULL, false),
('gnocchi-intl', 'Gnocchi (Potato Pasta)', 'Junk Food', 170, 5, 30, 3, 250, 'grams', NULL, false),

-- BURGERS / SANDWICHES (more)
('whopper-burger-intl', 'Whopper Burger (BK style)', 'Junk Food', 380, 20, 32, 20, 1, 'piece', 200, false),
('fish-burger-intl', 'Fish Burger / Filet-O-Fish', 'Junk Food', 320, 12, 36, 14, 1, 'piece', 140, false),
('chicken-tandoori-burger-intl', 'Tandoori Chicken Burger', 'Junk Food', 330, 18, 30, 15, 1, 'piece', 160, false),
('egg-burger-intl', 'Egg Burger', 'Junk Food', 290, 14, 28, 13, 1, 'piece', 130, false),
('roast-beef-sandwich-intl', 'Roast Beef Sandwich', 'Sandwiches', 280, 20, 26, 10, 1, 'piece', 180, false),
('tuna-sandwich-intl', 'Tuna Salad Sandwich', 'Sandwiches', 260, 18, 24, 10, 1, 'piece', 160, false),
('ham-sandwich-intl', 'Ham & Cheese Sandwich', 'Sandwiches', 270, 16, 26, 11, 1, 'piece', 150, false),
('turkey-sandwich-intl', 'Turkey Sandwich', 'Sandwiches', 250, 18, 26, 8, 1, 'piece', 160, false),
('pastrami-sandwich-intl', 'Pastrami Sandwich', 'Sandwiches', 290, 18, 24, 14, 1, 'piece', 170, false),

-- MEDITERRANEAN
('greek-moussaka-intl', 'Greek Moussaka', 'Indian Dishes', 180, 10, 15, 10, 300, 'grams', NULL, false),
('greek-souvlaki-intl', 'Chicken Souvlaki (2 skewers)', 'Chicken & Meat', 220, 24, 6, 12, 2, 'piece', 60, false),
('greek-gyros-intl', 'Gyros Wrap (Chicken)', 'Indian Dishes', 240, 18, 26, 8, 1, 'piece', 180, false),
('greek-spanakopita-intl', 'Spanakopita (Spinach Pie)', 'Snacks & Street Food', 220, 7, 20, 13, 1, 'piece', 100, false),
('greek-tzatziki-intl', 'Tzatziki Dip', 'Healthy & Fitness', 60, 3, 4, 4, 50, 'grams', NULL, false),
('turkish-doner-intl', 'Turkish Doner Kebab', 'Indian Dishes', 230, 18, 22, 9, 1, 'piece', 200, false),
('turkish-lahmacun-intl', 'Lahmacun (Turkish Pizza)', 'Junk Food', 210, 10, 28, 7, 1, 'piece', 150, false),
('turkish-borek-intl', 'Borek (Cheese Pastry)', 'Snacks & Street Food', 300, 8, 28, 18, 1, 'piece', 80, false),
('lebanese-fattoush-intl', 'Fattoush Salad', 'Healthy & Fitness', 70, 3, 10, 2.5, 250, 'grams', NULL, false),
('lebanese-kibbeh-intl', 'Kibbeh (Meat Croquettes, 2 pcs)', 'Chicken & Meat', 220, 14, 14, 12, 2, 'piece', 50, false),
('moroccan-tagine-intl', 'Moroccan Chicken Tagine', 'Indian Dishes', 160, 18, 8, 7, 250, 'grams', NULL, false),
('moroccan-couscous-intl', 'Couscous with Vegetables', 'Indian Dishes', 140, 5, 28, 2, 250, 'grams', NULL, false),

-- JAPANESE (more)
('ramen-tonkotsu-intl', 'Tonkotsu Ramen (Pork)', 'Chinese', 150, 8, 20, 4, 500, 'ml', NULL, false),
('ramen-miso-intl', 'Miso Ramen', 'Chinese', 140, 7, 22, 3.5, 500, 'ml', NULL, false),
('udon-noodles-intl', 'Udon Noodles (Stir-fried)', 'Chinese', 160, 5, 30, 2.5, 300, 'grams', NULL, false),
('gyoza-intl', 'Gyoza / Potstickers (4 pcs)', 'Chinese', 200, 10, 22, 8, 4, 'piece', 25, false),
('teriyaki-chicken-intl', 'Teriyaki Chicken', 'Chicken & Meat', 180, 24, 10, 5, 200, 'grams', NULL, false),
('donburi-chicken-intl', 'Chicken Donburi (Rice Bowl)', 'Chinese', 190, 14, 26, 4, 350, 'grams', NULL, false),
('tonkatsu-intl', 'Tonkatsu (Pork Cutlet)', 'Chicken & Meat', 280, 18, 18, 16, 1, 'piece', 120, false),
('okonomiyaki-intl', 'Okonomiyaki (Savory Pancake)', 'Chinese', 220, 8, 28, 8, 1, 'piece', 150, false),

-- KOREAN
('korean-fried-chicken-intl', 'Korean Fried Chicken (4 pcs)', 'Chicken & Meat', 280, 22, 14, 16, 4, 'piece', 40, false),
('tteokbokki-intl', 'Tteokbokki (Spicy Rice Cakes)', 'Chinese', 190, 4, 35, 4, 250, 'grams', NULL, false),
('korean-bbq-beef-intl', 'Korean BBQ Beef / Bulgogi', 'Chicken & Meat', 220, 22, 12, 10, 200, 'grams', NULL, false),
('korean-kimchi-stew-intl', 'Kimchi Jjigae (Kimchi Stew)', 'Chinese', 80, 6, 6, 3.5, 300, 'ml', NULL, false),
('korean-japchae-intl', 'Japchae (Glass Noodles)', 'Chinese', 160, 4, 28, 4, 250, 'grams', NULL, false),
('korean-bibimbap-veg-intl', 'Veg Bibimbap', 'Chinese', 150, 6, 28, 3.5, 350, 'grams', NULL, false),
('korean-hotdog-intl', 'Korean Corn Dog', 'Junk Food', 280, 9, 30, 14, 1, 'piece', 100, false),

-- VIETNAMESE
('vietnamese-pho-intl', 'Pho (Beef Noodle Soup)', 'Chinese', 90, 8, 12, 2, 500, 'ml', NULL, false),
('vietnamese-pho-chicken-intl', 'Pho Ga (Chicken Noodle Soup)', 'Chinese', 80, 10, 10, 1.5, 500, 'ml', NULL, false),
('vietnamese-banh-mi-intl', 'Banh Mi Sandwich', 'Sandwiches', 260, 14, 30, 10, 1, 'piece', 180, false),
('vietnamese-spring-roll-intl', 'Vietnamese Spring Roll (Fresh)', 'Chinese', 120, 6, 18, 3, 2, 'piece', 50, false),
('vietnamese-rice-paper-roll-intl', 'Rice Paper Roll (Prawn)', 'Fish & Seafood', 110, 8, 16, 2, 3, 'piece', 40, false),
('vietnamese-vermicelli-bowl-intl', 'Bun Cha (Vermicelli Bowl)', 'Chinese', 150, 10, 22, 3, 350, 'grams', NULL, false),

-- INDONESIAN
('nasi-goreng-intl', 'Nasi Goreng (Indonesian Fried Rice)', 'Chinese', 180, 8, 28, 5, 350, 'grams', NULL, false),
('satay-chicken-intl', 'Chicken Satay (4 skewers)', 'Chicken & Meat', 200, 20, 8, 10, 4, 'piece', 25, false),
('gado-gado-intl', 'Gado Gado (Vegetable Salad)', 'Healthy & Fitness', 120, 6, 12, 6, 250, 'grams', NULL, false),
('rendang-intl', 'Beef Rendang', 'Chicken & Meat', 240, 20, 8, 15, 200, 'grams', NULL, false),
('mie-goreng-intl', 'Mie Goreng (Fried Noodles)', 'Chinese', 190, 6, 26, 7, 300, 'grams', NULL, false),

-- BREAKFAST CEREALS
('cheerios-intl', 'Cheerios Cereal (30g)', 'Healthy & Fitness', 380, 10, 74, 5, 30, 'grams', NULL, false),
('weetabix-intl', 'Weetabix (2 biscuits)', 'Healthy & Fitness', 360, 12, 69, 2, 2, 'piece', 18, false),
('corn-flakes-intl', 'Corn Flakes (Kelloggs, 30g)', 'Healthy & Fitness', 380, 7, 84, 1, 30, 'grams', NULL, false),
('chocos-intl', 'Chocos Cereal (30g)', 'Junk Food', 390, 5, 80, 4, 30, 'grams', NULL, false),
('muesli-fruit-intl', 'Fruit Muesli (30g)', 'Healthy & Fitness', 360, 8, 67, 7, 30, 'grams', NULL, false),
('granola-homemade-intl', 'Homemade Granola (30g)', 'Healthy & Fitness', 420, 8, 55, 18, 30, 'grams', NULL, false),
('oatmeal-plain-intl', 'Oatmeal / Porridge (Plain)', 'Healthy & Fitness', 68, 2.5, 12, 1.5, 250, 'grams', NULL, false),
('pancake-mix-intl', 'Pancake Mix (Dry)', 'Junk Food', 350, 8, 70, 3, 50, 'grams', NULL, false),

-- CANNED / PACKAGED
('canned-tuna-intl', 'Canned Tuna (in Water)', 'Fish & Seafood', 116, 26, 0, 1, 100, 'grams', NULL, false),
('canned-sardines-intl', 'Canned Sardines (in Oil)', 'Fish & Seafood', 208, 25, 0, 12, 100, 'grams', NULL, false),
('canned-corn-intl', 'Canned Sweet Corn', 'Vegetables', 80, 3, 16, 1.5, 100, 'grams', NULL, false),
('canned-baked-beans-intl', 'Canned Baked Beans', 'Junk Food', 95, 5, 17, 0.5, 200, 'grams', NULL, false),
('canned-chickpeas-intl', 'Canned Chickpeas', 'Dal & Legumes', 120, 6, 18, 2, 200, 'grams', NULL, false),
('canned-kidney-beans-intl', 'Canned Kidney Beans', 'Dal & Legumes', 110, 7, 18, 0.5, 200, 'grams', NULL, false),
('canned-mushroom-intl', 'Canned Mushrooms', 'Vegetables', 25, 2, 4, 0.3, 100, 'grams', NULL, false),
('canned-tomato-intl', 'Canned Tomatoes (Diced)', 'Vegetables', 18, 1, 4, 0.2, 200, 'grams', NULL, false),
('canned-pineapple-intl', 'Canned Pineapple (in Syrup)', 'Fruits', 60, 0.4, 15, 0.1, 150, 'grams', NULL, false),
('canned-peaches-intl', 'Canned Peaches (in Syrup)', 'Fruits', 55, 0.4, 14, 0.1, 150, 'grams', NULL, false),

-- FROZEN FOODS
('frozen-pizza-margherita-intl', 'Frozen Margherita Pizza', 'Junk Food', 230, 8, 28, 10, 1, 'piece', 300, false),
('frozen-samosa-intl', 'Frozen Samosa (Haldiram)', 'Snacks & Street Food', 290, 6, 34, 15, 3, 'piece', 40, false),
('frozen-fries-intl', 'Frozen French Fries', 'Junk Food', 150, 2, 23, 5, 100, 'grams', NULL, false),
('frozen-waffle-intl', 'Frozen Waffle', 'Junk Food', 290, 5, 42, 11, 1, 'piece', 50, false),
('frozen-chicken-patty-intl', 'Frozen Chicken Patty', 'Junk Food', 240, 14, 18, 13, 1, 'piece', 80, false),
('frozen-peas-intl', 'Frozen Green Peas', 'Vegetables', 80, 5, 14, 0.4, 100, 'grams', NULL, false),
('frozen-mixed-veg-intl', 'Frozen Mixed Vegetables', 'Vegetables', 50, 3, 9, 0.3, 100, 'grams', NULL, false),
('frozen-ice-cream-vanilla-intl', 'Vanilla Ice Cream (Frozen)', 'Junk Food', 207, 3.5, 24, 11, 100, 'grams', NULL, false),

-- CHOCOLATES / CANDIES
('ferrero-rocher-intl', 'Ferrero Rocher (3 pcs)', 'Sweets & Desserts', 590, 8, 43, 45, 3, 'piece', 12, false),
('twix-intl', 'Twix Bar', 'Sweets & Desserts', 490, 5, 65, 24, 1, 'piece', 50, false),
('mars-bar-intl', 'Mars Bar', 'Sweets & Desserts', 450, 4, 70, 16, 1, 'piece', 50, false),
('bounty-intl', 'Bounty Bar', 'Sweets & Desserts', 480, 4, 58, 26, 1, 'piece', 50, false),
('m-and-ms-intl', 'M&Ms (Peanut, 45g)', 'Sweets & Desserts', 510, 10, 60, 26, 1, 'serving', 45, false),
('skittles-intl', 'Skittles (50g)', 'Sweets & Desserts', 400, 0, 90, 4, 1, 'serving', 50, false),
('toblerone-intl', 'Toblerone (50g)', 'Sweets & Desserts', 530, 6, 60, 30, 1, 'serving', 50, false),
('hershey-kisses-intl', 'Hershey Kisses (5 pcs)', 'Sweets & Desserts', 520, 7, 60, 30, 5, 'piece', 5, false),
('gummy-bears-intl', 'Gummy Bears (50g)', 'Sweets & Desserts', 340, 6, 78, 0, 50, 'grams', NULL, false),
('lollipop-intl', 'Lollipop', 'Sweets & Desserts', 60, 0, 15, 0, 1, 'piece', 12, false),
('candy-cane-intl', 'Candy Cane', 'Sweets & Desserts', 55, 0, 14, 0, 1, 'piece', 12, false),

-- PROTEIN / HEALTH SUPPLEMENTS
('whey-protein-isolate-intl', 'Whey Protein Isolate (1 scoop)', 'Healthy & Fitness', 110, 25, 1, 1, 1, 'serving', 30, false),
('whey-concentrate-intl', 'Whey Protein Concentrate (1 scoop)', 'Healthy & Fitness', 120, 24, 3, 2, 1, 'serving', 30, false),
('mass-gainer-intl', 'Mass Gainer (1 scoop)', 'Healthy & Fitness', 350, 20, 60, 4, 1, 'serving', 100, false),
('bcaa-intl', 'BCAA (1 serving)', 'Healthy & Fitness', 20, 5, 0, 0, 1, 'serving', 5, false),
('creatine-intl', 'Creatine Monohydrate (1 serving)', 'Healthy & Fitness', 0, 0, 0, 0, 1, 'serving', 5, false),
('pre-workout-intl', 'Pre-Workout (1 serving)', 'Healthy & Fitness', 15, 0, 2, 0, 1, 'serving', 10, false),
('vegan-protein-intl', 'Vegan Protein (Pea, 1 scoop)', 'Healthy & Fitness', 110, 22, 2, 2, 1, 'serving', 30, false),
('caffeine-tablet-intl', 'Caffeine Tablet (200mg)', 'Healthy & Fitness', 0, 0, 0, 0, 1, 'piece', 1, false),

-- BABY FOOD (basics)
('baby-rice-cereal-intl', 'Baby Rice Cereal (30g)', 'Healthy & Fitness', 120, 2, 26, 0.5, 30, 'grams', NULL, false),
('baby-oat-cereal-intl', 'Baby Oat Cereal (30g)', 'Healthy & Fitness', 130, 4, 24, 1.5, 30, 'grams', NULL, false),
('baby-apple-puree-intl', 'Baby Apple Puree (100g)', 'Fruits', 45, 0.2, 11, 0.1, 100, 'grams', NULL, false),
('baby-banana-puree-intl', 'Baby Banana Puree (100g)', 'Fruits', 70, 0.5, 17, 0.2, 100, 'grams', NULL, false),
('baby-carrot-puree-intl', 'Baby Carrot Puree (100g)', 'Vegetables', 35, 0.8, 8, 0.1, 100, 'grams', NULL, false),
('baby-sweet-potato-puree-intl', 'Baby Sweet Potato Puree (100g)', 'Vegetables', 55, 1, 13, 0.1, 100, 'grams', NULL, false),

-- RTE MEALS
('rte-dal-makhani-intl', 'RTE Dal Makhani (MTR/ITC)', 'Indian Dishes', 140, 6, 14, 6, 1, 'serving', 300, false),
('rte-palak-paneer-intl', 'RTE Palak Paneer (MTR/ITC)', 'Indian Dishes', 150, 8, 7, 10, 1, 'serving', 300, false),
('rte-pav-bhaji-intl', 'RTE Pav Bhaji (Haldiram)', 'Indian Dishes', 180, 5, 26, 6, 1, 'serving', 350, false),
('rte-biryani-veg-intl', 'RTE Veg Biryani (MTR)', 'Indian Dishes', 160, 5, 28, 4, 1, 'serving', 350, false),
('rte-pongal-intl', 'RTE Ven Pongal (MTR)', 'Indian Dishes', 130, 4, 22, 3, 1, 'serving', 300, false),
('rte-upma-intl', 'RTE Upma (MTR)', 'Indian Dishes', 140, 4, 24, 3, 1, 'serving', 250, false),
('rte-noodles-chowmein-intl', 'RTE Chowmein (Maggi/Horlicks)', 'Chinese', 150, 4, 24, 4, 1, 'serving', 250, false),
('rte-dal-chawal-intl', 'RTE Dal Chawal', 'Indian Dishes', 130, 5, 24, 2, 1, 'serving', 300, false),

-- STREET DRINKS
('bubble-tea-intl', 'Bubble Tea / Boba (Milk)', 'Beverages', 120, 2, 22, 3, 400, 'ml', NULL, false),
('slush-lemon-intl', 'Lemon Slush / Gola', 'Beverages', 80, 0, 20, 0, 300, 'ml', NULL, false),
('smoothie-berry-intl', 'Berry Smoothie', 'Beverages', 90, 2, 18, 1, 350, 'ml', NULL, false),
('smoothie-green-intl', 'Green Smoothie (Spinach+Banana)', 'Beverages', 70, 3, 14, 1, 350, 'ml', NULL, false),
('protein-smoothie-intl', 'Protein Smoothie (Whey+Banana)', 'Beverages', 140, 15, 18, 2, 350, 'ml', NULL, false),
('cold-pressed-juice-intl', 'Cold Pressed Juice (Orange)', 'Beverages', 45, 0.7, 10, 0.2, 250, 'ml', NULL, false),
('milk-tea-bubble-intl', 'Milk Tea (Bubble Tea Plain)', 'Beverages', 100, 2, 18, 3, 400, 'ml', NULL, false),

-- BAKERY ITEMS (more)
('donut-glazed-intl', 'Glazed Donut', 'Junk Food', 450, 5, 52, 25, 1, 'piece', 60, false),
('donut-chocolate-intl', 'Chocolate Donut', 'Junk Food', 470, 5, 50, 28, 1, 'piece', 60, false),
('danish-pastry-intl', 'Danish Pastry (Fruit)', 'Junk Food', 380, 5, 48, 19, 1, 'piece', 80, false),
('cinnamon-roll-intl', 'Cinnamon Roll', 'Junk Food', 420, 5, 55, 20, 1, 'piece', 90, false),
('muffin-blueberry-intl', 'Blueberry Muffin', 'Junk Food', 380, 5, 50, 18, 1, 'piece', 100, false),
('muffin-banana-intl', 'Banana Muffin', 'Junk Food', 370, 5, 48, 17, 1, 'piece', 90, false),
('cupcake-vanilla-intl', 'Vanilla Cupcake', 'Sweets & Desserts', 400, 4, 55, 18, 1, 'piece', 70, false),
('scone-plain-intl', 'Plain Scone', 'Junk Food', 350, 6, 50, 14, 1, 'piece', 70, false),
('baguette-intl', 'Baguette (100g)', 'Bread & Roti', 270, 9, 55, 1.5, 100, 'grams', NULL, false),
('focaccia-intl', 'Focaccia Bread', 'Bread & Roti', 280, 8, 40, 10, 1, 'piece', 80, false),
('pretzel-intl', 'Soft Pretzel', 'Junk Food', 340, 8, 68, 4, 1, 'piece', 100, false),

-- SAUCES / CONDIMENTS (more)
('sweet-chilli-sauce-intl', 'Sweet Chilli Sauce', 'Chinese', 150, 0.5, 35, 0.2, 15, 'grams', NULL, false),
('oyster-sauce-intl', 'Oyster Sauce', 'Chinese', 100, 2, 20, 0.5, 15, 'grams', NULL, false),
('fish-sauce-intl', 'Fish Sauce', 'Chinese', 35, 5, 4, 0, 10, 'ml', NULL, false),
('hoisin-sauce-intl', 'Hoisin Sauce', 'Chinese', 220, 3, 44, 3, 15, 'grams', NULL, false),
('worcestershire-intl', 'Worcestershire Sauce', 'Junk Food', 80, 0, 19, 0, 10, 'ml', NULL, false),
('english-mustard-intl', 'English Mustard', 'Junk Food', 150, 6, 8, 10, 5, 'grams', NULL, false),
('dijon-mustard-intl', 'Dijon Mustard', 'Junk Food', 160, 7, 6, 12, 10, 'grams', NULL, false),
('thai-sweet-chilli-intl', 'Thai Sweet Chilli Sauce', 'Chinese', 160, 0.5, 38, 0.2, 15, 'grams', NULL, false),

-- CHEESE
('parmesan-block-intl', 'Parmesan Cheese (Block)', 'Eggs & Dairy', 431, 38, 4, 29, 30, 'grams', NULL, false),
('feta-cheese-intl', 'Feta Cheese', 'Eggs & Dairy', 264, 14, 4, 21, 50, 'grams', NULL, false),
('brie-cheese-intl', 'Brie Cheese', 'Eggs & Dairy', 334, 21, 0.5, 28, 50, 'grams', NULL, false),
('gouda-cheese-intl', 'Gouda Cheese', 'Eggs & Dairy', 356, 25, 2, 28, 50, 'grams', NULL, false),
('blue-cheese-intl', 'Blue Cheese', 'Eggs & Dairy', 353, 21, 2.3, 29, 30, 'grams', NULL, false),
('ricotta-intl', 'Ricotta Cheese', 'Eggs & Dairy', 174, 11, 3, 13, 50, 'grams', NULL, false),
('swiss-cheese-intl', 'Swiss Cheese', 'Eggs & Dairy', 380, 27, 5.4, 28, 30, 'grams', NULL, false),
('cream-cheese-block-intl', 'Cream Cheese (Block)', 'Eggs & Dairy', 342, 6, 4, 34, 30, 'grams', NULL, false),

-- MORE SNACKS / CHIPS
('tortilla-chips-nacho-intl', 'Nacho Cheese Tortilla Chips (50g)', 'Snacks & Street Food', 470, 7, 58, 23, 50, 'grams', NULL, false),
('potato-chips-salted-intl', 'Salted Potato Chips (50g)', 'Junk Food', 540, 6, 50, 36, 50, 'grams', NULL, false),
('banana-chips-sweet-intl', 'Sweet Banana Chips (50g)', 'Snacks & Street Food', 510, 2, 55, 32, 50, 'grams', NULL, true),
('rice-crackers-intl', 'Rice Crackers (30g)', 'Snacks & Street Food', 380, 7, 82, 2, 30, 'grams', NULL, false),
('cheese-straws-intl', 'Cheese Straws (50g)', 'Snacks & Street Food', 480, 10, 45, 28, 50, 'grams', NULL, false),
('bread-sticks-intl', 'Bread Sticks / Grissini (30g)', 'Snacks & Street Food', 400, 10, 70, 8, 30, 'grams', NULL, false),

-- DIPS / SPREADS (more)
('cheese-spread-intl', 'Cheese Spread (Amul)', 'Eggs & Dairy', 280, 12, 6, 23, 20, 'grams', NULL, false),
('sour-cream-dip-intl', 'Sour Cream Dip', 'Junk Food', 200, 2.5, 5, 19, 30, 'grams', NULL, false),
('french-onion-dip-intl', 'French Onion Dip', 'Junk Food', 180, 2, 6, 17, 30, 'grams', NULL, false),
('avocado-spread-intl', 'Avocado Spread / Guac', 'Healthy & Fitness', 160, 2, 9, 15, 50, 'grams', NULL, false)

ON CONFLICT (id) DO NOTHING;
