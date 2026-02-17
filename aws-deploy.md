# AWS Deployment - Not Applicable for Python/Flask Version

⚠️ **Note**: The original `aws-deploy.sh` script was designed for deploying a Node.js Lambda function to AWS. 

The **new Python/Flask version** of this application is designed to run on:
- **EC2 instances** (use `vm-deploy.sh`)
- **Virtual Machines** (use `vm-deploy.sh`)
- **Docker containers**
- **Any server with Python 3.8+**

## Deploying to AWS EC2

If you want to deploy the Python/Flask version to AWS, follow these steps:

### 1. Launch an EC2 Instance

```bash
# Launch an Amazon Linux 2023 or Ubuntu instance
# Recommended: t2.small or larger
# Security Group: Allow ports 80 (HTTP), 443 (HTTPS), 22 (SSH)
```

### 2. Connect and Deploy

```bash
# SSH into your EC2 instance
ssh -i your-key.pem ec2-user@your-instance-ip

# Upload deployment script and project
scp -i your-key.pem -r Dashboard/ ec2-user@your-instance-ip:/tmp/weather-analytics-deploy/
scp -i your-key.pem vm-deploy.sh ec2-user@your-instance-ip:~/

# Run deployment
sudo bash ~/vm-deploy.sh
```

### 3. Access Your Dashboard

```
http://your-ec2-public-ip
```

## Alternative: AWS Lambda with Python (Future Enhancement)

If you want to deploy a serverless version using AWS Lambda + API Gateway, you would need to:

1. Convert the Flask app to use **AWS Lambda handlers**
2. Use **API Gateway** for HTTP endpoints
3. Use **AWS IoT Core** or **API Gateway WebSocket API** for real-time updates
4. Deploy using **AWS SAM** or **Serverless Framework**

This would be a significant refactoring and is not included in the current implementation.

## Using the Original Node.js Lambda Deployment

If you want to use AWS Lambda with the original Node.js version, you can:

1. Check out the previous version of the codebase (before Python migration)
2. Run the original `aws-deploy.sh` script

```bash
# Switch to the old Node.js/React branch
git checkout <commit-before-python-migration>

# Run the original deployment
bash aws-deploy.sh
```

---

For the current Python/Flask version, **use `vm-deploy.sh`** for deployment to any Linux server or EC2 instance.
