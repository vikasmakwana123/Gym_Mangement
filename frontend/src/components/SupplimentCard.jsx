import React from 'react';

const SupplementCard = ({
  image,
  name = 'Product Name',
  description = 'Description',
  price = '₹0',
  quantity = '0 kg',
}) => {
  return (
    <div className="w-[300px] rounded-2xl bg-zinc-200 h-70 gap-7">
      <img
        src={image}
        alt={name}
        className="w-full bg-amber-50 rounded-t-xl h-[160px] object-cover"
      />

      <div className="flex justify-between mt-2">
        <div className="flex flex-col ml-2 text-xl">
          <span>{name}</span>
          <span className="text-sm text-gray-500">{description}</span>
        </div>

        <div className="flex flex-col text-2xl text-right mr-4">
          <span className="text-[18px] text-gray-500">{price}</span>
          <span className="text-xs text-gray-500">{quantity}</span>
          <button className="text-sm mt-5 flex items-center justify-center bg-gray-900 text-teal-50 px-2 py-1 rounded-xl">
            <span className="text-xl mr-2 font-bold">+</span>
            Add To Cart
          </button>
        </div>

      </div>

    </div>
  );
};

export default SupplementCard;
