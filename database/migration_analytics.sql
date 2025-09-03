-- =====================================================
-- MIGRAÇÃO PARA ANALYTICS - SISTEMA DE QUESTIONÁRIOS
-- =====================================================

-- 1. Adicionar campo 'city' na tabela survey_responses
ALTER TABLE survey_responses 
ADD COLUMN city TEXT;

-- 2. Adicionar campos de ideologia na tabela surveys
ALTER TABLE surveys 
ADD COLUMN federal_ideology TEXT CHECK (federal_ideology IN ('left', 'center', 'right')),
ADD COLUMN state_ideology TEXT CHECK (state_ideology IN ('left', 'center', 'right'));

-- 3. Migrar dados existentes dos campos fixos para question_answers
-- Primeiro, vamos inserir as respostas existentes na tabela question_answers

-- Buscar questionários existentes para mapear as perguntas
-- (Este comando é apenas para referência - não executar ainda)
/*
SELECT 
    s.id as survey_id,
    s.title,
    q.id as question_id,
    q.question_text,
    q.order_index
FROM surveys s
JOIN questions q ON s.id = q.survey_id
WHERE s.deleted_at IS NULL 
  AND q.deleted_at IS NULL
ORDER BY s.id, q.order_index;
*/

-- 4. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_survey_responses_city ON survey_responses(city);
CREATE INDEX IF NOT EXISTS idx_survey_responses_survey_id ON survey_responses(survey_id);
CREATE INDEX IF NOT EXISTS idx_question_answers_survey_response_id ON question_answers(survey_response_id);
CREATE INDEX IF NOT EXISTS idx_question_answers_question_id ON question_answers(question_id);

-- 5. Atualizar dados existentes com cidade padrão (opcional)
-- UPDATE survey_responses SET city = 'Não informado' WHERE city IS NULL;

-- =====================================================
-- VERIFICAÇÕES PÓS-MIGRAÇÃO
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

-- Verificar dados existentes
SELECT COUNT(*) as total_responses FROM survey_responses;
SELECT COUNT(*) as total_answers FROM question_answers;
