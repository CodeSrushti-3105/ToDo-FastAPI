from fastapi import FastAPI,Query
from typing import List, Optional
from crud import create_task, read_tasks, update_task, delete_task
from database import create_db_and_tables
from models import Task
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # ✅ allow React frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    create_db_and_tables()

@app.post("/tasks/", response_model=Task)
def add_task(task: Task):
    return create_task(task)

@app.get("/tasks/", response_model=List[Task])
def get_tasks(
    completed: Optional[bool] = Query(None, description="Filter by completion status"),
    search: Optional[str] = Query(None, description="Search by title"),
    sort: Optional[str] = Query(None, description="Sort by 'id' or 'title'"),
    order: Optional[str] = Query("asc", description="Sort order: 'asc' or 'desc'"),
    limit: Optional[int] = Query(None, description="Max number of tasks to return"),
    offset: Optional[int] = Query(None, description="How many tasks to skip")
):
    return read_tasks(
        completed=completed,
        search=search,
        sort=sort,
        order=order,
        limit=limit,
        offset=offset
    )


@app.put("/tasks/{task_id}", response_model=Task)
def modify_task(task_id: int, updated_task: Task):
    return update_task(task_id, updated_task)

@app.delete("/tasks/{task_id}")
def remove_task(task_id: int):
    return delete_task(task_id)
