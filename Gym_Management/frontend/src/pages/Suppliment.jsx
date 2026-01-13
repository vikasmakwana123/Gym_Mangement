import React from 'react'
import { useState,useEffect} from 'react'


const Suppliment = () => {
    const [SupplimentsData, setSupplimentsData] = useState([])
    useEffect(async() => {
      const suppliment = await axios.get(`{import.process.meta.VITE_API_URL}/get-suppliments`)
      if(suppliment.response==201){
        if(suppliment.length>0){
            setSupplimentsData(suppliment)
        }
      }else{
        toast.fail('No Suppliments Found')
      }
    }, [])
    
  return (
    <div>
        

    </div>
  )
}

export default Suppliment