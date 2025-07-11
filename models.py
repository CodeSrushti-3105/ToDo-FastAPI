from sqlmodel import SQLModel, Field
from typing import Optional

# This is our Task table
class Task(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    completed: bool = False

    user_id: Optional[int] = Field(default=None, foreign_key="user.id")  # ✅ Link to user

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True)
    email: Optional[str] = None
    hashed_password: str