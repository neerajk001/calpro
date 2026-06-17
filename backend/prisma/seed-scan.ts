import { prisma } from "../src/prisma.js";

async function main() {
  console.log("🌱 Seeding food aliases and portions...\n");

  // ─── FOOD ALIASES ───────────────────────────────────────────────────────────

  const aliasData: { foodName: string; aliases: string[] }[] = [
    { foodName: "Dal Masoor (Red Lentil)", aliases: ["Masoor Dal", "Red Lentil Dal", "Orange Lentil", "मसूर दाल"] },
    { foodName: "Dal Chana (Chickpea)", aliases: ["Chana Dal", "Chickpea Dal", "Bengal Gram Dal", "चना दाल", "Cholar Dal"] },
    { foodName: "Dal Moong (Green Lentil)", aliases: ["Moong Dal", "Green Lentil Dal", "Mung Dal", "मूंग दाल"] },
    { foodName: "Dal Toor (Arhar Dal)", aliases: ["Arhar Dal", "Toor Dal", "Pigeon Pea Lentil", "तूर दाल", "Dal Tadka", "Yellow Dal", "Dal Fry"] },
    { foodName: "Dal Urad (Black Lentil)", aliases: ["Urad Dal", "Black Lentil Dal", "Black Gram Dal", "उड़द दाल", "Dal Makhani"] },
    { foodName: "Rajma (Kidney Beans)", aliases: ["Kidney Beans", "Rajma Masala", "राजमा"] },
    { foodName: "Chole (Chickpea Curry)", aliases: ["Chole Bhature", "Chana Masala", "Chickpea Curry", "छोले", "Chole"] },
    { foodName: "Rice (White, Cooked)", aliases: ["Steamed Rice", "Plain Rice", "White Rice", "Cooked Rice", "चावल", "Basmati Rice", "Sona Masoori"] },
    { foodName: "Roti (Whole Wheat)", aliases: ["Chapati", "Roti", "Phulka", "रोटी", "Tandoori Roti", "Plain Roti", "Wheat Roti"] },
    { foodName: "Naan", aliases: ["Butter Naan", "Garlic Naan", "Plain Naan", "Tandoori Naan", "नान"] },
    { foodName: "Paratha (Plain)", aliases: ["Plain Paratha", "Tawa Paratha", "पराठा", "Plain Parantha"] },
    { foodName: "Egg (Boiled)", aliases: ["Boiled Egg", "Hard Boiled Egg", "उबला अंडा", "Whole Egg", "Egg"] },
    { foodName: "Egg (Fried)", aliases: ["Fried Egg", "Sunny Side Up", "Egg Fry", "Omelette", "Plain Omelette", "आमलेट"] },
    { foodName: "Egg Bhurji", aliases: ["Scrambled Egg", "Egg Bhurji", "Anda Bhurji", "अंडा भुर्जी"] },
    { foodName: "Idli", aliases: ["Steamed Idli", "Rice Cake", "Plain Idli", "इडली", "Idly"] },
    { foodName: "Dosa (Plain)", aliases: ["Plain Dosa", "Sada Dosa", "Crispy Dosa", "डोसा", "Masala Dosa"] },
    { foodName: "Chicken Curry", aliases: ["Chicken Gravy", "Chicken Masala", "चिकन करी", "Butter Chicken", "Murgh Makhani"] },
    { foodName: "Chicken Biryani", aliases: ["Biryani", "Chicken Dum Biryani", "Hyderabadi Biryani", "चिकन बिरयानी", "Mutton Biryani"] },
    { foodName: "Samosa", aliases: ["Aloo Samosa", "Potato Samosa", "समोसा", "Vegetable Samosa", "Punjabi Samosa"] },
    { foodName: "Pakora (Mixed Vegetable)", aliases: ["Pakoda", "Mixed Pakora", "Onion Pakora", "पकोड़ा", "Bhajiya", "Bhaji"] },
    { foodName: "Palak Paneer", aliases: ["Spinach Paneer", "Palak Paneer Curry", "पालक पनीर", "Saag Paneer"] },
    { foodName: "Paneer Butter Masala", aliases: ["Paneer Makhani", "Butter Paneer", "पनीर मखनी", "Shahi Paneer", "Kadai Paneer", "Matar Paneer"] },
    { foodName: "Aloo Gobi", aliases: ["Potato Cauliflower Curry", "Aloo Gobhi", "आलू गोभी"] },
    { foodName: "Gulab Jamun", aliases: ["Gulab Jamoon", "गुलाब जामुन", "Milk Ball Sweet"] },
    { foodName: "Lassi (Sweet)", aliases: ["Sweet Lassi", "Punjabi Lassi", "लस्सी"] },
    { foodName: "Tea (With Milk)", aliases: ["Chai", "Masala Chai", "Indian Tea", "चाय", "Milk Tea", "Ginger Tea"] },
    { foodName: "Curd (Plain)", aliases: ["Dahi", "Yogurt", "Plain Yogurt", "दही", "Curd"] },
    { foodName: "Khichdi", aliases: ["Dal Khichdi", "Rice Lentil Porridge", "खिचड़ी", "Moong Dal Khichdi"] },
    { foodName: "Upma", aliases: ["Rava Upma", "Suji Upma", "Semolina Upma", "उपमा"] },
    { foodName: "Poha", aliases: ["Flattened Rice", "Kanda Poha", "Batata Poha", "पोहा", "Indori Poha"] },
    { foodName: "Vada Pav", aliases: ["Vada Pao", "Bombay Burger", "वड़ा पाव", "Batata Vada"] },
    { foodName: "Bhel Puri", aliases: ["Bhel", "Mumbai Bhel", "भेल पूरी"] },
    { foodName: "Pani Puri", aliases: ["Golgappa", "Puchka", "Pani Poori", "पानी पूरी", "Gol Gappa"] },
    { foodName: "Paneer Tikka", aliases: ["Tandoori Paneer", "Grilled Paneer", "पनीर टिक्का"] },
    { foodName: "Fish Curry", aliases: ["Fish Masala", "Meen Curry", "मछली करी", "Fish Gravy"] },
    { foodName: "Buttermilk", aliases: ["Chaas", "Mattha", "छाछ", "Salted Lassi"] },
  ];

  for (const entry of aliasData) {
    const food = await prisma.food.findFirst({
      where: { name: { contains: entry.foodName.split(" (")[0], mode: "insensitive" } },
      select: { id: true, name: true },
    });

    if (!food) {
      console.log(`  ⚠ Food not found: ${entry.foodName}`);
      continue;
    }

    let created = 0;
    for (const alias of entry.aliases) {
      await prisma.foodAlias.upsert({
        where: { foodId_alias: { foodId: food.id, alias } },
        create: { foodId: food.id, alias },
        update: {},
      });
      created++;
    }
    console.log(`  ✅ ${food.name}: ${created} aliases`);
  }

  // ─── FOOD PORTIONS ──────────────────────────────────────────────────────────

  const portionData: { foodName: string; portions: { label: string; unit: string; grams: number; isDefault?: boolean }[] }[] = [
    {
      foodName: "Dal",
      portions: [
        { label: "½ katori (75g)", unit: "katori", grams: 75 },
        { label: "1 katori (150g)", unit: "katori", grams: 150, isDefault: true },
        { label: "1.5 katori (225g)", unit: "katori", grams: 225 },
        { label: "2 katori (300g)", unit: "katori", grams: 300 },
      ],
    },
    {
      foodName: "Rice",
      portions: [
        { label: "½ plate (150g)", unit: "plate", grams: 150 },
        { label: "1 plate (300g)", unit: "plate", grams: 300, isDefault: true },
        { label: "1.5 plate (450g)", unit: "plate", grams: 450 },
        { label: "2 plates (600g)", unit: "plate", grams: 600 },
      ],
    },
    {
      foodName: "Roti",
      portions: [
        { label: "1 roti (40g)", unit: "piece", grams: 40, isDefault: true },
        { label: "2 rotis (80g)", unit: "piece", grams: 80 },
        { label: "3 rotis (120g)", unit: "piece", grams: 120 },
        { label: "4 rotis (160g)", unit: "piece", grams: 160 },
      ],
    },
    {
      foodName: "Egg",
      portions: [
        { label: "1 egg (50g)", unit: "piece", grams: 50, isDefault: true },
        { label: "2 eggs (100g)", unit: "piece", grams: 100 },
        { label: "3 eggs (150g)", unit: "piece", grams: 150 },
        { label: "4 eggs (200g)", unit: "piece", grams: 200 },
      ],
    },
    {
      foodName: "Chicken",
      portions: [
        { label: "Small (100g)", unit: "grams", grams: 100 },
        { label: "Medium (200g)", unit: "grams", grams: 200, isDefault: true },
        { label: "Large (350g)", unit: "grams", grams: 350 },
      ],
    },
  ];

  for (const entry of portionData) {
    const foods = await prisma.food.findMany({
      where: { name: { contains: entry.foodName, mode: "insensitive" } },
      select: { id: true, name: true },
    });

    for (const food of foods) {
      // Skip if already seeded
      const existing = await prisma.foodPortion.findFirst({ where: { foodId: food.id } });
      if (existing) continue;

      let order = 0;
      for (const p of entry.portions) {
        await prisma.foodPortion.create({
          data: {
            foodId: food.id,
            label: p.label,
            unit: p.unit,
            grams: p.grams,
            sortOrder: order++,
            isDefault: p.isDefault ?? false,
          },
        });
      }
      console.log(`  ✅ ${food.name}: ${entry.portions.length} portions`);
    }
  }

  console.log("\n🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
