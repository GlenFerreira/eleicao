# Database Scripts

Esta pasta contém os scripts SQL para configuração e migração do banco de dados.

## Arquivos

### `clean_and_migrate.sql`
**Script principal de migração**
- Limpa dados de teste (comentado)
- Adiciona campos necessários:
  - `city` na tabela `survey_responses`
  - `federal_ideology` e `state_ideology` na tabela `surveys`
- Cria índices para performance
- **Uso**: Setup inicial do banco de dados

### `migrate_existing_data.sql`
**Migração de dados existentes**
- Migra respostas dos campos fixos (`question3_answer`, etc.) para a tabela normalizada `question_answers`
- **Uso**: Migrar dados antigos quando necessário

### `migration_analytics.sql`
**Migração específica para analytics**
- Adiciona campos necessários para o sistema de analytics
- Migra dados para suportar funcionalidades de analytics
- **Uso**: Migrações relacionadas ao sistema de analytics

## Como usar

1. **Setup inicial**: Execute `clean_and_migrate.sql`
2. **Migrar dados antigos**: Execute `migrate_existing_data.sql` se necessário
3. **Analytics**: Execute `migration_analytics.sql` se necessário

## Notas

- Sempre faça backup do banco antes de executar os scripts
- Teste em ambiente de desenvolvimento primeiro
- Os scripts são idempotentes (podem ser executados múltiplas vezes)
