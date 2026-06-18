INSERT INTO "Food" (id, name, category, "caloriesPer100g", "proteinPer100g", "carbsPer100g", "fatPer100g", "defaultQty", "quantityMode", "gramsPerPiece", "isIndian")
VALUES
-- ==================== REGIONAL DISHES (more) ====================
('pithla-bhakri', 'Pithla Bhakri (Maharashtrian)', 'Indian Dishes', 155, 7, 22, 4.5, 1, 'serving', 300, true),
('puran-poli-dish', 'Puran Poli (Maharashtrian)', 'Indian Dishes', 300, 8, 55, 6, 1, 'piece', 80, true),
('thalipeeth', 'Thalipeeth (Multigrain Pancake)', 'Indian Dishes', 220, 8, 38, 5, 1, 'piece', 70, true),
('kothimbir-vadi', 'Kothimbir Vadi (Coriander Cake)', 'Snacks & Street Food', 180, 5, 18, 10, 3, 'piece', 30, true),
('sabudana-vada', 'Sabudana Vada', 'Snacks & Street Food', 230, 4, 35, 9, 2, 'piece', 40, true),
('batata-vada', 'Batata Vada', 'Snacks & Street Food', 210, 4, 28, 10, 1, 'piece', 80, true),
('misal', 'Misal (Spiced Sprouts)', 'Indian Dishes', 160, 7, 25, 5, 1, 'serving', 300, true),
('khandvi', 'Khandvi (Gram Flour Rolls)', 'Snacks & Street Food', 130, 4, 20, 4, 4, 'piece', 25, true),
('dhokla-dish', 'Dhokla (Steamed)', 'Snacks & Street Food', 160, 7, 28, 3, 3, 'piece', 40, true),
('patra', 'Patra / Alu Vadi', 'Snacks & Street Food', 175, 4, 22, 8, 3, 'piece', 35, true),
('chakli', 'Chakli / Murukku', 'Snacks & Street Food', 480, 8, 48, 28, 2, 'piece', 15, true),
('shankarpali', 'Shankarpali (Sweet Diamond Cuts)', 'Sweets & Desserts', 440, 6, 55, 22, 50, 'grams', NULL, true),
('chivda', 'Chivda / Poha Mixture', 'Snacks & Street Food', 450, 8, 50, 24, 50, 'grams', NULL, true),
('bhakarwadi', 'Bhakarwadi', 'Snacks & Street Food', 460, 7, 42, 30, 3, 'piece', 20, true),
('kharabath', 'Khara Bath (Upma)', 'Indian Dishes', 135, 4, 23, 3, 200, 'grams', NULL, true),
('kesari-bath', 'Kesari Bath (Saffron Semolina)', 'Sweets & Desserts', 280, 5, 45, 9, 150, 'grams', NULL, true),
('bisi-bele-bath-dish', 'Bisi Bele Bath', 'Indian Dishes', 135, 5, 22, 3.5, 300, 'grams', NULL, true),
('neer-dosa', 'Neer Dosa (Water Dosa)', 'Indian Dishes', 155, 3.5, 30, 2.5, 2, 'piece', 50, true),
('akki-roti', 'Akki Roti (Rice Flour Roti)', 'Bread & Roti', 280, 5, 55, 4, 1, 'piece', 70, true),
('ragi-mudde', 'Ragi Mudde (Finger Millet Ball)', 'Indian Dishes', 160, 4, 32, 1.5, 2, 'piece', 80, true),

-- ==================== DAL VARIETIES ====================
('dal-fry', 'Dal Fry', 'Dal & Legumes', 140, 8, 18, 5, 200, 'grams', NULL, true),
('dal-palak', 'Dal Palak (Lentil & Spinach)', 'Dal & Legumes', 110, 7, 14, 3.5, 200, 'grams', NULL, true),
('amti-dal', 'Amti Dal (Maharashtrian)', 'Dal & Legumes', 125, 6, 15, 4.5, 200, 'grams', NULL, true),
('panchmel-dal', 'Panchmel Dal (Rajasthani)', 'Dal & Legumes', 135, 8, 17, 4, 200, 'grams', NULL, true),
('sambar', 'Sambar (South Indian)', 'Indian Dishes', 50, 3, 8, 1, 200, 'ml', NULL, true),

-- ==================== KEBABS & GRILL ====================
('chicken-seekh-kebab', 'Chicken Seekh Kebab', 'Chicken & Meat', 180, 20, 5, 10, 2, 'piece', 50, true),
('mutton-seekh-kebab', 'Mutton Seekh Kebab', 'Chicken & Meat', 200, 18, 4, 13, 2, 'piece', 50, true),
('fish-tikka', 'Fish Tikka', 'Fish & Seafood', 140, 20, 3, 5, 150, 'grams', NULL, true),
('chicken-malai-tikka', 'Chicken Malai Tikka', 'Chicken & Meat', 180, 22, 4, 9, 150, 'grams', NULL, true),
('reshmi-kebab', 'Reshmi Kebab', 'Chicken & Meat', 190, 21, 4, 10, 2, 'piece', 50, true),

-- ==================== VEGETARIAN (more) ====================
('mix-veg-sabzi', 'Mix Vegetable Sabzi', 'Vegetables', 75, 3, 10, 3, 200, 'grams', NULL, true),
('stuffed-capsicum', 'Stuffed Capsicum / Bharwa Shimla', 'Indian Dishes', 95, 3, 10, 5, 1, 'piece', 120, true),
('vegetable-jalfrezi', 'Vegetable Jalfrezi', 'Indian Dishes', 85, 3, 10, 4, 200, 'grams', NULL, true),
('navratan-korma', 'Navratan Korma (Nine Gem)', 'Indian Dishes', 155, 5, 12, 10, 200, 'grams', NULL, true),
('veg-makhanwala', 'Veg Makhanwala', 'Indian Dishes', 160, 5, 10, 12, 200, 'grams', NULL, true),

-- ==================== CURRY RICE COMBOS ====================
('dal-chawal', 'Dal Chawal (Simple Meal)', 'Indian Dishes', 120, 5, 22, 2, 350, 'grams', NULL, true),
('curd-rice-dish', 'Curd Rice (Thayir Sadam)', 'Indian Dishes', 95, 3, 16, 2, 300, 'grams', NULL, true),
('tomato-rice', 'Tomato Rice', 'Rice & Grains', 140, 3, 25, 3.5, 200, 'grams', NULL, true),
('coconut-rice', 'Coconut Rice', 'Rice & Grains', 165, 3, 24, 6, 200, 'grams', NULL, true),
('bisi-bele-bath-combo', 'Bisi Bele Bath (Combo)', 'Indian Dishes', 140, 6, 24, 3, 350, 'grams', NULL, true),

-- ==================== PARATHA (more) ====================
('egg-paratha', 'Egg Paratha', 'Bread & Roti', 280, 10, 35, 12, 1, 'piece', 120, true),
('chicken-keema-paratha', 'Chicken Keema Paratha', 'Bread & Roti', 290, 14, 32, 12, 1, 'piece', 130, true),

-- ==================== SANDWICHES (more) ====================
('bombay-sandwich', 'Bombay Masala Sandwich', 'Sandwiches', 190, 5, 24, 8, 1, 'piece', 150, true),
('veg-cheese-sandwich', 'Veg Cheese Grilled Sandwich', 'Sandwiches', 210, 7, 22, 10, 1, 'piece', 150, true),
('egg-sandwich', 'Egg Sandwich', 'Sandwiches', 200, 9, 18, 10, 1, 'piece', 150, true),
('chicken-sandwich', 'Chicken Sandwich', 'Sandwiches', 230, 13, 20, 11, 1, 'piece', 170, true),

-- ==================== NOODLES / PASTA ====================
('veg-chowmein', 'Veg Chowmein', 'Chinese', 145, 4, 24, 4, 250, 'grams', NULL, true),
('chicken-chowmein', 'Chicken Chowmein', 'Chinese', 165, 9, 22, 5, 250, 'grams', NULL, true),
('white-sauce-pasta', 'White Sauce Pasta', 'Junk Food', 190, 6, 26, 7, 250, 'grams', NULL, false),
('red-sauce-pasta', 'Red Sauce Pasta', 'Junk Food', 160, 5, 28, 3.5, 250, 'grams', NULL, false),
('schezwan-noodles', 'Schezwan Noodles', 'Chinese', 170, 5, 24, 6, 250, 'grams', NULL, true),

-- ==================== BIRYANI VARIETIES ====================
('veg-biryani', 'Veg Biryani', 'Indian Dishes', 155, 4.5, 26, 4, 300, 'grams', NULL, true),
('egg-biryani', 'Egg Biryani', 'Indian Dishes', 175, 9, 24, 5, 300, 'grams', NULL, true),
('prawn-biryani', 'Prawn Biryani', 'Indian Dishes', 185, 14, 22, 6, 300, 'grams', NULL, true),
('mutton-dum-biryani', 'Mutton Dum Biryani', 'Indian Dishes', 210, 16, 24, 7, 300, 'grams', NULL, true),

-- ==================== KEBABS & TIKKA (more) ====================
('hariyali-kebab', 'Hariyali Kebab (Green Herb)', 'Chicken & Meat', 170, 20, 4, 9, 2, 'piece', 50, true),
('galouti-kebab', 'Galouti Kebab', 'Chicken & Meat', 195, 16, 3, 14, 2, 'piece', 45, true),
('shami-kebab', 'Shami Kebab', 'Chicken & Meat', 200, 14, 5, 12, 2, 'piece', 45, true),
('dahi-kebab', 'Dahi Kebab (Yogurt)', 'Chicken & Meat', 160, 10, 8, 10, 2, 'piece', 50, true),

-- ==================== MORE SNACKS ====================
('maddur-vada', 'Maddur Vada', 'Snacks & Street Food', 240, 5, 28, 12, 2, 'piece', 35, true),
('banana-chips', 'Banana Chips (Fried)', 'Snacks & Street Food', 520, 2, 50, 34, 30, 'grams', NULL, true),
('tapioca-chips', 'Tapioca Chips (Fried)', 'Snacks & Street Food', 500, 1, 55, 30, 30, 'grams', NULL, true),
('sakkarai-poni', 'Sakkarai Poni (Sweet Puffed Rice)', 'Sweets & Desserts', 400, 3, 70, 12, 50, 'grams', NULL, true),

-- ==================== SWEETS (more) ====================
('badaam-halwa', 'Badaam Halwa (Almond)', 'Sweets & Desserts', 380, 8, 40, 22, 100, 'grams', NULL, true),
('pumpkin-halwa', 'Pumpkin Halwa / Kaddu Halwa', 'Sweets & Desserts', 220, 2, 38, 8, 100, 'grams', NULL, true),
('doodhi-halwa', 'Doodhi Halwa (Bottle Gourd)', 'Sweets & Desserts', 200, 3, 35, 7, 100, 'grams', NULL, true),
('imarti', 'Imarti / Jhangri', 'Sweets & Desserts', 400, 3, 60, 16, 1, 'piece', 40, true),
('moti-choor-ladoo', 'Moti Choor Ladoo', 'Sweets & Desserts', 440, 6, 55, 22, 1, 'piece', 40, true),
('coconut-ladoo', 'Coconut Ladoo', 'Sweets & Desserts', 380, 4, 42, 22, 1, 'piece', 30, true),
('til-ladoo', 'Til Ladoo (Sesame)', 'Sweets & Desserts', 460, 10, 38, 30, 1, 'piece', 30, true),
('chikki', 'Chikki (Peanut Brittle)', 'Sweets & Desserts', 500, 12, 42, 32, 1, 'piece', 20, true),

-- ==================== CHUTNEY / DIP ====================
('tomato-chutney', 'Tomato Chutney', 'Indian Dishes', 55, 1, 8, 2, 30, 'grams', NULL, true),
('raw-mango-chutney', 'Raw Mango Chutney', 'Indian Dishes', 50, 0.5, 11, 0.5, 30, 'grams', NULL, true),
('garlic-chutney', 'Garlic Chutney', 'Indian Dishes', 80, 3, 10, 3, 20, 'grams', NULL, true),
('onion-chutney', 'Onion Chutney', 'Indian Dishes', 55, 1.5, 8, 2, 30, 'grams', NULL, true),

-- ==================== JUICES ====================
('watermelon-juice', 'Watermelon Juice', 'Beverages', 30, 0.6, 7.6, 0.2, 300, 'ml', NULL, true),
('pineapple-juice', 'Pineapple Juice', 'Beverages', 50, 0.5, 13, 0.1, 250, 'ml', NULL, true),
('pomegranate-juice', 'Pomegranate Juice', 'Beverages', 65, 0.2, 16, 0.3, 250, 'ml', NULL, true),
('carrot-juice', 'Carrot Juice', 'Beverages', 35, 0.8, 8, 0.2, 250, 'ml', NULL, true),
('mixed-fruit-juice', 'Mixed Fruit Juice', 'Beverages', 55, 0.5, 13, 0.2, 250, 'ml', NULL, true),

-- ==================== FERMENTED / PICKLED ====================
('idli-batter', 'Idli Batter (Raw)', 'Indian Dishes', 130, 4, 27, 1, 100, 'grams', NULL, true),
('dosa-batter', 'Dosa Batter (Raw)', 'Indian Dishes', 120, 3.5, 25, 1, 100, 'grams', NULL, true),
('kimchi', 'Kimchi (Korean Pickle)', 'Vegetables', 15, 1.1, 2.4, 0.5, 50, 'grams', NULL, false),

-- ==================== FLOUR BASED ====================
('bhatura-dough', 'Bhatura Dough (Raw)', 'Bread & Roti', 240, 6, 38, 8, 50, 'grams', NULL, true),
('pizza-base', 'Pizza Base (Plain)', 'Junk Food', 260, 8, 48, 4, 1, 'piece', 150, false),
('burger-bun', 'Burger Bun', 'Junk Food', 280, 8, 50, 5, 1, 'piece', 60, false),

-- ==================== PANEER (more) ====================
('paneer-raw', 'Paneer (Raw Blocks)', 'Indian Dishes', 265, 18, 3, 20, 100, 'grams', NULL, true),
('tofu-silken', 'Silken Tofu', 'Healthy & Fitness', 55, 5, 2.5, 2.7, 150, 'grams', NULL, false),

-- ==================== RAMEN / SOUP ====================
('ramen-veg', 'Veg Ramen', 'Chinese', 110, 4, 16, 3.5, 400, 'ml', NULL, false),
('shrimp-ramen', 'Shrimp Ramen', 'Chinese', 130, 8, 16, 3.5, 400, 'ml', NULL, false)

ON CONFLICT (id) DO NOTHING;
