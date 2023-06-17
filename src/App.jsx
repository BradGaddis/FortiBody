import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import BMRPage from './pages/BMRPage';
import './styles/App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/navbar';

function App() {
  // const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <Router>
          <Navbar />

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/bmr" element={<BMRPage />} />
          </Routes>
        </Router>
      </div>
    </>
)
}

const Home = () => {
  return (
    <>
      <p>The Earth is flat</p>
      <p>Just like your belly</p>
      <p>...let's not lie. It's all round. Let's change it — the belly part anyway...</p>
      <p>And the moon is made of cheese</p>

      <h2><strong>Coming Soon</strong></h2>


      <section>You are your body. You are free. We don't charge for anything.</section>
    </>
  )
}




export default App
