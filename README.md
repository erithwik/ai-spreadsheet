# AI Spreadsheet

An OSS project inspired by these innovative but currently invite-only products:
- [Matrices](https://matrices.app/)
- [Exa Websets](https://exa.ai/websets)
- [Paradigm](https://www.paradigmai.com/)

## Usage Demo

https://github.com/user-attachments/assets/a9c1f9b6-f935-4476-b929-0751a0638c4a

## Core Functionality
- Edit any cell directly
- Sources are automatically requested for non-index cells
- Add and rearrange columns as needed

## AI Capabilities 
- Smart Column Suggestions

https://github.com/user-attachments/assets/a7ad82e9-d223-4c65-94f7-9d4dece2042f

- Auto-generate index column entries

https://github.com/user-attachments/assets/b399c391-3434-4f50-a140-3bcedce8694f

- AI-assisted cell content generation

https://github.com/user-attachments/assets/bd0af606-5e0e-46c3-82d6-d9dce5322be8

## Getting Started

1. Set up environment variables:
   Create a `.env` file in the `python-backend` directory with these values:

   - `BRAVE_API_KEY` - Brave API key
   - `ANTHROPIC_API_KEY` - Anthropic API key
   - `URL_DATABASE` - Database connection string
   - `OPENAI_API_KEY` - OpenAI API key **(optional)**
   - `GROQ_API_KEY` - Groq API key **(optional)**

   Example `.env` file:
   ```
   BRAVE_API_KEY=BSAy*****************
   OPENAI_API_KEY=sk-proj-************
   GROQ_API_KEY=gsk_******************
   ANTHROPIC_API_KEY=sk-ant***********
   URL_DATABASE=postgresql://postgres:postgres@db:5432/aispreadsheet
   ```

   Note: Currently uses Anthropic's API by default. This can be changed in `python_backend/.../llm.py` 
   by modifying the `ASK_LLM` variable. Dynamic LLM selection coming soon.

2. Launch the application:
   ```
   docker compose up --build
   ```

3. Access the spreadsheet:

   Open `http://localhost:8080` in your browser

## Future Improvements
- Implement comprehensive test suite
- Expand integration capabilities
  - Add support for LinkedIn, Slack, Google Drive and other platforms
- Enhance user experience
  - Enable column reordering in the suggested columns modal
  - Implement granular cell-by-cell autogeneration; we currently have row-by-row autogeneration
  - Add functionality to delete rows and columns in the spreadsheet view
