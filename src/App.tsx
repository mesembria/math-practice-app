import { useState } from 'react'
import './App.css'
import ProblemDisplay from './components/ProblemDisplay/ProblemDisplay'
import NumericKeyboard from './components/NumericKeyboard/NumericKeyboard'

function App() {
  const [answer, setAnswer] = useState('0')

  const handleSubmit = () => {
    console.log('Submitted answer:', answer)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Math Practice
        </h1>
        <ProblemDisplay factor1={7} factor2={8} />
        <div className="mt-8">
          <div className="text-2xl font-bold text-center mb-4">
            Your Answer: {answer || '0'}
          </div>
          <NumericKeyboard
            value={answer}
            onChange={setAnswer}
            onSubmit={handleSubmit}
            maxLength={3}
            className="mx-auto"
          />
        </div>
      </div>
    </div>
  )
}

export default App
