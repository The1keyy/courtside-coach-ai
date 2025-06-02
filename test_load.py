# test_load.py

import os
import sys

def load_transcript_from_file(path: str) -> str:
    """
    Reads the entire contents of a text file at `path` and returns it as a string.
    """
    with open(path, "r", encoding="utf-8") as f:
        return f.read()

def load_transcript_from_stdin() -> str:
    """
    Reads multiline input from the user until an EOF (Ctrl+D on macOS/Linux, Ctrl+Z then Enter on Windows).
    """
    print(
        "Paste your play-by-play transcript below. "
        "When you’re done, press Ctrl+D (macOS/Linux) or Ctrl+Z then Enter (Windows) to finish:\n"
    )
    lines = []
    try:
        while True:
            line = input()
            lines.append(line)
    except EOFError:
        pass

    return "\n".join(lines)


if __name__ == "__main__":
    print("=== Transcript Loader ===\n")
    print("Choose one of the following options:")
    print("  1) Enter a file path (e.g. game1_playbyplay.txt)")
    print("  2) Paste the transcript directly (multiline).")
    choice = input("\nEnter 1 or 2: ").strip()

    if choice == "1":
        path = input("Enter the transcript file path: ").strip()
        if not os.path.isfile(path):
            print(f"Error: File not found at '{path}'. Exiting.")
            sys.exit(1)

        transcript = load_transcript_from_file(path)

    elif choice == "2":
        transcript = load_transcript_from_stdin()
        if not transcript.strip():
            print("Error: No transcript was provided. Exiting.")
            sys.exit(1)

    else:
        print("Invalid choice. Please run again and enter either 1 or 2.")
        sys.exit(1)

    # Print the first 10 lines (or fewer if the transcript is shorter)
    print("\n=== First 10 lines of the transcript ===\n")
    for i, line in enumerate(transcript.splitlines()):
        if i >= 10:
            break
        print(f"{i+1:2d}: {line}")
