#!/bin/bash
# ============================================================
# AWS Resource Cleanup Script
# Deletes all Weather Analytics Dashboard resources
# ============================================================
# WARNING: This will DELETE all resources and DATA!
# ============================================================
# NOTE: This script is for the Node.js Lambda version.
# For the Python/Flask version, you only need to clean up
# EC2 instances or other infrastructure you created manually.
# ============================================================

# Don't exit on errors - continue cleanup even if resources missing

# Configuration
AWS_REGION="${AWS_REGION:-ap-south-1}"
PROJECT_NAME="weather-analytics"
KINESIS_STREAM_NAME="WeatherDataStream"
DYNAMODB_TABLE_NAME="WeatherData"
LAMBDA_FUNCTION_NAME="WeatherDataProcessor"
LAMBDA_ROLE_NAME="${PROJECT_NAME}-lambda-role"

echo "============================================"
echo "AWS Resource Cleanup - Weather Analytics"
echo "============================================"
echo "Region: $AWS_REGION"
echo ""
echo "⚠️  NOTE: This cleanup script is for AWS Lambda deployment."
echo "   The current Python/Flask version runs on VMs/containers."
echo "   If you deployed to EC2, manually terminate instances."
echo ""
echo "⚠️  WARNING: This will DELETE the following:"
echo "  • Kinesis Stream: $KINESIS_STREAM_NAME"
echo "  • DynamoDB Table: $DYNAMODB_TABLE_NAME (ALL DATA!)"
echo "  • Lambda Function: $LAMBDA_FUNCTION_NAME"
echo "  • IAM Role: $LAMBDA_ROLE_NAME"
echo ""
read -p "Are you sure? Type 'DELETE' to confirm: " CONFIRM

if [ "$CONFIRM" != "DELETE" ]; then
    echo "❌ Cleanup cancelled"
    exit 0
fi

echo ""
echo "Starting cleanup..."
echo ""

# ---- 1. Delete Event Source Mapping ----
echo "🔗 Deleting event source mappings..."
MAPPINGS=$(aws lambda list-event-source-mappings \
    --function-name "$LAMBDA_FUNCTION_NAME" \
    --region "$AWS_REGION" \
    --query "EventSourceMappings[].UUID" \
    --output text 2>/dev/null || true)

if [ -n "$MAPPINGS" ]; then
    for UUID in $MAPPINGS; do
        echo "   Deleting mapping: $UUID"
        aws lambda delete-event-source-mapping \
            --uuid "$UUID" \
            --region "$AWS_REGION" || true
    done
    echo "   ✓ Event source mappings deleted"
else
    echo "   No event source mappings found"
fi
echo ""

# ---- 2. Delete Lambda Function ----
echo "λ Deleting Lambda function: $LAMBDA_FUNCTION_NAME..."
if aws lambda get-function --function-name "$LAMBDA_FUNCTION_NAME" --region "$AWS_REGION" 2>/dev/null; then
    aws lambda delete-function \
        --function-name "$LAMBDA_FUNCTION_NAME" \
        --region "$AWS_REGION"
    echo "   ✓ Lambda function deleted"
else
    echo "   Lambda function not found, skipping"
fi
echo ""

# ---- 3. Delete DynamoDB Table ----
echo "💾 Deleting DynamoDB table: $DYNAMODB_TABLE_NAME..."
if aws dynamodb describe-table --table-name "$DYNAMODB_TABLE_NAME" --region "$AWS_REGION" 2>/dev/null; then
    aws dynamodb delete-table \
        --table-name "$DYNAMODB_TABLE_NAME" \
        --region "$AWS_REGION" > /dev/null
    echo "   ✓ DynamoDB table deletion initiated"
    echo "   Waiting for table to be deleted..."
    aws dynamodb wait table-not-exists \
        --table-name "$DYNAMODB_TABLE_NAME" \
        --region "$AWS_REGION" 2>/dev/null || true
    echo "   ✓ DynamoDB table deleted"
else
    echo "   DynamoDB table not found, skipping"
fi
echo ""

# ---- 4. Delete Kinesis Stream ----
echo "📡 Deleting Kinesis stream: $KINESIS_STREAM_NAME..."
if aws kinesis describe-stream --stream-name "$KINESIS_STREAM_NAME" --region "$AWS_REGION" 2>/dev/null; then
    aws kinesis delete-stream \
        --stream-name "$KINESIS_STREAM_NAME" \
        --region "$AWS_REGION"
    echo "   ✓ Kinesis stream deletion initiated"
    echo "   Note: Stream deletion takes ~24 hours to complete"
else
    echo "   Kinesis stream not found, skipping"
fi
echo ""

# ---- 5. Delete IAM Role ----
echo "🔐 Deleting IAM role: $LAMBDA_ROLE_NAME..."
if aws iam get-role --role-name "$LAMBDA_ROLE_NAME" 2>/dev/null; then
    # Delete inline policies
    echo "   Deleting inline policies..."
    aws iam delete-role-policy \
        --role-name "$LAMBDA_ROLE_NAME" \
        --policy-name "${PROJECT_NAME}-permissions" 2>/dev/null || true
    
    # Detach managed policies
    echo "   Detaching managed policies..."
    aws iam detach-role-policy \
        --role-name "$LAMBDA_ROLE_NAME" \
        --policy-arn "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole" 2>/dev/null || true
    
    aws iam detach-role-policy \
        --role-name "$LAMBDA_ROLE_NAME" \
        --policy-arn "arn:aws:iam::aws:policy/AmazonKinesisReadOnlyAccess" 2>/dev/null || true
    
    # Delete role
    aws iam delete-role --role-name "$LAMBDA_ROLE_NAME"
    echo "   ✓ IAM role deleted"
else
    echo "   IAM role not found, skipping"
fi
echo ""

# ---- 6. Clean up local files ----
echo "🧹 Cleaning up local Lambda package..."
if [ -d "Dashboard/backend/lambda-package" ]; then
    rm -rf Dashboard/backend/lambda-package
    echo "   ✓ Deleted backend/lambda-package/"
fi

if [ -f "Dashboard/backend/lambda-function.zip" ]; then
    rm -f Dashboard/backend/lambda-function.zip
    echo "   ✓ Deleted backend/lambda-function.zip"
fi
echo ""

# ---- Summary ----
echo "============================================"
echo "✅ Cleanup Complete!"
echo "============================================"
echo ""
echo "Deleted Resources:"
echo "  ✓ Event source mappings"
echo "  ✓ Lambda function: $LAMBDA_FUNCTION_NAME"
echo "  ✓ DynamoDB table: $DYNAMODB_TABLE_NAME"
echo "  ✓ Kinesis stream: $KINESIS_STREAM_NAME (deletion in progress)"
echo "  ✓ IAM role: $LAMBDA_ROLE_NAME"
echo "  ✓ Local Lambda package files"
echo ""
echo "Note: Kinesis stream deletion takes up to 24 hours."
echo ""
echo "============================================"
