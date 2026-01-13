import { useState } from 'react'

import './App.css'
import SupplementCard from './components/SupplimentCard'

function App() {
  const [count, setCount] = useState(0)

  return (
<>
<div className='flex gap-5 flex-col'>
<SupplementCard/>
<SupplementCard/>
<SupplementCard/>
<SupplementCard/>
</div>
</>
  )
}

export default App
