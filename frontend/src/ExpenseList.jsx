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
        fetch(`${import.meta.env.VITE_API_URL}/expenses`)
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
        fetch(`${import.meta.env.VITE_API_URL}/expenses`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                description: description.trim(), 
                amount: parseFloat(amount), 
                category_id: parseInt(categoryId),
                expense_date: date
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
            const res = await fetch(`${import.meta.env.VITE_API_URL}/expenses/${expenseId}`, {
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
    const res = await fetch(`${import.meta.env.VITE_API_URL}/expenses/${expenseId}`, {
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
    <div className="panel">
      <h2 className="panel-title">Expenses</h2>
      <ul className="item-list">
        {expenses.map((expense) => (
          <li key={expense.id} className="item-row">
            {editingId === expense.id ? (
              <>
                <div className="edit-fields">
                  <input
                    type="number"
                    className="input edit-input edit-input-sm"
                    value={editFormData.amount}
                    onChange={(e) => setEditFormData({ ...editFormData, amount: e.target.value })}
                  />
                  <input
                    type="text"
                    className="input edit-input"
                    value={editFormData.description}
                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  />
                  <input
                    type="date"
                    className="input edit-input"
                    value={editFormData.expense_date}
                    onChange={(e) => setEditFormData({ ...editFormData, expense_date: e.target.value })}
                  />
                  <select
                    className="input edit-input"
                    value={editFormData.category_id}
                    onChange={(e) => setEditFormData({ ...editFormData, category_id: e.target.value })}
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="row-actions">
                  <button className="btn btn-primary" onClick={() => handleUpdate(expense.id)}>Save</button>
                  <button className="btn btn-ghost" onClick={() => setEditingId(null)}>Cancel</button>
                </div>
              </>
            ) : (
              <>
                <span className="item-label">{expense.description} — ₹{expense.amount}</span>
                <div className="row-actions">
                  <button className="btn btn-ghost" onClick={() => startEdit(expense)}>Edit</button>
                  <button className="btn btn-danger" onClick={() => handleDelete(expense.id)}>Delete</button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>

      <form onSubmit={handleSubmit} className="add-form">
        <input
          type="text"
          className="input"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
        />
        <input
          type="number"
          step="0.01"
          className="input"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount"
        />
        <select className="input" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">Select category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        <input
          type="date"
          className="input"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <button type="submit" className="btn btn-primary">Add Expense</button>
      </form>
      {error && <p className="error-text">{error}</p>}
    </div>
    );
}
export default ExpenseList;