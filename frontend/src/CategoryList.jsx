import { useState } from 'react';

function CategoryList({categories, onCategoryAdded}) {
  const [newName, setNewName] = useState('');
  const [error, setError] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  function handleSubmit(e) {
    e.preventDefault();

    if (newName.trim() === '') {
      setError('Category name cannot be empty');
      return;
    }

    fetch('http://localhost:8000/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim() }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to create category');
        }
        return res.json();
      })
      .then(() => {
        setNewName('');
        setError('');
        onCategoryAdded();
      })
      .catch((err) => setError(err.message));
  }

  function startEdit(category) {
    setEditingId(category.id);
    setEditName(category.name);
  }

  async function handleUpdate(categoryId) {
    if (editName.trim() === '') {
      setError('Category name cannot be empty');
      return;
    }

    try {
      const res = await fetch(`http://localhost:8000/categories/${categoryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName.trim() }),
      });

      if (!res.ok) {
        throw new Error('Failed to update category');
      }

      setEditingId(null);
      setError('');
      onCategoryAdded();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(categoryId) {
    const confirmed = window.confirm(
      'Deleting this category will also delete all its expenses. Continue?'
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`http://localhost:8000/categories/${categoryId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete category');
      }

      onCategoryAdded();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="panel">
      <h2 className="panel-title">Categories</h2>
      <ul className="item-list">
        {categories.map((cat) => (
          <li key={cat.id} className="item-row">
            {editingId === cat.id ? (
              <>
                <input
                  type="text"
                  className="input edit-input"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
                <div className="row-actions">
                  <button className="btn btn-primary" onClick={() => handleUpdate(cat.id)}>Save</button>
                  <button className="btn btn-ghost" onClick={() => setEditingId(null)}>Cancel</button>
                </div>
              </>
            ) : (
              <>
                <span className="item-label">{cat.name}</span>
                <div className="row-actions">
                  <button className="btn btn-ghost" onClick={() => startEdit(cat)}>Edit</button>
                  <button className="btn btn-danger" onClick={() => handleDelete(cat.id)}>Delete</button>
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
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New category name"
        />
        <button type="submit" className="btn btn-primary">Add Category</button>
      </form>
      {error && <p className="error-text">{error}</p>}
    </div>
  );
}

export default CategoryList;