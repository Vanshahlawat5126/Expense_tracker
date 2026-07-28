import CategoryList from "./CategoryList";
import ExpenseList from "./ExpenseList";
import SummaryList from "./SummaryList";
import {useState, useEffect} from 'react';

function App() {
  const [categories, setCategories] = useState([]);
  const [summary, setSummary] = useState([]);

  function fetchCategories() {
    fetch("http://localhost:8000/categories")
    .then ((res)=>res.json())
    .then((data) => setCategories(data));
  }
 

  function fetchSummary() {
    fetch("http://localhost:8000/summary")
    .then(res => res.json())
    .then((data) => setSummary(data));
  }
 
  useEffect(() => {
    fetchCategories();
    fetchSummary();

  }, []);
 

  return (
    <div>
      <h1>Expense Tracker</h1>
      <CategoryList 
      categories={categories}
      onCategoryAdded={fetchCategories}
      />
      <ExpenseList categories={categories}  onExpenseAdded={fetchSummary} />
      <SummaryList summary={summary} />
    </div>
  );
}

export default App;