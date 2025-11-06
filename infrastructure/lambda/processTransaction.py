import json
import re
import boto3
from datetime import datetime

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('BudgetBlissTransactionsV2')

def parse_mpesa_message(message):
    """
    Extracts transaction details from a raw M-PESA message.
    """
    data = {}

    # Extract transaction ID (e.g., TK28M8ZHLX)
    match = re.search(r"([A-Z0-9]{10}) Confirmed", message)
    if match:
        data["transactionId"] = match.group(1)

    # Extract amount
    amt_match = re.search(r"Ksh([\d,]+\.\d{2})", message)
    if amt_match:
        data["amount"] = float(amt_match.group(1).replace(",", ""))

    # Determine type (incoming or outgoing)
    if "received" in message.lower():
        data["type"] = "INCOMING"
    elif "sent to" in message.lower() or "paid to" in message.lower():
        data["type"] = "OUTGOING"
    else:
        data["type"] = "UNKNOWN"

    # Extract balance
    balance_match = re.search(r"New M-PESA balance is Ksh([\d,]+\.\d{2})", message)
    if balance_match:
        data["balance"] = float(balance_match.group(1).replace(",", ""))

    # Extract date and time
    date_match = re.search(r"on (\d{1,2}/\d{1,2}/\d{2,4}) at ([\d:]+ [APM]{2})", message)
    if date_match:
        date_str = f"{date_match.group(1)} {date_match.group(2)}"
        data["timestamp"] = datetime.strptime(date_str, "%d/%m/%y %I:%M %p").isoformat()

    return data

def lambda_handler(event, context):
    """
    AWS Lambda entry point. Expects a JSON input with `message` and `userId`.
    """
    try:
        message = event.get("message", "")
        user_id = event.get("userId", "anonymous")

        parsed = parse_mpesa_message(message)
        parsed["userId"] = user_id

        # Store transaction
        table.put_item(Item=parsed)

        return {
            "statusCode": 200,
            "body": json.dumps({"message": "Transaction stored successfully", "data": parsed})
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)})
        }
