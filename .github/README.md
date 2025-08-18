# GitHub Actions 工作流程說明

這個專案包含了三個 GitHub Actions 工作流程，用於自動化發佈 Foundry VTT 模組。

## 工作流程檔案

### 1. `auto-release.yml` (推薦使用)
**簡潔的自動發佈工作流程**

- **觸發條件**: 
  - 推送到 `main` 或 `master` 分支
  - 手動觸發 (`workflow_dispatch`)

- **功能**:
  - 讀取 `module.json` 中的版本號
  - 檢查是否已存在相同版本的 release
  - 如果版本不存在，自動建立 `module.zip` 並發佈到 GitHub Releases

### 2. `version-check.yml` (進階功能)
**包含版本檢查和自動版本更新的工作流程**

- **觸發條件**:
  - 推送到 `main` 或 `master` 分支 (僅限特定檔案類型)
  - 手動觸發，可選擇版本更新類型

- **功能**:
  - 檢查自上次 release 以來的變更
  - 手動觸發時可自動更新版本號 (patch/minor/major)
  - 自動提交版本更新到 repository

### 3. `release.yml` (基礎版本)
**基礎的自動發佈工作流程**

- **觸發條件**: 
  - 推送到 `main` 或 `master` 分支
  - 手動觸發

- **功能**:
  - 基本的自動發佈功能
  - 檢查重複版本並跳過

## 使用方法

### 自動發佈
1. 更新你的程式碼
2. 在 `module.json` 中更新版本號
3. 推送到 `main` 或 `master` 分支
4. GitHub Actions 會自動檢查並發佈新版本

### 手動發佈
1. 前往 GitHub repository 的 Actions 頁面
2. 選擇想要的工作流程
3. 點擊 "Run workflow"
4. 選擇分支和版本類型 (如果適用)
5. 點擊 "Run workflow"

## 版本號格式
版本號應遵循 [Semantic Versioning](https://semver.org/) 格式：
- `MAJOR.MINOR.PATCH` (例如: `2.0.2`)
- 主要版本 (MAJOR): 不相容的 API 變更
- 次要版本 (MINOR): 向後相容的功能新增
- 修補版本 (PATCH): 向後相容的錯誤修正

## 注意事項

1. **權限設定**: 確保 repository 有適當的權限來建立 releases
2. **版本檢查**: 工作流程會檢查是否已存在相同版本的 release，避免重複發佈
3. **檔案排除**: `module.zip` 會自動排除 `.git`、`.github`、`node_modules` 等不必要的檔案
4. **手動觸發**: 可以在 Actions 頁面手動觸發工作流程進行測試

## 建議使用方式

- **日常開發**: 使用 `auto-release.yml`
- **版本管理**: 使用 `version-check.yml` 進行手動版本更新
- **測試**: 使用 `release.yml` 進行基礎測試
