import { Routes, Route } from 'react-router-dom'
import Homepage from './pages/Homepage' 
import NextPage from './pages/NextPage'
import Dashboard from './pages/dashboard'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/next" element={<NextPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  )
}

export default App

//link to wiki for interactibility
//random forest: decision tree, makes random trees with random parameters and keeps the most accurate one, ex. which hour fraud? mostly happens at midnight,
//makes trends in data points (most fraud hour, job?) and uses that info to make decision trees 