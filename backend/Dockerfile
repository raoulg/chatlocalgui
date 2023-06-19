# Dockerfile-python
FROM python:3.9.16

RUN apt-get update

WORKDIR /app


ENV POETRY_VERSION=1.5.1 \
	PYTHONPATH="${PYTHONPATH}:/app" \
	PIP_NO_CACHE_DIR=off \
	PIP_DEFAULT_TIMEOUT=100

RUN pip install --upgrade pip
RUN  pip install "poetry==$POETRY_VERSION"

COPY . .

RUN poetry config virtualenvs.create false \
	&& poetry install --no-dev --no-ansi


EXPOSE 8000

ENV DOCPATH /app/notes

ENTRYPOINT ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]

