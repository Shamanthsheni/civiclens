# Shared AWS Bedrock Runtime client and call_nova helper used across all agents.

import os
import json
import boto3
from dotenv import load_dotenv

load_dotenv()

AWS_ACCESS_KEY_ID     = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_REGION            = os.getenv("AWS_REGION", "ap-south-1")
NOVA_MODEL_ID         = os.getenv("NOVA_MODEL_ID", "us.amazon.nova-lite-v1:0")

bedrock = boto3.client(
    service_name="bedrock-runtime",
    region_name=AWS_REGION,
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
)


def call_nova(prompt: str) -> str:
    """
    Sends a text prompt to the Amazon Nova Lite model via Bedrock Runtime
    and returns the model's text response.

    Args:
        prompt: The user prompt to send to the model.

    Returns:
        The model's text response as a string, or an error message.
    """
    try:
        body = json.dumps({
            "messages": [
                {
                    "role": "user",
                    "content": [{"text": prompt}],
                }
            ]
        })

        response = bedrock.invoke_model(
            modelId=NOVA_MODEL_ID,
            contentType="application/json",
            accept="application/json",
            body=body,
        )

        response_body = json.loads(response["body"].read())
        text = response_body["output"]["message"]["content"][0]["text"]
        return text

    except Exception as e:
        print(f"[call_nova] Error calling Bedrock: {e}")
        return f"Error: {e}"
