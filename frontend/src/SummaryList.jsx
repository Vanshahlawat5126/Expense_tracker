function SummaryList({summary}){
    return(
    <div>
        <h2>Summary</h2>
        <ul
        style={{
          maxHeight: '200px',
          overflowY: 'auto',
          border: '1px solid #ccc',
          padding: '8px',
        }}
      >
        {summary.map((item) => (
          <li key={item.category_name}>
            {item.category_name} — ₹{item.total_amount}
          </li>
        ))}
      </ul>


    </div>)
}

export default SummaryList;