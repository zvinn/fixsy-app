# Security Policy for Fixsy

## 🔒 Overview

This document outlines security best practices and policies for the Fixsy project.

## 🚨 Reporting Security Vulnerabilities

If you discover a security vulnerability, please **DO NOT** open a public issue. Instead:

1. Email the maintainers at: **mhamed.saad.ibrahim@gmail.com**
2. Include detailed information about the vulnerability
3. Wait for a response before disclosing publicly

We aim to respond within 48 hours.

## 🔑 API Key Management

### Critical Rules

> [!CAUTION]
> **NEVER commit API keys, tokens, or credentials to version control!**

### Best Practices

1. **Always use environment variables** for sensitive data
2. **Use `.env.example`** to document required variables (without real values)
3. **Rotate keys immediately** if accidentally exposed
4. **Use different keys** for development and production

### Required Environment Variables

See [`.env.example`](.env.example) for a complete list. Critical keys include:

- `VITE_FIREBASE_API_KEY` - Firebase configuration
- `VITE_GROQ_API_KEY` - Groq AI API key
- `VITE_GEMINI_API_KEY` - Google Gemini API key
- `VITE_CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
- `VITE_CLOUDINARY_UPLOAD_PRESET` - Cloudinary upload preset

### Key Rotation Procedure

If an API key is exposed:

1. **Immediately revoke** the compromised key from the provider's dashboard:
   - Groq: [https://console.groq.com](https://console.groq.com)
   - Gemini: [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
   - Firebase: [https://console.firebase.google.com](https://console.firebase.google.com)
   - Cloudinary: [https://console.cloudinary.com](https://console.cloudinary.com)

2. **Generate a new key** from the provider

3. **Update `.env`** locally and in all deployment environments

4. **Verify functionality** by testing affected features

5. **Monitor usage** for any suspicious activity

## 🛡️ Security Features

### Input Validation

- All user inputs are validated and sanitized
- File uploads are checked for type, size, and content
- Image analysis uses secure APIs

### Authentication

- Firebase Authentication with email/password and social providers
- Role-based access control (Admin, Technician, Client)
- Session management and automatic logout

### Data Protection

- Firestore security rules enforce proper access control
- Sensitive user data is encrypted at rest
- HTTPS enforced for all communications

### XSS & Injection Prevention

- React's built-in XSS protection
- All database queries use parameterized statements
- Content Security Policy headers recommended

## 🔍 Security Scanning

### Automated Checks

Our CI/CD pipeline includes:

- **Secret scanning** with TruffleHog
- **Dependency scanning** with `npm audit`
- **SAST analysis** (planned)

### Manual Reviews

- Code reviews required for all PRs
- Security-critical changes require additional review
- Regular security audits recommended

## 📋 Security Checklist for Contributors

Before committing:

- [ ] No hardcoded credentials or API keys
- [ ] All environment variables properly documented
- [ ] Input validation for user-provided data
- [ ] Proper error handling (no sensitive data in errors)
- [ ] Dependencies up to date and audited
- [ ] Tests cover security-critical flows
- [ ] **Run `npm run lint` locally and enable `husky` pre-commit hooks** (repository includes `lint-staged` to auto-fix/format staged files)

Note: The repo includes a pre-commit hook that runs `lint-staged` to help prevent style/format/security regressions locally before pushing.

## 🔄 Dependency Security

### Regular Updates

```bash
# Check for vulnerabilities
npm audit

# Fix automatically where possible
npm audit fix

# Review and update dependencies
npm outdated
```

### Trusted Dependencies

- Only use well-maintained packages
- Review changelogs before updating
- Test thoroughly after dependency updates

## 🚀 Deployment Security

### Production Checklist

- [ ] All API keys rotated from development keys
- [ ] Environment variables set in deployment platform
- [ ] HTTPS enabled and enforced
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] Monitoring and logging active

### Secrets Management

**Development:**
- Use `.env` file (gitignored)
- Never share `.env` via insecure channels

**Production:**
- Use platform-specific secret management (e.g., Vercel Environment Variables, Firebase Config)
- Enable access logging for secrets
- Rotate keys regularly (every 90 days recommended)

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [React Security Best Practices](https://react.dev/learn/security)
- [Firebase Security Rules](https://firebase.google.com/docs/firestore/security/get-started)

## 📞 Contact

For security concerns, contact: **mhamed.saad.ibrahim@gmail.com**

---

**Last Updated:** 2025-12-31
