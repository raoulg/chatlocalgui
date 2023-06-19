import os
from pathlib import Path
from typing import List

from chatlocal import DataLoader, FileType, VectorStore
from loguru import logger


def build() -> None:
    docpath_ = os.environ.get("DOCPATH", "/app/notes")
    filetypes = os.environ.get("FILETYPES", ".md")

    docpath = Path(docpath_).expanduser().resolve()
    logger.info(f"using {docpath}")

    ftype = [FileType(t) for t in filetypes.split(",")]
    dataloader = DataLoader(filetypes=ftype)
    dataloader.load_files(docpath)
    vectorstore = VectorStore.from_dataloader(dataloader)
    vectorstore.save()


if __name__ == "__main__":
    build()
