from typing import Dict
import requests
import os
from dotenv import load_dotenv

load_dotenv()

BRAVE_API_KEY = os.getenv("BRAVE_API_KEY", None)
if BRAVE_API_KEY is None:
    raise ValueError("BRAVE_API_KEY environment variable is required")


def format_search_results(brave_results: Dict, results_limit: int = 10):
    brave_results = brave_results["web"]["results"]
    output_data = []
    valid_keys = ["title", "url", "snippet", "description", "extra_snippets"]
    for result in brave_results:
        output_data.append(
            {key: result.get(key, "")
             for key in valid_keys if key in result})
    return output_data[:results_limit]


def search_brave(query: str):
    url = f"https://api.search.brave.com/res/v1/web/search?q={query}"
    headers = {
        "Accept": "application/json",
        "Accept-Encoding": "gzip",
        "X-Subscription-Token": BRAVE_API_KEY
    }

    response = requests.get(url, headers=headers)
    return format_search_results(response.json())
