from fastapi import FastAPI, Query, Depends, HTTPException
from typing import List, Optional
from crud import create_task, read_tasks, update_task, delete_task
from database import create_db_and_tables, engine
from models import Task, User
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
from auth import (
    hash_password, verify_password, create_access_token, get_current_user
)
from fastapi.security import OAuth2PasswordRequestForm

app = FastAPI()

# ✅ CORS for React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

# ✅ Secure: Create task with user_id
@app.post("/tasks/", response_model=Task)
def add_task(task: Task, current_user: User = Depends(get_current_user)):
    task.user_id = current_user.id
    with Session(engine) as session:
        session.add(task)
        session.commit()
        session.refresh(task)
        return task

# ✅ Secure: Get tasks only for logged-in user
@app.get("/tasks/", response_model=List[Task])
def get_tasks(
    completed: Optional[bool] = Query(None, description="Filter by completion status"),
    search: Optional[str] = Query(None, description="Search by title"),
    sort: Optional[str] = Query(None, description="Sort by 'id' or 'title'"),
    order: Optional[str] = Query("asc", description="Sort order: 'asc' or 'desc'"),
    limit: Optional[int] = Query(None, description="Max number of tasks to return"),
    offset: Optional[int] = Query(None, description="How many tasks to skip"),
    current_user: User = Depends(get_current_user)  # ✅ Auth required
):
    with Session(engine) as session:
        statement = select(Task).where(Task.user_id == current_user.id)

        if completed is not None:
            statement = statement.where(Task.completed == completed)
        if search:
            statement = statement.where(Task.title.contains(search))
        if sort in ["id", "title"]:
            sort_column = getattr(Task, sort)
            if order == "desc":
                sort_column = sort_column.desc()
            statement = statement.order_by(sort_column)
        if limit:
            statement = statement.limit(limit)
        if offset:
            statement = statement.offset(offset)

        tasks = session.exec(statement).all()
        return tasks

# ✅ Signup (unchanged)
@app.post("/signup")
def signup(user: User):
    with Session(engine) as session:
        existing_user = session.exec(select(User).where(User.username == user.username)).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Username already exists")

        user.hashed_password = hash_password(user.hashed_password)
        session.add(user)
        session.commit()
        session.refresh(user)
        return {"message": "User created successfully"}

# ✅ Login (unchanged)
@app.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    with Session(engine) as session:
        user = session.exec(select(User).where(User.username == form_data.username)).first()
        if not user or not verify_password(form_data.password, user.hashed_password):
            raise HTTPException(status_code=401, detail="Invalid username or password")

        access_token = create_access_token(data={"sub": user.username})
        return {"access_token": access_token, "token_type": "bearer"}

# ✅ Secure update
@app.put("/tasks/{task_id}", response_model=Task)
def modify_task(task_id: int, updated_task: Task, current_user: User = Depends(get_current_user)):
    with Session(engine) as session:
        task = session.get(Task, task_id)
        if not task or task.user_id != current_user.id:
            raise HTTPException(status_code=404, detail="Task not found")

        task.title = updated_task.title
        task.completed = updated_task.completed
        session.add(task)
        session.commit()
        session.refresh(task)
        return task

# ✅ Secure delete
@app.delete("/tasks/{task_id}")
def remove_task(task_id: int, current_user: User = Depends(get_current_user)):
    with Session(engine) as session:
        task = session.get(Task, task_id)
        if not task or task.user_id != current_user.id:
            raise HTTPException(status_code=404, detail="Task not found")

        session.delete(task)
        session.commit()
        return {"message": "Task deleted successfully"}
