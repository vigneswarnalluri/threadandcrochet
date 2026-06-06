-- ================================================================
-- Migration: Separate Order Number from Razorpay Payment ID
-- Run in: Supabase Dashboard → SQL Editor → New query
-- ================================================================

-- 1. Add razorpay_payment_id column to store the payment reference separately
ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_payment_id text;

-- 2. Add a proper sequential order number sequence (starts at 10001 for a clean look)
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 10001;

-- 3. Copy existing payment IDs into the new column (backward compat for old orders)
UPDATE orders SET razorpay_payment_id = number WHERE razorpay_payment_id IS NULL;

-- 4. Done — new orders will use TL-XXXXX as `number` and store pay_XXXX in razorpay_payment_id
