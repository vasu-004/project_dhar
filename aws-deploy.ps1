# ============================================================
# AWS Infrastructure Deployment Script (PowerShell)
# Real-Time Weather Analytics Dashboard
# ============================================================

$ErrorActionPreference = "Stop"

# Configuration
$AWS_REGION = if ($env:AWS_REGION) { $env:AWS_REGION } else { "ap-south-1" }
$PROJECT_NAME = "weather-analytics"
$KINESIS_STREAM_NAME = "WeatherDataStream"
$DYNAMODB_TABLE_NAME = "WeatherData"
$LAMBDA_FUNCTION_NAME = "WeatherDataProcessor"
$LAMBDA_ROLE_NAME = "$PROJECT_NAME-lambda-role"

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "AWS Weather Analytics Dashboard Deployer" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Region: $AWS_REGION"
Write-Host "Project: $PROJECT_NAME"
Write-Host ""

# Check AWS CLI
if (-not (Get-Command aws -ErrorAction SilentlyContinue)) {
    Write-Host "❌ AWS CLI not found. Please install from: https://aws.amazon.com/cli/" -ForegroundColor Red
    exit 1
}

Write-Host "✓ AWS CLI found" -ForegroundColor Green

# Get AWS Account ID
$AWS_ACCOUNT_ID = (aws sts get-caller-identity --query Account --output text)
Write-Host "AWS Account: $AWS_ACCOUNT_ID"
Write-Host ""

# ---- 1. Create Kinesis Stream ----
Write-Host "📡 Creating Kinesis Stream: $KINESIS_STREAM_NAME..." -ForegroundColor Yellow
try {
    aws kinesis describe-stream --stream-name $KINESIS_STREAM_NAME --region $AWS_REGION 2>$null
    Write-Host "   Stream already exists" -ForegroundColor Gray
} catch {
    aws kinesis create-stream --stream-name $KINESIS_STREAM_NAME --shard-count 2 --region $AWS_REGION
    Write-Host "   ✓ Kinesis Stream created" -ForegroundColor Green
    aws kinesis wait stream-exists --stream-name $KINESIS_STREAM_NAME --region $AWS_REGION
}
Write-Host ""

# ---- 2. Create DynamoDB Table ----
Write-Host "💾 Creating DynamoDB Table: $DYNAMODB_TABLE_NAME..." -ForegroundColor Yellow
try {
    aws dynamodb describe-table --table-name $DYNAMODB_TABLE_NAME --region $AWS_REGION 2>$null
    Write-Host "   Table already exists" -ForegroundColor Gray
} catch {
    aws dynamodb create-table `
        --table-name $DYNAMODB_TABLE_NAME `
        --attribute-definitions AttributeName=city,AttributeType=S AttributeName=timestamp,AttributeType=S `
        --key-schema AttributeName=city,KeyType=HASH AttributeName=timestamp,KeyType=RANGE `
        --billing-mode PAY_PER_REQUEST `
        --region $AWS_REGION
    Write-Host "   ✓ DynamoDB Table created" -ForegroundColor Green
    aws dynamodb wait table-exists --table-name $DYNAMODB_TABLE_NAME --region $AWS_REGION
}
Write-Host ""

# ---- 3. Create IAM Role ----
Write-Host "🔐 Creating IAM Role: $LAMBDA_ROLE_NAME..." -ForegroundColor Yellow

$TRUST_POLICY = @"
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {"Service": "lambda.amazonaws.com"},
    "Action": "sts:AssumeRole"
  }]
}
"@

$TRUST_POLICY | Out-File -FilePath "$env:TEMP\trust-policy.json" -Encoding utf8

try {
    aws iam get-role --role-name $LAMBDA_ROLE_NAME 2>$null
    Write-Host "   Role exists, updating..." -ForegroundColor Gray
} catch {
    aws iam create-role --role-name $LAMBDA_ROLE_NAME --assume-role-policy-document "file://$env:TEMP\trust-policy.json"
    Write-Host "   ✓ IAM Role created" -ForegroundColor Green
}

# Attach policies
aws iam attach-role-policy --role-name $LAMBDA_ROLE_NAME --policy-arn "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole" 2>$null
aws iam attach-role-policy --role-name $LAMBDA_ROLE_NAME --policy-arn "arn:aws:iam::aws:policy/AmazonKinesisReadOnlyAccess" 2>$null

$INLINE_POLICY = @"
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": ["dynamodb:PutItem", "dynamodb:UpdateItem", "dynamodb:GetItem", "dynamodb:Query"],
    "Resource": "arn:aws:dynamodb:$AWS_REGION:$AWS_ACCOUNT_ID:table/$DYNAMODB_TABLE_NAME"
  }, {
    "Effect": "Allow",
    "Action": ["kinesis:GetRecords", "kinesis:GetShardIterator", "kinesis:DescribeStream", "kinesis:ListStreams"],
    "Resource": "arn:aws:kinesis:$AWS_REGION:$AWS_ACCOUNT_ID:stream/$KINESIS_STREAM_NAME"
  }]
}
"@

$INLINE_POLICY | Out-File -FilePath "$env:TEMP\lambda-policy.json" -Encoding utf8
aws iam put-role-policy --role-name $LAMBDA_ROLE_NAME --policy-name "$PROJECT_NAME-permissions" --policy-document "file://$env:TEMP\lambda-policy.json"

Write-Host "   ✓ Policies attached" -ForegroundColor Green
Write-Host ""

# ---- 4. Package Lambda ----
Write-Host "📦 Packaging Lambda function..." -ForegroundColor Yellow
Set-Location backend

if (Test-Path lambda-package) { Remove-Item -Recurse -Force lambda-package }
New-Item -ItemType Directory -Path lambda-package | Out-Null

Copy-Item lambdaProcessor.js lambda-package/
Copy-Item dataStore.js lambda-package/

# Create handler
@'
const { DynamoDBClient, PutItemCommand } = require('@aws-sdk/client-dynamodb');
const dynamodb = new DynamoDBClient({});
const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME;

class DynamoDataStore {
  async put(cityName, record) {
    await dynamodb.send(new PutItemCommand({
      TableName: TABLE_NAME,
      Item: {
        city: { S: cityName },
        timestamp: { S: record.timestamp },
        data: { S: JSON.stringify(record) }
      }
    }));
  }
}

exports.handler = async (event) => {
  const LambdaProcessor = require('./lambdaProcessor');
  const dataStore = new DynamoDataStore();
  for (const record of event.Records) {
    const payload = JSON.parse(Buffer.from(record.kinesis.data, 'base64').toString());
    const processor = new LambdaProcessor(null, dataStore);
    const processed = processor._transformWeatherData(payload);
    await dataStore.put(processed.city, processed);
    console.log(`Processed: ${processed.city}`);
  }
  return { statusCode: 200 };
};
'@ | Out-File -FilePath lambda-package/index.js -Encoding utf8

Set-Location lambda-package
npm install --production @aws-sdk/client-dynamodb 2>$null | Out-Null
Compress-Archive -Path * -DestinationPath ../lambda-function.zip -Force
Set-Location ..

Write-Host "   ✓ Lambda package created" -ForegroundColor Green
Write-Host ""

# ---- 5. Deploy Lambda ----
Write-Host "λ Deploying Lambda function..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

$LAMBDA_ROLE_ARN = "arn:aws:iam::$AWS_ACCOUNT_ID:role/$LAMBDA_ROLE_NAME"

try {
    aws lambda get-function --function-name $LAMBDA_FUNCTION_NAME --region $AWS_REGION 2>$null
    aws lambda update-function-code --function-name $LAMBDA_FUNCTION_NAME --zip-file fileb://lambda-function.zip --region $AWS_REGION | Out-Null
    Write-Host "   ✓ Lambda updated" -ForegroundColor Green
} catch {
    aws lambda create-function `
        --function-name $LAMBDA_FUNCTION_NAME `
        --runtime nodejs20.x `
        --role $LAMBDA_ROLE_ARN `
        --handler index.handler `
        --zip-file fileb://lambda-function.zip `
        --timeout 60 `
        --memory-size 256 `
        --environment "Variables={DYNAMODB_TABLE_NAME=$DYNAMODB_TABLE_NAME}" `
        --region $AWS_REGION | Out-Null
    Write-Host "   ✓ Lambda created" -ForegroundColor Green
}

aws lambda wait function-active --function-name $LAMBDA_FUNCTION_NAME --region $AWS_REGION
Set-Location ..
Write-Host ""

# ---- 6. Event Source Mapping ----
Write-Host "🔗 Creating event source mapping..." -ForegroundColor Yellow
$STREAM_ARN = "arn:aws:kinesis:$AWS_REGION:$AWS_ACCOUNT_ID:stream/$KINESIS_STREAM_NAME"

$EXISTING = (aws lambda list-event-source-mappings --function-name $LAMBDA_FUNCTION_NAME --region $AWS_REGION --query "EventSourceMappings[?EventSourceArn=='$STREAM_ARN'].UUID" --output text)

if ($EXISTING) {
    Write-Host "   Mapping exists: $EXISTING" -ForegroundColor Gray
} else {
    aws lambda create-event-source-mapping --function-name $LAMBDA_FUNCTION_NAME --event-source-arn $STREAM_ARN --starting-position LATEST --batch-size 100 --region $AWS_REGION | Out-Null
    Write-Host "   ✓ Mapping created" -ForegroundColor Green
}
Write-Host ""

Write-Host "=========================================" -ForegroundColor Green
Write-Host "✅ Deployment Complete!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Resources Created:"
Write-Host "  • Kinesis Stream: $KINESIS_STREAM_NAME"
Write-Host "  • DynamoDB Table: $DYNAMODB_TABLE_NAME"
Write-Host "  • Lambda Function: $LAMBDA_FUNCTION_NAME"
Write-Host ""
Write-Host "Next: Update weatherFetcher.js to use AWS SDK"
Write-Host ""
