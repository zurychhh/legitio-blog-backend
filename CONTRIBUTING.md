# Contributing to Auto-Blog SEO Monster

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the project.

## 🤝 Ways to Contribute

- **Bug Reports**: Open an issue with detailed information
- **Feature Requests**: Suggest new features or improvements
- **Code Contributions**: Submit pull requests with new features or fixes
- **Documentation**: Improve docs, guides, or examples
- **Testing**: Help test new features and report issues

## 🚀 Getting Started

### 1. Fork & Clone

```bash
# Fork the repository on GitHub
# Then clone your fork
git clone https://github.com/zurychhh/auto-blog-seo-monster.git
cd auto-blog-seo-monster
```

### 2. Set Up Development Environment

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your settings
```

**Frontend:**
```bash
cd frontend
npm install
cp .env.example .env
```

**Services:**
```bash
# Start PostgreSQL
brew services start postgresql  # macOS
# Or: docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=password postgres:16

# Start Redis
brew services start redis  # macOS
# Or: docker run -d -p 6379:6379 redis:7-alpine

# Run migrations
cd backend
alembic upgrade head
```

### 3. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Testing improvements

## 📝 Development Guidelines

### Code Style

**Python (Backend):**
- Follow [PEP 8](https://pep8.org/)
- Use Black for formatting: `black .`
- Use isort for imports: `isort .`
- Type hints for all functions
- Docstrings for public APIs

**TypeScript (Frontend):**
- Follow [TypeScript best practices](https://www.typescriptlang.org/)
- Use Prettier for formatting
- ESLint for linting: `npm run lint`
- Functional components with hooks

### Testing

**Backend:**
```bash
# Run tests
pytest

# With coverage
pytest --cov=app --cov-report=html

# Specific test
pytest tests/test_auth.py -v
```

**Frontend:**
```bash
# Type check
npm run type-check

# Lint
npm run lint

# Build test
npm run build
```

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add WordPress OAuth integration
fix: resolve authentication redirect bug
docs: update installation instructions
refactor: simplify AI service error handling
test: add unit tests for content generation
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style (formatting)
- `refactor`: Code refactoring
- `test`: Testing
- `chore`: Build/tools

## 🔄 Pull Request Process

### 1. Before Submitting

- [ ] Code follows style guidelines
- [ ] Tests pass locally
- [ ] New tests added for new features
- [ ] Documentation updated
- [ ] No merge conflicts with main

### 2. Submit PR

```bash
git push origin feature/your-feature-name
```

Then open PR on GitHub with:
- **Clear title**: Describe what the PR does
- **Description**: Explain why and how
- **Related issues**: Link any related issues
- **Screenshots**: If UI changes

### 3. PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Manual testing completed
- [ ] All tests pass

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
```

### 4. Code Review

- Maintainers will review your PR
- Address feedback promptly
- Keep discussion focused and professional
- Be open to suggestions

## 🐛 Reporting Bugs

### Before Reporting

1. **Search existing issues** - Maybe it's already reported
2. **Try latest version** - Bug might be fixed
3. **Minimal reproduction** - Simplify to essential steps

### Bug Report Template

```markdown
**Describe the bug**
Clear description of what happened

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen

**Screenshots**
If applicable

**Environment:**
- OS: [e.g. macOS 13]
- Python: [e.g. 3.11.5]
- Node: [e.g. 18.17.0]
- Browser: [e.g. Chrome 118]

**Additional context**
Any other relevant information
```

## 💡 Feature Requests

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
Describe the problem

**Describe the solution you'd like**
Clear description of desired functionality

**Describe alternatives you've considered**
Other approaches you thought about

**Additional context**
Mockups, examples, use cases
```

## 📚 Documentation

### Types of Documentation

- **Code comments**: Explain complex logic
- **Docstrings**: All public functions/classes
- **README**: Project overview
- **Guides**: Step-by-step tutorials
- **API docs**: Endpoint documentation

### Documentation Guidelines

- Clear and concise
- Examples included
- Up-to-date with code
- Proper formatting (Markdown)

## 🎨 Project Structure

```
.
├── backend/              # FastAPI backend
│   ├── app/
│   │   ├── api/         # API routes
│   │   ├── models/      # Database models
│   │   ├── services/    # Business logic
│   │   ├── core/        # Config, security
│   │   └── tasks/       # Celery tasks
│   ├── tests/           # Pytest tests
│   └── alembic/         # Migrations
├── frontend/            # React frontend
│   ├── src/
│   │   ├── api/         # API client
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   └── types/       # TypeScript types
│   └── public/          # Static assets
└── docs/                # Documentation
```

## 🔐 Security

### Reporting Security Issues

**DO NOT** open public issues for security vulnerabilities.

Instead:
1. Email: security@yourdomain.com
2. Include detailed description
3. Steps to reproduce
4. Potential impact

We'll respond within 48 hours.

## 📜 Code of Conduct

### Our Standards

- **Be respectful**: Treat everyone with respect
- **Be constructive**: Provide helpful feedback
- **Be inclusive**: Welcome diverse perspectives
- **Be professional**: Keep discussions on-topic

### Unacceptable Behavior

- Harassment or discrimination
- Trolling or inflammatory comments
- Personal or political attacks
- Publishing private information

### Enforcement

Violations may result in:
1. Warning
2. Temporary ban
3. Permanent ban

## 📞 Getting Help

- **Issues**: For bugs and feature requests
- **Discussions**: For questions and ideas
- **Discord/Slack**: For real-time chat (if available)
- **Email**: contact@yourdomain.com

## 🏆 Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Credited in release notes
- Thanked publicly

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing!** 🎉

Every contribution, no matter how small, makes a difference.
