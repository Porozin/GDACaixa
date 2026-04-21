# Guia de Configuração de Backup Automático (Firestore)

Para que o backup automático funcione no GitHub, você precisa dar permissão para o script acessar seu banco de dados. Siga estes passos:

## 1. Gerar a Chave do Firebase (Service Account)
1. Vá para o [Console do Firebase](https://console.firebase.google.com/).
2. Clique no ícone de engrenagem (Configurações do Projeto) > **Contas de Serviço**.
3. Clique no botão azul **Gerar nova chave privada**.
4. Um arquivo `.json` será baixado. **Não compartilhe este arquivo com ninguém e não o coloque no GitHub.**

## 2. Configurar o Secret no GitHub
1. Abra o seu repositório no GitHub.
2. Vá em **Settings** (Configurações) > **Secrets and variables** > **Actions**.
3. Clique em **New repository secret**.
4. No nome, coloque: `FIREBASE_SERVICE_ACCOUNT`
5. No conteúdo (Value), cole todo o texto que está dentro do arquivo `.json` que você baixou.
6. Clique em **Add secret**.

## 3. Testar o Backup
1. No seu repositório GitHub, vá na aba **Actions**.
2. Clique em **Firestore Periodic Backup** na lateral esquerda.
3. Clique no botão **Run workflow** > **Run workflow**.
4. Aguarde alguns minutos. Se tudo der certo, uma pasta chamada `backups/` aparecerá no seu código com o arquivo JSON!

---

### Como Restaurar?
Se algo der errado no banco, você terá o arquivo JSON com todos os dados. Você poderá usar um script similar para fazer o "upload" de volta ou simplesmente consultar os dados no arquivo para recuperar o que foi perdido.

> [!TIP]
> O backup roda automaticamente todos os dias às 03:00 da manhã.
