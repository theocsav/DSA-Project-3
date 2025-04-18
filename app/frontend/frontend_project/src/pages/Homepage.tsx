import { useState } from 'react'
import tree from '../assets/tree.png'
import random from '../assets/random.png'
import { Link } from 'react-router-dom'
import '../css/App.css'

function HomePage() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div className="popup-container left">
        <a href="no" target="_blank">
          <img src={tree} className="logo" alt="tree logo" />
        </a>
        <div className="popup-text">
          Isolation Forest fraud detection - track fraudulent anomalies within a variety of purchases
        </div>
      </div>

      <div className="popup-container right">
        <a href="no" target="_blank">
          <img src={random} className="logo react" alt="Louvain logo" />
        </a>
        <div className="popup-text">
          Random Forest - 
        </div>
      </div>

      <h1>Isolation Forest + Random Forest</h1>

      <p className="read-the-docs">
        Click on the tree and graph logos to test, hover to learn more
      </p>

      <div className="button-container">
        <Link to="/dashboard">
          <button>Go to Dashboard</button>
        </Link>
        
        <Link to="/next">
          <button>Go to Next Page</button>
        </Link>
      </div>
    </>
  )
}

export default HomePage