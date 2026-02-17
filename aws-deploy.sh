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

# Check and install AWS CLI
if ! command -v aws &> /dev/null; then
    echo "   ⚠ AWS CLI not found, installing..."
    
    # Install AWS CLI v2
    echo "   Installing AWS CLI v2..."
    cd /tmp
    curl -s "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
    
    # Ensure unzip is available
    if ! command -v unzip &> /dev/null; then
        if command -v yum &> /dev/null; then
            yum install -y unzip > /dev/null 2>&1
        elif command -v apt-get &> /dev/null; then
            apt-get install -y unzip > /dev/null 2>&1
        fi
    fi
    
    unzip -q awscliv2.zip
    ./aws/install > /dev/null 2>&1
    rm -rf awscliv2.zip aws
    cd - > /dev/null
    
    if command -v aws &> /dev/null; then
        echo "   ✓ AWS CLI installed: $(aws --version)"
    else
        echo "   ❌ AWS CLI installation failed"
        echo "   Please install manually: https://aws.amazon.com/cli/"
        exit 1
    fi
else
    echo "   ✓ AWS CLI found: $(aws --version)"
fi

# Check AWS credentials
echo "   Checking AWS credentials..."
if ! aws sts get-caller-identity &> /dev/null; then
    echo ""
    echo "   ⚠ AWS credentials not configured!"
    echo "   Please run: aws configure"
    echo "   You'll need:"
    echo "     - AWS Access Key ID"
    echo "     - AWS Secret Access Key"
    echo "     - Default region: $AWS_REGION"
    echo ""
    read -p "   Press Enter after configuring AWS credentials..." 
fi
echo "   ✓ AWS credentials configured"

# Check and install Python3 and pip
if ! command -v python3 &> /dev/null; then
    echo "   ⚠ Python3 not found, installing..."
    
    if command -v yum &> /dev/null; then
        yum install -y python3 python3-pip > /dev/null 2>&1
    elif command -v apt-get &> /dev/null; then
        apt-get install -y python3 python3-pip > /dev/null 2>&1
    fi
    
    if command -v python3 &> /dev/null; then
        echo "   ✓ Python3 installed: $(python3 --version)"
    else
        echo "   ❌ Python3 installation failed"
        exit 1
    fi
else
    echo "   ✓ Python3 found: $(python3 --version)"
fi

# Check and install pip
if ! command -v pip &> /dev/null && ! command -v pip3 &> /dev/null; then
    echo "   ⚠ pip not found, installing..."
    
    if command -v yum &> /dev/null; then
        yum install -y python3-pip > /dev/null 2>&1
    elif command -v apt-get &> /dev/null; then
        apt-get install -y python3-pip > /dev/null 2>&1
    fi
    
    if command -v pip &> /dev/null || command -v pip3 &> /dev/null; then
        echo "   ✓ pip installed"
    else
        echo "   ❌ pip installation failed"
        exit 1
    fi
else
    echo "   ✓ pip found"
fi

# Check and install zip
if ! command -v zip &> /dev/null; then
    echo "   ⚠ zip not found, installing..."
    
    if command -v yum &> /dev/null; then
        yum install -y zip > /dev/null 2>&1
    elif command -v apt-get &> /dev/null; then
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
echo "📦 Packaging Lambda function (Python)..."
cd Dashboard/backend

# Create deployment package directory
mkdir -p lambda-package

# Create Python Lambda handler
cat > lambda-package/lambda_function.py <<'EOF'
"""
AWS Lambda Handler for Weather Data Processor
Processes Kinesis records and stores them in DynamoDB
"""
import json
import base64
import os
from datetime import datetime
import boto3
from decimal import Decimal

dynamodb = boto3.resource('dynamodb')
table_name = os.environ['DYNAMODB_TABLE_NAME']
table = dynamodb.Table(table_name)


def transform_weather_data(raw_data, city):
    """Transform OpenWeatherMap API data into our format."""
    main = raw_data.get('main', {})
    weather = raw_data.get('weather', [{}])[0]
    wind = raw_data.get('wind', {})
    sys_data = raw_data.get('sys', {})
    coords = raw_data.get('coord', {})
    
    # Convert floats to Decimal for DynamoDB
    def to_decimal(value, decimals=1):
        if value is None:
            return None
        return Decimal(str(round(value, decimals)))
    
    return {
        'city': city,
        'temperature': to_decimal(main.get('temp', 0)),
        'feelsLike': to_decimal(main.get('feels_like', 0)),
        'tempMin': to_decimal(main.get('temp_min', 0)),
        'tempMax': to_decimal(main.get('temp_max', 0)),
        'pressure': main.get('pressure', 0),
        'humidity': main.get('humidity', 0),
        'visibility': raw_data.get('visibility', 0),
        'windSpeed': to_decimal(wind.get('speed', 0)),
        'windDeg': wind.get('deg', 0),
        'windGust': to_decimal(wind.get('gust')) if wind.get('gust') else None,
        'cloudiness': raw_data.get('clouds', {}).get('all', 0),
        'weatherMain': weather.get('main', 'Unknown'),
        'weatherDescription': weather.get('description', 'unknown'),
        'weatherIcon': weather.get('icon', '01d'),
        'sunrise': sys_data.get('sunrise'),
        'sunset': sys_data.get('sunset'),
        'timezone': raw_data.get('timezone', 0),
        'latitude': to_decimal(coords.get('lat', 0), 6),
        'longitude': to_decimal(coords.get('lon', 0), 6),
        'timestamp': raw_data.get('dt', int(datetime.now().timestamp())),
        'processedAt': datetime.now().isoformat()
    }


def lambda_handler(event, context):
    """Process Kinesis records and store in DynamoDB."""
    processed_count = 0
    
    for record in event['Records']:
        try:
            # Decode Kinesis data
            payload = json.loads(base64.b64decode(record['kinesis']['data']))
            partition_key = record['kinesis']['partitionKey']
            
            # Transform data
            transformed = transform_weather_data(payload, partition_key)
            
            # Store in DynamoDB
            table.put_item(Item={
                'city': transformed['city'],
                'timestamp': str(transformed['timestamp']),
                'data': transformed
            })
            
            processed_count += 1
            print(f"Processed: {transformed['city']} | Temp: {transformed['temperature']}°C")
            
        except Exception as e:
            print(f"Error processing record: {e}")
            raise
    
    return {
        'statusCode': 200,
        'body': json.dumps(f'Processed {processed_count} records')
    }
EOF

# Create requirements.txt for Lambda dependencies
cat > lambda-package/requirements.txt <<'EOF'
boto3>=1.34.0
EOF

# Install dependencies into the package directory
echo "   Installing Python dependencies..."
pip install -r lambda-package/requirements.txt -t lambda-package/ --quiet

# Create ZIP package
echo "   Creating deployment package..."
cd lambda-package
zip -r ../lambda-function.zip . > /dev/null 2>&1
cd ..

# Clean up
rm -rf lambda-package

echo "   ✓ Lambda package created: lambda-function.zip"
echo ""

# ---- 5. Deploy Lambda Function ----
echo "λ Deploying Lambda function: $LAMBDA_FUNCTION_NAME..."

# Wait for role to propagate
echo "   Waiting 10s for IAM role to propagate..."
sleep 10

LAMBDA_ROLE_ARN="arn:aws:iam::$AWS_ACCOUNT_ID:role/$LAMBDA_ROLE_NAME"

# Check if function exists
if aws lambda get-function --function-name "$LAMBDA_FUNCTION_NAME" --region "$AWS_REGION" > /dev/null 2>&1; then
    echo "   Function exists, updating code..."
    aws lambda update-function-code \
        --function-name "$LAMBDA_FUNCTION_NAME" \
        --zip-file fileb://lambda-function.zip \
        --region "$AWS_REGION" > /dev/null
    
    aws lambda update-function-configuration \
        --function-name "$LAMBDA_FUNCTION_NAME" \
        --runtime python3.12 \
        --handler lambda_function.lambda_handler \
        --environment "Variables={DYNAMODB_TABLE_NAME=$DYNAMODB_TABLE_NAME}" \
        --region "$AWS_REGION" > /dev/null
    
    echo "   ✓ Lambda function updated"
else
    # Try to create function
    if aws lambda create-function \
        --function-name "$LAMBDA_FUNCTION_NAME" \
        --runtime python3.12 \
        --role "$LAMBDA_ROLE_ARN" \
        --handler lambda_function.lambda_handler \
        --zip-file fileb://lambda-function.zip \
        --timeout 60 \
        --memory-size 256 \
        --environment "Variables={DYNAMODB_TABLE_NAME=$DYNAMODB_TABLE_NAME}" \
        --region "$AWS_REGION" > /dev/null 2>&1; then
        
        echo "   ✓ Lambda function created"
        
        # Only wait for new deployments (wait can hang on updates)
        echo "   Waiting for function to become active..."
        aws lambda wait function-active --function-name "$LAMBDA_FUNCTION_NAME" --region "$AWS_REGION" 2>/dev/null || echo "   ⚠ Wait timed out, but function may still be deploying"
    else
        # If create failed (e.g., function already exists), try update
        echo "   Function already exists, updating instead..."
        aws lambda update-function-code \
            --function-name "$LAMBDA_FUNCTION_NAME" \
            --zip-file fileb://lambda-function.zip \
            --region "$AWS_REGION" > /dev/null 2>&1
        
        aws lambda update-function-configuration \
            --function-name "$LAMBDA_FUNCTION_NAME" \
            --runtime python3.12 \
            --handler lambda_function.lambda_handler \
            --environment "Variables={DYNAMODB_TABLE_NAME=$DYNAMODB_TABLE_NAME}" \
            --region "$AWS_REGION" > /dev/null 2>&1
        
        echo "   ✓ Lambda function updated"
    fi
fi
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

cd ../..
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
