import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import SupplementCard from "../components/SupplimentCard";

const Suppliment = () => {
  const [supplimentsData, setSupplimentsData] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSuppliments = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/admin/supplements`
        );

        if (response.status === 200 && response.data.length > 0) {
          setSupplimentsData(response.data);
          console.log("Supplements Data:", response.data);
        } else {
          setError("No Supplements Found");
        }
      } catch (err) {
        setError("Failed to fetch supplements");
      }
    };

    fetchSuppliments();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6">Supplements</h2>

      {error && <p className="text-red-500">{error}</p>}

      <div className="flex flex-wrap gap-6">
        {supplimentsData.map((item) => (
          <SupplementCard
            key={item._id}
            item={item}   
            imageUrl={item.imageUrl}
            name={item.name}
            description={item.description}
            price={item.price}
            quantity={item.quantity}
            weight={item.weight}
          />

        ))}
      </div>
    </div>
  );
};

export default Suppliment;
