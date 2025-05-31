# test_load.py

def load_transcript(path: str) -> str:
    with open(path, "r", encoding="utf-8") as f:
        return f.read()

if __name__ == "__main__":
    text = load_transcript("game1_playbyplay.txt")
    print("=== First 10 lines of the transcript ===\n")
    for i, line in enumerate(text.splitlines()):
        if i >= 10:
            break
        print(f"{i+1:2d}: {line}")
