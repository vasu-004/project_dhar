#!/bin/bash
# ============================================================
# AWS Infrastructure Deployment Script
# Real-Time Weather Analytics Dashboard
# ============================================================
# This script creates all AWS resources needed for the project:
# - Kinesis Data Stream
# - DynamoDB Table
# - Lambda Function (with Layer)
# - IAM Roles & Policies
# - CloudWatch Logs
# ============================================================

set -e  # Exit on error

# Configuration
AWS_REGION="${AWS_REGION:-ap-south-1}"
PROJECT_NAME="weather-analytics"
KINESIS_STREAM_NAME="WeatherDataStream"
DYNAMODB_TABLE_NAME="WeatherData"
LAMBDA_FUNCTION_NAME="WeatherDataProcessor"
LAMBDA_ROLE_NAME="${PROJECT_NAME}-lambda-role"
OPENWEATHER_API_KEY="${OPENWEATHER_API_KEY:-}"  # Set this as env var

echo "========================================="
echo "AWS Weather Analytics Dashboard Deployer"
echo "========================================="
echo "Region: $AWS_REGION"
echo "Project: $PROJECT_NAME"
echo ""

# ---- Check and Install Prerequisites ----
echo "🔍 Checking prerequisites..."

# Check AWS CLI
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI not found. Please install: https://aws.amazon.com/cli/"
    exit 1
fi
echo "   ✓ AWS CLI found"

# Check and install Node.js
if ! command -v node &> /dev/null; then
    echo "   ⚠ Node.js not found, installing..."
    
    # Detect OS and install accordingly
    if [ -f /etc/redhat-release ]; then
        # Amazon Linux / RHEL / CentOS
        echo "   Installing Node.js 20 (Amazon Linux/RHEL)..."
        curl -fsSL https://rpm.nodesource.com/setup_20.x | bash - > /dev/null 2>&1
        yum install -y nodejs > /dev/null 2>&1
    elif [ -f /etc/debian_version ]; then
        # Debian / Ubuntu
        echo "   Installing Node.js 20 (Debian/Ubuntu)..."
        curl -fsSL https://deb.nodesource.com/setup_20.x | bash - > /dev/null 2>&1
        apt-get install -y nodejs > /dev/null 2>&1
    else
        echo "   ❌ Unsupported OS. Please install Node.js 20 manually."
        exit 1
    fi
    
    if command -v node &> /dev/null; then
        echo "   ✓ Node.js installed: $(node -v)"
    else
        echo "   ❌ Node.js installation failed"
        exit 1
    fi
else
    echo "   ✓ Node.js found: $(node -v)"
fi

# Check and install npm
if ! command -v npm &> /dev/null; then
    echo "   ❌ npm not found (should come with Node.js)"
    exit 1
fi
echo "   ✓ npm found: $(npm -v)"

# Check and install zip
if ! command -v zip &> /dev/null; then
    echo "   ⚠ zip not found, installing..."
    
    if [ -f /etc/redhat-release ]; then
        yum install -y zip > /dev/null 2>&1
    elif [ -f /etc/debian_version ]; then
        apt-get install -y zip > /dev/null 2>&1
    fi
    
    if command -v zip &> /dev/null; then
        echo "   ✓ zip installed"
    else
        echo "   ❌ zip installation failed"
        exit 1
    fi
else
    echo "   ✓ zip found"
fi

echo "✓ All prerequisites ready"
echo ""

# Get AWS Account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo "AWS Account: $AWS_ACCOUNT_ID"
echo ""

# ---- 1. Create Kinesis Data Stream ----
echo "📡 Creating Kinesis Stream: $KINESIS_STREAM_NAME..."
if aws kinesis describe-stream --stream-name "$KINESIS_STREAM_NAME" --region "$AWS_REGION" 2>/dev/null; then
    echo "   Stream already exists, skipping..."
else
    aws kinesis create-stream \
        --stream-name "$KINESIS_STREAM_NAME" \
        --shard-count 2 \
        --region "$AWS_REGION"
    echo "   ✓ Kinesis Stream created with 2 shards"
    
    # Wait for stream to become active
    echo "   Waiting for stream to become ACTIVE..."
    aws kinesis wait stream-exists --stream-name "$KINESIS_STREAM_NAME" --region "$AWS_REGION"
fi
echo ""

# ---- 2. Create DynamoDB Table ----
echo "💾 Creating DynamoDB Table: $DYNAMODB_TABLE_NAME..."
if aws dynamodb describe-table --table-name "$DYNAMODB_TABLE_NAME" --region "$AWS_REGION" 2>/dev/null 1>/dev/null; then
    echo "   ✓ Table already exists, skipping..."
else
    # Use || true to prevent script exit on error
    if aws dynamodb create-table \
        --table-name "$DYNAMODB_TABLE_NAME" \
        --attribute-definitions \
            AttributeName=city,AttributeType=S \
            AttributeName=timestamp,AttributeType=S \
        --key-schema \
            AttributeName=city,KeyType=HASH \
            AttributeName=timestamp,KeyType=RANGE \
        --billing-mode PAY_PER_REQUEST \
        --region "$AWS_REGION" 2>&1 | grep -v "ResourceInUseException"; then
        
        echo "   ✓ DynamoDB Table created (pay-per-request billing)"
        
        # Wait for table to become active
        echo "   Waiting for table to become ACTIVE..."
        aws dynamodb wait table-exists --table-name "$DYNAMODB_TABLE_NAME" --region "$AWS_REGION"
    else
        echo "   ✓ Table already exists (ignoring error)"
    fi
fi
echo ""

# ---- 3. Create IAM Role for Lambda ----
echo "🔐 Creating IAM Role: $LAMBDA_ROLE_NAME..."

TRUST_POLICY=$(cat <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF
)

if aws iam get-role --role-name "$LAMBDA_ROLE_NAME" 2>/dev/null; then
    echo "   Role already exists, updating trust policy..."
    echo "$TRUST_POLICY" > /tmp/trust-policy.json
    aws iam update-assume-role-policy \
        --role-name "$LAMBDA_ROLE_NAME" \
        --policy-document file:///tmp/trust-policy.json
else
    echo "$TRUST_POLICY" > /tmp/trust-policy.json
    aws iam create-role \
        --role-name "$LAMBDA_ROLE_NAME" \
        --assume-role-policy-document file:///tmp/trust-policy.json \
        --description "Role for Weather Analytics Lambda Function"
    echo "   ✓ IAM Role created"
fi

# Attach policies
echo "   Attaching policies..."
aws iam attach-role-policy \
    --role-name "$LAMBDA_ROLE_NAME" \
    --policy-arn "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole" 2>/dev/null || true

aws iam attach-role-policy \
    --role-name "$LAMBDA_ROLE_NAME" \
    --policy-arn "arn:aws:iam::aws:policy/AmazonKinesisReadOnlyAccess" 2>/dev/null || true

# Create inline policy for DynamoDB and Kinesis
INLINE_POLICY=$(cat <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:GetItem",
        "dynamodb:Query"
      ],
      "Resource": "arn:aws:dynamodb:$AWS_REGION:$AWS_ACCOUNT_ID:table/$DYNAMODB_TABLE_NAME"
    },
    {
      "Effect": "Allow",
      "Action": [
        "kinesis:GetRecords",
        "kinesis:GetShardIterator",
        "kinesis:DescribeStream",
        "kinesis:ListStreams"
      ],
      "Resource": "arn:aws:kinesis:$AWS_REGION:$AWS_ACCOUNT_ID:stream/$KINESIS_STREAM_NAME"
    }
  ]
}
EOF
)

echo "$INLINE_POLICY" > /tmp/lambda-policy.json
aws iam put-role-policy \
    --role-name "$LAMBDA_ROLE_NAME" \
    --policy-name "${PROJECT_NAME}-permissions" \
    --policy-document file:///tmp/lambda-policy.json

echo "   ✓ Policies attached"
echo ""

# ---- 4. Package Lambda Function ----
echo "📦 Packaging Lambda function..."
cd backend

# Create deployment package
mkdir -p lambda-package
cp lambdaProcessor.js lambda-package/
cp dataStore.js lambda-package/

# Create Lambda handler
cat > lambda-package/index.js <<'EOF'
// AWS Lambda Handler for Weather Data Processor
const LambdaProcessor = require('./lambdaProcessor');
const { DynamoDBClient, PutItemCommand } = require('@aws-sdk/client-dynamodb');

const dynamodb = new DynamoDBClient({});
const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME;

// Simplified DataStore for AWS (writes to DynamoDB)
class DynamoDataStore {
  async put(cityName, record) {
    const params = {
      TableName: TABLE_NAME,
      Item: {
        city: { S: cityName },
        timestamp: { S: record.timestamp },
        data: { S: JSON.stringify(record) }
      }
    };
    await dynamodb.send(new PutItemCommand(params));
  }
}

exports.handler = async (event) => {
  const dataStore = new DynamoDataStore();
  
  for (const record of event.Records) {
    const payload = JSON.parse(Buffer.from(record.kinesis.data, 'base64').toString());
    
    // Transform using same logic as local simulator
    const processor = new LambdaProcessor(null, dataStore);
    const processed = processor._transformWeatherData(payload);
    
    await dataStore.put(processed.city, processed);
    console.log(`Processed: ${processed.city} | Temp: ${processed.temperature}°C`);
  }
  
  return { statusCode: 200, body: 'OK' };
};
EOF

# Install dependencies
echo "   Installing AWS SDK dependencies..."
if npm install --production --prefix lambda-package @aws-sdk/client-dynamodb 2>&1 | grep -v "^npm WARN" | grep -v "^$"; then
    echo "   ✓ Dependencies installed successfully"
else
    # Check if node_modules exists anyway (install might have succeeded despite warnings)
    if [ -d "lambda-package/node_modules/@aws-sdk" ]; then
        echo "   ✓ Dependencies installed (with warnings)"
    else
        echo "   ❌ Failed to install dependencies"
        exit 1
    fi
fi

# Create ZIP
cd lambda-package
zip -r ../lambda-function.zip . > /dev/null
cd ..
echo "   ✓ Lambda package created: lambda-function.zip"
echo ""

# ---- 5. Deploy Lambda Function ----
echo "λ Deploying Lambda function: $LAMBDA_FUNCTION_NAME..."

# Wait for role to propagate
echo "   Waiting 10s for IAM role to propagate..."
sleep 10

LAMBDA_ROLE_ARN="arn:aws:iam::$AWS_ACCOUNT_ID:role/$LAMBDA_ROLE_NAME"

if aws lambda get-function --function-name "$LAMBDA_FUNCTION_NAME" --region "$AWS_REGION" 2>/dev/null; then
    echo "   Function exists, updating code..."
    aws lambda update-function-code \
        --function-name "$LAMBDA_FUNCTION_NAME" \
        --zip-file fileb://lambda-function.zip \
        --region "$AWS_REGION" > /dev/null
    
    aws lambda update-function-configuration \
        --function-name "$LAMBDA_FUNCTION_NAME" \
        --environment "Variables={DYNAMODB_TABLE_NAME=$DYNAMODB_TABLE_NAME}" \
        --region "$AWS_REGION" > /dev/null
else
    aws lambda create-function \
        --function-name "$LAMBDA_FUNCTION_NAME" \
        --runtime nodejs20.x \
        --role "$LAMBDA_ROLE_ARN" \
        --handler index.handler \
        --zip-file fileb://lambda-function.zip \
        --timeout 60 \
        --memory-size 256 \
        --environment "Variables={DYNAMODB_TABLE_NAME=$DYNAMODB_TABLE_NAME}" \
        --region "$AWS_REGION" > /dev/null
    echo "   ✓ Lambda function deployed"
fi

# Wait for function to be ready
aws lambda wait function-active --function-name "$LAMBDA_FUNCTION_NAME" --region "$AWS_REGION"
echo ""

# ---- 6. Create Event Source Mapping (Kinesis → Lambda) ----
echo "🔗 Creating Kinesis → Lambda event source mapping..."

STREAM_ARN="arn:aws:kinesis:$AWS_REGION:$AWS_ACCOUNT_ID:stream/$KINESIS_STREAM_NAME"

# Check if mapping exists
EXISTING_MAPPING=$(aws lambda list-event-source-mappings \
    --function-name "$LAMBDA_FUNCTION_NAME" \
    --region "$AWS_REGION" \
    --query "EventSourceMappings[?EventSourceArn=='$STREAM_ARN'].UUID" \
    --output text)

if [ -n "$EXISTING_MAPPING" ]; then
    echo "   Event source mapping already exists: $EXISTING_MAPPING"
else
    aws lambda create-event-source-mapping \
        --function-name "$LAMBDA_FUNCTION_NAME" \
        --event-source-arn "$STREAM_ARN" \
        --starting-position LATEST \
        --batch-size 100 \
        --region "$AWS_REGION" > /dev/null
    echo "   ✓ Event source mapping created"
fi

cd ..
echo ""

# ---- Summary ----
echo "========================================="
echo "✅ Deployment Complete!"
echo "========================================="
echo ""
echo "Resources Created:"
echo "  • Kinesis Stream: $KINESIS_STREAM_NAME (2 shards)"
echo "  • DynamoDB Table: $DYNAMODB_TABLE_NAME"
echo "  • Lambda Function: $LAMBDA_FUNCTION_NAME"
echo "  • IAM Role: $LAMBDA_ROLE_NAME"
echo ""
echo "Next Steps:"
echo "  1. Update backend/weatherFetcher.js to push to Kinesis:"
echo "     Use AWS SDK: kinesis.putRecord() instead of local simulator"
echo ""
echo "  2. Test by putting a record to Kinesis:"
echo "     aws kinesis put-record \\"
echo "       --stream-name $KINESIS_STREAM_NAME \\"
echo "       --partition-key Delhi \\"
echo "       --data '{\"name\":\"Delhi\",\"main\":{\"temp\":25}}' \\"
echo "       --region $AWS_REGION"
echo ""
echo "  3. Check Lambda logs:"
echo "     aws logs tail /aws/lambda/$LAMBDA_FUNCTION_NAME --follow --region $AWS_REGION"
echo ""
echo "  4. Query DynamoDB:"
echo "     aws dynamodb scan --table-name $DYNAMODB_TABLE_NAME --region $AWS_REGION"
echo ""
echo "========================================="
