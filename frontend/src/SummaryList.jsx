function SummaryList({summary}){
    return(
    <div className="panel">
        <h2 className="panel-title">Summary</h2>
        <div className="summary-table-wrap">
          <table className="summary-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {summary.map((item) => (
                <tr key={item.category_name} className={item.total_amount == 0 ? 'row-empty' : ''}>
                  <td>{item.category_name}</td>
                  <td>₹{item.total_amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
    </div>)
}

export default SummaryList;