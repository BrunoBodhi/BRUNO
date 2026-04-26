# Guia de Hospedagem e Configuração do Banco de Dados

Este documento contém as instruções necessárias para hospedar sua aplicação e configurar o banco de dados Firebase para que as alterações feitas no painel administrativo sejam salvas permanentemente.

## 1. Organização do Projeto
Os arquivos estão organizados da seguinte forma:
- `/src`: Contém todo o código-fonte (React + TypeScript).
- `/components`: Componentes da interface, divididos por funcionalidade.
- `/components/admin`: Todas as ferramentas do painel administrativo.
- `api.ts`: Centraliza a comunicação com o banco de dados (Firebase/Firestore).
- `constants.tsx`: Define os valores padrão e configurações iniciais da marca.
- `types.ts`: Define as estruturas de dados (TypeScript interfaces) usadas no sistema.

## 2. Configuração do Banco de Dados (Firebase)
O sistema foi projetado para usar o **Firebase Firestore**. Siga estes passos para configurar:

1.  Acesse o [Console do Firebase](https://console.firebase.google.com/).
2.  Crie um novo projeto (ex: "Minha Barbbearia").
3.  No menu lateral, vá em **Compilação > Firestore Database** e clique em **Criar banco de dados**.
4.  Escolha uma região (ex: `southamerica-east1` para o Brasil) e inicie em **Modo de Produção** (depois configure as regras de segurança).
5.  Vá em **Configurações do Projeto > Geral** e adicione um **App Web** (ícone `</>`).
6.  Copie o objeto `firebaseConfig` que será gerado. Ele contém `apiKey`, `authDomain`, `projectId`, etc.
7.  Abra o arquivo `api.ts` e cole esses valores na variável `firebaseConfig` (linha 44).

### Estrutura do Banco (Firestore)
O sistema criará automaticamente duas coleções principais:
- `stores`: Armazena as configurações de cada estabelecimento (identificado pelo PIN).
- `public`: Armazena a configuração que será exibida para o público geral (Landing Page).

## 3. Como Hospedar (Deploy)
Para colocar o site no ar (ex: Hostinger, Vercel, Netlify):

1.  **Gere os arquivos de produção:**
    No terminal, execute: `npm run build`
2.  **Envie os arquivos:**
    Após o comando, será criada uma pasta chamada `dist`. Copie TODO o conteúdo dessa pasta e envie para o seu servidor de hospedagem (via FTP ou Git).
3.  **Configuração do Servidor (Apache/.htaccess):**
    A aplicação utiliza rotas do lado do cliente. No servidor Apache, certifique-se de que o arquivo `.htaccess` (já incluído no projeto) esteja configurado para redirecionar todas as requisições para o `index.html`.

## 4. Requisitos Técnicos
- **Node.js:** Versão 18.x ou superior para compilação local.
- **Hospedagem:** Qualquer serviço que suporte arquivos estáticos (HTML/JS/CSS).
- **Banco de Dados:** Conta gratuita do Firebase (Spark Plan) é suficiente para começar.

---
*Dica: Antes de baixar os arquivos, verifique se todas as suas alterações visuais e textos estão como você deseja no modo de visualização.*
