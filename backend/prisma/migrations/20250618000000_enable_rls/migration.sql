-- Enable Row Level Security on all user-owned tables
-- Each user can only access their own records
-- The userId is stored as a UUID string matching the User.id

-- ═══════════════════════════════════════════════════════════════
-- User table (parent)
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON "User"
  FOR SELECT
  USING (id = current_setting('app.current_user_id', true));

-- ═══════════════════════════════════════════════════════════════
-- Settings
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE "Settings" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own settings"
  ON "Settings" FOR SELECT
  USING ("userId" = current_setting('app.current_user_id', true));

CREATE POLICY "Users can insert own settings"
  ON "Settings" FOR INSERT
  WITH CHECK ("userId" = current_setting('app.current_user_id', true));

CREATE POLICY "Users can update own settings"
  ON "Settings" FOR UPDATE
  USING ("userId" = current_setting('app.current_user_id', true));

CREATE POLICY "Users can delete own settings"
  ON "Settings" FOR DELETE
  USING ("userId" = current_setting('app.current_user_id', true));

-- ═══════════════════════════════════════════════════════════════
-- FoodLog
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE "FoodLog" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own food logs"
  ON "FoodLog" FOR SELECT
  USING ("userId" = current_setting('app.current_user_id', true));

CREATE POLICY "Users can insert own food logs"
  ON "FoodLog" FOR INSERT
  WITH CHECK ("userId" = current_setting('app.current_user_id', true));

CREATE POLICY "Users can update own food logs"
  ON "FoodLog" FOR UPDATE
  USING ("userId" = current_setting('app.current_user_id', true));

CREATE POLICY "Users can delete own food logs"
  ON "FoodLog" FOR DELETE
  USING ("userId" = current_setting('app.current_user_id', true));

-- ═══════════════════════════════════════════════════════════════
-- CustomFood
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE "CustomFood" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own custom foods"
  ON "CustomFood" FOR SELECT
  USING ("userId" = current_setting('app.current_user_id', true));

CREATE POLICY "Users can insert own custom foods"
  ON "CustomFood" FOR INSERT
  WITH CHECK ("userId" = current_setting('app.current_user_id', true));

CREATE POLICY "Users can update own custom foods"
  ON "CustomFood" FOR UPDATE
  USING ("userId" = current_setting('app.current_user_id', true));

CREATE POLICY "Users can delete own custom foods"
  ON "CustomFood" FOR DELETE
  USING ("userId" = current_setting('app.current_user_id', true));

-- ═══════════════════════════════════════════════════════════════
-- MealTemplate
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE "MealTemplate" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own meal templates"
  ON "MealTemplate" FOR SELECT
  USING ("userId" = current_setting('app.current_user_id', true));

CREATE POLICY "Users can insert own meal templates"
  ON "MealTemplate" FOR INSERT
  WITH CHECK ("userId" = current_setting('app.current_user_id', true));

CREATE POLICY "Users can update own meal templates"
  ON "MealTemplate" FOR UPDATE
  USING ("userId" = current_setting('app.current_user_id', true));

CREATE POLICY "Users can delete own meal templates"
  ON "MealTemplate" FOR DELETE
  USING ("userId" = current_setting('app.current_user_id', true));

-- ═══════════════════════════════════════════════════════════════
-- MealTemplateItem
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE "MealTemplateItem" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own template items"
  ON "MealTemplateItem" FOR SELECT
  USING ("userId" = current_setting('app.current_user_id', true));

CREATE POLICY "Users can insert own template items"
  ON "MealTemplateItem" FOR INSERT
  WITH CHECK ("userId" = current_setting('app.current_user_id', true));

CREATE POLICY "Users can update own template items"
  ON "MealTemplateItem" FOR UPDATE
  USING ("userId" = current_setting('app.current_user_id', true));

CREATE POLICY "Users can delete own template items"
  ON "MealTemplateItem" FOR DELETE
  USING ("userId" = current_setting('app.current_user_id', true));

-- ═══════════════════════════════════════════════════════════════
-- WaterLog
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE "WaterLog" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own water logs"
  ON "WaterLog" FOR SELECT
  USING ("userId" = current_setting('app.current_user_id', true));

CREATE POLICY "Users can insert own water logs"
  ON "WaterLog" FOR INSERT
  WITH CHECK ("userId" = current_setting('app.current_user_id', true));

CREATE POLICY "Users can update own water logs"
  ON "WaterLog" FOR UPDATE
  USING ("userId" = current_setting('app.current_user_id', true));

CREATE POLICY "Users can delete own water logs"
  ON "WaterLog" FOR DELETE
  USING ("userId" = current_setting('app.current_user_id', true));

-- ═══════════════════════════════════════════════════════════════
-- ScanFeedback
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE "ScanFeedback" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own scan feedback"
  ON "ScanFeedback" FOR SELECT
  USING ("userId" = current_setting('app.current_user_id', true));

CREATE POLICY "Users can insert own scan feedback"
  ON "ScanFeedback" FOR INSERT
  WITH CHECK ("userId" = current_setting('app.current_user_id', true));

-- ═══════════════════════════════════════════════════════════════
-- ScanCache (already has userId, to be populated in later PR)
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE "ScanCache" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own scan cache"
  ON "ScanCache" FOR SELECT
  USING ("userId" = current_setting('app.current_user_id', true) OR "userId" IS NULL);

CREATE POLICY "Users can insert own scan cache"
  ON "ScanCache" FOR INSERT
  WITH CHECK ("userId" = current_setting('app.current_user_id', true));
