from pydantic import BaseModel
from typing import List

COLUMN_SUGGESTION_PROMPT = '''You are given a description of the task that the user wants to do. For example, the following description:

"I want to learn about top AI startups in the bay area that are 5 years old or less"

You need to create a list of column names that are relevant to the description. For example, the following columns:

["company_name", "company_age", "is_company_in_bay_area"]

Here is the input:

{description}

Your output should follow the correct format.'''


class ColumnSuggestionResponse(BaseModel):
    columns: List[str]


INDEX_COL_QUERY_CREATION_PROMPT = '''You are given the following things:
- description of the task that the user wants to do.
- the column that the user wants to autofill

Your goal is to create a search query that will be used to search the web to fill elements for the index column. This should be an exploratory query that will be used to provide a list of values for the index column.

Here is an example input:

{{"description": "I want to learn about top AI startups in the bay area that are 5 years old or less", "column": "company_name"}}

A valid output for this would be:

"list of top ai startups in bay area that are 5 years old or less"

Here is the input:

{input_dict}

Provide a search query that will be used to search the web for the index column:
'''

INDEX_COL_CONSOLIDATION_PROMPT = '''You are given the following things:
- description of the task that the user wants to do.
- the column that the user wants to autofill
- the query that was used to search the web for the index column
- the search results

Your goal is to consolidate the search results into a list of values for the index column. Use all valid elements in the search results to create the list of values.

Here's an example input:

{{"description": "I want to learn about top AI startups in the bay area that are 5 years old or less", "column": "company_name", "query": "list of top ai startups in bay area that are 5 years old or less"}}

With the search results:

["...Anthropic...", "...Hebbia...", "<irrelevant information>"]

Your output should be:

["Anthropic", "Hebbia"]

Here is the input:

{input_dict}

Search results:

{search_results}

Your output should follow the correct format.'''


class IndexColConsolidationResponse(BaseModel):
    index_values: List[str]


CELL_FILL_QUERY_CREATION_PROMPT = '''You are given the following things:
- description of the task that the user wants to do.
- list of selected columns
- list of index values

Your goal is to create a query per combination of columns and index values that will be used to search the web. These queries should be descriptive and specific. Add information as needed from the description provided to make sure you search for the right information.

The current date is {current_date}. Use this date (year specifcally) often, especially if relevant to the query. For instance, when the query is dependent on the current date (for instance, current company details).

You will be given a dictionary that looks like the following:

{{"description": "I want to learn about companies", "columns": ["company_url", "company_age"], "index_value": "Google"}}

You will return a list of queries that will be used to search the web.

The queries should be in the following format:

["what is the url of google's website?", "how old is google in years on {current_date}?"]

Here is the input:

{input_dict}

Your output should follow the correct format.'''


class CellFillQueryCreationResponse(BaseModel):
    queries: List[str]


CELL_FILL_INFORMATION_CONSOLIDATION_PROMPT = '''
You are given the following things:
- description of the task that the user wants to do.
- element that the user cares about
- the aspect of the element that the user wants to learn about
- the query that was used to search the web
- the search results

Your goal is to consolidate the search results into a single answer that answers the question and provide the url for the sources. Your output should be concise. Think step by step to consolidate the search results. Use good judgement to make sure the output you get is valid and accurate.

The current date is {current_date}. Use this date if it's relevant to the user request (for instance, when age is relevant or when the user asks about company revenue for a certain year).

For example, if the inputs looks like:

{{"description": "I want to learn about companies", "element": "company", "aspect": "revenue", "query": "what is the revenue of google?", "search_results": "google made 100 billion dollars in revenue last year."}}

Your output should be:

{{"answer": "$100 billion", "sources": ["<url that helped you get the answer>", "<url2 that helped you get the answer>"]}}

The answer shouldn't be elaborate.
- For numbers, just return the number with any modifiers (like dollars, years, etc).
- For dates, return the date in the format YYYY-MM-DD. 
- For other information, summarize the information in a concise manner (less than 2 sentences).
- Do not include unnecessary information in the response (like "As of {current_date}...")
- If the answer is unclear, just return "unknown"

For the URLs, provide all of the urls of the sources that helped you get the answer.

Here is the input:

{input_dict}

Search results:

{search_results}
'''


class CellFillInformationConsolidationResponse(BaseModel):
    answer: str
    sources: List[str]
