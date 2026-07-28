from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime, date
from decimal import Decimal


class Category(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class CategoryCreate(SQLModel):
    name:str


class Expense(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    amount: Decimal = Field(max_digits=10, decimal_places=2)
    description: Optional[str] = None
    expense_date: date = Field(default_factory=date.today)
    category_id: int = Field(foreign_key="category.id")


class ExpenseCreate(SQLModel):
    amount: Decimal
    description: Optional[str] = None
    expense_date: date = Field(default_factory=date.today)
    category_id: int

class CategorySummary(SQLModel):
    category_name: str
    total_amount: Decimal