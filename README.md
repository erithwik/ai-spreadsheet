# AI Spreadsheet

> [!NOTE]
> This repo is a work in progress! The python code needs significant restructuring.

## Demo (WIP)



## Features
- Get automatically suggested columns
- Get automatically filled index columns
- Get automatically filled cells

## Usage
- Create an `.env` file in the `python-backend` directory and fill out the following items:
```
BRAVE_API_KEY=BSAy*****************
OPENAI_API_KEY=sk-proj-************
GROQ_API_KEY=gsk_******************
URL_DATABASE=postgresql://postgres:postgres@db:5432/aispreadsheet
```
Afterwards, go to the root directory of the project and run
```
docker compose up --build
```
You should be able to access the AI spreadsheet at `http://localhost:8080`
