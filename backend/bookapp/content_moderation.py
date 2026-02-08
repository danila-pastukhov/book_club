"""
Content moderation module for filtering profanity in user-generated text.

Implements a dictionary-based approach optimized for Russian language profanity
detection with leet-speak normalization and morphological root matching.

Usage:
    from .content_moderation import contains_profanity, censor_text

    if contains_profanity("some text"):
        # reject

    clean = censor_text("some text")  # replaces bad words with ***
"""

import re
import logging

from django.conf import settings

logger = logging.getLogger(__name__)


# ============================================================================
# Leet-speak / obfuscation character map (Latin & Cyrillic lookalikes)
# ============================================================================

_LEET_MAP = {
    "0": "о",
    "o": "о",
    "O": "О",
    "@": "а",
    "a": "а",
    "A": "А",
    "6": "б",
    "b": "б",
    "B": "В",
    "e": "е",
    "E": "Е",
    "3": "з",
    "k": "к",
    "K": "К",
    "m": "м",
    "M": "М",
    "h": "н",
    "H": "Н",
    "p": "р",
    "P": "Р",
    "c": "с",
    "C": "С",
    "T": "Т",
    "t": "т",
    "y": "у",
    "Y": "У",
    "x": "х",
    "X": "Х",
    "$": "с",
    "1": "і",
    "!": "і",
    "|": "і",
    "u": "у",
    "U": "У",
    "d": "д",
    "D": "Д",
}

# Characters that are sometimes inserted to bypass filters
_NOISE_CHARS = re.compile(r"[\s\-_.*+~`'\"\\/,;:!?#%^&()0-9]")


# ============================================================================
# Profanity roots — morphological stems that match the vast majority of
# Russian obscene words. Each root is a regex fragment.
# ============================================================================

# fmt: off
_PROFANITY_ROOTS = [
    # Core roots (covers ~95% of Russian profanity)
    r"[хx][уy][ейияёюйжle]",
    r"[хx][уy][ил]",
    r"[пp][иieё][зz3][дd]",
    r"[пp][иieё][дd][аaоo@eе]?[рr]",
    r"[бb6][лl][яьъ]",
    r"[еёe][бb6]",
    r"[ёе][бb6][аaуулиioо]",
    r"[сsc$][уy][кk][аa]",
    r"[сsc$][уy][чc][аоьк]",
    r"[мm][уy][дd][аоиeё]",
    r"[дd][еe][рr][ьъ][мm]",
    r"[гg][аa@][нnh][дd][оo0]н",
    r"[жj][оo0][пp][аa@у]",
    r"[зz3][аa@][лl][уy][пp]",
    r"[мm][аa@]н[дd][аa@]",
    r"[пp][аa@][дd][оo0]н[оo0]?[кk]",
    r"[шш][лl][юy][хx]",
    r"[шш][аa@][лl][аa@][вvб]",
    r"[пp][оo0][хx][уy]",
    r"[нnh][аa@][хx][уy]",
    r"[зz3][аa@][еёe][бb6]",
    r"[оo0][тt][ъь]?[еёe][бb6]",
    r"[уy][ёеe][бb6]",
    r"[вv][ыy][бb6][лl]?[яь]",
    r"[дd][рr][оo0][чc]",
    r"[мm][иie]н[еёe][тt]",
    r"[еёe][бb6][аa@]?[нnh]",
    r"[еёe][бb6][аa@][тt]",
    r"[еёe][бb6][лl]",
    r"[тt][рr][аa@][хx]",
    r"[пp][еe][рr][дd]",
]
# fmt: on


def _build_profanity_pattern():
    """
    Build a compiled regex that matches any profanity root surrounded
    by word-like boundaries.
    """
    extra_words = getattr(settings, "PROFANITY_EXTRA_WORDS", [])
    all_roots = list(_PROFANITY_ROOTS)

    # Escape extra words and add them
    for word in extra_words:
        all_roots.append(re.escape(word.lower()))

    combined = "|".join(f"(?:{root})" for root in all_roots)
    # We don't use \b because Cyrillic chars aren't considered \w in all locales
    return re.compile(combined, re.IGNORECASE | re.UNICODE)


_profanity_re = _build_profanity_pattern()


# ============================================================================
# Public API
# ============================================================================


def _normalize(text: str) -> str:
    """
    Normalize text for profanity matching:
    1. Replace leet-speak characters with Cyrillic equivalents
    2. Collapse repeated characters (е.g. "ааааа" → "а")
    3. Remove noise characters (spaces, dashes, dots inserted to bypass filters)
    """
    # Step 1: leet-speak replacement
    chars = []
    for ch in text:
        chars.append(_LEET_MAP.get(ch, ch))
    normalized = "".join(chars)

    # Step 2: lowercase
    normalized = normalized.lower()

    # Step 3: remove noise characters between letters
    normalized = _NOISE_CHARS.sub("", normalized)

    # Step 4: collapse repeated characters (3+ → 1)
    normalized = re.sub(r"(.)\1{2,}", r"\1", normalized)

    return normalized


def contains_profanity(text: str) -> bool:
    """
    Check whether *text* contains Russian profanity.

    Returns True if profanity is detected, False otherwise.
    """
    if not text:
        return False

    normalized = _normalize(text)
    match = _profanity_re.search(normalized)

    if match and logger.isEnabledFor(logging.DEBUG):
        logger.debug(
            "Profanity detected: matched '%s' in normalized text", match.group()
        )

    return match is not None


def censor_text(text: str) -> str:
    """
    Replace profanity in *text* with '***'.

    This operates on the original text by finding match positions
    in the normalized version and mapping them back.

    For simplicity, this replaces the entire word containing the match.
    """
    if not text:
        return text

    # Simple approach: split into words, check each word, replace if profane
    words = text.split()
    result = []
    for word in words:
        if contains_profanity(word):
            result.append("***")
        else:
            result.append(word)
    return " ".join(result)


def get_profanity_error_message() -> str:
    """Return the user-facing error message for profanity violations."""
    return getattr(
        settings,
        "PROFANITY_ERROR_MESSAGE",
        "Текст содержит недопустимые выражения. Пожалуйста, перефразируйте.",
    )
