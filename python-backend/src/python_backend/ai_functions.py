from src.python_backend.brave import search_brave
from src.python_backend.prompts import (
    CELL_FILL_QUERY_CREATION_PROMPT,
    CELL_FILL_INFORMATION_CONSOLIDATION_PROMPT, 
    COLUMN_SUGGESTION_PROMPT,
    INDEX_COL_QUERY_CREATION_PROMPT,
    INDEX_COL_CONSOLIDATION_PROMPT,
    CellFillQueryCreationResponse,
    CellFillInformationConsolidationResponse,
    ColumnSuggestionResponse,
    IndexColConsolidationResponse
)
from src.python_backend.llm import ASK_LLM
from typing import List
import json
from datetime import datetime


def get_queries_to_search(selected_cols: List[str], index_value: str,
                          description: str):
    input_dict = {
        "description": description,
        "columns": selected_cols,
        "index_value": index_value
    }
    prompt = CELL_FILL_QUERY_CREATION_PROMPT.format(
        current_date=datetime.now().strftime("%Y-%m-%d"),
        input_dict=json.dumps(input_dict))
    openai_output: CellFillQueryCreationResponse = ASK_LLM(
        prompt, response_format=CellFillQueryCreationResponse)
    return {
        col_name: query
        for col_name, query in zip(selected_cols, openai_output.queries)
    }


def consolidate_search_results(description: str, element: str, aspect: str,
                               query: str, search_results: str):
    input_dict = {
        "description": description,
        "element": element,
        "aspect": aspect,
        "query": query,
    }
    prompt = CELL_FILL_INFORMATION_CONSOLIDATION_PROMPT.format(
        current_date=datetime.now().strftime("%Y-%m-%d"),
        input_dict=json.dumps(input_dict),
        search_results=search_results)
    return ASK_LLM(prompt,
                   response_format=CellFillInformationConsolidationResponse)


def ai_autofill_cells(selected_cols: List[str], index_value: str,
                      description: str):
    query_dict = get_queries_to_search(selected_cols, index_value, description)
    results = []
    sources = []
    for col_name, query in query_dict.items():
        print(f"Processing {col_name} for {index_value}")
        print(f"Query: {query}")
        try:
            search_results = search_brave(query)
            consolidation_response: CellFillInformationConsolidationResponse = consolidate_search_results(
                description, col_name, index_value, query, search_results)
            results.append(consolidation_response.answer)
            sources.append("\n".join(consolidation_response.sources))
        except Exception as e:
            print(f"Error processing {col_name} for {index_value}: {e}")
            results.append("unknown")
            sources.append("unknown")
    return results, sources


def ai_autofill_index_col(description: str,
                          col_name: str,
                          max_count: int = 10):
    input_dict = {"description": description, "col_name": col_name}
    prompt = INDEX_COL_QUERY_CREATION_PROMPT.format(
        input_dict=json.dumps(input_dict))
    search_query = ASK_LLM(prompt)
    input_dict = {
        "description": description,
        "col_name": col_name,
        "query": search_query
    }
    try:
        search_results = search_brave(search_query)
    except Exception as e:
        print(f"Error searching brave: {e}")
        return []
    consolidation_prompt = INDEX_COL_CONSOLIDATION_PROMPT.format(
        input_dict=json.dumps(input_dict), search_results=search_results)
    consolidation_response: IndexColConsolidationResponse = ASK_LLM(
        consolidation_prompt, response_format=IndexColConsolidationResponse)
    return consolidation_response.index_values[:max_count]


def ai_get_suggested_columns(description: str):
    prompt = COLUMN_SUGGESTION_PROMPT.format(description=description)
    openai_output: ColumnSuggestionResponse = ASK_LLM(
        prompt, response_format=ColumnSuggestionResponse)
    return openai_output.columns

def run_tests():
    from pprint import pprint

    def _test_search():
        search_results = search_brave(
            "what is the current valuation of Modal Labs in 2025?")
        pprint(search_results)

    def _test_get_suggested_columns():
        columns = ai_get_suggested_columns("I want to investigate startups")
        pprint(columns)

    def _test_ai_autofill_index_col():
        index_values = ai_autofill_index_col(
            description="I want to learn about top AI startups in the bay area",
            col_name="company_name")
        pprint(index_values)

    def _test_get_queries_to_search():
        queries = get_queries_to_search(
            selected_cols=["valuation", "number_of_employees"],
            index_value="Anthropic",
            description="I want to investigate startups")
        pprint(queries)

    def _test_ai_autofill_cells():
        results, sources = ai_autofill_cells(
            selected_cols=["valuation", "number_of_employees"],
            index_value="Anthropic",
            description="I want to investigate startups")
        pprint({
            "results": results,
            "sources": sources
        })