import CategoryList from "./CategoryList";
import ExpenseList from "./ExpenseList";
import SummaryList from "./SummaryList";
import {useState, useEffect} from 'react';

function App() {
  const [categories, setCategories] = useState([]);
  const [summary, setSummary] = useState([]);

  const [activePreset, setActivePreset] = useState("all");
  // active Preset tracks which filter is currently applied from "all, month, or 30 days"

  function fetchCategories() {
    fetch("http://localhost:8000/categories")
    .then ((res)=>res.json())
    .then((data) => setCategories(data));
  }
 

  function fetchSummary(startDate, endDate) {
    let url = "http://localhost:8000/summary";
    const params = new URLSearchParams();
    // URLSearchParams id built-in javascript class that is used to work with URL query parameters (the part of a URL after the ?).

    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);
    /* if start date exists it will have eg: let start date be 2026-07-29 then it will have startDate=2026-07-01*/
   if (params.toString()) {
  url += `?${params.toString()}`; // this checks id arg exist i.e start or end dates it will convert them to string eg "startDate=2026-07-01&endDate=2026-07-31"

}
    fetch(url)
    .then(res => res.json())
    .then((data) => setSummary(data));
  }
 
  function formatDate(d){
    return d.toISOString().split("T")[0]
  }
  // the javascript date object returns looks loke this YYYY-MM-DDTHH:mm:ss.sssZ after toISOString() converts the date into an ISO format string.
  // why split("T")[0] we don't need the time we only need date and the seprator of date and time is 'T'
  
  function applyPreset(preset){
    setActivePreset(preset) //  state updater of the selected/Active preset
    const today = new  Date(); // today's date

    if (preset === 'all'){ 
      fetchSummary(); // all time no args needed 
      return;
    }
    if (preset === 'month'){
      const start = new Date(today.getFullYear(),today.getMonth(),1)
      fetchSummary(formatDate(start), formatDate(today));
      return;
    }
    if (preset ==='30days'){
      const start = new Date(today);
      start.setDate(start.getDate()-30);
      fetchSummary(formatDate(start), formatDate(today));
      return;
    }
  }

    function refreshSummary(){
      applyPreset(activePreset)
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
      <ExpenseList categories={categories}  onExpenseAdded={refreshSummary} />
      <div>
        {/* the disabled here diables the btn after user has clicked it once to prevent unneccesory re-renders */}
        <button onClick={() => applyPreset('all')} disabled={activePreset === 'all' } >All Time</button>
        <button onClick={() => applyPreset('month')} disabled={activePreset === 'month' } >This Month</button>
        <button onClick={() => applyPreset('30days')} disabled={activePreset === '30days' } >Last 30 Days</button>
      </div>
      <SummaryList summary={summary} />
    </div>
  );
}

export default App;