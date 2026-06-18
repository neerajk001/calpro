INSERT INTO "Food" (id, name, category, "caloriesPer100g", "proteinPer100g", "carbsPer100g", "fatPer100g", "defaultQty", "quantityMode", "gramsPerPiece", "isIndian")
VALUES
  ('medu-vada',          'Medu Vada',                       'Indian Dishes', 198, 8.5, 26, 7.5,  2,  'piece', 50,  true),
  ('pesarattu',          'Pesarattu (Green Gram Dosa)',      'Indian Dishes', 145, 7,   24, 3,    1,  'piece', 80,  true),
  ('appam',              'Appam (Fermented Rice Pancake)',   'Indian Dishes', 135, 2.5, 28, 2,    2,  'piece', 60,  true),
  ('ven-pongal',         'Ven Pongal (Rice & Lentil)',      'Indian Dishes', 120, 4,   20, 3,    250,'grams',  NULL, true),
  ('lemon-rice',         'Lemon Rice / Chitranna',           'Indian Dishes', 145, 3,   26, 3.5,  200,'grams',  NULL, true),
  ('curd-rice',          'Curd Rice / Thayir Sadam',         'Indian Dishes', 95,  3,   16, 2,    200,'grams',  NULL, true),
  ('set-dosa',           'Set Dosa (Thick & Soft)',          'Indian Dishes', 165, 4,   32, 2.5,  2,  'piece', 60,  true),
  ('rava-dosa',          'Rava Dosa (Semolina Crispy)',      'Indian Dishes', 175, 4.5, 28, 5,    1,  'piece', 80,  true),
  ('aloo-gobi',          'Aloo Gobi (Potato & Cauliflower)', 'Indian Dishes', 85,  2.5, 14, 2.5,  200,'grams',  NULL, true),
  ('baingan-bharta',     'Baingan Bharta (Roasted Eggplant)','Indian Dishes', 65,  2,   8,  3,    200,'grams',  NULL, true),
  ('bhindi-masala',      'Bhindi Masala (Okra Stir-fry)',    'Indian Dishes', 80,  2.5, 8,  4.5,  150,'grams',  NULL, true),
  ('dum-aloo',           'Dum Aloo (Baby Potatoes in Gravy)', 'Indian Dishes', 105, 3,  16, 3.5,  200,'grams',  NULL, true),
  ('malai-kofta',        'Malai Kofta (Creamy Veg Balls)',   'Indian Dishes', 185, 7,  14, 12,   200,'grams',  NULL, true),
  ('methi-malai-matar',  'Methi Malai Matar (Fenugreek Peas)','Indian Dishes',110,  5,  10, 6,    200,'grams',  NULL, true)
ON CONFLICT (id) DO NOTHING;
