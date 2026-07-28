from fastapi import FastAPI, Depends, HTTPException
from sqlmodel import Session, select, func
from database import get_db
from  models import Category, CategoryCreate, Expense, ExpenseCreate, CategorySummary

from fastapi.middleware.cors import CORSMiddleware
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)




@app.get("/categories")
def get_categories(db: Session = Depends(get_db)):
    categories = db.exec(select(Category)).all()
    return categories

@app.post("/categories")
def create_category(category: CategoryCreate, db: Session = Depends(get_db)):   # db represents a database session Type SQLModel - Session
    db_category = Category(name=category.name)                                  #category represents the data sent by the client in the HTTP request
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category


@app.post("/expenses")
def create_expense(expense: ExpenseCreate, db : Session = Depends(get_db)):
    category = db.get(Category, expense.category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    db_expense = Expense(
        amount = expense.amount,
        description = expense.description,
        date=expense.expense_date,
        category_id=expense.category_id
    )
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    return db_expense

@app.get("/summary", response_model=list[CategorySummary])
def get_summary(db: Session = Depends(get_db)):
    statement = (
        select(
            Category.name,
            func.coalesce(func.sum(Expense.amount), 0).label("total_amount")
        )
        .join(Expense, Expense.category_id == Category.id, isouter=True)
        .group_by(Category.name)
        .order_by(Category.name)
    )
    results = db.exec(statement).all()

    return [
        CategorySummary(category_name=row[0], total_amount=row[1])
        for row in results
    ]

@app.get("/expenses", response_model=list[Expense])
def get_expenses(db: Session = Depends(get_db)):
    statement = select(Expense)
    expenses = db.exec(statement).all()
    return expenses

@app.delete("/expenses/{expense_id}")
def delete_expense(expense_id: int, session: Session = Depends(get_db)):
    expense = session.get(Expense, expense_id)
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    session.delete(expense)
    session.commit()

    return {"message": "Expense deleted successfully"}

@app.delete("/categories/{category_id}")
def delete_category(category_id: int, session: Session = Depends(get_db)):
    category = session.get(Category, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    expenses  = session.exec(
        select(Expense).where(Expense.category_id == category_id)
    ).all()

    for expense in expenses:
        session.delete(expense)

    session.delete(category)
    session.commit()

    return{"message": f"Category: {category.name} and {len(expenses)} associated expense(s) deleted"}

@app.put("/expenses/{expense_id}")
def update_expense(expense_id: int, expense_data: ExpenseCreate, db: Session = Depends(get_db)):
    expense = db.get(Expense, expense_id)
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")

    category = db.get(Category, expense_data.category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    expense.amount = expense_data.amount
    expense.description = expense_data.description
    expense.expense_date = expense_data.expense_date
    expense.category_id = expense_data.category_id

    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense


@app.put("/categories/{category_id}")
def update_category(category_id: int, category_data: CategoryCreate, db  : Session = Depends(get_db)):
    category = db.get(Category, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    category.name = category_data.name

    db.add(category)
    db.commit()
    db.refresh(category)
    return category