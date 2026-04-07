# ATLAS FISCAL - Sistema de Automação e Inteligência Tributária

Este projeto consiste em uma plataforma de automação fiscal desenvolvida para otimizar o processamento de Notas Fiscais Eletrônicas (NF-e), realizar cálculos complexos de Substituição Tributária (ICMS-ST) e automatizar a geração de documentos de arrecadação através de processos de RPA (Robotic Process Automation).

## Visão Geral

O ATLAS FISCAL funciona como uma camada de inteligência sobre os documentos fiscais de uma organização, permitindo que contadores e gestores tributários transformem arquivos XML brutos em visões estratégicas de custo e conformidade. O sistema é estruturado em uma arquitetura moderna, utilizando microserviços para processamento de dados e automação de interface governamental.

## Funcionalidades Principais

*   **Ingestão Inteligente de XML**: Mapeamento e extração automática de dados de NF-e, incluindo dados de fornecedores, produtos (SKUs) e tributação original.
*   **Motor de Cálculo ICMS-ST**: Algoritmo especializado para cálculo do custo efetivo da Substituição Tributária, permitindo a visualização do impacto financeiro real por mercadoria.
*   **Auditoria e Persistência**: Histórico completo e imutável de todas as operações processadas, integrado a um banco de dados relacional para consultas rápidas e geração de relatórios.
*   **Estratégia de Precificação**: Módulo que converte tributos complexos em valores de custo de prateleira, auxiliando na formação de preço de venda.
*   **RPA para Geração de DAE**: Automação robótica utilizando Playwright para preencher formulários no portal da SEFAZ, reduzindo erros manuais e tempo de operação.
*   **Gestão Multiempresas**: Arquitetura multi-tenant que permite o isolamento completo de dados por CNPJ ou cliente, ideal para holdings ou escritórios de contabilidade.

## Arquitetura Tecnológica

### Backend
*   **FastAPI**: Framework de alto desempenho para a construção da API.
*   **Playwright**: Motor de automação para navegação em portais governamentais.
*   **Supabase (PostgreSQL)**: Persistência de dados e autenticação de usuários.
*   **Pydantic**: Validação de dados e modelagem de esquemas.

### Frontend
*   **React (Vite)**: Interface reativa e de alta performance.
*   **Tailwind CSS**: Estilização baseada em utilitários para interface corporativa moderna.
*   **Lucide React**: Conjunto de ícones para interfaces profissionais.
*   **React Router**: Gerenciamento de rotas e estados de navegação.

## Infraestrutura e Deploy

O projeto está configurado para rodar em ambientes containerizados via **Docker**, facilitando a escalabilidade do motor Playwright (Chrome Headless) no backend e o serviço de frontend.

### Requisitos
*   Docker e Docker Compose
*   Conta no Supabase (URL e Chave de API)

### Inicialização
1.  Configure as variáveis de ambiente no arquivo `.env` (baseado no `.env.example`).
2.  Inicie os containers:
    ```bash
    docker-compose up -d --build
    ```

## Estrutura do Repositório
*   `/backend`: Código fonte da API e motores de automação.
*   `/frontend`: Código fonte da aplicação web single-page.
*   `supabase_schema.sql`: Script de migração para configuração do banco de dados.

## Boas Práticas e Contribuição
Este projeto segue padrões rigorosos de desenvolvimento, incluindo:
*   Tipagem estática (TypeScript e Type Hints em Python).
*   Logs estruturados para rastreabilidade de erros no RPA.
*   Isolamento de contexto para segurança de dados entre tenants.
