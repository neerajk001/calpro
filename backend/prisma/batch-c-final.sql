INSERT INTO "Food" (id, name, category, "caloriesPer100g", "proteinPer100g", "carbsPer100g", "fatPer100g", "defaultQty", "quantityMode", "gramsPerPiece", "isIndian")
VALUES
-- ==================== CURRIES (MORE) ====================
('aloo-matar', 'Aloo Matar (Potato & Peas)', 'Indian Dishes', 95, 3, 14, 3.5, 200, 'grams', NULL, true),
('aloo-shimla', 'Aloo Shimla Mirch', 'Indian Dishes', 80, 2.5, 12, 3, 200, 'grams', NULL, true),
('aloo-jeera', 'Aloo Jeera (Cumin Potato)', 'Indian Dishes', 90, 2.5, 14, 3, 200, 'grams', NULL, true),
('aloo-palak', 'Aloo Palak (Potato Spinach)', 'Indian Dishes', 70, 3, 10, 2.5, 200, 'grams', NULL, true), -- corrected id
('mushroom-matar', 'Mushroom Matar', 'Indian Dishes', 65, 3, 7, 3, 200, 'grams', NULL, true), -- corrected id
('mushroom-do-pyaza', 'Mushroom Do Pyaza', 'Indian Dishes', 70, 3.5, 7, 3.5, 200, 'grams', NULL, true),
('baby-corn-masala', 'Baby Corn Masala', 'Indian Dishes', 80, 2.5, 10, 3.5, 200, 'grams', NULL, true),

-- ==================== DAL (more variants) ====================
('dal-tadka', 'Dal Tadka (Tempered Lentils)', 'Dal & Legumes', 140, 8, 18, 5, 200, 'grams', NULL, true),
('chana-dal-fry', 'Chana Dal Fry', 'Dal & Legumes', 160, 9, 22, 5, 200, 'grams', NULL, true),
('moong-dal-halwa-dish', 'Moong Dal Halwa (Dessert)', 'Sweets & Desserts', 350, 8, 42, 18, 100, 'grams', NULL, true),

-- ==================== CHICKEN (more) ====================
('chicken-saagwala', 'Chicken Saagwala', 'Indian Dishes', 135, 16, 5, 6, 200, 'grams', NULL, true),
('chicken-changezi', 'Chicken Changezi', 'Indian Dishes', 190, 20, 6, 10, 200, 'grams', NULL, true),
('chicken-rola', 'Chicken Rola (Home Style)', 'Indian Dishes', 145, 18, 4, 7, 200, 'grams', NULL, true),
('chicken-curry-kerala', 'Kerala Chicken Curry', 'Indian Dishes', 155, 17, 5, 8, 200, 'grams', NULL, true),
('chicken-chettinad', 'Chicken Chettinad', 'Indian Dishes', 170, 20, 5, 8, 200, 'grams', NULL, true),

-- ==================== MUTTON (more) ====================
('mutton-rogan-josh', 'Mutton Rogan Josh', 'Indian Dishes', 190, 18, 4, 12, 200, 'grams', NULL, true),
('mutton-korma', 'Mutton Korma', 'Indian Dishes', 210, 16, 5, 14, 200, 'grams', NULL, true),
('mutton-biryani', 'Mutton Biryani', 'Indian Dishes', 220, 16, 24, 7, 300, 'grams', NULL, true),

-- ==================== FISH (more) ====================
('fish-curry-bengali', 'Bengali Fish Curry (Jhol)', 'Indian Dishes', 120, 16, 4, 5, 200, 'grams', NULL, true),
('fish-curry-kerala', 'Kerala Fish Curry (Meen)', 'Indian Dishes', 135, 17, 4, 6, 200, 'grams', NULL, true),
('fish-masala-fry', 'Fish Masala Fry', 'Fish & Seafood', 170, 20, 5, 8, 150, 'grams', NULL, true),
('prawn-masala', 'Prawn Masala', 'Fish & Seafood', 140, 18, 4, 6, 150, 'grams', NULL, true),

-- ==================== EGG (more) ====================
('egg-fried-rice', 'Egg Fried Rice', 'Chinese', 175, 8, 26, 5, 250, 'grams', NULL, true),
('egg-noodles', 'Egg Noodles', 'Chinese', 160, 7, 22, 5, 250, 'grams', NULL, true),

-- ==================== MORE SNACKS ====================
('corn-chaat', 'Corn Chaat', 'Snacks & Street Food', 120, 4, 20, 3, 150, 'grams', NULL, true),
('aloo-chaat', 'Aloo Chaat', 'Snacks & Street Food', 140, 3, 22, 5, 150, 'grams', NULL, true),
('fruit-chaat', 'Fruit Chaat', 'Snacks & Street Food', 80, 1, 18, 0.5, 200, 'grams', NULL, true),
('katori-chaat', 'Katori Chaat', 'Snacks & Street Food', 170, 5, 24, 6, 1, 'piece', 60, true),
('samosa-chaat', 'Samosa Chaat', 'Snacks & Street Food', 250, 6, 30, 12, 1, 'piece', 120, true),
('kachori-chaat', 'Kachori Chaat', 'Snacks & Street Food', 280, 7, 35, 13, 1, 'piece', 130, true),

-- ==================== MOMOS (more) ====================
('momos-fried-veg', 'Veg Fried Momos', 'Chinese', 210, 6, 28, 8, 6, 'piece', 25, true),
('momos-fried-chicken', 'Chicken Fried Momos', 'Chinese', 230, 12, 22, 10, 6, 'piece', 25, true),
('momos-paneer', 'Paneer Momos', 'Chinese', 190, 8, 24, 7, 6, 'piece', 28, true),
('momos-tandoori', 'Tandoori Momos', 'Chinese', 195, 9, 22, 8, 6, 'piece', 28, true),

-- ==================== PAKODA (more) ====================
('paneer-pakoda', 'Paneer Pakoda', 'Snacks & Street Food', 290, 9, 18, 20, 100, 'grams', NULL, true),
('mirchi-pakoda', 'Mirchi Pakoda', 'Snacks & Street Food', 230, 3, 20, 15, 2, 'piece', 40, true),
('gobi-pakoda', 'Gobi Pakoda', 'Snacks & Street Food', 210, 4, 22, 12, 100, 'grams', NULL, true),
('bread-pakoda', 'Bread Pakoda', 'Snacks & Street Food', 260, 6, 28, 14, 1, 'piece', 60, true),

-- ==================== DOSA (more) ====================
('onion-dosa', 'Onion Dosa', 'Indian Dishes', 185, 5, 28, 6, 1, 'piece', 80, true),
('paper-dosa', 'Paper Dosa', 'Indian Dishes', 170, 4, 30, 3, 1, 'piece', 60, true),
('cheese-dosa', 'Cheese Dosa', 'Indian Dishes', 220, 7, 28, 8, 1, 'piece', 100, true),
('podi-dosa', 'Podi Dosa (Gunpowder)', 'Indian Dishes', 190, 5, 26, 7, 1, 'piece', 80, true),
('egg-dosa', 'Egg Dosa', 'Indian Dishes', 210, 8, 26, 8, 1, 'piece', 100, true),

-- ==================== IDLI (more) ====================
('rava-idli', 'Rava Idli', 'Indian Dishes', 150, 4, 26, 3, 3, 'piece', 35, true),
('oats-idli', 'Oats Idli', 'Indian Dishes', 130, 5, 22, 2.5, 3, 'piece', 35, true),
('kanchipuram-idli', 'Kanchipuram Idli', 'Indian Dishes', 160, 5, 27, 3.5, 2, 'piece', 50, true),

-- ==================== UTTAPAM (more) ====================
('onion-uttapam', 'Onion Uttapam', 'Indian Dishes', 170, 5, 28, 4, 1, 'piece', 100, true),
('tomato-uttapam', 'Tomato Uttapam', 'Indian Dishes', 165, 5, 27, 4, 1, 'piece', 100, true),
('mixed-veg-uttapam', 'Mixed Veg Uttapam', 'Indian Dishes', 175, 5, 28, 4.5, 1, 'piece', 110, true),

-- ==================== MORE BREADS ====================
('garlic-naan', 'Garlic Naan', 'Bread & Roti', 325, 9, 52, 10, 1, 'piece', 90, true),
('cheese-naan', 'Cheese Naan', 'Bread & Roti', 350, 11, 48, 13, 1, 'piece', 100, true),
('stuffed-naan', 'Stuffed Naan (Aloo/Paneer)', 'Bread & Roti', 310, 10, 48, 10, 1, 'piece', 120, true),

-- ==================== MORE ROTI ====================
('bajra-roti', 'Bajra Roti (Pearl Millet)', 'Bread & Roti', 260, 8, 48, 4, 1, 'piece', 50, true),
('jowar-roti', 'Jowar Roti (Sorghum)', 'Bread & Roti', 250, 7, 50, 2.5, 1, 'piece', 50, true),

-- ==================== MORE RICE ====================
('matar-pulao', 'Matar Pulao', 'Rice & Grains', 155, 5, 28, 3, 250, 'grams', NULL, true),
('kashmiri-pulao', 'Kashmiri Pulao', 'Rice & Grains', 180, 6, 32, 4, 250, 'grams', NULL, true),
('peas-pulao', 'Peas Pulao', 'Rice & Grains', 150, 4.5, 27, 3, 250, 'grams', NULL, true),

-- ==================== CURD / RAITA (more) ====================
('pineapple-raita', 'Pineapple Raita', 'Indian Dishes', 75, 2.5, 12, 2, 100, 'grams', NULL, true),
('onion-raita', 'Onion Raita', 'Indian Dishes', 55, 2, 6, 2.5, 100, 'grams', NULL, true),
('mix-veg-raita', 'Mix Veg Raita', 'Indian Dishes', 60, 2.5, 7, 2.5, 100, 'grams', NULL, true),

-- ==================== DRINKS (more) ====================
('salted-lassi', 'Salted Lassi', 'Beverages', 60, 3.5, 8, 2, 300, 'ml', NULL, true),
('rose-milk', 'Rose Milk', 'Beverages', 90, 2, 16, 2, 250, 'ml', NULL, true),
('khus-sharbat', 'Khus Sharbat', 'Beverages', 55, 0.2, 13, 0.1, 250, 'ml', NULL, true),
('kokum-sharbat', 'Kokum Sharbat', 'Beverages', 45, 0.3, 11, 0.2, 250, 'ml', NULL, true),

-- ==================== SWEETS (even more) ====================
('kulfi', 'Kulfi (Indian Ice Cream)', 'Sweets & Desserts', 210, 5, 24, 10, 1, 'piece', 60, true),
('falooda', 'Falooda', 'Beverages', 160, 4, 28, 4, 300, 'ml', NULL, true),
('double-ka-meetha', 'Double ka Meetha (Hyderabadi)', 'Sweets & Desserts', 330, 6, 42, 16, 1, 'piece', 100, true),
('shahi-tukda', 'Shahi Tukda', 'Sweets & Desserts', 340, 6, 40, 18, 1, 'piece', 90, true),
('rabri', 'Rabri (Thickened Sweet Milk)', 'Sweets & Desserts', 290, 6, 28, 17, 100, 'grams', NULL, true),

-- ==================== KHEER VARIETIES ====================
('rice-kheer', 'Rice Kheer', 'Sweets & Desserts', 141, 3.5, 24, 4, 150, 'grams', NULL, true),
('sabudana-kheer', 'Sabudana Kheer', 'Sweets & Desserts', 155, 2, 32, 2.5, 150, 'grams', NULL, true),
('dal-kheer', 'Dal Kheer (Lentil Pudding)', 'Sweets & Desserts', 165, 6, 28, 3.5, 150, 'grams', NULL, true),

-- ==================== STUFFED VEGETABLES ====================
('bharwa-baingan', 'Bharwa Baingan (Stuffed Eggplant)', 'Indian Dishes', 95, 3, 9, 5, 2, 'piece', 80, true),
('bharwa-karela', 'Bharwa Karela (Stuffed Bitter Gourd)', 'Indian Dishes', 80, 3, 8, 4, 2, 'piece', 60, true),
('bharwa-tomato', 'Bharwa Tomato', 'Indian Dishes', 65, 2, 7, 3.5, 2, 'piece', 80, true),

-- ==================== WRAPS / ROLLS ====================
('paneer-roll', 'Paneer Roll (Frankie)', 'Indian Dishes', 280, 12, 32, 12, 1, 'piece', 150, true),
('chicken-roll', 'Chicken Roll (Frankie)', 'Indian Dishes', 300, 16, 30, 13, 1, 'piece', 150, true),
('egg-roll', 'Egg Roll (Frankie)', 'Indian Dishes', 270, 10, 30, 12, 1, 'piece', 140, true),
('kathi-roll', 'Kathi Roll', 'Indian Dishes', 290, 14, 30, 13, 1, 'piece', 150, true),

-- ==================== MORE INDO-CHINESE ====================
('gobi-manchurian', 'Gobi Manchurian', 'Chinese', 130, 3, 14, 7, 200, 'grams', NULL, true),
('veg-manchurian-dry', 'Veg Manchurian (Dry)', 'Chinese', 150, 4, 16, 8, 200, 'grams', NULL, true),
('chicken-lollipop', 'Chicken Lollipop', 'Chinese', 240, 16, 12, 14, 4, 'piece', 30, true),
('honey-chilli-potato', 'Honey Chilli Potato', 'Chinese', 170, 2, 28, 6, 150, 'grams', NULL, true),
('veg-triple-schezwan', 'Veg Triple Schezwan Rice', 'Chinese', 180, 5, 28, 6, 300, 'grams', NULL, true),

-- ==================== GREEN VEG (quick add) ====================
('cucumber-raw', 'Cucumber / Kheera (Raw)', 'Vegetables', 16, 0.7, 3.6, 0.1, 100, 'grams', NULL, true),
('lettuce-raw', 'Lettuce (Iceberg)', 'Vegetables', 14, 0.9, 3, 0.1, 100, 'grams', NULL, false),
('cherry-tomato', 'Cherry Tomato', 'Vegetables', 18, 0.8, 3.9, 0.2, 10, 'piece', 15, true),
('pak-choy', 'Pak Choy / Bok Choy', 'Vegetables', 13, 1.5, 2.2, 0.2, 150, 'grams', NULL, false),
('asparagus', 'Asparagus', 'Vegetables', 20, 2.2, 3.9, 0.1, 100, 'grams', NULL, false),
('celery', 'Celery', 'Vegetables', 16, 0.7, 3, 0.2, 50, 'grams', NULL, false),
('leek', 'Leek', 'Vegetables', 30, 1.5, 6.7, 0.3, 100, 'grams', NULL, false),
('red-cabbage', 'Red Cabbage', 'Vegetables', 31, 1.4, 7.4, 0.2, 150, 'grams', NULL, false),

-- ==================== FROZEN / INSTANT ====================
('french-fries-frozen', 'French Fries (Frozen)', 'Junk Food', 150, 2, 23, 5, 100, 'grams', NULL, false),
('nuggets-chicken', 'Chicken Nuggets (Frozen)', 'Junk Food', 260, 14, 16, 16, 6, 'piece', 20, false),
('fish-fingers', 'Fish Fingers (Frozen)', 'Junk Food', 230, 13, 18, 13, 4, 'piece', 28, false),
('veg-burger-patty', 'Veg Burger Patty (Frozen)', 'Junk Food', 180, 10, 20, 8, 1, 'piece', 70, false),

-- ==================== SPROUTS ====================
('mixed-sprouts', 'Mixed Sprouts (Raw)', 'Dal & Legumes', 45, 4, 8, 0.4, 100, 'grams', NULL, true),
('moth-sprouts', 'Moth Bean Sprouts', 'Dal & Legumes', 42, 4.5, 7.5, 0.3, 100, 'grams', NULL, true),

-- ==================== WRAPPED ====================
('roti-wrap-paneer', 'Paneer Wrap', 'Indian Dishes', 260, 12, 30, 10, 1, 'piece', 150, true),
('roti-wrap-chicken', 'Chicken Wrap', 'Indian Dishes', 280, 16, 28, 11, 1, 'piece', 150, true),
('roti-wrap-egg', 'Egg Wrap', 'Indian Dishes', 250, 10, 28, 10, 1, 'piece', 140, true)

ON CONFLICT (id) DO NOTHING;
