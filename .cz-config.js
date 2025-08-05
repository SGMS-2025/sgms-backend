module.exports = {
  types: [
    { value: 'feat', name: 'feat:     ✨ A new feature' },
    { value: 'fix', name: 'fix:      🐛 A bug fix' },
    { value: 'docs', name: 'docs:     📚 Documentation changes' },
    { value: 'style', name: 'style:    💎 Code style changes (formatting, etc)' },
    { value: 'refactor', name: 'refactor: 📦 Code refactoring' },
    { value: 'test', name: 'test:     🚨 Adding or updating tests' },
    { value: 'chore', name: 'chore:    🔧 Maintenance tasks' },
    { value: 'perf', name: 'perf:     ⚡ Performance improvements' },
    { value: 'ci', name: 'ci:       👷 CI/CD changes' },
    { value: 'build', name: 'build:    📦 Build system changes' },
    { value: 'revert', name: 'revert:   ⏪ Revert previous changes' }
  ],
  
  scopes: [
    { name: 'auth' },
    { name: 'user' },
    { name: 'database' },
    { name: 'api' },
    { name: 'config' },
    { name: 'middleware' },
    { name: 'routes' },
    { name: 'validation' },
    { name: 'security' },
    { name: 'performance' }
  ],
  
  allowCustomScopes: true,
  allowBreakingChanges: ['feat', 'fix'],
  subjectLimit: 50,
  subjectSeparator: ': ',
  ticketNumberPrefix: '#',
  
  messages: {
    type: 'Select the type of change that you\'re committing:',
    scope: 'Denote the SCOPE of this change (optional):',
    customScope: 'Denote the SCOPE of this change:',
    subject: 'Write a SHORT, IMPERATIVE tense description of the change:\n',
    body: 'Provide a LONGER description of the change (optional). Use "|" to break new line:\n',
    breaking: 'List any BREAKING CHANGES (optional):\n',
    footer: 'List any ISSUES CLOSED by this change (optional). E.g.: #31, #34:\n',
    confirmCommit: 'Are you sure you want to proceed with the commit above?'
  }
};
