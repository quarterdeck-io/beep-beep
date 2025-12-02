# GitHub Actions Workflows

This repository includes several GitHub Actions workflows for automated building, testing, and releasing of the eeeeee-bay Electron application.

## Workflows Overview

### 1. CI (`ci.yml`)

**Triggers**: Push and Pull Requests to `main` and `develop` branches
**Purpose**: Continuous Integration - runs tests and builds on every commit

- ✅ Runs on Linux, Windows, and macOS
- ✅ Tests with Node.js 18 and 20
- ✅ Runs linting, tests, and type checking
- ✅ Verifies the app builds successfully
- ✅ Creates test builds on main branch pushes

### 2. Build and Release (`build-and-release.yml`)

**Triggers**:

- Git tags matching `v*` (e.g., `v1.0.0`, `v2.1.3`)
- Manual workflow dispatch

**Purpose**: Creates official releases with downloadable binaries

- 🚀 Builds for Windows, macOS, and Linux
- 📦 Creates installer packages (.exe, .dmg, .AppImage, .deb)
- 🏷️ Creates GitHub releases with release notes
- ⬆️ Uploads build artifacts to the release

### 3. Release Version (`release.yml`)

**Triggers**: Manual workflow dispatch only
**Purpose**: Automates version bumping and release creation

- 🔢 Automatically bumps version (patch/minor/major)
- 📝 Updates CHANGELOG.md
- 🏷️ Creates and pushes git tags
- 🚀 Triggers the build and release workflow

## How to Use

### Creating a Release

#### Option 1: Automatic Version Bump (Recommended)

1. Go to **Actions** tab in GitHub
2. Select **"Release Version"** workflow
3. Click **"Run workflow"**
4. Choose version bump type:
   - `patch`: 1.0.0 → 1.0.1 (bug fixes)
   - `minor`: 1.0.0 → 1.1.0 (new features)
   - `major`: 1.0.0 → 2.0.0 (breaking changes)
5. Or enter a custom version like `v1.2.3`
6. Click **"Run workflow"**

This will:

- Update package.json version
- Update CHANGELOG.md
- Create and push a git tag
- Automatically trigger the build and release workflow

#### Option 2: Manual Tag Creation

1. Create and push a tag manually:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```
2. This will automatically trigger the build and release workflow

#### Option 3: Manual Workflow Trigger

1. Go to **Actions** tab in GitHub
2. Select **"Build and Release"** workflow
3. Click **"Run workflow"**
4. Enter the version (e.g., `v1.0.0`)
5. Click **"Run workflow"**

### Release Assets

Each release will include:

**Windows**:

- `eeeeee-bay-v1.0.0-setup.exe` - Windows installer

**macOS**:

- `eeeeee-bay-v1.0.0-mac.dmg` - macOS disk image

**Linux**:

- `eeeeee-bay-v1.0.0.AppImage` - Portable Linux executable
- `eeeeee-bay_v1.0.0_amd64.deb` - Debian/Ubuntu package

## Configuration

### Secrets Required

The workflows use `GITHUB_TOKEN` which is automatically provided by GitHub Actions. No additional secrets are needed.

### Customizing Build Targets

To modify which platforms to build for, edit the `matrix.os` in the workflows:

```yaml
strategy:
  matrix:
    os: [macos-latest, windows-latest, ubuntu-latest]
```

### Customizing Release Notes

Edit the release body in `build-and-release.yml` to customize the release notes template.

## Troubleshooting

### Build Failures

1. Check the **Actions** tab for detailed error logs
2. Ensure all tests pass locally with `npm test`
3. Verify the build works locally with `npm run build`

### Missing Release Assets

- The workflow uses `continue-on-error: true` for asset uploads
- Check the workflow logs to see which uploads failed
- File paths in the workflow may need adjustment based on actual build output

### Version Conflicts

- Ensure the version in package.json matches your tag
- Use the "Release Version" workflow to keep versions in sync

## File Structure

```
.github/workflows/
├── ci.yml                 # Continuous Integration
├── build-and-release.yml  # Build and Release
└── release.yml            # Version Management
```
