-- Module 2 (Pipeline): a "Qualified" stage and the final amount captured when a deal is won.
-- Additive only: existing statuses and rows are unchanged.

ALTER TABLE leads
  MODIFY COLUMN status ENUM('new','contacted','qualified','site_visit','quote_sent','won','lost') NOT NULL DEFAULT 'new',
  ADD COLUMN final_amount INT UNSIGNED NULL AFTER quote_amount;
