# TripGenius GitHub上传脚本
# 请将下面的 YOUR_GITHUB_USERNAME 替换为您的实际GitHub用户名

param(
    [Parameter(Mandatory=$true)]
    [string]$GitHubUsername
)

Write-Host "========================================" -ForegroundColor Green
Write-Host "TripGenius GitHub上传脚本" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# 检查是否在正确的目录
if (-not (Test-Path "package.json")) {
    Write-Host "❌ 错误：请在项目根目录运行此脚本" -ForegroundColor Red
    exit 1
}

# 检查Git是否安装
if (-not (Get-Command "git" -ErrorAction SilentlyContinue)) {
    Write-Host "❌ 错误：未检测到Git，请先安装Git" -ForegroundColor Red
    exit 1
}

Write-Host "✅ 环境检查通过" -ForegroundColor Green
Write-Host ""

# 删除现有的远程配置
Write-Host "删除旧的远程仓库配置..." -ForegroundColor Yellow
try {
    git remote remove origin 2>$null
    Write-Host "✅ 旧的远程配置已删除" -ForegroundColor Green
} catch {
    Write-Host "⚠️ 没有找到旧的远程配置" -ForegroundColor Yellow
}

# 添加正确的远程仓库
$repoUrl = "https://github.com/$GitHubUsername/tripgeniusdbao.git"
Write-Host "添加新的远程仓库: $repoUrl" -ForegroundColor Yellow
git remote add origin $repoUrl
Write-Host "✅ 远程仓库配置完成" -ForegroundColor Green
Write-Host ""

# 推送代码到GitHub
Write-Host "推送代码到GitHub..." -ForegroundColor Yellow
try {
    git push -u origin main
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "✅ 代码上传成功！" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "下一步操作：" -ForegroundColor Cyan
    Write-Host "1. 访问 https://github.com/$GitHubUsername/tripgeniusdbao" -ForegroundColor White
    Write-Host "2. 在仓库Settings中配置GitHub Secrets" -ForegroundColor White
    Write-Host "3. 连接EdgeOne Pages进行部署" -ForegroundColor White
} catch {
    Write-Host ""
    Write-Host "❌ 推送失败，请检查：" -ForegroundColor Red
    Write-Host "   - GitHub用户名是否正确" -ForegroundColor Red
    Write-Host "   - 仓库是否存在 (https://github.com/$GitHubUsername/tripgeniusdbao)" -ForegroundColor Red
    Write-Host "   - 网络连接是否正常" -ForegroundColor Red
}