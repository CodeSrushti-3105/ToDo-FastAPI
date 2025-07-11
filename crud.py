from sqlmodel import Session, select
from fastapi import HTTPException
from models import Task
from database import get_session
from typing import List, Optional

# Step 1: Add a new task to the database
def create_task(task: Task):
    with get_session() as session:
        session.add(task)
        session.commit()
        session.refresh(task)
        return task

# Step 2: Get all tasks from the database
def read_tasks(
    completed: Optional[bool] = None,
    search: Optional[str] = None,
    sort: Optional[str] = None,
    order: Optional[str] = "asc",
    limit: Optional[int] = None,
    offset: Optional[int] = None
):
    with get_session() as session:
        query = select(Task)

        if completed is not None:
            query = query.where(Task.completed == completed)

        if search:
            query = query.where(Task.title.contains(search))

        if sort == "title":
            query = query.order_by(Task.title if order == "asc" else Task.title.desc())
        elif sort == "id":
            query = query.order_by(Task.id if order == "asc" else Task.id.desc())

        # ✅ Apply limit and offset
        if limit is not None:
            query = query.limit(limit)
        if offset is not None:
            query = query.offset(offset)

        return session.exec(query).all()



# Step 3: Update an existing task
def update_task(task_id: int, updated_task: Task):
    with get_session() as session:
        task = session.get(Task, task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        task.title = updated_task.title
        task.completed = updated_task.completed
        session.add(task)
        session.commit()
        session.refresh(task)
        return task

# Step 4: Delete a task
def delete_task(task_id: int):
    with get_session() as session:
        task = session.get(Task, task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        session.delete(task)
        session.commit()
        return {"message": "Task deleted successfully"}
