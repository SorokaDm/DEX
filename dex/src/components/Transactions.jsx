import React, { useEffect, useState } from "react";
import "./../styles/Transactions.css";
import axios from "axios";
import { Pagination } from "antd";

const Transactions = () => {
  const [transactionsData, setTransactionsData] = useState([]);
  const [page, setPage] = useState(1);
  const [transactionsPerPage] = useState(8);

  useEffect(() => {
    axios
      .get(`http://localhost:3001/transactions`)
      .then((response) => {
        if (Array.isArray(response.data)) {
          const reversedData = response.data.reverse(); // Зворотній порядок транзакцій
          setTransactionsData(reversedData);
          // console.log("Fetched data:", reversedData);
        } else {
          console.error("Data is not an array", response.data);
        }
      })
      .catch((error) => {
        console.error("There was an error fetching the transactions!", error);
      });
  }, []);

  const handlePageChange = (page) => {
    setPage(page);
  };

  const indexOfLastTransaction = page * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = transactionsData.slice(
    indexOfFirstTransaction,
    indexOfLastTransaction
  );

  return (
    <div className="transactions-home">
      <div className="transactions-table">
        <div className="transactions-table-layout header">
          <p>#</p>
          <p>User</p>
          <p>From</p>
          <p>To</p>
          <p>Input</p>
          <p>Output</p>
          <p className="transactions-status">Status</p>
        </div>
        {currentTransactions.map((transaction) => (
          <div className="transactions-table-layout" key={transaction._id}>
            <p>{transaction.number}</p>
            <p>{transaction.user}</p>
            <p>{transaction.from}</p>
            <p>{transaction.to}</p>
            <p>{transaction.input}</p>
            <p>{transaction.output}</p>
            <p
              className={`transactions-status ${transaction.status.toLowerCase()}`}
            >
              {transaction.status}
            </p>
          </div>
        ))}
      </div>
      <div className="pagination-container">
        <Pagination
          className="ant-pagination"
          current={page}
          pageSize={transactionsPerPage}
          total={transactionsData.length}
          onChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default Transactions;
