import "./App.css";
import Header from "./components/Header";
import Swap from "./components/Swap";
import Tokens from "./components/Tokens";
import { Routes, Route, useLocation } from "react-router-dom";
import { useConnect, useAccount, useDisconnect } from "wagmi";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import Coin from "./components/Coin";
import Footer from "./components/Footer";
import Transactions from "./components/Transactions";

function App() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect({
    connector: new MetaMaskConnector({
      options: {
        shimDisconnect: true,
        UNSTABLE_shimOnConnectSelectAccount: true,
      },
    }),
  });

  const { disconnect } = useDisconnect();

  const location = useLocation(); // Використовується для отримання поточного шляху

  const showFooter = location.pathname !== "/"; // Змінюємо умову в залежності від потрібного шляху

  const handleConnectDisconnect = () => {
    if (isConnected) {
      disconnect();
    } else {
      connect();
    }
  };
  // console.log(isConnected)

  return (
    <div className="App">
      <Header
        handleConnectDisconnect={handleConnectDisconnect}
        isConnected={isConnected}
        address={address}
      />
      <div className="mainWindow">
        <Routes>
          <Route
            path="/"
            element={<Swap isConnected={isConnected} address={address} />}
          />
          <Route path="/coin/:coinId" element={<Coin />} />
          <Route path="/tokens" element={<Tokens />} />
          <Route path="/transactions" element={<Transactions />} />
        </Routes>
      </div>
      {showFooter && <Footer />}
    </div>
  );
}

export default App;
