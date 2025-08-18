# Game Time Clock

A FoundryVTT module that shows how much time you spend in game.

## Features

- Track game session time
- Display time spent in game
- Multi-language support (English, Traditional Chinese)

## Installation

### Manual Installation
1. Download the latest release from [GitHub Releases](https://github.com/hktrpg/foundryVTT_game_time_clock/releases)
2. Extract the ZIP file to your FoundryVTT modules directory
3. Enable the module in your world settings

### FoundryVTT Module Installation
1. In FoundryVTT, go to Add-on Modules
2. Click "Install Module"
3. Enter the manifest URL: `https://raw.githubusercontent.com/hktrpg/foundryVTT_game_time_clock/master/module.json`
4. Click "Install"

## Compatibility

- **FoundryVTT**: 10+
- **Verified**: 13

## Development

### Prerequisites
- Node.js 16+ 
- Git

### Setup
```bash
# Clone the repository
git clone https://github.com/hktrpg/foundryVTT_game_time_clock.git
cd foundryVTT_game_time_clock

# Install dependencies
npm install
```

### Available Scripts

#### Version Management
```bash
# Bump version (patch, minor, or major)
npm run version:patch    # 2.0.0 → 2.0.1
npm run version:minor    # 2.0.0 → 2.1.0  
npm run version:major    # 2.0.0 → 3.0.0

# Dry run to see what version would be set
npm run version:dry-run

# Manual version bump
npm run version:bump patch
```

#### Validation & Testing
```bash
# Validate module.json
npm run validate

# Package the module
npm run package
```

### CI/CD Pipeline

This repository uses GitHub Actions for continuous integration and deployment:

#### Workflows

1. **CI** (`.github/workflows/ci.yml`)
   - Runs on every push and pull request
   - Validates module structure
   - Checks file integrity
   - Extracts version from `module.json`

2. **Release** (`.github/workflows/release.yml`)
   - Triggers when a version tag is pushed (e.g., `v2.0.1`)
   - Creates GitHub release
   - Packages module as ZIP file
   - Updates manifest URLs

3. **Package** (`.github/workflows/package.yml`)
   - Manual workflow for creating packages
   - Useful for testing or manual releases

4. **Validate** (`.github/workflows/validate.yml`)
   - Comprehensive module validation
   - Runs weekly and manually
   - Generates validation reports

### Release Process

1. **Update Version**
   ```bash
   npm run version:patch  # or minor/major
   ```

2. **Commit Changes**
   ```bash
   git add module.json
   git commit -m "Bump version to 2.0.1"
   ```

3. **Create Tag**
   ```bash
   git tag v2.0.1
   ```

4. **Push to GitHub**
   ```bash
   git push
   git push --tags
   ```

5. **Automatic Release**
   - GitHub Actions will automatically:
     - Validate the module
     - Create a release
     - Package the module
     - Update manifest URLs

### Version Management

The version is automatically extracted from `module.json` in all CI/CD workflows. The version format follows semantic versioning (SemVer):

- **Patch** (2.0.0 → 2.0.1): Bug fixes
- **Minor** (2.0.0 → 2.1.0): New features, backward compatible
- **Major** (2.0.0 → 3.0.0): Breaking changes

### File Structure

```
game_time_clock/
├── .github/workflows/     # CI/CD workflows
├── scripts/               # Development scripts
├── langs/                 # Language files
│   ├── en.json           # English
│   └── zh-tw.json        # Traditional Chinese
├── index.js              # Main module file
├── module.json           # Module manifest
├── package.json          # Development dependencies
└── README.md             # This file
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test your changes
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/hktrpg/foundryVTT_game_time_clock/issues)
- **Discord**: zzz#8939

## Changelog

### Version 2.0.0
- Initial release
- Multi-language support
- CI/CD pipeline implementation
