-- ==========================================================
-- SEED: Dados reais 2025 - Familia Frank & Ana Paula
-- Fonte: controle2025.csv
-- Total Renda: R$ 133.497,14
-- Total Despesas: R$ 146.286,25
-- Subtotal: -R$ 12.789,11
-- ==========================================================

-- Family UUID (ja criada pelo usuario)
-- 52ac8d04-1874-450d-a460-bdeafd480b31

-- 1. Membros da familia (ja existem no banco)
-- Frank:     2de69a40-95f3-4fb4-ad8c-b2065448fd48
-- Ana Paula: 3f9d5585-70b0-4d25-bea4-568f37f7f40f

-- ==========================================================
-- 2. RENDA (Inflows) - 2025
-- ==========================================================

INSERT INTO inflows (family_id, member_id, amount, category_id, source, inflow_date, status) VALUES
-- Frank (freelance, renda variavel)
('52ac8d04-1874-450d-a460-bdeafd480b31', '2de69a40-95f3-4fb4-ad8c-b2065448fd48', 1290.00, 'freelance', 'Frank', '2025-01-01', 'confirmada'),
('52ac8d04-1874-450d-a460-bdeafd480b31', '2de69a40-95f3-4fb4-ad8c-b2065448fd48', 2235.47, 'freelance', 'Frank', '2025-02-01', 'confirmada'),
('52ac8d04-1874-450d-a460-bdeafd480b31', '2de69a40-95f3-4fb4-ad8c-b2065448fd48', 1250.00, 'freelance', 'Frank', '2025-03-01', 'confirmada'),
('52ac8d04-1874-450d-a460-bdeafd480b31', '2de69a40-95f3-4fb4-ad8c-b2065448fd48', 15000.00, 'freelance', 'Frank', '2025-05-01', 'confirmada'),
('52ac8d04-1874-450d-a460-bdeafd480b31', '2de69a40-95f3-4fb4-ad8c-b2065448fd48', 3000.00, 'freelance', 'Frank', '2025-06-01', 'confirmada'),
('52ac8d04-1874-450d-a460-bdeafd480b31', '2de69a40-95f3-4fb4-ad8c-b2065448fd48', 200.00, 'freelance', 'Frank', '2025-09-01', 'confirmada'),

-- Ana Paula (salario)
('52ac8d04-1874-450d-a460-bdeafd480b31', '3f9d5585-70b0-4d25-bea4-568f37f7f40f', 2360.00, 'salary', 'Ana Paula', '2025-01-01', 'confirmada'),
('52ac8d04-1874-450d-a460-bdeafd480b31', '3f9d5585-70b0-4d25-bea4-568f37f7f40f', 5570.00, 'salary', 'Ana Paula', '2025-02-01', 'confirmada'),
('52ac8d04-1874-450d-a460-bdeafd480b31', '3f9d5585-70b0-4d25-bea4-568f37f7f40f', 5130.00, 'salary', 'Ana Paula', '2025-03-01', 'confirmada'),
('52ac8d04-1874-450d-a460-bdeafd480b31', '3f9d5585-70b0-4d25-bea4-568f37f7f40f', 3750.00, 'salary', 'Ana Paula', '2025-04-01', 'confirmada'),
('52ac8d04-1874-450d-a460-bdeafd480b31', '3f9d5585-70b0-4d25-bea4-568f37f7f40f', 7410.00, 'salary', 'Ana Paula', '2025-05-01', 'confirmada'),
('52ac8d04-1874-450d-a460-bdeafd480b31', '3f9d5585-70b0-4d25-bea4-568f37f7f40f', 8280.00, 'salary', 'Ana Paula', '2025-06-01', 'confirmada'),
('52ac8d04-1874-450d-a460-bdeafd480b31', '3f9d5585-70b0-4d25-bea4-568f37f7f40f', 7580.00, 'salary', 'Ana Paula', '2025-07-01', 'confirmada'),
('52ac8d04-1874-450d-a460-bdeafd480b31', '3f9d5585-70b0-4d25-bea4-568f37f7f40f', 4780.00, 'salary', 'Ana Paula', '2025-08-01', 'confirmada'),
('52ac8d04-1874-450d-a460-bdeafd480b31', '3f9d5585-70b0-4d25-bea4-568f37f7f40f', 7400.00, 'salary', 'Ana Paula', '2025-09-01', 'confirmada'),
('52ac8d04-1874-450d-a460-bdeafd480b31', '3f9d5585-70b0-4d25-bea4-568f37f7f40f', 9070.00, 'salary', 'Ana Paula', '2025-10-01', 'confirmada'),
('52ac8d04-1874-450d-a460-bdeafd480b31', '3f9d5585-70b0-4d25-bea4-568f37f7f40f', 9511.68, 'salary', 'Ana Paula', '2025-11-01', 'confirmada'),
('52ac8d04-1874-450d-a460-bdeafd480b31', '3f9d5585-70b0-4d25-bea4-568f37f7f40f', 10830.00, 'salary', 'Ana Paula', '2025-12-01', 'confirmada'),

-- CMB (renda complementar)
('52ac8d04-1874-450d-a460-bdeafd480b31', null, 1000.00, 'other_income', 'CMB', '2025-01-01', 'confirmada'),
('52ac8d04-1874-450d-a460-bdeafd480b31', null, 1000.00, 'other_income', 'CMB', '2025-02-01', 'confirmada'),
('52ac8d04-1874-450d-a460-bdeafd480b31', null, 1000.00, 'other_income', 'CMB', '2025-03-01', 'confirmada'),
('52ac8d04-1874-450d-a460-bdeafd480b31', null, 1600.00, 'other_income', 'CMB', '2025-04-01', 'confirmada'),
('52ac8d04-1874-450d-a460-bdeafd480b31', null, 1600.00, 'other_income', 'CMB', '2025-05-01', 'confirmada'),
('52ac8d04-1874-450d-a460-bdeafd480b31', null, 1600.00, 'other_income', 'CMB', '2025-06-01', 'confirmada'),
('52ac8d04-1874-450d-a460-bdeafd480b31', null, 1600.00, 'other_income', 'CMB', '2025-07-01', 'confirmada'),
('52ac8d04-1874-450d-a460-bdeafd480b31', null, 1600.00, 'other_income', 'CMB', '2025-08-01', 'confirmada'),
('52ac8d04-1874-450d-a460-bdeafd480b31', null, 1600.00, 'other_income', 'CMB', '2025-09-01', 'confirmada'),
('52ac8d04-1874-450d-a460-bdeafd480b31', null, 1600.00, 'other_income', 'CMB', '2025-10-01', 'confirmada'),
('52ac8d04-1874-450d-a460-bdeafd480b31', null, 1600.00, 'other_income', 'CMB', '2025-11-01', 'confirmada'),
('52ac8d04-1874-450d-a460-bdeafd480b31', null, 1600.00, 'other_income', 'CMB', '2025-12-01', 'confirmada'),

-- PR do terreno (venda)
('52ac8d04-1874-450d-a460-bdeafd480b31', null, 583.33, 'casual_sale', 'PR do terreno', '2025-01-01', 'confirmada'),
('52ac8d04-1874-450d-a460-bdeafd480b31', null, 583.33, 'casual_sale', 'PR do terreno', '2025-02-01', 'confirmada'),
('52ac8d04-1874-450d-a460-bdeafd480b31', null, 583.33, 'casual_sale', 'PR do terreno', '2025-03-01', 'confirmada'),

-- Cursos AP (Ana Paula)
('52ac8d04-1874-450d-a460-bdeafd480b31', '3f9d5585-70b0-4d25-bea4-568f37f7f40f', 2000.00, 'freelance', 'Cursos AP', '2025-01-01', 'confirmada'),
('52ac8d04-1874-450d-a460-bdeafd480b31', '3f9d5585-70b0-4d25-bea4-568f37f7f40f', 2400.00, 'freelance', 'Cursos AP', '2025-02-01', 'confirmada'),
('52ac8d04-1874-450d-a460-bdeafd480b31', '3f9d5585-70b0-4d25-bea4-568f37f7f40f', 2000.00, 'freelance', 'Cursos AP', '2025-07-01', 'confirmada'),
('52ac8d04-1874-450d-a460-bdeafd480b31', '3f9d5585-70b0-4d25-bea4-568f37f7f40f', 2500.00, 'freelance', 'Cursos AP', '2025-08-01', 'confirmada'),
('52ac8d04-1874-450d-a460-bdeafd480b31', '3f9d5585-70b0-4d25-bea4-568f37f7f40f', 800.00, 'freelance', 'Cursos AP', '2025-11-01', 'confirmada');

-- ==========================================================
-- 3. DESPESAS (Expenses) - 2025 - todas pagas
-- Mapeamento de categorias:
--   housing: Aluguel, Terreno
--   debts_loans: Financiamento carro, Emprestimos, Cred Amigo, Damiao Moto
--   utilities: Brisanet, AJ-net, Agua, Luz, Tel Vivo
--   credit_card: C. Will, C. NuBank, C. Mercado Pago, C. Santander
--   transport: Ligeira, Gasolina
--   taxes_fees: Licenciamento, IPVA
--   groceries: Feira
--   dining_out: iFood/delivery
--   personal_care: Trinks, Gastos Pessoais
--   children_family: Volei de Ester
--   health: Academia, Suplementos
--   insurance: Plano de Saude
--   education: Unip
--   travel: Carla Hotel Viagem
--   other_expense: Custo do Studio, Mercado Pago Expresso
-- ==========================================================

INSERT INTO expenses (family_id, amount, category_id, description, due_date, status) VALUES

-- ALUGUEL (dia 5) - R$ 1.876/mes x 12
('52ac8d04-1874-450d-a460-bdeafd480b31', 1876.00, 'housing', 'Aluguel', '2025-01-05', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 1876.00, 'housing', 'Aluguel', '2025-02-05', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 1876.00, 'housing', 'Aluguel', '2025-03-05', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 1876.00, 'housing', 'Aluguel', '2025-04-05', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 1876.00, 'housing', 'Aluguel', '2025-05-05', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 1876.00, 'housing', 'Aluguel', '2025-06-05', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 1876.00, 'housing', 'Aluguel', '2025-07-05', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 1876.00, 'housing', 'Aluguel', '2025-08-05', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 1876.00, 'housing', 'Aluguel', '2025-09-05', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 1876.00, 'housing', 'Aluguel', '2025-10-05', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 1876.00, 'housing', 'Aluguel', '2025-11-05', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 1876.00, 'housing', 'Aluguel', '2025-12-05', 'paga'),

-- FINANCIAMENTO CARRO (dia 10) - 18 parcelas restantes
('52ac8d04-1874-450d-a460-bdeafd480b31', 2443.29, 'debts_loans', 'Financiamento Carro', '2025-01-10', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 2201.06, 'debts_loans', 'Financiamento Carro', '2025-02-10', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 2201.06, 'debts_loans', 'Financiamento Carro', '2025-03-10', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 2201.06, 'debts_loans', 'Financiamento Carro', '2025-04-10', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 2097.29, 'debts_loans', 'Financiamento Carro', '2025-05-10', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 2181.87, 'debts_loans', 'Financiamento Carro', '2025-06-10', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 2230.90, 'debts_loans', 'Financiamento Carro', '2025-07-10', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 2097.29, 'debts_loans', 'Financiamento Carro', '2025-08-10', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 2097.29, 'debts_loans', 'Financiamento Carro', '2025-09-10', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 2097.29, 'debts_loans', 'Financiamento Carro', '2025-10-10', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 2097.29, 'debts_loans', 'Financiamento Carro', '2025-11-10', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 2097.29, 'debts_loans', 'Financiamento Carro', '2025-12-10', 'paga'),

-- Mercado Pago Expresso (dia 20) - emprestimo
('52ac8d04-1874-450d-a460-bdeafd480b31', 1601.00, 'debts_loans', 'Mercado Pago Expresso', '2025-10-20', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 1200.00, 'debts_loans', 'Mercado Pago Expresso', '2025-11-20', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 1200.00, 'debts_loans', 'Mercado Pago Expresso', '2025-12-20', 'paga'),

-- Emprestimo Pessoal (dia 31/30)
('52ac8d04-1874-450d-a460-bdeafd480b31', 303.00, 'debts_loans', 'Emprestimo Pessoal', '2025-08-31', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 303.00, 'debts_loans', 'Emprestimo Pessoal', '2025-09-30', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 303.00, 'debts_loans', 'Emprestimo Pessoal', '2025-10-31', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 303.00, 'debts_loans', 'Emprestimo Pessoal', '2025-11-30', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 303.00, 'debts_loans', 'Emprestimo Pessoal', '2025-12-31', 'paga'),

-- Emprestimo Mercado Pago (dia 30)
('52ac8d04-1874-450d-a460-bdeafd480b31', 500.00, 'debts_loans', 'Emprestimo Mercado Pago', '2025-08-30', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 762.84, 'debts_loans', 'Emprestimo Mercado Pago', '2025-09-30', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 762.84, 'debts_loans', 'Emprestimo Mercado Pago', '2025-10-30', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 762.84, 'debts_loans', 'Emprestimo Mercado Pago', '2025-11-30', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 762.84, 'debts_loans', 'Emprestimo Mercado Pago', '2025-12-30', 'paga'),

-- Cred Amigo (dia 10)
('52ac8d04-1874-450d-a460-bdeafd480b31', 952.66, 'debts_loans', 'Cred Amigo', '2025-06-10', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 952.66, 'debts_loans', 'Cred Amigo', '2025-07-10', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 952.66, 'debts_loans', 'Cred Amigo', '2025-08-10', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 952.66, 'debts_loans', 'Cred Amigo', '2025-09-10', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 1126.05, 'debts_loans', 'Cred Amigo', '2025-10-10', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 1126.05, 'debts_loans', 'Cred Amigo', '2025-11-10', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 1126.05, 'debts_loans', 'Cred Amigo', '2025-12-10', 'paga'),

-- Damiao Moto (dia 22)
('52ac8d04-1874-450d-a460-bdeafd480b31', 515.54, 'debts_loans', 'Damiao Moto', '2025-02-22', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 515.54, 'debts_loans', 'Damiao Moto', '2025-03-22', 'paga'),

-- BRISANET internet (dia 20)
('52ac8d04-1874-450d-a460-bdeafd480b31', 133.11, 'utilities', 'Brisanet', '2025-01-20', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 132.91, 'utilities', 'Brisanet', '2025-02-20', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 108.00, 'utilities', 'Brisanet', '2025-03-20', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 108.00, 'utilities', 'Brisanet', '2025-04-20', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 104.80, 'utilities', 'Brisanet', '2025-05-20', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 108.00, 'utilities', 'Brisanet', '2025-06-20', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 107.91, 'utilities', 'Brisanet', '2025-07-20', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 107.90, 'utilities', 'Brisanet', '2025-08-20', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 107.90, 'utilities', 'Brisanet', '2025-09-20', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 107.97, 'utilities', 'Brisanet', '2025-10-20', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 104.80, 'utilities', 'Brisanet', '2025-11-20', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 104.80, 'utilities', 'Brisanet', '2025-12-20', 'paga'),

-- Volei de Ester (dia 5)
('52ac8d04-1874-450d-a460-bdeafd480b31', 80.00, 'children_family', 'Volei de Ester', '2025-01-05', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 80.00, 'children_family', 'Volei de Ester', '2025-02-05', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 80.00, 'children_family', 'Volei de Ester', '2025-03-05', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 80.00, 'children_family', 'Volei de Ester', '2025-04-05', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 80.00, 'children_family', 'Volei de Ester', '2025-05-05', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 80.00, 'children_family', 'Volei de Ester', '2025-06-05', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 80.00, 'children_family', 'Volei de Ester', '2025-07-05', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 80.00, 'children_family', 'Volei de Ester', '2025-08-05', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 80.00, 'children_family', 'Volei de Ester', '2025-09-05', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 80.00, 'children_family', 'Volei de Ester', '2025-10-05', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 80.00, 'children_family', 'Volei de Ester', '2025-11-05', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 80.00, 'children_family', 'Volei de Ester', '2025-12-05', 'paga'),

-- AJ-net (dia 5)
('52ac8d04-1874-450d-a460-bdeafd480b31', 60.00, 'utilities', 'AJ-net', '2025-05-05', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 60.00, 'utilities', 'AJ-net', '2025-06-05', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 60.00, 'utilities', 'AJ-net', '2025-07-05', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 60.00, 'utilities', 'AJ-net', '2025-08-05', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 60.00, 'utilities', 'AJ-net', '2025-09-05', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 60.00, 'utilities', 'AJ-net', '2025-10-05', 'paga'),

-- Ligeira (dia 22) - transporte
('52ac8d04-1874-450d-a460-bdeafd480b31', 74.90, 'transport', 'Ligeira', '2025-01-22', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 74.90, 'transport', 'Ligeira', '2025-02-22', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 74.90, 'transport', 'Ligeira', '2025-03-22', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 76.62, 'transport', 'Ligeira', '2025-04-22', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 76.54, 'transport', 'Ligeira', '2025-05-22', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 76.62, 'transport', 'Ligeira', '2025-06-22', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 80.43, 'transport', 'Ligeira', '2025-07-22', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 80.43, 'transport', 'Ligeira', '2025-08-22', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 80.43, 'transport', 'Ligeira', '2025-09-22', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 83.00, 'transport', 'Ligeira', '2025-10-22', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 78.65, 'transport', 'Ligeira', '2025-11-22', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 78.65, 'transport', 'Ligeira', '2025-12-22', 'paga'),

-- Licenciamento Moto (dia 10)
('52ac8d04-1874-450d-a460-bdeafd480b31', 457.01, 'taxes_fees', 'Licenciamento Moto', '2025-02-10', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 180.89, 'taxes_fees', 'Licenciamento Moto', '2025-07-10', 'paga'),

-- Licenciamento Carro (dia 12)
('52ac8d04-1874-450d-a460-bdeafd480b31', 521.97, 'taxes_fees', 'Licenciamento Carro', '2025-06-12', 'paga'),

-- IPVA Moto (dia 15)
('52ac8d04-1874-450d-a460-bdeafd480b31', 94.00, 'taxes_fees', 'IPVA Moto', '2025-02-15', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 361.36, 'taxes_fees', 'IPVA Moto', '2025-05-15', 'paga'),

-- IPVA Carro (dia 8)
('52ac8d04-1874-450d-a460-bdeafd480b31', 1958.48, 'taxes_fees', 'IPVA Carro', '2025-05-08', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 489.64, 'taxes_fees', 'IPVA Carro', '2025-06-08', 'paga'),

-- AGUA (dia 8)
('52ac8d04-1874-450d-a460-bdeafd480b31', 327.31, 'utilities', 'Agua', '2025-01-08', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 240.91, 'utilities', 'Agua', '2025-02-08', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 240.91, 'utilities', 'Agua', '2025-03-08', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 135.52, 'utilities', 'Agua', '2025-04-08', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 65.33, 'utilities', 'Agua', '2025-05-08', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 83.89, 'utilities', 'Agua', '2025-06-08', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 65.33, 'utilities', 'Agua', '2025-07-08', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 159.80, 'utilities', 'Agua', '2025-08-08', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 132.04, 'utilities', 'Agua', '2025-09-08', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 66.09, 'utilities', 'Agua', '2025-10-08', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 82.74, 'utilities', 'Agua', '2025-11-08', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 69.94, 'utilities', 'Agua', '2025-12-08', 'paga'),

-- Trinks (dia 14) - salao/estetica
('52ac8d04-1874-450d-a460-bdeafd480b31', 80.00, 'personal_care', 'Trinks', '2025-01-14', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 80.00, 'personal_care', 'Trinks', '2025-02-14', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 80.00, 'personal_care', 'Trinks', '2025-03-14', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 80.00, 'personal_care', 'Trinks', '2025-04-14', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 90.00, 'personal_care', 'Trinks', '2025-05-14', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 90.00, 'personal_care', 'Trinks', '2025-06-14', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 90.00, 'personal_care', 'Trinks', '2025-07-14', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 90.00, 'personal_care', 'Trinks', '2025-08-14', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 90.00, 'personal_care', 'Trinks', '2025-09-14', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 90.00, 'personal_care', 'Trinks', '2025-10-14', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 90.00, 'personal_care', 'Trinks', '2025-11-14', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 80.00, 'personal_care', 'Trinks', '2025-12-14', 'paga'),

-- Luz Casa (dia 15)
('52ac8d04-1874-450d-a460-bdeafd480b31', 479.04, 'utilities', 'Luz Casa', '2025-01-15', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 352.94, 'utilities', 'Luz Casa', '2025-02-15', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 322.55, 'utilities', 'Luz Casa', '2025-03-15', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 356.29, 'utilities', 'Luz Casa', '2025-04-15', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 369.68, 'utilities', 'Luz Casa', '2025-05-15', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 318.84, 'utilities', 'Luz Casa', '2025-06-15', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 314.06, 'utilities', 'Luz Casa', '2025-07-15', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 332.70, 'utilities', 'Luz Casa', '2025-08-15', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 271.00, 'utilities', 'Luz Casa', '2025-09-15', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 395.00, 'utilities', 'Luz Casa', '2025-10-15', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 495.00, 'utilities', 'Luz Casa', '2025-11-15', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 330.88, 'utilities', 'Luz Casa', '2025-12-15', 'paga'),

-- Luz Studio (dia 15)
('52ac8d04-1874-450d-a460-bdeafd480b31', 500.00, 'utilities', 'Luz Studio', '2025-01-15', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 500.00, 'utilities', 'Luz Studio', '2025-02-15', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 522.75, 'utilities', 'Luz Studio', '2025-03-15', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 614.92, 'utilities', 'Luz Studio', '2025-04-15', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 563.44, 'utilities', 'Luz Studio', '2025-05-15', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 500.00, 'utilities', 'Luz Studio', '2025-06-15', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 500.00, 'utilities', 'Luz Studio', '2025-07-15', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 500.00, 'utilities', 'Luz Studio', '2025-08-15', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 500.00, 'utilities', 'Luz Studio', '2025-09-15', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 500.00, 'utilities', 'Luz Studio', '2025-10-15', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 500.00, 'utilities', 'Luz Studio', '2025-11-15', 'paga'),

-- Terreno (dia 15) - parcelas
('52ac8d04-1874-450d-a460-bdeafd480b31', 932.50, 'housing', 'Terreno', '2025-02-15', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 754.24, 'housing', 'Terreno', '2025-07-15', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 378.32, 'housing', 'Terreno', '2025-08-15', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 378.32, 'housing', 'Terreno', '2025-09-15', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 378.32, 'housing', 'Terreno', '2025-10-15', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 378.32, 'housing', 'Terreno', '2025-11-15', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 378.32, 'housing', 'Terreno', '2025-12-15', 'paga'),

-- C. Will - cartao (dia 20)
('52ac8d04-1874-450d-a460-bdeafd480b31', 730.27, 'credit_card', 'Cartao Will', '2025-01-20', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 652.72, 'credit_card', 'Cartao Will', '2025-02-20', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 622.07, 'credit_card', 'Cartao Will', '2025-03-20', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 400.00, 'credit_card', 'Cartao Will', '2025-04-20', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 450.00, 'credit_card', 'Cartao Will', '2025-05-20', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 96.80, 'credit_card', 'Cartao Will', '2025-06-20', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 79.00, 'credit_card', 'Cartao Will', '2025-07-20', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 63.81, 'credit_card', 'Cartao Will', '2025-08-20', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 90.00, 'credit_card', 'Cartao Will', '2025-09-20', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 125.70, 'credit_card', 'Cartao Will', '2025-10-20', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 109.90, 'credit_card', 'Cartao Will', '2025-11-20', 'paga'),

-- C. NuBank - cartao (dia 27)
('52ac8d04-1874-450d-a460-bdeafd480b31', 380.09, 'credit_card', 'Cartao NuBank', '2025-01-27', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 508.97, 'credit_card', 'Cartao NuBank', '2025-02-27', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 191.21, 'credit_card', 'Cartao NuBank', '2025-03-27', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 250.00, 'credit_card', 'Cartao NuBank', '2025-04-27', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 342.19, 'credit_card', 'Cartao NuBank', '2025-05-27', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 291.96, 'credit_card', 'Cartao NuBank', '2025-06-27', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 240.50, 'credit_card', 'Cartao NuBank', '2025-07-27', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 120.22, 'credit_card', 'Cartao NuBank', '2025-08-27', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 265.50, 'credit_card', 'Cartao NuBank', '2025-09-27', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 235.33, 'credit_card', 'Cartao NuBank', '2025-10-27', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 350.00, 'credit_card', 'Cartao NuBank', '2025-11-27', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 296.89, 'credit_card', 'Cartao NuBank', '2025-12-27', 'paga'),

-- C. Mercado Pago - cartao (dia 14)
('52ac8d04-1874-450d-a460-bdeafd480b31', 430.61, 'credit_card', 'Cartao Mercado Pago', '2025-01-14', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 806.72, 'credit_card', 'Cartao Mercado Pago', '2025-02-14', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 1079.00, 'credit_card', 'Cartao Mercado Pago', '2025-03-14', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 94.67, 'credit_card', 'Cartao Mercado Pago', '2025-04-14', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 964.55, 'credit_card', 'Cartao Mercado Pago', '2025-05-14', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 1876.34, 'credit_card', 'Cartao Mercado Pago', '2025-06-14', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 267.59, 'credit_card', 'Cartao Mercado Pago', '2025-07-14', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 480.24, 'credit_card', 'Cartao Mercado Pago', '2025-08-14', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 520.90, 'credit_card', 'Cartao Mercado Pago', '2025-09-14', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 1086.00, 'credit_card', 'Cartao Mercado Pago', '2025-10-14', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 1215.55, 'credit_card', 'Cartao Mercado Pago', '2025-11-14', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 1802.91, 'credit_card', 'Cartao Mercado Pago', '2025-12-14', 'paga'),

-- C. Santander - cartao (dia 20)
('52ac8d04-1874-450d-a460-bdeafd480b31', 1147.10, 'credit_card', 'Cartao Santander', '2025-01-20', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 134.56, 'credit_card', 'Cartao Santander', '2025-02-20', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 2102.44, 'credit_card', 'Cartao Santander', '2025-05-20', 'paga'),

-- FEIRA - alimentacao (dia 15)
('52ac8d04-1874-450d-a460-bdeafd480b31', 500.00, 'groceries', 'Feira', '2025-01-15', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 500.00, 'groceries', 'Feira', '2025-02-15', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 420.00, 'groceries', 'Feira', '2025-03-15', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 550.00, 'groceries', 'Feira', '2025-04-15', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 500.00, 'groceries', 'Feira', '2025-05-15', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 525.00, 'groceries', 'Feira', '2025-07-15', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 500.00, 'groceries', 'Feira', '2025-08-15', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 500.00, 'groceries', 'Feira', '2025-09-15', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 435.90, 'groceries', 'Feira', '2025-10-15', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 479.00, 'groceries', 'Feira', '2025-11-15', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 692.25, 'groceries', 'Feira', '2025-12-15', 'paga'),

-- Carla | Hotel - Viagem (dia 9)
('52ac8d04-1874-450d-a460-bdeafd480b31', 278.00, 'travel', 'Carla Hotel - Viagem', '2025-05-09', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 278.00, 'travel', 'Carla Hotel - Viagem', '2025-06-09', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 320.00, 'travel', 'Carla Hotel - Viagem', '2025-07-09', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 70.20, 'travel', 'Carla Hotel - Viagem', '2025-08-09', 'paga'),

-- Suplementos (dia 15)
('52ac8d04-1874-450d-a460-bdeafd480b31', 335.00, 'health', 'Suplementos', '2025-10-15', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 367.00, 'health', 'Suplementos', '2025-11-15', 'paga'),

-- iFood/delivery (dia 15)
('52ac8d04-1874-450d-a460-bdeafd480b31', 107.41, 'dining_out', 'iFood/Delivery', '2025-01-15', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 207.54, 'dining_out', 'iFood/Delivery', '2025-02-15', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 280.00, 'dining_out', 'iFood/Delivery', '2025-04-15', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 543.00, 'dining_out', 'iFood/Delivery', '2025-05-15', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 347.20, 'dining_out', 'iFood/Delivery', '2025-06-15', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 529.76, 'dining_out', 'iFood/Delivery', '2025-07-15', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 638.64, 'dining_out', 'iFood/Delivery', '2025-08-15', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 352.72, 'dining_out', 'iFood/Delivery', '2025-09-15', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 782.09, 'dining_out', 'iFood/Delivery', '2025-10-15', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 1083.54, 'dining_out', 'iFood/Delivery', '2025-11-15', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 2027.44, 'dining_out', 'iFood/Delivery', '2025-12-15', 'paga'),

-- GASOLINA (dia 15)
('52ac8d04-1874-450d-a460-bdeafd480b31', 250.00, 'transport', 'Gasolina', '2025-01-15', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 250.00, 'transport', 'Gasolina', '2025-02-15', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 280.00, 'transport', 'Gasolina', '2025-03-15', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 300.00, 'transport', 'Gasolina', '2025-04-15', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 250.00, 'transport', 'Gasolina', '2025-05-15', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 300.00, 'transport', 'Gasolina', '2025-06-15', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 395.06, 'transport', 'Gasolina', '2025-07-15', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 410.47, 'transport', 'Gasolina', '2025-08-15', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 226.42, 'transport', 'Gasolina', '2025-09-15', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 554.45, 'transport', 'Gasolina', '2025-10-15', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 1052.00, 'transport', 'Gasolina', '2025-11-15', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 725.78, 'transport', 'Gasolina', '2025-12-15', 'paga'),

-- Tel VIVO (dia 10)
('52ac8d04-1874-450d-a460-bdeafd480b31', 45.50, 'utilities', 'Tel Vivo', '2025-01-10', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 45.50, 'utilities', 'Tel Vivo', '2025-02-10', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 49.00, 'utilities', 'Tel Vivo', '2025-03-10', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 41.21, 'utilities', 'Tel Vivo', '2025-04-10', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 39.99, 'utilities', 'Tel Vivo', '2025-05-10', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 41.20, 'utilities', 'Tel Vivo', '2025-06-10', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 40.00, 'utilities', 'Tel Vivo', '2025-07-10', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 42.00, 'utilities', 'Tel Vivo', '2025-08-10', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 40.00, 'utilities', 'Tel Vivo', '2025-09-10', 'paga'),

-- Academia (dia 25)
('52ac8d04-1874-450d-a460-bdeafd480b31', 100.00, 'health', 'Academia', '2025-01-25', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 100.00, 'health', 'Academia', '2025-03-25', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 165.00, 'health', 'Academia', '2025-04-25', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 165.00, 'health', 'Academia', '2025-05-25', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 65.00, 'health', 'Academia', '2025-06-25', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 65.00, 'health', 'Academia', '2025-07-25', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 65.00, 'health', 'Academia', '2025-08-25', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 65.00, 'health', 'Academia', '2025-09-25', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 65.00, 'health', 'Academia', '2025-10-25', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 200.00, 'health', 'Academia', '2025-11-25', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 218.00, 'health', 'Academia', '2025-12-25', 'paga'),

-- Unip (dia 15) - faculdade
('52ac8d04-1874-450d-a460-bdeafd480b31', 135.00, 'education', 'Unip', '2025-11-15', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 135.00, 'education', 'Unip', '2025-12-15', 'paga'),

-- Custo do Studio (dia 15)
('52ac8d04-1874-450d-a460-bdeafd480b31', 458.09, 'other_expense', 'Custo Studio', '2025-07-15', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 971.00, 'other_expense', 'Custo Studio', '2025-09-15', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 605.19, 'other_expense', 'Custo Studio', '2025-10-15', 'paga'),

-- Gastos Pessoais (dia 15)
('52ac8d04-1874-450d-a460-bdeafd480b31', 675.20, 'personal_care', 'Gastos Pessoais', '2025-07-15', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 1496.05, 'personal_care', 'Gastos Pessoais', '2025-08-15', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 681.92, 'personal_care', 'Gastos Pessoais', '2025-09-15', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 80.00, 'personal_care', 'Gastos Pessoais', '2025-10-15', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 268.81, 'personal_care', 'Gastos Pessoais', '2025-11-15', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 689.71, 'personal_care', 'Gastos Pessoais', '2025-12-15', 'paga'),

-- Plano de Saude (dia 26)
('52ac8d04-1874-450d-a460-bdeafd480b31', 670.05, 'insurance', 'Plano de Saude', '2025-01-26', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 741.33, 'insurance', 'Plano de Saude', '2025-02-26', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 549.04, 'insurance', 'Plano de Saude', '2025-03-26', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 668.56, 'insurance', 'Plano de Saude', '2025-04-26', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 668.56, 'insurance', 'Plano de Saude', '2025-05-26', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 920.00, 'insurance', 'Plano de Saude', '2025-06-26', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 761.12, 'insurance', 'Plano de Saude', '2025-07-26', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 761.02, 'insurance', 'Plano de Saude', '2025-08-26', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 768.05, 'insurance', 'Plano de Saude', '2025-09-26', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 688.00, 'insurance', 'Plano de Saude', '2025-10-26', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 688.00, 'insurance', 'Plano de Saude', '2025-11-26', 'paga'),
('52ac8d04-1874-450d-a460-bdeafd480b31', 688.00, 'insurance', 'Plano de Saude', '2025-12-26', 'paga');

-- ==========================================================
-- Resumo:
-- Membros: Frank, Ana Paula
-- Inflows: 38 registros (6 Frank + 12 Ana Paula salario + 12 CMB + 3 PR terreno + 5 Cursos AP)
-- Expenses: ~270 registros cobrindo todas as 35 categorias de despesas do CSV
-- Periodo: Janeiro a Dezembro 2025
-- ==========================================================
