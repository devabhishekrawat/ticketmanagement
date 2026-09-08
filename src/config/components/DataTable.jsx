export function DataTable({ columns, data, onRowClick, emptyMessage = 'No records found.' }) {
  return (
    <div className="table-wrapper">
      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th key={col.key || idx} className={col.className || ''}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-8 text-slate-400">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIdx) => (
                <tr
                  key={row.id || rowIdx}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={onRowClick ? 'clickable' : ''}
                >
                  {columns.map((col, colIdx) => (
                    <td key={col.key || colIdx} className={col.cellClassName || ''}>
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
