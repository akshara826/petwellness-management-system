import { useState, useEffect } from 'react';
import API from '../api/api';

export default function Marketplace() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const res = await API.get('/products');
      setProducts(res.data);
    };
    fetchProducts();
  }, []);

  return (
    <div>
      <h2>Pet Marketplace</h2>
      {products.map(p => (
        <div key={p._id}>
          {p.name} - ${p.price}
          <button>Buy</button>
        </div>
      ))}
    </div>
  );
}
