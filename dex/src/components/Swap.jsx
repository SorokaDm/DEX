import React, { useState, useEffect } from "react";
import { Input, Popover, Radio, Modal, message } from "antd";
import {
  ArrowDownOutlined,
  DownOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import tokenList from "../tokenListBSC.json";
import axios from "axios";
import { useSendTransaction, useWaitForTransaction } from "wagmi";

function Swap(props) {
  const { address, isConnected } = props;
  const [messageApi, contextHolder] = message.useMessage();
  const [slippage, setSlippage] = useState(2.5);
  const [tokenOneAmount, setTokenOneAmount] = useState(null);
  const [tokenTwoAmount, setTokenTwoAmount] = useState(null);
  const [tokenOne, setTokenOne] = useState(tokenList[0]);
  const [tokenTwo, setTokenTwo] = useState(tokenList[1]);
  const [isOpen, setIsOpen] = useState(false);
  const [changeToken, setChangeToken] = useState(1);
  const [prices, setPrices] = useState(null);
  const [gasPrice, setGasPrice] = useState(null);
  const [balance, setBalance] = useState(null);
  const [txDetails, setTxDetails] = useState({
    to: null,
    data: null,
    value: null,
  });

  const { data, sendTransaction } = useSendTransaction({
    request: {
      from: address,
      to: String(txDetails.to),
      data: String(txDetails.data),
      value: String(txDetails.value),
    },
  });

  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });

  function handleSlippageChange(e) {
    setSlippage(e.target.value);
  }

  function changeAmount(e) {
    setTokenOneAmount(e.target.value);
    if (
      e.target.value &&
      prices &&
      prices[tokenOne.address] &&
      prices[tokenTwo.address]
    ) {
      const priceOne = prices[tokenOne.address];
      const priceTwo = prices[tokenTwo.address];
      const tokenTwoEquivalent = (e.target.value * priceOne) / priceTwo;
      setTokenTwoAmount(tokenTwoEquivalent.toFixed(2));
    } else {
      setTokenTwoAmount(null);
    }
  }

  function switchTokens() {
    setPrices(null);
    setTokenOneAmount(null);
    setTokenTwoAmount(null);
    const one = tokenOne;
    const two = tokenTwo;
    setTokenOne(two);
    setTokenTwo(one);
    fetchPrices(two.address, one.address);
  }

  function openModal(asset) {
    setChangeToken(asset);
    setIsOpen(true);
  }

  function modifyToken(i) {
    setPrices(null);
    setTokenOneAmount(null);
    setTokenTwoAmount(null);
    if (changeToken === 1) {
      setTokenOne(tokenList[i]);
      fetchPrices(tokenList[i].address, tokenTwo.address);
    } else {
      setTokenTwo(tokenList[i]);
      fetchPrices(tokenOne.address, tokenList[i].address);
    }
    setIsOpen(false);
  }
  function formatGasPrice(gasPrice) {
    // Convert the gas price to a number and divide by 10^9 to get the value in Gwei
    const formattedGasPrice = Number(gasPrice) / 10 ** 13;

    // Format the number to 6 decimal places
    return formattedGasPrice.toFixed(6);
  }

  function displayBalance(token, address) {
    if (balance && balance[address] && balance[address][token.address]) {
      const formattedBalance =
        Number(balance[address][token.address]) / 10 ** 18;
      return (
        <>
          {token.ticker}: {formattedBalance.toFixed(5)}
        </>
      ); // Display up to 4 decimal places
    }
    return null;
  }

  function calculateTokenOneValueInUSD(amount, prices) {
    if (!amount || !prices || !prices[tokenOne.address]) {
      return null;
    }

    const priceOne = prices[tokenOne.address];
    const tokenOneValue = amount * priceOne;
    return tokenOneValue.toFixed(2);
  }

  function formatWith18Decimals(tokenOneAmount) {
    // Convert the amount to a string
    const amountString = String(tokenOneAmount);

    // Split the amount into integer and fractional parts
    const [integerPart, fractionalPart] = amountString.split(".");

    // If fractional part exists, pad it with zeros to ensure it has 18 decimals
    const paddedFractionalPart = fractionalPart
      ? fractionalPart.padEnd(18, "0")
      : "000000000000000000";

    // Concatenate the integer part and padded fractional part
    const formattedAmount = integerPart + paddedFractionalPart;

    return formattedAmount;
  }

  async function fetchGasPrice() {
    const res = await axios.get("http://localhost:3001/api/gas-price");
    setGasPrice(res.data);
  }

  async function fetchWalletBalance() {
    try {
      const res = await axios.post("http://localhost:3001/walletBalance", {
        tokens: [tokenOne.address, tokenTwo.address],
        wallets: [address],
      });
      setBalance(res.data);
    } catch (error) {
      console.error("Error fetching wallet balance:", error);
    }
  }

  async function fetchPrices(one, two) {
    try {
      const addresses = `${one},${two}`;
      const res = await axios.get(`http://localhost:3001/tokenPricee`, {
        params: { addresses: addresses },
      });
      setPrices(res.data);
    } catch (error) {
      console.error("Error fetching prices:", error);
    }
  }

  async function fetchDexSwap() {
    try {
      // Fetch allowance using the updated API endpoint
      const allowanceResponse = await axios.get(
        `http://localhost:3001/allowance`,
        {
          params: {
            tokenAddress: tokenOne.address,
            walletAddress: address,
          },
        }
      );

      if (allowanceResponse.data.allowance === "0") {
        // If allowance is "0", fetch transaction details to approve
        const approveResponse = await axios.get(
          `http://localhost:3001/transaction`,
          {
            params: {
              tokenAddress: tokenOne.address,
            },
          }
        );

        // Set transaction details and log message
        setTxDetails(approveResponse.data);
        console.log("Not approved");
        return;
      }
      console.log("Approved");
      const formattedAmount = formatWith18Decimals(tokenOneAmount);
      const performSwap = await axios.get(`http://localhost:3001/swap`, {
        params: {
          fromToken: tokenOne.address,
          toToken: tokenTwo.address,
          amount: formattedAmount,
          walletAddress: address,
          slippage: slippage,
        },
      });
      setTxDetails(performSwap.data.tx);
    } catch (error) {
      // Handle errors, e.g., network issues or API response errors
      console.error("Error approving data:", error.message);
      // Optionally, set an error state or display an error message to the user
    }
  }

  function calculateTokenTwoValueInUSD(amount, prices) {
    if (!amount || !prices || !prices[tokenTwo.address]) {
      return null;
    }

    const priceTwo = prices[tokenTwo.address];
    const tokenTwoValue = amount * priceTwo;
    return tokenTwoValue.toFixed(2);
  }

  useEffect(() => {
    fetchWalletBalance(tokenList[0].address);
  }, []);

  useEffect(() => {
    fetchGasPrice();
  }, []);

  useEffect(() => {
    fetchPrices(tokenList[0].address, tokenList[1].address);
  }, []);

  useEffect(() => {
    if (txDetails.to && isConnected) {
      sendTransaction();
    }
  }, [txDetails]);

  useEffect(() => {
    messageApi.destroy();

    if (isLoading) {
      messageApi.open({
        type: "loading",
        content: "Transaction is Pending...",
        duration: 3,
      });
      axios
        .post("http://localhost:3001/add-transaction", {
          user: address,
          from: tokenOne.ticker,
          to: tokenTwo.ticker,
          input: tokenOneAmount,
          output: tokenTwoAmount,
          status: "Success",
        })
        .then((response) => {
          console.log("Transaction added:", response.data);
          setTokenOneAmount(null);
          setTokenTwoAmount(null);
        })
        .catch((error) => {
          console.error("Error adding transaction:", error);
        });
    }
  }, [isLoading]);

  useEffect(() => {
    messageApi.destroy();

    if (isSuccess) {
      console.log("Is Successful");
      messageApi.open({
        type: "success",
        content: "Transaction Successful",
        duration: 1.5,
      });
    }
    // else if (txDetails.to) {
    //   messageApi.open({
    //     type: "error",
    //     content: "Transaction Failed",
    //     duration: 1.5,
    //   });
    // }
  }, [isSuccess]);

  const settings = (
    <>
      <div>Slippage Tolerance</div>
      <div>
        <Radio.Group value={slippage} onChange={handleSlippageChange}>
          <Radio.Button value={0.5}>0.5%</Radio.Button>
          <Radio.Button value={2.5}>2.5%</Radio.Button>
          <Radio.Button value={5}>5.0%</Radio.Button>
        </Radio.Group>
      </div>
    </>
  );
  return (
    <>
      {contextHolder}
      <Modal
        open={isOpen}
        footer={null}
        onCancel={() => setIsOpen(false)}
        title="Select a token"
      >
        <div className="modalContent">
          {tokenList?.map((e, i) => {
            return (
              <div
                className="tokenChoice"
                key={i}
                onClick={() => modifyToken(i)}
              >
                <img src={e.img} alt={e.ticker} className="tokenLogo" />
                <div className="tokenChoiceNames">
                  <div className="tokenName">{e.name}</div>
                  <div className="tokenTicker">{e.ticker}</div>
                </div>
              </div>
            );
          })}
        </div>
      </Modal>
      <div className="tradeBox">
        <div className="tradeBoxHeader">
          <h4>Swap</h4>
          <Popover
            content={settings}
            title="Settings"
            trigger="click"
            placement="bottomRight"
          >
            <SettingOutlined className="cog" />
          </Popover>
        </div>
        <div className="inputs">
          <Input
            placeholder="0"
            value={tokenOneAmount}
            onChange={changeAmount}
            disabled={!prices}
          />
          <Input placeholder="0" value={tokenTwoAmount} disabled={true} />
          <div className="switchButton" onClick={switchTokens}>
            <ArrowDownOutlined className="switchArrow" />
          </div>
          <div className="assetOne" onClick={() => openModal(1)}>
            <img src={tokenOne.img} alt="assetOneLogo" className="assetLogo" />
            {tokenOne.ticker}
            <DownOutlined />
          </div>
          <div className="assetTwo" onClick={() => openModal(2)}>
            <img src={tokenTwo.img} alt="assetOneLogo" className="assetLogo" />
            {tokenTwo.ticker}
            <DownOutlined />
          </div>
          <div className="assetOneDisplaydInUSD">
            {prices &&
              calculateTokenOneValueInUSD(tokenOneAmount, prices) !== null && (
                <p>{calculateTokenOneValueInUSD(tokenOneAmount, prices)} USD</p>
              )}
          </div>
          <div className="assetTwoDisplaydInUSD">
            {prices &&
              calculateTokenTwoValueInUSD(tokenTwoAmount, prices) !== null && (
                <p>{calculateTokenTwoValueInUSD(tokenTwoAmount, prices)} USD</p>
              )}
          </div>

          <div className="assetOneWalletBalance">
            {displayBalance(tokenOne, address)}
          </div>
          <div className="assetTwoWalletBalance">
            {displayBalance(tokenTwo, address)}
          </div>
          <div className="slippageContainer">
            Slippage Tolerance {slippage}%
          </div>
          <div className="slippageContainer">
            Estimated Gas {gasPrice && formatGasPrice(gasPrice.standard)} BNB
          </div>
        </div>
        <div
          className="swapButton"
          disabled={!tokenOneAmount || !isConnected}
          onClick={fetchDexSwap}
        >
          Swap
        </div>
      </div>
    </>
  );
}

export default Swap;
