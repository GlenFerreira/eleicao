-- =====================================================
-- LIMPEZA E MIGRAÇÃO COMPLETA - SISTEMA DE QUESTIONÁRIOS
-- =====================================================

-- 1. LIMPAR DADOS DE TESTE
-- =====================================================

-- Limpar respostas existentes
DELETE FROM question_answers;
DELETE FROM survey_responses;

-- Limpar questionários e perguntas de teste
DELETE FROM question_options;
DELETE FROM questions;
DELETE FROM surveys;

-- 2. ADICIONAR NOVOS CAMPOS
-- =====================================================

-- Adicionar campo 'city' na tabela survey_responses
ALTER TABLE survey_responses 
ADD COLUMN IF NOT EXISTS city TEXT;

-- Adicionar campos de ideologia na tabela surveys
ALTER TABLE surveys 
ADD COLUMN IF NOT EXISTS federal_ideology TEXT CHECK (federal_ideology IN ('left', 'center', 'right')),
ADD COLUMN IF NOT EXISTS state_ideology TEXT CHECK (state_ideology IN ('left', 'center', 'right'));

-- 3. LIMPAR CAMPOS ANTIGOS (OPCIONAL - para remover campos fixos antigos)
-- =====================================================

-- Remover campos fixos antigos se existirem (descomente se quiser limpar)
-- ALTER TABLE survey_responses DROP COLUMN IF EXISTS question3_answer;
-- ALTER TABLE survey_responses DROP COLUMN IF EXISTS question4_answer;
-- ALTER TABLE survey_responses DROP COLUMN IF EXISTS question5_answer;
-- ALTER TABLE survey_responses DROP COLUMN IF EXISTS question6_answer;
-- ALTER TABLE survey_responses DROP COLUMN IF EXISTS questionn_answer;

-- 4. CRIAR ÍNDICES PARA PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_survey_responses_city ON survey_responses(city);
CREATE INDEX IF NOT EXISTS idx_survey_responses_survey_id ON survey_responses(survey_id);
CREATE INDEX IF NOT EXISTS idx_question_answers_survey_response_id ON question_answers(survey_response_id);
CREATE INDEX IF NOT EXISTS idx_question_answers_question_id ON question_answers(question_id);

-- 5. VERIFICAÇÕES
-- =====================================================

-- Verificar se os campos foram adicionados
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'survey_responses' 
  AND column_name = 'city';

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'surveys' 
  AND column_name IN ('federal_ideology', 'state_ideology');

-- Verificar que as tabelas estão limpas
SELECT 'survey_responses' as tabela, COUNT(*) as registros FROM survey_responses
UNION ALL
SELECT 'question_answers' as tabela, COUNT(*) as registros FROM question_answers
UNION ALL
SELECT 'surveys' as tabela, COUNT(*) as registros FROM surveys
UNION ALL
SELECT 'questions' as tabela, COUNT(*) as registros FROM questions
UNION ALL
SELECT 'question_options' as tabela, COUNT(*) as registros FROM question_options;

-- Verificar campos de contato na tabela survey_responses
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'survey_responses' 
  AND column_name IN ('contact_name', 'contact_email', 'contact_phone', 'wants_newsletter', 'city')
ORDER BY column_name;

-- =====================================================
-- PRONTO PARA NOVOS DADOS!
-- =====================================================
