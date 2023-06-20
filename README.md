# 🚀 Chatlocal Frontend Project

This is a frontend for the [Chatlocal](https://pypi.org/project/chatlocal/) project. The dependencies are managed within a docker-compose network, so they mainly manage everything by doing `make serve` (first time) and then `make up` and `make down`.

## 📚 Table of Contents
- [Background](#-background)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [To-Do List](#-to-do-list)

## 🌐 Background
[Chatlocal](https://pypi.org/project/chatlocal/) is a Python library designed to interact with your local files and provide AI-powered question-answering capabilities. The library can read your local documents, vectorize them, and then answer questions using the indexed documents. The library uses the FAISS library for efficient similarity search and LangChain for retrieval-based question answering. Currently, this project is in an alpha stage and is not ready for production use. However, you can interact with the library through the command line and ask questions to your indexed documents, currently only .txt or .md files are supported. The chatlocalgui is a project to add a graphic user interface to the library. For more information, check out the [Chatlocal project](https://pypi.org/project/chatlocal/).

## 🏗️ Project Structure
```markdown
.
├── Makefile                 <- Makefile to manage build tasks
├── README.md                <- Current file
├── backend
│   ├── Dockerfile           <- Dockerfile for backend
│   ├── poetry.lock          <- Lock file containing the exact versions of backend dependencies
│   ├── pyproject.toml       <- Backend dependencies and project metadata
│   └── src                  <- Folder with Python source code
├── docker-compose.yml       <- Docker Compose configuration file
└── frontend
    ├── Dockerfile           <- Dockerfile for frontend
    ├── db                   <- Database files
    ├── diagram              <- (unfinished) diagram files
    ├── go.mod               <- Go module dependencies
    ├── go.sum               <- Contains the expected cryptographic checksums of the content of specific module versions
    ├── server               <- Server files
    └── static               <- Static files (HTML, CSS, JS)
```


## 🚀 Getting Started

### ⚙️ Adding Docker Compose as a Dependency

If you already have docker compose, skip this section and jump to [Running the Project](#-running-the-project).

Docker Compose is a tool for defining and running multi-container Docker applications. It uses a YAML file (docker-compose.yml) to configure your application's services, and then creates and starts all the services from your configuration. This makes setting up the project much easier, as you don't have to install all the dependencies (e.g. python, go, and all environments) manually.

To add Docker Compose as a dependency, you need to install Docker first. Here are the general steps, but the exact process may vary depending on your operating system:

1. **Install Docker**: You can download Docker from the [official Docker website](https://www.docker.com/products/docker-desktop). Choose the right version for your operating system (Mac, Windows, Linux), download and install it.

2. **Install Docker Compose**: Docker Compose is included in the Docker Desktop installation. For more scenarios and examples, see the [official Docker Compose documentation](https://docs.docker.com/compose/install).

You can check if Docker Compose is installed correctly by running:

```bash
docker-compose --version
```

### 🐳 Running the Project
To get started with the project, you can use the following commands:

- `make serve`: This command is used for the first time setup. It starts the services and builds them if they haven't been built already.
- `make up`: This command starts the pipeline server.
- `make down`: This command stops the pipeline server.

After running `make serve` or `make up`, you can access your application at:
- Backend: http://localhost:8000
- Frontend: http://localhost:3000

## 📝 To-Do List
- [x] Make a gui for basic chat, storing the chatdata in a sql database.
- [x] Add a `Makefile` to automate the running of the project.
- [x] Add a `docker-compose.yml` file to automate the running of the project.
- [ ] Make it possible to change the title of the stored chats.
- [ ] Automate the running of `build.py` script. This script should be run, pointed to a folder (specified with the `DOCPATH` environment variable) containing .txt or .md files (specified by the `FILETYPES` variable) to create a vectorised version of local documents in order for the model to interact with the documents.
- [ ] Add more models. Currently, only OpenAI embeddings are added, but open-source LLMs like from huggingface should function too.
- [ ] Finish the diagram of the project.
