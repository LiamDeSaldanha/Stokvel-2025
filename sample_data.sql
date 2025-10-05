-- Sample data for all tables to make the stokvel application work

-- First, insert users
INSERT INTO public.users (id, name, surname, password, email, id_number, joined_at, verified) VALUES
(1, 'Alice', 'Johnson', 'password123', 'alice.johnson@email.com', '9001011234567', '2025-09-15 08:00:00+02', true),
(2, 'Bob', 'Smith', 'password123', 'bob.smith@email.com', '8805021234567', '2025-09-16 09:30:00+02', true),
(3, 'Carol', 'Brown', 'password123', 'carol.brown@email.com', '9203031234567', '2025-09-17 10:15:00+02', true),
(4, 'David', 'Williams', 'password123', 'david.williams@email.com', '8904041234567', '2025-09-18 11:00:00+02', true),
(5, 'Emma', 'Davis', 'password123', 'emma.davis@email.com', '9505051234567', '2025-09-19 12:30:00+02', true),
(6, 'Frank', 'Miller', 'password123', 'frank.miller@email.com', '8706061234567', '2025-09-20 13:45:00+02', true),
(7, 'Grace', 'Wilson', 'password123', 'grace.wilson@email.com', '9307071234567', '2025-09-21 14:20:00+02', true),
(8, 'Henry', 'Moore', 'password123', 'henry.moore@email.com', '8508081234567', '2025-09-22 15:10:00+02', true),
(9, 'Iris', 'Taylor', 'password123', 'iris.taylor@email.com', '9209091234567', '2025-09-23 16:00:00+02', true),
(10, 'Jack', 'Anderson', 'password123', 'jack.anderson@email.com', '8810101234567', '2025-09-24 17:30:00+02', true);

-- Insert stokvels
INSERT INTO public.stokvels (id, name, number_people, goal, monthly_contribution, net_value, interest_rate, started_at, end_at) VALUES
(1, 'Community Savings Circle', 3, 'Save for community projects and emergency funds', 1000, 25000, 5, '2025-09-15 08:00:00+02', '2026-09-15 08:00:00+02'),
(2, 'College Savings Circle', 3, 'Save for childrens education and school fees', 500, 15000, 4, '2025-09-18 10:00:00+02', '2026-09-18 10:00:00+02'),
(3, 'Vacation Savings Circle', 4, 'Save for family vacation and travel expenses', 8000, 120000, 6, '2025-09-20 12:00:00+02', '2026-03-20 12:00:00+02');

-- Insert stokvel enrollments
INSERT INTO public.stokvel_enrollment (id, userid, stokvel_id, "isAdmin", enrolled_at) VALUES
(1, 1, 1, true, '2025-09-15 08:30:00+02'),   -- Alice is admin of Community Savings
(2, 2, 1, false, '2025-09-16 09:30:00+02'),  -- Bob member of Community Savings
(3, 3, 1, false, '2025-09-17 10:30:00+02'),  -- Carol member of Community Savings
(4, 4, 2, true, '2025-09-18 11:30:00+02'),   -- David is admin of College Savings
(5, 5, 2, false, '2025-09-19 12:30:00+02'),  -- Emma member of College Savings
(6, 6, 2, false, '2025-09-20 13:30:00+02'),  -- Frank member of College Savings
(7, 7, 3, true, '2025-09-21 14:30:00+02'),   -- Grace is admin of Vacation Savings
(8, 8, 3, false, '2025-09-22 15:30:00+02'),  -- Henry member of Vacation Savings
(9, 9, 3, false, '2025-09-23 16:30:00+02'),  -- Iris member of Vacation Savings
(10, 10, 3, false, '2025-09-24 17:30:00+02'); -- Jack member of Vacation Savings

-- The payments data is already provided in the payments_202510052224[1].sql file
-- INSERT INTO public.payments (userid,stokvel_id,stokvel_name,amount,payment_date,payment_status) VALUES
-- (1,1,'Community Savings Circle',1000.00,'2025-10-01 09:00:00+02',1),
-- (4,2,'College Savings Circle',500.00,'2025-10-03 10:00:00+02',1),
-- (7,3,'Vacation Savings Circle',10000.00,'2025-10-01 07:30:00+02',1),
-- (10,3,'Vacation Savings Circle',12000.00,'2025-10-05 13:20:00+02',1),
-- (2,1,'Community Savings Circle',1000.00,'2025-10-02 14:30:00+02',1),
-- (3,1,'Community Savings Circle',1000.00,'2025-09-25 11:15:00+02',0),
-- (5,2,'College Savings Circle',250.00,'2025-10-05 16:45:00+02',1),
-- (6,2,'College Savings Circle',800.00,'2025-09-30 08:00:00+02',0),
-- (8,3,'Vacation Savings Circle',7500.00,'2025-10-04 12:00:00+02',1),
-- (9,3,'Vacation Savings Circle',5000.00,'2025-09-20 15:00:00+02',0);

-- Sample emergency withdrawal requests
INSERT INTO public.emergency_withdrawal_request (id, userid, stokvel_id, reason, requested_amount, status, created_at) VALUES
(1, 2, 1, 'Medical emergency - need funds for hospital bills', 800.00, 'pending', '2025-10-05 10:00:00+02'),
(2, 6, 2, 'Family emergency - unexpected funeral expenses', 600.00, 'approved', '2025-10-04 14:30:00+02');

-- Sample emergency withdrawal approvals
INSERT INTO public.emergency_withdrawal_approval (id, request_id, userid, vote, created_at) VALUES
(1, 1, 1, true, '2025-10-05 11:00:00+02'),   -- Alice approves Bob's emergency withdrawal
(2, 1, 3, true, '2025-10-05 12:00:00+02'),   -- Carol approves Bob's emergency withdrawal
(3, 2, 4, true, '2025-10-04 15:00:00+02'),   -- David approves Frank's emergency withdrawal
(4, 2, 5, true, '2025-10-04 16:00:00+02');   -- Emma approves Frank's emergency withdrawal

-- Set sequences to the correct values
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
SELECT setval('stokvels_id_seq', (SELECT MAX(id) FROM stokvels));
SELECT setval('stokvel_enrollment_id_seq', (SELECT MAX(id) FROM stokvel_enrollment));
SELECT setval('payments_id_seq', (SELECT MAX(id) FROM payments));
SELECT setval('emergency_withdrawal_request_id_seq', (SELECT MAX(id) FROM emergency_withdrawal_request));
SELECT setval('emergency_withdrawal_approval_id_seq', (SELECT MAX(id) FROM emergency_withdrawal_approval));