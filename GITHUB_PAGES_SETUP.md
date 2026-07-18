# 🚀 GitHub Pages Deployment Guide

## ✅ O que foi configurado

Um **pipeline GitHub Actions** foi criado para automatizar o build e deploy da aplicação no **GitHub Pages**.

### 📋 Arquivos criados:
- `.github/workflows/deploy.yml` - Pipeline CI/CD completo

### 🔄 O que o pipeline faz:

1. **Build** - Compila o projeto React + Vite para a pasta `dist`
2. **Lint** - Valida o código TypeScript
3. **Deploy** - Publica automaticamente no GitHub Pages

---

## 🎯 Próximos passos

### 1. Ativar GitHub Pages no repositório

1. Vá para **Settings** → **Pages**
2. Em **Source**, selecione:
   - **Deploy from a branch**
   - Branch: `gh-pages`
   - Pasta: `/ (root)`
3. Clique em **Save**

### 2. Commits automáticos do pipeline

O pipeline será acionado automaticamente quando você fizer push para:
- `main`
- `master`
- `develop`

### 3. Verificar o status

```bash
# Ver histórico de execuções
# GitHub → Actions → Workflows → "Build and Deploy to GitHub Pages"
```

---

## 🌍 URL do GitHub Pages

Após o deploy bem-sucedido, sua aplicação estará disponível em:

```
https://<seu-usuario>.github.io/<nome-do-repositorio>/
```

**Ou** se o repositório for `<seu-usuario>.github.io`:
```
https://<seu-usuario>.github.io/
```

---

## 📝 Variáveis de Ambiente

Se precisar de `.env` no build, adicione secrets no GitHub:

1. Settings → Secrets and variables → Actions
2. Clique em **New repository secret**
3. Adicione as variáveis necessárias

Depois atualize o `.github/workflows/deploy.yml`:
```yaml
      - name: Build
        env:
          VITE_YOUR_VAR: ${{ secrets.YOUR_SECRET }}
        run: npm run build
```

---

## 🧪 Testar localmente

```bash
npm run build
npm run preview
```

---

## ❌ Troubleshooting

### Pipeline falhando?
Verifique os logs em: **GitHub → Actions → Workflow runs**

### Não vê as mudanças no site?
- Aguarde 2-3 minutos após o deploy
- Limpe cache: `Ctrl+Shift+R` (ou `Cmd+Shift+R` no Mac)

### Erro de permissões?
Vá para **Settings → Pages** e confirme que a branch `gh-pages` está selecionada.

---

✨ **Seu projeto está pronto para deploy automático no GitHub Pages!**
