# Utility functions for reading and extracting text from various document formats.

import os
import fitz  # PyMuPDF


IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png"}


def extract_text_from_file(file_path: str) -> str:
    """
    Extracts text from a file at the given path.

    - For PDF files: uses PyMuPDF (fitz) to extract all text from every page.
    - For image files (jpg, jpeg, png): returns the file path as a string
      so it can be passed to a vision model for processing.

    Args:
        file_path: Absolute or relative path to the file.

    Returns:
        Extracted text string (PDF) or the file path string (image).
        Returns an empty string if extraction fails.
    """
    try:
        ext = os.path.splitext(file_path)[1].lower()

        if ext in IMAGE_EXTENSIONS:
            # Return path for downstream vision processing
            return file_path

        if ext == ".pdf":
            text_parts = []
            with fitz.open(file_path) as doc:
                for page in doc:
                    text_parts.append(page.get_text())
            return "\n".join(text_parts)

        raise ValueError(f"Unsupported file type: '{ext}'. Only PDF and image files are supported.")

    except FileNotFoundError:
        print(f"[document_reader] Error: File not found – {file_path}")
        return ""
    except ValueError as ve:
        print(f"[document_reader] Error: {ve}")
        return ""
    except Exception as e:
        print(f"[document_reader] Unexpected error while reading '{file_path}': {e}")
        return ""
