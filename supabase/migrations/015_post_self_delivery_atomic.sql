-- ====================================================================
-- nppv3 compatibility migration
-- Atomic replacement for nppv2 entry-detail handleSelfDeliver.
--
-- Workflow is unchanged:
--   draft export -> deduct batches FEFO + FIFO COGS -> posted
--   -> orders delivering -> receivables -> self-delivery in_transit.
-- Natural idempotency key: deliveries.source_stock_entry_id (unique in v2).
-- ====================================================================

CREATE OR REPLACE FUNCTION public.post_self_delivery(p_entry_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid             uuid := (SELECT auth.uid());
  v_org             uuid := public.user_org_id();
  v_role            text := public.user_role();
  v_entry           record;
  v_existing        uuid;
  v_delivery_id     uuid;
  v_order_id        uuid;
  v_line            record;
  v_batch           record;
  v_needed          numeric;
  v_take            numeric;
  v_fifo_cost       numeric;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'NOT_AUTHENTICATED' USING ERRCODE = 'P0001';
  END IF;
  IF v_org IS NULL THEN
    RAISE EXCEPTION 'NO_ORG' USING ERRCODE = 'P0001';
  END IF;
  IF v_role NOT IN ('owner', 'manager', 'warehouse', 'sales') THEN
    RAISE EXCEPTION 'FORBIDDEN' USING ERRCODE = 'P0001';
  END IF;

  SELECT id, org_id, entry_code, type, status, ref_order_ids
    INTO v_entry
  FROM stock_entries
  WHERE id = p_entry_id
  FOR UPDATE;

  IF NOT FOUND OR v_entry.org_id <> v_org OR v_entry.type <> 'export' THEN
    RAISE EXCEPTION 'ENTRY_NOT_FOUND' USING ERRCODE = 'P0001';
  END IF;

  SELECT id INTO v_existing
  FROM deliveries
  WHERE source_stock_entry_id = p_entry_id
  LIMIT 1;

  IF v_existing IS NOT NULL THEN
    RETURN jsonb_build_object(
      'entry_id', p_entry_id,
      'delivery_id', v_existing,
      'posted', true,
      'idempotent', true
    );
  END IF;

  IF v_entry.status <> 'draft' THEN
    RAISE EXCEPTION 'ENTRY_STATE_INVALID: %', v_entry.status USING ERRCODE = 'P0001';
  END IF;
  IF jsonb_typeof(v_entry.ref_order_ids) <> 'array'
     OR jsonb_array_length(v_entry.ref_order_ids) = 0 THEN
    RAISE EXCEPTION 'NO_ORDERS' USING ERRCODE = 'P0001';
  END IF;

  -- Validate all referenced orders before moving stock.
  FOR v_order_id IN
    SELECT value::uuid FROM jsonb_array_elements_text(v_entry.ref_order_ids)
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM sales_orders
      WHERE id = v_order_id AND org_id = v_org AND status = 'picking'
    ) THEN
      RAISE EXCEPTION 'ORDER_STATE_INVALID: %', v_order_id USING ERRCODE = 'P0001';
    END IF;
  END LOOP;

  -- Consume physical batches FEFO and accounting FIFO in one transaction.
  FOR v_line IN
    SELECT id, product_id, batch_id, ABS(qty_in_base_uom) AS qty
    FROM stock_entry_lines
    WHERE entry_id = p_entry_id
    ORDER BY created_at, id
  LOOP
    v_needed := COALESCE(v_line.qty, 0);
    IF v_needed <= 0 THEN CONTINUE; END IF;

    FOR v_batch IN
      SELECT id, qty_on_hand
      FROM batches
      WHERE org_id = v_org
        AND product_id = v_line.product_id
        AND warehouse_zone = 'sale'
        AND status = 'available'
        AND qty_on_hand > 0
      ORDER BY (id = v_line.batch_id) DESC, expires_at ASC, created_at ASC
      FOR UPDATE
    LOOP
      EXIT WHEN v_needed <= 0;
      v_take := LEAST(v_needed, v_batch.qty_on_hand);
      UPDATE batches
      SET qty_on_hand = qty_on_hand - v_take
      WHERE id = v_batch.id;
      v_needed := v_needed - v_take;
    END LOOP;

    IF v_needed > 0 THEN
      RAISE EXCEPTION 'INSUFFICIENT_STOCK: product %, missing %',
        v_line.product_id, v_needed USING ERRCODE = 'P0001';
    END IF;

    SELECT total_cost INTO v_fifo_cost
    FROM public.fifo_consume(
      v_org,
      v_line.product_id,
      'sale',
      v_line.qty,
      v_line.id
    );

    UPDATE stock_entry_lines
    SET unit_cost = CASE
      WHEN v_line.qty > 0 THEN ROUND(v_fifo_cost / v_line.qty)
      ELSE unit_cost
    END
    WHERE id = v_line.id;
  END LOOP;

  UPDATE stock_entries
  SET status = 'posted', posted_at = now()
  WHERE id = p_entry_id AND status = 'draft';

  UPDATE sales_orders
  SET status = 'delivering'
  WHERE org_id = v_org
    AND status = 'picking'
    AND id IN (
      SELECT value::uuid FROM jsonb_array_elements_text(v_entry.ref_order_ids)
    );

  FOR v_order_id IN
    SELECT value::uuid FROM jsonb_array_elements_text(v_entry.ref_order_ids)
  LOOP
    PERFORM public.recompute_order_receivable(v_order_id);
  END LOOP;

  INSERT INTO deliveries (
    org_id,
    driver_id,
    route_name,
    status,
    started_at,
    source_stock_entry_id
  ) VALUES (
    v_org,
    v_uid,
    'Tự giao — ' || v_entry.entry_code,
    'in_transit',
    now(),
    p_entry_id
  )
  RETURNING id INTO v_delivery_id;

  INSERT INTO delivery_lines (delivery_id, order_id, status)
  SELECT
    v_delivery_id,
    value::uuid,
    'pending'
  FROM jsonb_array_elements_text(v_entry.ref_order_ids);

  RETURN jsonb_build_object(
    'entry_id', p_entry_id,
    'delivery_id', v_delivery_id,
    'posted', true,
    'idempotent', false
  );
END;
$$;

COMMENT ON FUNCTION public.post_self_delivery(uuid) IS
  'nppv3: post phiếu tự giao atomic; trừ batch FEFO + FIFO, tạo công nợ và chuyến giao. Idempotent theo source_stock_entry_id.';

REVOKE EXECUTE ON FUNCTION public.post_self_delivery(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.post_self_delivery(uuid) TO authenticated;
