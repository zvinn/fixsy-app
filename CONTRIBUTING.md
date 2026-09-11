# 🤝 Contributing to Fixsy

Thank you for your interest in contributing to **Fixsy**! We welcome contributions, bug reports, feature suggestions, and pull requests to build the leading home services platform for the MENA region.

---

## 🛠️ Development Setup

1. **Fork and Clone the Repository:**
   ```bash
   git clone https://github.com/zvinn/fixsy-app.git
   cd fixsy-app
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment:**
   ```bash
   cp .env.example .env
   ```

4. **Launch Vite Dev Server:**
   ```bash
   npm run dev
   ```

---

## 📋 Code Quality & Standards

Before opening a pull request, please verify that your changes adhere to project standards:

- **Type Safety:** Run `npm run type-check` to ensure zero TypeScript errors.
- **Linting:** Run `npm run lint` and `npm run format:check`.
- **Testing:** Run `npm run test:run` to verify unit and integration tests.
- **Commit Messages:** Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:
  - `feat: add new feature`
  - `fix: resolve bug or issue`
  - `docs: update documentation`
  - `refactor: optimize existing code`

---

## 💬 Community & Feedback

If you encounter a bug or have a suggestion, please open an [Issue](https://github.com/zvinn/fixsy-app/issues) on GitHub.
