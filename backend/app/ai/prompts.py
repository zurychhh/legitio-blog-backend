"""
Prompt templates for AI content generation.
Structured prompts for blog posts, SEO metadata, etc.
"""

from typing import Optional


def build_system_prompt(
    expertise: str,
    persona: Optional[str],
    tone: str,
    target_audience: Optional[str] = None
) -> str:
    """
    Build system prompt for Claude based on agent configuration.

    Args:
        expertise: Domain expertise (e.g., "prawo", "marketing", "tech")
        persona: Agent persona description
        tone: Writing tone (professional, casual, friendly)
        target_audience: Optional target audience description

    Returns:
        System prompt string
    """
    prompt = f"""Jesteś ekspertem w dziedzinie: {expertise}"""

    if persona:
        prompt += f"\n\nTwoja persona:\n{persona}"

    prompt += f"\n\nTon wypowiedzi: {tone}"

    if target_audience:
        prompt += f"\nPiszesz dla: {target_audience}"

    prompt += """

ZASADY PISANIA:

1. **Struktura SEO:**
   - Używaj hierarchii nagłówków (H2, H3, H4)
   - Keyword musi pojawić się w pierwszych 100 słowach
   - Akapity max 3-4 zdania dla czytelności
   - Używaj list punktowanych dla lepszej skanowania

2. **Content Quality:**
   - Pisz naturalnie, unikaj keyword stuffing
   - Używaj synonimów i pokrewnych terminów
   - Dodawaj konkretne przykłady i dane
   - Linkuj do źródeł gdy podajesz fakty

3. **Engagement:**
   - Zacznij od mocnego hooka
   - Używaj pytań retorycznych
   - Dodaj praktyczne wskazówki
   - Zakończ wyraźnym CTA (call-to-action)

4. **Format:**
   - Pisz w Markdown
   - Używaj **pogrubienia** dla kluczowych punktów
   - Używaj *kursywy* dla podkreśleń
   - Dodawaj > cytaty gdy przydatne
"""

    return prompt


def build_post_generation_prompt(
    topic: str,
    keyword: Optional[str],
    length: str,
    sources_content: Optional[str] = None,
    additional_context: Optional[str] = None
) -> str:
    """
    Build prompt for blog post generation.

    Args:
        topic: Post topic/title
        keyword: Target SEO keyword
        length: Post length (short/medium/long/very_long)
        sources_content: Optional source content to reference
        additional_context: Optional additional context

    Returns:
        Generation prompt string
    """
    # Word count targets
    word_counts = {
        "short": "500-700",
        "medium": "1000-1500",
        "long": "2000-3000",
        "very_long": "3000-5000"
    }
    target_words = word_counts.get(length, "1000-1500")

    prompt = f"""Napisz profesjonalny artykuł blogowy na temat:

**Temat:** {topic}"""

    if keyword:
        prompt += f"\n**Główne keyword SEO:** {keyword}"

    prompt += f"""
**Długość docelowa:** {target_words} słów
**Format:** Markdown

"""

    if sources_content:
        prompt += f"""**Źródła do wykorzystania:**
{sources_content}

Wykorzystaj powyższe źródła jako inspirację i fakty, ale pisz swoimi słowami.

"""

    if additional_context:
        prompt += f"""**Dodatkowy kontekst:**
{additional_context}

"""

    prompt += """**Wymagana struktura:**

1. **Wstęp (2-3 akapity):**
   - Hook przyciągający uwagę
   - Przedstawienie problemu/tematu
   - Zapowiedź co czytelnik się dowie

2. **Treść główna (3-5 sekcji z nagłówkami H2):**
   - Każda sekcja skupiona na jednym aspekcie
   - Konkretne informacje, przykłady, dane
   - Podnagłówki H3 dla podpunktów
   - Listy punktowane dla klarowności

3. **Podsumowanie:**
   - Krótkie przypomnienie kluczowych punktów
   - Praktyczne wnioski
   - CTA zachęcające do akcji

**Dodatkowe wymagania:**
- Używaj language polskiego o wysokiej jakości
- Wprowadzaj keyword naturalnie
- Dodaj 2-3 pytania retoryczne
- Zakończ konkretnym CTA
- Pisz przystępnie ale profesjonalnie
"""

    return prompt


def build_meta_title_prompt(content: str, keyword: Optional[str]) -> str:
    """
    Build prompt for meta title generation.

    Args:
        content: Post content
        keyword: Target keyword

    Returns:
        Prompt for meta title
    """
    prompt = f"""Na podstawie poniższego artykułu, wygeneruj SEO-friendly meta title.

**Wymagania:**
- Maksymalnie 60 znaków
- Zawiera główny keyword: {keyword if keyword else "wyciągnij z treści"}
- Przyciąga uwagę
- Jasno komunikuje temat
- Nie używaj clickbaitu

**Artykuł:**
{content[:1000]}...

Odpowiedz TYLKO samym tytułem, bez cudzysłowów ani dodatkowego tekstu."""

    return prompt


def build_meta_description_prompt(content: str, keyword: Optional[str]) -> str:
    """
    Build prompt for meta description generation.

    Args:
        content: Post content
        keyword: Target keyword

    Returns:
        Prompt for meta description
    """
    prompt = f"""Na podstawie poniższego artykułu, wygeneruj SEO-friendly meta description.

**Wymagania:**
- Maksymalnie 160 znaków
- Zawiera główny keyword: {keyword if keyword else "wyciągnij z treści"}
- Zachęca do kliknięcia
- Jasno komunikuje wartość artykułu
- Kończy się CTA lub zachętą

**Artykuł:**
{content[:1000]}...

Odpowiedz TYLKO samym opisem, bez cudzysłowów ani dodatkowego tekstu."""

    return prompt


def build_keywords_extraction_prompt(content: str) -> str:
    """
    Build prompt for keyword extraction.

    Args:
        content: Post content

    Returns:
        Prompt for keyword extraction
    """
    prompt = f"""Przeanalizuj poniższy artykuł i wyciągnij 5-10 najważniejszych słów kluczowych (keywords).

**Wymagania:**
- Słowa/frazy 1-3 wyrazowe
- Istotne dla SEO
- Naturalne dla treści
- Posortowane od najważniejszych

**Artykuł:**
{content[:2000]}...

Odpowiedz w formacie JSON array, np: ["keyword1", "keyword2", "keyword3"]
TYLKO JSON, bez dodatkowego tekstu."""

    return prompt
