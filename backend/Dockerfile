# Dockerfile-python
FROM python:3.10.12

RUN apt-get update
RUN apt-get install -y build-essential libpoppler-cpp-dev pkg-config

WORKDIR /app

RUN pip install --upgrade pip
RUN  pip install pdm

COPY pyproject.toml pdm.lock /app/

RUN pdm install

COPY src src


EXPOSE 8000

ENV DOCPATH /app/notes


ENTRYPOINT ["pdm", "run", "uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]

