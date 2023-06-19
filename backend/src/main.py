import argparse
import os
import pickle
from pathlib import Path

import faiss
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from langchain.chains import RetrievalQAWithSourcesChain
from langchain.chat_models import ChatOpenAI
from pydantic import BaseModel

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


class ChatRequest(BaseModel):
    question: str


cachepath = Path(os.getenv("CACHE_DIR", Path.home() / ".cache" / "chatlocal"))
indexpath = str(cachepath / "docs.index")
storepath = str(cachepath / "vectorstore.pkl")

# Load the LangChain.
index = faiss.read_index(indexpath)

with open(storepath, "rb") as f:
    store = pickle.load(f)

store.index = index

chain = RetrievalQAWithSourcesChain.from_chain_type(
    llm=ChatOpenAI(temperature=0), retriever=store.as_retriever()
)


def qa(question: str) -> str:
    result = chain({"question": question})
    return result


@app.post("/api/chat")
def chat(request: ChatRequest):
    question = request.question

    result = qa(question)
    # answer = """Kullback-Leibler Divergence is a measure of difference between two probability distributions
    # and can be considered as a similarity or distance measure, but it is not a distance in the strict
    # mathematical sense.
    # """
    # sources = """/code/curriculum/Nuggets/Kullback-Leibler Divergence.md, /code/curriculum/Nuggets/Similarity or Distance Measures.md"""
    # return {"answer": answer, "sources": sources}

    return {"answer": result["answer"], "sources": result["sources"]}


@app.get("/health")
def health_check():
    return {"status": "ok"}
