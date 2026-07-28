import {useState, useEffect} from 'react';

function ExpenseList({categories, onExpenseAdded}) {
    const [expenses, setExpenses] = useState([]);
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [categoryId, setCategoryId] = useState("");
    const[date, setDate] = useState('');
    const [error, setError] = useState('');

    const [editingId, setEditingId] = useState(null);
    const [editFormData, setEditFormData] = useState({
        description: '',
        amount: '',
        category_id: '',
        expense_date: ''
    });


    function fetchExpenses(){
        fetch('http://localhost:8000/expenses')
        .then((res) => res.json())
        .then((data) => setExpenses(data));
    }
    useEffect(() => {
        fetchExpenses();
    }, []);

    function handleSubmit(e) {
        e.preventDefault();
        if (description.trim() === '' || amount.trim() === '' || categoryId === '' || date.trim() === '') {
            setError('All fields are required');
            return;
        }
        fetch('http://localhost:8000/expenses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                description: description.trim(), 
                amount: parseFloat(amount), 
                category_id: parseInt(categoryId),
                 date: date
                 }),
        })

        .then((res) => {
            if (!res.ok) {
                throw new Error('Failed to create expense');
            }
            return res.json();
        })
        .then(() => {
            setDescription('');
            setAmount('');
            setCategoryId('');
            setDate('');
            setError('');
            fetchExpenses();
            onExpenseAdded(); // Call the callback to update the summary
        })
        .catch((err) => setError(err.message));
    }

    async function handleDelete(expenseId){
        try{
            const res = await fetch(`http://localhost:8000/expenses/${expenseId}`, {
                method: 'DELETE',
            });
            if(!res.ok){
                throw new Error('Failed to delete expense');
            }
            fetchExpenses();
            onExpenseAdded();
        } catch(err) {
            console.error( err);
        }
    }

    function startEdit(expense){
      
      setEditingId(expense.id);
      setEditFormData({
        amount: expense.amount,
        description: expense.description,
        category_id: expense.category_id,
        expense_date: expense.expense_date
      })
    }

    async function handleUpdate(expenseId) {
  try {
    const res = await fetch(`http://localhost:8000/expenses/${expenseId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editFormData),
    });

    if (!res.ok) {
      throw new Error("Failed to update expense");
    }

    setEditingId(null);
    fetchExpenses();
    onExpenseAdded();
  } catch (err) {
    console.error(err);
  }
}
    

    return (
         <div>
      <h2>Expenses</h2>
      <ul>
        {expenses.map((expense) => (
  <li key={expense.id}>
    {editingId === expense.id ? (
      <>
        <input
          type="number"
          value={editFormData.amount}
          onChange={(e) => setEditFormData({ ...editFormData, amount: e.target.value })}
        />
        <input
          type="text"
          value={editFormData.description}
          onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
        />
        <input
          type="date"
          value={editFormData.expense_date}
          onChange={(e) => setEditFormData({ ...editFormData, expense_date: e.target.value })}
        />
        <select
          value={editFormData.category_id}
          onChange={(e) => setEditFormData({ ...editFormData, category_id: e.target.value })}
        >
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        <button onClick={() => handleUpdate(expense.id)}>Save</button>
        <button onClick={() => setEditingId(null)}>Cancel</button>
      </>
    ) : (
      <>
        {expense.description} — ₹{expense.amount}
        <button onClick={() => startEdit(expense)}>Edit</button>
        <button onClick={() => handleDelete(expense.id)}>Delete</button>
      </>
    )}
  </li>
))}
      </ul>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
        />
        <input
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount"
        />
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">Select category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <button type="submit">Add Expense</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
    );
}

export default ExpenseList;