import React from "react";
import styles from "../styles/SummaryManagement.module.css";

const SummaryTable = ({ summaries }) => {
  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th>ID</th>
          <th>Văn bản gốc</th>
          <th>Tóm tắt</th>
          <th>Kiểu</th>
          <th>Lớp</th>
          <th>Hành động</th>
        </tr>
      </thead>
      <tbody>
        {summaries.map((summary) => (
          <tr key={summary.id}>
            <td>{summary.id}</td>
            <td>{summary.textInput.substring(0, 20)}...</td>
            <td>{summary.summaryResult.substring(0, 20)}...</td>
            <td>{summary.method}</td>
            <td>{summary.grade}</td>
            <td>
              <button className={styles.actionBtn}>Sửa</button>
              <button className={styles.actionBtn}>Xóa</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default SummaryTable;
