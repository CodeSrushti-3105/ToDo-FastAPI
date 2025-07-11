from sqlmodel import SQLModel, create_engine, Session

# Step 1: Setup database connection
sqlite_file_name = "todo.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"

engine = create_engine(sqlite_url, echo=True)

# Step 2: Create tables on startup
def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

# Step 3: Provide DB session to other files
def get_session():
    return Session(engine)
