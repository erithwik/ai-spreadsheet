from typing import Optional
from pydantic import BaseModel
from groq import Groq
from openai import OpenAI
from anthropic import Anthropic
import instructor
import os
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY", None)
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", None)
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", None)

if any(key is None for key in [GROQ_API_KEY, OPENAI_API_KEY, ANTHROPIC_API_KEY]):
    raise ValueError("No API key found")


def ask_groq(prompt: str,
             model: str = "llama-3.3-70b-specdec",
             response_format: Optional[BaseModel] = None):
    additional_args = {}
    client = Groq(api_key=GROQ_API_KEY)
    if response_format:
        client = instructor.from_groq(Groq(api_key=GROQ_API_KEY),
                                      mode=instructor.Mode.JSON)
        additional_args["response_model"] = response_format
    output = client.chat.completions.create(model=model,
                                            messages=[{
                                                "role": "user",
                                                "content": prompt
                                            }],
                                            temperature=0.65,
                                            **additional_args)
    if response_format:
        return output
    return output.choices[0].message.content


def ask_openai(prompt: str,
               model: str = "gpt-4o-mini-2024-07-18",
               response_format: Optional[BaseModel] = None):
    additional_args = {}
    client = OpenAI(api_key=OPENAI_API_KEY)

    fn = client.chat.completions.create
    if response_format:
        additional_args["response_format"] = response_format
        fn = client.beta.chat.completions.parse

    response = fn(model=model,
                  messages=[{
                      "role": "user",
                      "content": prompt
                  }],
                  **additional_args)
    if response_format:
        return response.choices[0].message.parsed
    return response.choices[0].message.content


def ask_anthropic(prompt: str,
               model: str = "claude-3-5-haiku-latest",
               response_format: Optional[BaseModel] = None):
    additional_args = {}
    client = Anthropic(api_key=ANTHROPIC_API_KEY)
    if response_format:
        additional_args["response_model"] = response_format
        client = instructor.from_anthropic(Anthropic(api_key=ANTHROPIC_API_KEY))
    output = client.messages.create(model=model,
                                    max_tokens=1024,
                                    messages=[{
                                          "role": "user",
                                          "content": prompt
                                      }],
                                    **additional_args)
    if response_format:
        return output
    return output.content[0].text

ASK_LLM = ask_anthropic
