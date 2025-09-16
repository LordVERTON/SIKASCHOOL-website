# Development Guide

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation
```bash
npm install --legacy-peer-deps
```

### Development
```bash
npm run dev
```

### Building for Production
```bash
npm run build
npm run start
```

## Code Quality & Security

### Scripts Available
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run type-check` - Run TypeScript type checking
- `npm run security:audit` - Run npm security audit
- `npm run security:check` - Run comprehensive security checks
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage

### Pre-commit Checklist
- [ ] Run `npm run lint:fix`
- [ ] Run `npm run type-check`
- [ ] Run `npm run security:check`
- [ ] Run `npm run test`
- [ ] Ensure all tests pass
- [ ] Check for console errors in browser

## Architecture

### Project Structure
```
├── app/                    # Next.js App Router
│   └── (site)/            # Site routes
├── components/            # React components
│   ├── Accessibility/     # Accessibility components
│   ├── Booking/          # Booking-related components
│   └── ...
├── lib/                   # Utility libraries
│   ├── __tests__/        # Test files
│   ├── validation.ts     # Input validation
│   ├── storage.ts        # Secure storage utilities
│   ├── logger.ts         # Logging utilities
│   └── ...
├── public/               # Static assets
├── scripts/              # Build and utility scripts
└── types/                # TypeScript type definitions
```

### Security Features
- Input validation and sanitization
- Security headers (CSP, XSS protection, etc.)
- Error boundaries and secure logging
- TypeScript strict mode
- ESLint security rules
- Regular security audits

### Accessibility Features
- Skip links for keyboard navigation
- Proper ARIA labels and roles
- Semantic HTML structure
- Focus management
- Screen reader compatibility

## Development Guidelines

### TypeScript
- Use strict mode (enabled)
- Define proper interfaces for all props
- Avoid `any` type
- Use proper error handling

### React Components
- Use functional components with hooks
- Implement proper error boundaries
- Add accessibility attributes
- Use semantic HTML elements

### Styling
- Use Tailwind CSS classes
- Follow the existing design system
- Ensure responsive design
- Test in both light and dark modes

### Testing
- Write unit tests for utilities
- Test component behavior
- Mock external dependencies
- Maintain good test coverage

### Security
- Validate all user inputs
- Sanitize data before storage
- Use secure storage methods
- Log security events appropriately

## Environment Variables

Create a `.env.local` file for local development:
```env
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=SikaSchool
```

## Deployment

### Production Checklist
- [ ] Run all security checks
- [ ] Update environment variables
- [ ] Enable HTTPS
- [ ] Configure security headers
- [ ] Set up monitoring
- [ ] Test all functionality

### Recommended Platforms
- Vercel (recommended for Next.js)
- Netlify
- AWS Amplify

## Troubleshooting

### Common Issues
1. **TypeScript errors**: Run `npm run type-check`
2. **Linting errors**: Run `npm run lint:fix`
3. **Security vulnerabilities**: Run `npm run security:fix`
4. **Build failures**: Check for missing dependencies

### Getting Help
- Check the documentation
- Review the security policy
- Run the security check script
- Check the test suite

## Contributing

1. Follow the code quality guidelines
2. Write tests for new features
3. Update documentation as needed
4. Run all checks before submitting
5. Follow the security best practices
