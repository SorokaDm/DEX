import { createContext, useEffect, useState, useCallback } from "react";

export const CoinContext = createContext();

const CoinContextProvider = (props) => {
  const [allCoin, setAllCoin] = useState([]);
  const [currency, setCurrency] = useState({
    name: "usd",
    symbol: "$",
  });

  const fetchAllCoin = useCallback(async () => {
    const options = {
      method: "GET",
      headers: {
        accept: "application/json",
        "x-cg-demo-api-key": "CG-RxbXBnZ47iJANVZQbv4FBRus",
      },
    };

    fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currency.name}`,
      options
    )
      .then((response) => response.json())
      .then((response) => setAllCoin(response))
      .catch((err) => console.error(err));
  }, [currency]);

  useEffect(() => {
    fetchAllCoin();
  }, [currency, fetchAllCoin]);

  const contextValue = { allCoin, currency, setCurrency };

  return (
    <CoinContext.Provider value={contextValue}>
      {props.children}
    </CoinContext.Provider>
  );
};

export default CoinContextProvider;
