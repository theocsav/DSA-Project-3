import { Routes, Route } from 'react-router-dom'
import HomePage from './Home'
import NextPage from './NextPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/next" element={<NextPage />} />
    </Routes>
  
  )
}

export default App


//link to wiki for interactibility
//random forest: decision tree, makes random trees with random parameters and keeps the most accurate one, ex. which hour fraud? mostly happens at midnight,
//makes trends in data points (most fraud hour, job?) and uses that info to make decision trees 