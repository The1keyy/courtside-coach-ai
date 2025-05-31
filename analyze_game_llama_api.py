# analyze_game_llama_api.py

import os
import openai
import base64

# ──────────────────────────────────────────────────────
# 1) Read your API key from the environment
LLAMA_API_KEY = os.getenv("LLAMA_API_KEY")
if not LLAMA_API_KEY:
    raise EnvironmentError("Please set LLAMA_API_KEY in your environment before running.")

# ──────────────────────────────────────────────────────
# 2) Initialize the OpenAI (Llama) client
client = openai.OpenAI(
    api_key=LLAMA_API_KEY,
    base_url="https://api.llama.com/compat/v1/"
)

# ──────────────────────────────────────────────────────
# 3) Load the play-by-play transcript
def load_transcript(path: str) -> str:
    with open(path, "r", encoding="utf-8") as f:
        return f.read()

transcript = load_transcript("game1_playbyplay.txt")

# ──────────────────────────────────────────────────────
# 4) Encode the court diagram PNG as a Base64 Data URI
def encode_image_to_data_uri(path: str) -> str:
    with open(path, "rb") as img_file:
        raw = img_file.read()
    b64 = base64.b64encode(raw).decode("utf-8")
    return f"data:image/png;base64,{b64}"

court_data_uri = encode_image_to_data_uri("court_diagram.png")

# ──────────────────────────────────────────────────────
# 5) Build the chat messages: system→image→transcript
system_message = {
    "role": "developer",
    "content": (
        "You are a veteran basketball coach who can see both text and images. "
        "I will first send you a court diagram, and then a full play-by-play transcript. "
        "When you receive both, identify the exact spot on the court where the most "
        "momentum-shifting 3-pointer occurred. Respond in this format:\n\n"
        "Location on court — Quarter, Time, Player, Description."
        "When you identify the location, also explain why that shot shifted momentum and what the score became immediately afterward."
    )
}

# “User” message #1: the Base64‐encoded image
image_message = {
    "role": "user",
    "content": court_data_uri
}

# “User” message #2: the transcript + instructions
transcript_message = {
    "role": "user",
    "content": (
        "Below is the full play-by-play transcript. "
        "Using the court diagram I just provided, identify the exact spot on the court "
        "where the most momentum-shifting 3-pointer occurred. "
        "Format your reply as:\n"
        "Location on court — Quarter, Time, Player, Description.\n\n"
        f"{transcript}"
    )
}

messages = [system_message, image_message, transcript_message]

# ──────────────────────────────────────────────────────
# 6) Call Llama-4-Scout (multimodal) via the compat endpoint
response = client.chat.completions.create(
    model="Llama-4-Scout-17B-16E-Instruct-FP8",  # exactly as shown in your models list
    messages=messages,
    max_tokens=256,
    temperature=0.0
)

# ──────────────────────────────────────────────────────
# 7) Print the model’s answer
answer = response.choices[0].message.content
print("\n=== Coach’s Visual Insight ===\n")
print(answer)
