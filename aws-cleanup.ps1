# ============================================================
# AWS Resource Cleanup Script (PowerShell)
# Deletes all Weather Analytics Dashboard resources
# ============================================================
# WARNING: This will DELETE all resources and DATA!
# ============================================================

$ErrorActionPreference = "Continue"  # Continue on errors

# Configuration
$AWS_REGION = if ($env:AWS_REGION) { $env:AWS_REGION } else { "ap-south-1" }
$PROJECT_NAME = "weather-analytics"
$KINESIS_STREAM_NAME = "WeatherDataStream"
$DYNAMODB_TABLE_NAME = "WeatherData"
$LAMBDA_FUNCTION_NAME = "WeatherDataProcessor"
$LAMBDA_ROLE_NAME = "$PROJECT_NAME-lambda-role"

Write-Host "============================================" -ForegroundColor Red
Write-Host "AWS Resource Cleanup - Weather Analytics" -ForegroundColor Red
Write-Host "============================================" -ForegroundColor Red
Write-Host "Region: $AWS_REGION"
Write-Host ""
Write-Host "⚠️  WARNING: This will DELETE the following:" -ForegroundColor Yellow
Write-Host "  • Kinesis Stream: $KINESIS_STREAM_NAME"
Write-Host "  • DynamoDB Table: $DYNAMODB_TABLE_NAME (ALL DATA!)" -ForegroundColor Red
Write-Host "  • Lambda Function: $LAMBDA_FUNCTION_NAME"
Write-Host "  • IAM Role: $LAMBDA_ROLE_NAME"
Write-Host ""

$CONFIRM = Read-Host "Are you sure? Type 'DELETE' to confirm"

if ($CONFIRM -ne "DELETE") {
    Write-Host "❌ Cleanup cancelled" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "Starting cleanup..." -ForegroundColor Cyan
Write-Host ""

# ---- 1. Delete Event Source Mappings ----
Write-Host "🔗 Deleting event source mappings..." -ForegroundColor Yellow
try {
    $MAPPINGS = (aws lambda list-event-source-mappings --function-name $LAMBDA_FUNCTION_NAME --region $AWS_REGION --query "EventSourceMappings[].UUID" --output text 2>$null)
    if ($MAPPINGS) {
        foreach ($UUID in $MAPPINGS.Split()) {
            Write-Host "   Deleting mapping: $UUID"
            aws lambda delete-event-source-mapping --uuid $UUID --region $AWS_REGION 2>$null
        }
        Write-Host "   ✓ Event source mappings deleted" -ForegroundColor Green
    } else {
        Write-Host "   No event source mappings found"
    }
} catch {
    Write-Host "   No event source mappings found"
}
Write-Host ""

# ---- 2. Delete Lambda Function ----
Write-Host "λ Deleting Lambda function: $LAMBDA_FUNCTION_NAME..." -ForegroundColor Yellow
try {
    aws lambda get-function --function-name $LAMBDA_FUNCTION_NAME --region $AWS_REGION 2>$null | Out-Null
    aws lambda delete-function --function-name $LAMBDA_FUNCTION_NAME --region $AWS_REGION
    Write-Host "   ✓ Lambda function deleted" -ForegroundColor Green
} catch {
    Write-Host "   Lambda function not found, skipping"
}
Write-Host ""

# ---- 3. Delete DynamoDB Table ----
Write-Host "💾 Deleting DynamoDB table: $DYNAMODB_TABLE_NAME..." -ForegroundColor Yellow
try {
    aws dynamodb describe-table --table-name $DYNAMODB_TABLE_NAME --region $AWS_REGION 2>$null | Out-Null
    aws dynamodb delete-table --table-name $DYNAMODB_TABLE_NAME --region $AWS_REGION | Out-Null
    Write-Host "   ✓ DynamoDB table deletion initiated" -ForegroundColor Green
    Write-Host "   Waiting for table to be deleted..."
    aws dynamodb wait table-not-exists --table-name $DYNAMODB_TABLE_NAME --region $AWS_REGION 2>$null
    Write-Host "   ✓ DynamoDB table deleted" -ForegroundColor Green
} catch {
    Write-Host "   DynamoDB table not found, skipping"
}
Write-Host ""

# ---- 4. Delete Kinesis Stream ----
Write-Host "📡 Deleting Kinesis stream: $KINESIS_STREAM_NAME..." -ForegroundColor Yellow
try {
    aws kinesis describe-stream --stream-name $KINESIS_STREAM_NAME --region $AWS_REGION 2>$null | Out-Null
    aws kinesis delete-stream --stream-name $KINESIS_STREAM_NAME --region $AWS_REGION
    Write-Host "   ✓ Kinesis stream deletion initiated" -ForegroundColor Green
    Write-Host "   Note: Stream deletion takes ~24 hours to complete"
} catch {
    Write-Host "   Kinesis stream not found, skipping"
}
Write-Host ""

# ---- 5. Delete IAM Role ----
Write-Host "🔐 Deleting IAM role: $LAMBDA_ROLE_NAME..." -ForegroundColor Yellow
try {
    aws iam get-role --role-name $LAMBDA_ROLE_NAME 2>$null | Out-Null
    
    Write-Host "   Deleting inline policies..."
    aws iam delete-role-policy --role-name $LAMBDA_ROLE_NAME --policy-name "$PROJECT_NAME-permissions" 2>$null
    
    Write-Host "   Detaching managed policies..."
    aws iam detach-role-policy --role-name $LAMBDA_ROLE_NAME --policy-arn "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole" 2>$null
    aws iam detach-role-policy --role-name $LAMBDA_ROLE_NAME --policy-arn "arn:aws:iam::aws:policy/AmazonKinesisReadOnlyAccess" 2>$null
    
    aws iam delete-role --role-name $LAMBDA_ROLE_NAME
    Write-Host "   ✓ IAM role deleted" -ForegroundColor Green
} catch {
    Write-Host "   IAM role not found, skipping"
}
Write-Host ""

# ---- 6. Clean up local files ----
Write-Host "🧹 Cleaning up local Lambda package..." -ForegroundColor Yellow
if (Test-Path "backend\lambda-package") {
    Remove-Item -Recurse -Force "backend\lambda-package"
    Write-Host "   ✓ Deleted backend\lambda-package\" -ForegroundColor Green
}
if (Test-Path "backend\lambda-function.zip") {
    Remove-Item -Force "backend\lambda-function.zip"
    Write-Host "   ✓ Deleted backend\lambda-function.zip" -ForegroundColor Green
}
Write-Host ""

# ---- Summary ----
Write-Host "============================================" -ForegroundColor Green
Write-Host "✅ Cleanup Complete!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Deleted Resources:"
Write-Host "  ✓ Event source mappings"
Write-Host "  ✓ Lambda function: $LAMBDA_FUNCTION_NAME"
Write-Host "  ✓ DynamoDB table: $DYNAMODB_TABLE_NAME"
Write-Host "  ✓ Kinesis stream: $KINESIS_STREAM_NAME (deletion in progress)"
Write-Host "  ✓ IAM role: $LAMBDA_ROLE_NAME"
Write-Host "  ✓ Local Lambda package files"
Write-Host ""
Write-Host "Note: Kinesis stream deletion takes up to 24 hours."
Write-Host ""
Write-Host "To redeploy, run: .\aws-deploy.ps1"
Write-Host "============================================"
