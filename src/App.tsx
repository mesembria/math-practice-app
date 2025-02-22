import './App.css'
import Exercise from './components/Exercise/Exercise'

function App() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Math Practice
        </h1>
        <Exercise numberOfProblems={10} minFactor={2} maxFactor={10} />
      </div>
    </div>
  )
}

export default App
