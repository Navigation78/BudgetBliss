import boto3
import json

client = boto3.client('lambda', region_name='eu-north-1')

payload = {
    "message": "TK1O88ZF59 Confirmed. You have received Ksh1000.00 from JAMES NGUTHIRU 0722633585 on 11/11/25 at 3:00 PM New M-PESA balance is Ksh2175.52",
    "userId": "user123"
}

response = client.invoke(
    FunctionName='ProcessBudgetBlissTransactions',
    Payload=json.dumps(payload)
)

result = json.loads(response['Payload'].read())
print(json.dumps(result, indent=2))