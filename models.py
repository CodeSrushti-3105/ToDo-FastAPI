from sqlmodel import SQLModel, Field
from typing import Optional

# This is our Task table
class Task(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    completed: bool = False
