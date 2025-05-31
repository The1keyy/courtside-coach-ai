# list_models.py

import os
import openai

# Make sure LLAMA_API_KEY is set in your environment
LLAMA_API_KEY = os.getenv("LLM|30648844664714254|5XS27-LGvITLzQ91plmeBBE07BY")
if not LLAMA_API_KEY:
    raise EnvironmentError("Please set LLAMA_API_KEY before running.")

client = openai.OpenAI(
    api_key=LLAMA_API_KEY,
    base_url="https://api.llama.com/compat/v1/"
)

# Fetch and print the first 50 models you have access to
response = client.models.list(limit=50)
for m in response.data:
    print(m.id)
