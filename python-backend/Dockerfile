# Use an official Python runtime as a parent image
FROM ghcr.io/astral-sh/uv:python3.12-alpine

# Copy the project files into the container
COPY . /app

# Set working directory in the container
WORKDIR /app

# Install dependencies using requirements.txt first, with --system flag
RUN uv pip compile pyproject.toml -o requirements.txt && \
    uv pip install --system -r requirements.txt

# Install the package in editable mode, with --system flag
RUN uv pip install --system -e .

# Expose port 8000
EXPOSE 8000

# Set environment variable
ENV ENV=production

# Run the application using the entry point defined in pyproject.toml
CMD ["python", "-m", "src.python_backend.main"]
