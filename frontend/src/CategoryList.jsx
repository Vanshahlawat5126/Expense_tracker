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
    <div>
      <h2>Categories</h2>
      <ul>
        {categories.map((cat) => (
          <li key={cat.id}>
            {editingId === cat.id ? (
              <>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
                <button onClick={() => handleUpdate(cat.id)}>Save</button>
                <button onClick={() => setEditingId(null)}>Cancel</button>
              </>
            ) : (
              <>
                {cat.name}
                <button onClick={() => startEdit(cat)}>Edit</button>
                <button onClick={() => handleDelete(cat.id)}>Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New category name"
        />
        <button type="submit">Add Category</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default CategoryList;