import { useState } from 'react'
import tree from './assets/tree.png'
import louvain from './assets/Louvain.png'
import { Link } from 'react-router-dom'
import './App.css'

function HomePage() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div className="popup-container left">
        <a href="https://chatgpt.com/?model=auto" target="_blank">
          <img src={tree} className="logo" alt="tree logo" />
        </a>
        <div className="popup-text">
          Isolation Forest fraud detection - track fraudulent anomalies within a variety of purchases
        </div>
      </div>

      <div className="popup-container right">
        <a href="https://chatgpt.com/?model=auto" target="_blank">
          <img src={louvain} className="logo react" alt="Louvain logo" />
        </a>
        <div className="popup-text">
          Louvain method fraud detection - track fraudulent anomalies within a variety of purchases
        </div>
      </div>

      <h1>Isolation Forest + Louvain</h1>

      <p className="read-the-docs">
        Click on the tree and graph logos to test, hover to learn more
      </p>

      <Link to="/next">
        <button>Go to Next Page</button>
      </Link>
    </>
  )
}

export default HomePage
