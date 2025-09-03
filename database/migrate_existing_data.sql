-- =====================================================
-- MIGRAÇÃO DOS DADOS EXISTENTES
-- =====================================================

-- Este script migra as respostas dos campos fixos (question3_answer, etc.)
-- para a tabela question_answers normalizada

-- 1. Primeiro, vamos ver quais questionários existem e suas perguntas
-- (Execute este SELECT para ver a estrutura antes de migrar)
/*
SELECT 
    s.id as survey_id,
    s.title as survey_title,
    q.id as question_id,
    q.question_text,
    q.order_index,
    q.question_type
FROM surveys s
JOIN questions q ON s.id = q.survey_id
WHERE s.deleted_at IS NULL 
  AND q.deleted_at IS NULL
ORDER BY s.id, q.order_index;
*/

-- 2. Migrar respostas existentes para question_answers
-- (Execute apenas APÓS verificar a estrutura acima)

-- Para question3_answer (assumindo que é a pergunta de ordem 1)
INSERT INTO question_answers (survey_response_id, question_id, answer_text, rating_value)
SELECT 
    sr.id as survey_response_id,
    q.id as question_id,
    sr.question3_answer as answer_text,
    CASE 
        WHEN q.question_type = 'rating' THEN sr.question3_answer::integer
        ELSE NULL
    END as rating_value
FROM survey_responses sr
JOIN surveys s ON sr.survey_id = s.id
JOIN questions q ON s.id = q.survey_id AND q.order_index = 1
WHERE sr.question3_answer IS NOT NULL 
  AND sr.question3_answer != ''
  AND s.deleted_at IS NULL 
  AND q.deleted_at IS NULL;

-- Para question4_answer (assumindo que é a pergunta de ordem 2)
INSERT INTO question_answers (survey_response_id, question_id, answer_text, rating_value)
SELECT 
    sr.id as survey_response_id,
    q.id as question_id,
    sr.question4_answer as answer_text,
    CASE 
        WHEN q.question_type = 'rating' THEN sr.question4_answer::integer
        ELSE NULL
    END as rating_value
FROM survey_responses sr
JOIN surveys s ON sr.survey_id = s.id
JOIN questions q ON s.id = q.survey_id AND q.order_index = 2
WHERE sr.question4_answer IS NOT NULL 
  AND sr.question4_answer != ''
  AND s.deleted_at IS NULL 
  AND q.deleted_at IS NULL;

-- Para question5_answer (assumindo que é a pergunta de ordem 3)
INSERT INTO question_answers (survey_response_id, question_id, answer_text, rating_value)
SELECT 
    sr.id as survey_response_id,
    q.id as question_id,
    sr.question5_answer as answer_text,
    CASE 
        WHEN q.question_type = 'rating' THEN sr.question5_answer::integer
        ELSE NULL
    END as rating_value
FROM survey_responses sr
JOIN surveys s ON sr.survey_id = s.id
JOIN questions q ON s.id = q.survey_id AND q.order_index = 3
WHERE sr.question5_answer IS NOT NULL 
  AND sr.question5_answer != ''
  AND s.deleted_at IS NULL 
  AND q.deleted_at IS NULL;

-- Para question6_answer (assumindo que é a pergunta de ordem 4)
INSERT INTO question_answers (survey_response_id, question_id, answer_text, rating_value)
SELECT 
    sr.id as survey_response_id,
    q.id as question_id,
    sr.question6_answer as answer_text,
    CASE 
        WHEN q.question_type = 'rating' THEN sr.question6_answer::integer
        ELSE NULL
    END as rating_value
FROM survey_responses sr
JOIN surveys s ON sr.survey_id = s.id
JOIN questions q ON s.id = q.survey_id AND q.order_index = 4
WHERE sr.question6_answer IS NOT NULL 
  AND sr.question6_answer != ''
  AND s.deleted_at IS NULL 
  AND q.deleted_at IS NULL;

-- Para questionn_answer (assumindo que é a pergunta de ordem 5)
INSERT INTO question_answers (survey_response_id, question_id, answer_text, rating_value)
SELECT 
    sr.id as survey_response_id,
    q.id as question_id,
    sr.questionn_answer as answer_text,
    CASE 
        WHEN q.question_type = 'rating' THEN sr.questionn_answer::integer
        ELSE NULL
    END as rating_value
FROM survey_responses sr
JOIN surveys s ON sr.survey_id = s.id
JOIN questions q ON s.id = q.survey_id AND q.order_index = 5
WHERE sr.questionn_answer IS NOT NULL 
  AND sr.questionn_answer != ''
  AND s.deleted_at IS NULL 
  AND q.deleted_at IS NULL;

-- =====================================================
-- VERIFICAÇÃO PÓS-MIGRAÇÃO
-- =====================================================

-- Verificar quantas respostas foram migradas
SELECT 
    'Respostas migradas' as tipo,
    COUNT(*) as quantidade
FROM question_answers
UNION ALL
SELECT 
    'Respostas originais' as tipo,
    COUNT(*) as quantidade
FROM survey_responses;

-- Verificar se todas as respostas foram migradas corretamente
SELECT 
    sr.id,
    sr.question3_answer,
    sr.question4_answer,
    sr.question5_answer,
    COUNT(qa.id) as answers_migrated
FROM survey_responses sr
LEFT JOIN question_answers qa ON sr.id = qa.survey_response_id
GROUP BY sr.id, sr.question3_answer, sr.question4_answer, sr.question5_answer
ORDER BY sr.created_at DESC;
