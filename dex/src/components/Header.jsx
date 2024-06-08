import React from "react";
import Logo from "../moralis-logo.svg";
import Eth from "../bnblogo.webp";
import { Link } from "react-router-dom";

function Header(props) {
  const { address, isConnected, handleConnectDisconnect } = props;

  return (
    <header>
      <div className="leftH">
        <img src={Logo} alt="logo" className="logo" />
        <Link to="/" className="link">
          <div className="headerItem">Swap</div>
        </Link>
        <Link to="/tokens" className="link">
          <div className="headerItem">Tokens</div>
        </Link>
        <Link to="/transactions" className="link">
          <div className="headerItem">Transactions</div>
        </Link>
      </div>

      <div className="rightH">
        <div className="headerItem">
          <img src={Eth} alt="Ethereum Logo" className="eth" />
          Binance
        </div>
        <div className="connectButton" onClick={handleConnectDisconnect}>
          {isConnected
            ? address.slice(0, 4) + "..." + address.slice(38)
            : "Connect"}
        </div>
      </div>
    </header>
  );
}

export default Header;
